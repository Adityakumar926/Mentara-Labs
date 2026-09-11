-- Classroom & Virtual Batch Management System Migration Schema

-- 1. Create Classrooms table
CREATE TABLE IF NOT EXISTS public.classrooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT NULL,
    invite_code VARCHAR(20) UNIQUE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Create Classroom Members table
CREATE TABLE IF NOT EXISTS public.classroom_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    classroom_id UUID NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'removed')),
    joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    removed_at TIMESTAMPTZ NULL,
    CONSTRAINT classroom_members_unique UNIQUE (classroom_id, student_id)
);

-- 3. Create Classroom Invitations table
CREATE TABLE IF NOT EXISTS public.classroom_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    classroom_id UUID NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
    student_email TEXT NOT NULL,
    invited_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Create Classroom Exams table
CREATE TABLE IF NOT EXISTS public.classroom_exams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    classroom_id UUID NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
    exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
    assigned_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    due_date TIMESTAMPTZ NULL,
    CONSTRAINT classroom_exams_unique UNIQUE (classroom_id, exam_id)
);

-- 5. Create Classroom Materials table
CREATE TABLE IF NOT EXISTS public.classroom_materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    classroom_id UUID NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
    material_id UUID NOT NULL REFERENCES public.content(id) ON DELETE CASCADE,
    assigned_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT classroom_materials_unique UNIQUE (classroom_id, material_id)
);

-- 6. Create Classroom Assignments table
CREATE TABLE IF NOT EXISTS public.classroom_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    classroom_id UUID NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NULL,
    due_date TIMESTAMPTZ NULL,
    assigned_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Create Classroom Announcements table
CREATE TABLE IF NOT EXISTS public.classroom_announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    classroom_id UUID NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Add Performance & Partial Indexes
CREATE INDEX IF NOT EXISTS idx_classrooms_teacher ON public.classrooms(teacher_id);
CREATE INDEX IF NOT EXISTS idx_classroom_members_class ON public.classroom_members(classroom_id);
CREATE INDEX IF NOT EXISTS idx_classroom_members_student ON public.classroom_members(student_id);
CREATE INDEX IF NOT EXISTS idx_classroom_members_active ON public.classroom_members(classroom_id) WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_classroom_invitations_class ON public.classroom_invitations(classroom_id);
CREATE INDEX IF NOT EXISTS idx_classroom_invitations_email ON public.classroom_invitations(student_email);
CREATE INDEX IF NOT EXISTS idx_classroom_invitations_pending ON public.classroom_invitations(classroom_id) WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_classroom_exams_class ON public.classroom_exams(classroom_id);
CREATE INDEX IF NOT EXISTS idx_classroom_materials_class ON public.classroom_materials(classroom_id);

-- 9. Ensure System Settings Defaults
INSERT INTO public.system_settings (key, value, updated_at)
VALUES 
  ('free_classroom_seat_limit', '10', NOW()),
  ('max_classroom_seat_limit', '50', NOW())
ON CONFLICT (key) DO NOTHING;

-- 10. Ensure subscription_plan column on users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS subscription_plan VARCHAR(20) NOT NULL DEFAULT 'free';
