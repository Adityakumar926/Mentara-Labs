-- Migration: Add topic_id to questions and exams tables
-- This allows questions and exams to be categorized under specific topics or nested sub-topics.

-- 1. Alter questions table
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS topic_id UUID NULL;

-- Add foreign key constraint to topics table with ON DELETE SET NULL
ALTER TABLE public.questions 
DROP CONSTRAINT IF EXISTS questions_topic_id_fkey;

ALTER TABLE public.questions 
ADD CONSTRAINT questions_topic_id_fkey 
FOREIGN KEY (topic_id) REFERENCES public.topics(id) ON DELETE SET NULL;

-- 2. Alter exams table
ALTER TABLE public.exams ADD COLUMN IF NOT EXISTS topic_id UUID NULL;

-- Add foreign key constraint to topics table with ON DELETE SET NULL
ALTER TABLE public.exams 
DROP CONSTRAINT IF EXISTS exams_topic_id_fkey;

ALTER TABLE public.exams 
ADD CONSTRAINT exams_topic_id_fkey 
FOREIGN KEY (topic_id) REFERENCES public.topics(id) ON DELETE SET NULL;

-- 3. Add indexes for query performance
CREATE INDEX IF NOT EXISTS idx_questions_topic ON public.questions(topic_id);
CREATE INDEX IF NOT EXISTS idx_exams_topic ON public.exams(topic_id);
