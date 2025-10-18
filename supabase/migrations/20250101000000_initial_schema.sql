/*
  # Schema de Aplicación de Gestión de Procesos

  ## Descripción General
  Sistema de gestión de procesos con autenticación de usuarios y chat en tiempo real.
  Permite a supervisores y operadores registrar, monitorear y validar procesos de trabajo.

  ## 1. Nuevas Tablas

  ### profiles
  Extiende la información de usuarios de auth.users
  - `id` (uuid, FK a auth.users) - ID del usuario
  - `email` (text) - Email del usuario
  - `full_name` (text) - Nombre completo
  - `role` (text) - Rol: 'supervisor' u 'operador'
  - `avatar_url` (text, opcional) - URL del avatar
  - `created_at` (timestamptz) - Fecha de creación
  - `updated_at` (timestamptz) - Fecha de actualización

  ### processes
  Procesos de trabajo que pueden ser creados y monitoreados
  - `id` (uuid, PK) - ID único del proceso
  - `title` (text) - Título del proceso
  - `description` (text) - Descripción detallada
  - `status` (text) - Estado: 'pending', 'in_progress', 'completed', 'cancelled'
  - `priority` (text) - Prioridad: 'low', 'medium', 'high', 'urgent'
  - `created_by` (uuid, FK a profiles) - Usuario que creó el proceso
  - `assigned_to` (uuid, FK a profiles, opcional) - Usuario asignado
  - `estimated_time` (integer) - Tiempo estimado en minutos
  - `actual_time` (integer, opcional) - Tiempo real en minutos
  - `created_at` (timestamptz) - Fecha de creación
  - `updated_at` (timestamptz) - Fecha de actualización
  - `completed_at` (timestamptz, opcional) - Fecha de completado

  ### process_steps
  Pasos individuales de cada proceso
  - `id` (uuid, PK) - ID único del paso
  - `process_id` (uuid, FK a processes) - ID del proceso padre
  - `step_number` (integer) - Número de orden del paso
  - `title` (text) - Título del paso
  - `description` (text) - Descripción del paso
  - `status` (text) - Estado: 'pending', 'in_progress', 'completed', 'skipped'
  - `responsible` (uuid, FK a profiles, opcional) - Responsable del paso
  - `estimated_time` (integer) - Tiempo estimado en minutos
  - `actual_time` (integer, opcional) - Tiempo real en minutos
  - `started_at` (timestamptz, opcional) - Fecha de inicio
  - `completed_at` (timestamptz, opcional) - Fecha de completado
  - `created_at` (timestamptz) - Fecha de creación
  - `updated_at` (timestamptz) - Fecha de actualización

  ### messages
  Mensajes del sistema de chat
  - `id` (uuid, PK) - ID único del mensaje
  - `content` (text) - Contenido del mensaje
  - `user_id` (uuid, FK a profiles) - Usuario que envió el mensaje
  - `process_id` (uuid, FK a processes, opcional) - Proceso relacionado
  - `is_system` (boolean) - Si es mensaje del sistema
  - `created_at` (timestamptz) - Fecha de creación

  ## 2. Seguridad (RLS)

  Todas las tablas tienen RLS habilitado con políticas específicas:
  - Los usuarios autenticados pueden leer sus propios perfiles
  - Los supervisores pueden crear procesos
  - Los usuarios pueden ver procesos asignados a ellos o creados por ellos
  - Los mensajes son visibles para todos los usuarios autenticados
  - Los usuarios pueden actualizar sus propios perfiles

  ## 3. Funciones Especiales

  ### handle_new_user()
  Trigger que crea automáticamente un perfil cuando se registra un usuario nuevo

  ## 4. Notas Importantes
  - Todos los timestamps usan la zona horaria UTC
  - Los roles se validan a nivel de aplicación
  - Los estados y prioridades se validan a nivel de aplicación
  - Se recomienda implementar validación adicional en la capa de aplicación
*/

-- Crear tabla de perfiles
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL DEFAULT 'operador' CHECK (role IN ('supervisor', 'operador')),
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Crear tabla de procesos
CREATE TABLE IF NOT EXISTS processes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  created_by uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  assigned_to uuid REFERENCES profiles(id) ON DELETE SET NULL,
  estimated_time integer NOT NULL DEFAULT 0,
  actual_time integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Crear tabla de pasos de proceso
CREATE TABLE IF NOT EXISTS process_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  process_id uuid NOT NULL REFERENCES processes(id) ON DELETE CASCADE,
  step_number integer NOT NULL,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped')),
  responsible uuid REFERENCES profiles(id) ON DELETE SET NULL,
  estimated_time integer NOT NULL DEFAULT 0,
  actual_time integer,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(process_id, step_number)
);

-- Crear tabla de mensajes
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  process_id uuid REFERENCES processes(id) ON DELETE SET NULL,
  is_system boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_processes_created_by ON processes(created_by);
CREATE INDEX IF NOT EXISTS idx_processes_assigned_to ON processes(assigned_to);
CREATE INDEX IF NOT EXISTS idx_processes_status ON processes(status);
CREATE INDEX IF NOT EXISTS idx_process_steps_process_id ON process_steps(process_id);
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_process_id ON messages(process_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

-- Habilitar RLS en todas las tablas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE processes ENABLE ROW LEVEL SECURITY;
ALTER TABLE process_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Políticas para processes
CREATE POLICY "Users can view processes they created or are assigned to"
  ON processes FOR SELECT
  TO authenticated
  USING (
    auth.uid() = created_by OR
    auth.uid() = assigned_to OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'supervisor'
    )
  );

CREATE POLICY "Authenticated users can create processes"
  ON processes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update processes they created"
  ON processes FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'supervisor'
    )
  )
  WITH CHECK (
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'supervisor'
    )
  );

CREATE POLICY "Users can delete processes they created"
  ON processes FOR DELETE
  TO authenticated
  USING (
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'supervisor'
    )
  );

-- Políticas para process_steps
CREATE POLICY "Users can view steps of processes they have access to"
  ON process_steps FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM processes
      WHERE processes.id = process_steps.process_id
      AND (
        processes.created_by = auth.uid() OR
        processes.assigned_to = auth.uid() OR
        EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid()
          AND profiles.role = 'supervisor'
        )
      )
    )
  );

CREATE POLICY "Users can create steps in processes they created"
  ON process_steps FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM processes
      WHERE processes.id = process_steps.process_id
      AND processes.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can update steps in processes they have access to"
  ON process_steps FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM processes
      WHERE processes.id = process_steps.process_id
      AND (
        processes.created_by = auth.uid() OR
        processes.assigned_to = auth.uid() OR
        process_steps.responsible = auth.uid()
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM processes
      WHERE processes.id = process_steps.process_id
      AND (
        processes.created_by = auth.uid() OR
        processes.assigned_to = auth.uid() OR
        process_steps.responsible = auth.uid()
      )
    )
  );

CREATE POLICY "Users can delete steps in processes they created"
  ON process_steps FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM processes
      WHERE processes.id = process_steps.process_id
      AND processes.created_by = auth.uid()
    )
  );

-- Políticas para messages
CREATE POLICY "Users can view all messages"
  ON messages FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own messages"
  ON messages FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Función para manejar nuevos usuarios
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'operador')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear perfil automáticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_processes_updated_at ON processes;
CREATE TRIGGER update_processes_updated_at
  BEFORE UPDATE ON processes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_process_steps_updated_at ON process_steps;
CREATE TRIGGER update_process_steps_updated_at
  BEFORE UPDATE ON process_steps
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
