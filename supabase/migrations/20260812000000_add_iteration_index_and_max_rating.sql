-- Formly Migration: Add iteration_index to answers table for multi-loop survey responses
-- Version: 1.1.0
-- Created: 2026-08-12

-- 1. Add iteration_index column to public.answers table
ALTER TABLE public.answers 
ADD COLUMN IF NOT EXISTS iteration_index INT NOT NULL DEFAULT 1;

-- 2. Create index for query optimization on iteration_index
CREATE INDEX IF NOT EXISTS idx_answers_iteration_index ON public.answers(iteration_index);

-- 3. Comments on column and table
COMMENT ON COLUMN public.answers.iteration_index IS 'Iteration index number for multi-pass section responses in looped survey flows (1-indexed)';
