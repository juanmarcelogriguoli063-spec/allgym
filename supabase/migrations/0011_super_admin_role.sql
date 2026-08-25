-- Nuevo rol: super_admin (dueño de la EMPRESA All Gym, distinto de "dueno"
-- que es dueño de UN gimnasio cliente, ej. Griguoli Gym).
-- ALTER TYPE ... ADD VALUE va en su propia migracion porque Postgres no
-- permite usar el valor nuevo en la misma transaccion en que se lo agrega.
alter type user_role add value if not exists 'super_admin';
