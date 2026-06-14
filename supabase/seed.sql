-- ============================================================
-- Seed: Datos iniciales para desarrollo
-- ============================================================

-- Insertar perfil de administrador
-- NOTA: El usuario debe existir primero en auth.users
-- Reemplaza el UUID con el del usuario que quieras hacer admin
INSERT INTO public.profiles (id, full_name, role)
VALUES ('7805b9d9-ca21-407e-8f6f-1599f62688b9', 'richard', 'admin')
ON CONFLICT (id) DO UPDATE SET role = 'admin';
