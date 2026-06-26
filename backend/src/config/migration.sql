-- Migration Script: Multi-Curriculum LMS Schema Restructuring

-- 1. Create classes table
CREATE TABLE IF NOT EXISTS public.classes (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    curriculum_id UUID NOT NULL,
    name TEXT NOT NULL,
    description TEXT NULL,
    order_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT classes_pkey PRIMARY KEY (id),
    CONSTRAINT classes_curriculum_id_fkey FOREIGN KEY (curriculum_id) REFERENCES public.curriculums (id) ON DELETE CASCADE
);

-- Grant privileges for classes
GRANT ALL ON public.classes TO anon;
GRANT ALL ON public.classes TO authenticated;
GRANT ALL ON public.classes TO service_role;

-- 2. Alter subjects table to point to classes instead of curriculums
ALTER TABLE public.subjects ADD COLUMN class_id UUID NULL;
ALTER TABLE public.subjects ADD CONSTRAINT subjects_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes (id) ON DELETE CASCADE;

-- Note: Since subjects is currently empty, we will make class_id NOT NULL after setting it,
-- or just drop the curriculum_id constraint and make it NOT NULL now.
ALTER TABLE public.subjects ALTER COLUMN class_id SET NOT NULL;
ALTER TABLE public.subjects DROP CONSTRAINT IF EXISTS subjects_curriculum_id_fkey;
ALTER TABLE public.subjects DROP COLUMN IF EXISTS curriculum_id;

-- 3. Create topics table
CREATE TABLE IF NOT EXISTS public.topics (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    subject_id UUID NOT NULL,
    parent_topic_id UUID NULL,
    name TEXT NOT NULL,
    description TEXT NULL,
    order_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT topics_pkey PRIMARY KEY (id),
    CONSTRAINT topics_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects (id) ON DELETE CASCADE,
    CONSTRAINT topics_parent_topic_id_fkey FOREIGN KEY (parent_topic_id) REFERENCES public.topics (id) ON DELETE CASCADE
);

-- Grant privileges for topics
GRANT ALL ON public.topics TO anon;
GRANT ALL ON public.topics TO authenticated;
GRANT ALL ON public.topics TO service_role;

CREATE INDEX IF NOT EXISTS idx_topics_subject ON public.topics (subject_id);
CREATE INDEX IF NOT EXISTS idx_topics_parent ON public.topics (parent_topic_id);

-- 4. Alter content table to point to topics instead of subjects
ALTER TABLE public.content ADD COLUMN topic_id UUID NULL;
ALTER TABLE public.content ADD CONSTRAINT content_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.topics (id) ON DELETE CASCADE;

-- Make topic_id NOT NULL and drop subject_id column
ALTER TABLE public.content ALTER COLUMN topic_id SET NOT NULL;
ALTER TABLE public.content DROP CONSTRAINT IF EXISTS content_subject_id_fkey;
ALTER TABLE public.content DROP COLUMN IF EXISTS subject_id;

-- 5. Alter users table to add curriculum_id, class_id, and onboarded status
ALTER TABLE public.users ADD COLUMN curriculum_id UUID NULL;
ALTER TABLE public.users ADD COLUMN class_id UUID NULL;
ALTER TABLE public.users ADD COLUMN onboarded BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.users ADD CONSTRAINT users_curriculum_id_fkey FOREIGN KEY (curriculum_id) REFERENCES public.curriculums (id) ON DELETE SET NULL;
ALTER TABLE public.users ADD CONSTRAINT users_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes (id) ON DELETE SET NULL;

-- 6. Create user_progress table
CREATE TABLE IF NOT EXISTS public.user_progress (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    topic_id UUID NULL,
    content_id UUID NULL,
    completed BOOLEAN NOT NULL DEFAULT false,
    video_progress INT NOT NULL DEFAULT 0, -- watch duration in seconds
    last_visited TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT user_progress_pkey PRIMARY KEY (id),
    CONSTRAINT user_progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users (id) ON DELETE CASCADE,
    CONSTRAINT user_progress_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.topics (id) ON DELETE CASCADE,
    CONSTRAINT user_progress_content_id_fkey FOREIGN KEY (content_id) REFERENCES public.content (id) ON DELETE CASCADE,
    CONSTRAINT user_progress_user_content_key UNIQUE (user_id, content_id),
    CONSTRAINT user_progress_user_topic_key UNIQUE (user_id, topic_id)
);

-- Grant privileges for user_progress
GRANT ALL ON public.user_progress TO anon;
GRANT ALL ON public.user_progress TO authenticated;
GRANT ALL ON public.user_progress TO service_role;

CREATE INDEX IF NOT EXISTS idx_user_progress_user ON public.user_progress (user_id);
