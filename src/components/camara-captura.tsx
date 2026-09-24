"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, ImagePlus, RefreshCw, Trash2, UserRound, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const LADO = 480; // la foto final es cuadrada de 480x480: liviana (~40-80 KB) y suficiente para reconocer a alguien

type Modo = "reposo" | "camara" | "lista";

/**
 * Saca o sube una foto del cliente y la entrega como Blob JPEG ya recortado y
 * comprimido. En la PC usa la camara en vivo; en el celular, "Subir / usar la
 * camara del celular" abre la camara nativa.
 */
export default function CamaraCaptura({
  onChange,
  fotoActualUrl,
}: {
  onChange: (foto: Blob | null) => void;
  fotoActualUrl?: string | null;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const archivoRef = useRef<HTMLInputElement>(null);
  const [modo, setModo] = useState<Modo>("reposo");
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const apagarCamara = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  // Al cerrar el dialogo/desmontar: apagar la camara (si no, queda la luz prendida).
  useEffect(() => apagarCamara, [apagarCamara]);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  // Conectar el stream al <video> apenas se muestra.
  useEffect(() => {
    if (modo === "camara" && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }, [modo]);

  function fijar(blob: Blob) {
    setPreview(URL.createObjectURL(blob));
    setModo("lista");
    setError(null);
    onChange(blob);
  }

  async function abrirCamara() {
    setError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Este navegador no permite usar la cámara. Usá \"Subir foto\".");
      return;
    }
    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      setModo("camara");
    } catch {
      setError("No se pudo usar la cámara (permiso denegado o no hay cámara). Podés subir una foto.");
    }
  }

  function cancelarCamara() {
    apagarCamara();
    setModo(preview ? "lista" : "reposo");
  }

  function aBlobCuadrado(fuente: CanvasImageSource, ancho: number, alto: number) {
    const lado = Math.min(ancho, alto);
    const canvas = document.createElement("canvas");
    canvas.width = LADO;
    canvas.height = LADO;
    canvas.getContext("2d")?.drawImage(fuente, (ancho - lado) / 2, (alto - lado) / 2, lado, lado, 0, 0, LADO, LADO);
    canvas.toBlob(
      (blob) => {
        if (blob) fijar(blob);
        else setError("No se pudo procesar la foto. Probá de nuevo.");
      },
      "image/jpeg",
      0.82
    );
  }

  function capturar() {
    const v = videoRef.current;
    if (!v || !v.videoWidth) return;
    aBlobCuadrado(v, v.videoWidth, v.videoHeight);
    apagarCamara();
  }

  async function elegirArchivo(e: React.ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0];
    e.target.value = ""; // permite volver a elegir el mismo archivo
    if (!archivo) return;
    try {
      const bmp = await createImageBitmap(archivo, { imageOrientation: "from-image" });
      aBlobCuadrado(bmp, bmp.width, bmp.height);
    } catch {
      setError("No se pudo leer esa imagen. Probá con otra.");
    }
  }

  function quitar() {
    apagarCamara();
    setPreview(null);
    setModo("reposo");
    onChange(null);
  }

  const imagen = modo === "lista" ? preview : fotoActualUrl;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative aspect-square w-40 overflow-hidden rounded-2xl border-2 border-border bg-muted">
        {modo === "camara" ? (
          // Espejado solo en pantalla (natural para un selfie); la foto guardada NO sale espejada.
          <video ref={videoRef} playsInline muted className="size-full -scale-x-100 object-cover" />
        ) : imagen ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imagen} alt="Foto del cliente" className="size-full object-cover" />
        ) : (
          <div className="flex size-full items-center justify-center text-muted-foreground">
            <UserRound className="size-16 opacity-40" />
          </div>
        )}
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {modo === "camara" ? (
          <>
            <Button type="button" size="sm" onClick={capturar} className="gap-1.5">
              <Camera className="size-4" /> Capturar
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={cancelarCamara} className="gap-1.5">
              <X className="size-4" /> Cancelar
            </Button>
          </>
        ) : (
          <>
            <Button type="button" size="sm" variant={imagen ? "outline" : "default"} onClick={abrirCamara} className="gap-1.5">
              {imagen ? <RefreshCw className="size-4" /> : <Camera className="size-4" />}
              {imagen ? "Sacar otra" : "Sacar foto"}
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => archivoRef.current?.click()} className="gap-1.5">
              <ImagePlus className="size-4" /> Subir foto
            </Button>
            {modo === "lista" && (
              <Button type="button" size="sm" variant="ghost" onClick={quitar} className="gap-1.5 text-muted-foreground">
                <Trash2 className="size-4" /> Quitar
              </Button>
            )}
          </>
        )}
      </div>

      {/* En el celular, "capture" abre directo la camara frontal. */}
      <input ref={archivoRef} type="file" accept="image/*" capture="user" className="hidden" onChange={elegirArchivo} />

      {error && <p className="max-w-xs text-center text-xs text-destructive">{error}</p>}
      {!error && modo === "reposo" && !imagen && (
        <p className="text-xs text-muted-foreground">La foto aparece en el control de acceso.</p>
      )}
    </div>
  );
}
