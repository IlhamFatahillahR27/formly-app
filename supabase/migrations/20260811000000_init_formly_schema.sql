-- Formly Database DDL Migration Script
-- Version: 1.0.0
-- Created: 2026-08-11

-- 1. Surveys Table
CREATE TABLE IF NOT EXISTS public.surveys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    start_section_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Sections Table
CREATE TABLE IF NOT EXISTS public.sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id UUID NOT NULL REFERENCES public.surveys(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    position_x FLOAT NOT NULL DEFAULT 0,
    position_y FLOAT NOT NULL DEFAULT 0,
    default_next_section_id UUID REFERENCES public.sections(id) ON DELETE SET NULL,
    is_end_section BOOLEAN NOT NULL DEFAULT false,
    order_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Questions Table
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_id UUID NOT NULL REFERENCES public.sections(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('short_text', 'long_text', 'multiple_choice', 'rating')),
    is_required BOOLEAN NOT NULL DEFAULT true,
    options JSONB,
    order_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Section Logic Table
CREATE TABLE IF NOT EXISTS public.section_logic (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id UUID NOT NULL REFERENCES public.surveys(id) ON DELETE CASCADE,
    source_section_id UUID NOT NULL REFERENCES public.sections(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    operator TEXT NOT NULL DEFAULT 'selected' CHECK (operator IN ('selected', 'filled', 'equals', 'not_equals', 'greater_than', 'less_than')),
    condition_value JSONB,
    target_section_id UUID NOT NULL REFERENCES public.sections(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Responses Table
CREATE TABLE IF NOT EXISTS public.responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id UUID NOT NULL REFERENCES public.surveys(id) ON DELETE CASCADE,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Answers Table
CREATE TABLE IF NOT EXISTS public.answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    response_id UUID NOT NULL REFERENCES public.responses(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    answer_value JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Foreign Key Constraint for Surveys -> Start Section (Circular Safety)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_surveys_start_section'
    ) THEN
        ALTER TABLE public.surveys 
        ADD CONSTRAINT fk_surveys_start_section 
        FOREIGN KEY (start_section_id) REFERENCES public.sections(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Query Optimization Indexes
CREATE INDEX IF NOT EXISTS idx_questions_section_id ON public.questions(section_id);
CREATE INDEX IF NOT EXISTS idx_sections_survey_id ON public.sections(survey_id);
CREATE INDEX IF NOT EXISTS idx_section_logic_survey_id ON public.section_logic(survey_id);
CREATE INDEX IF NOT EXISTS idx_section_logic_question_id ON public.section_logic(question_id);
CREATE INDEX IF NOT EXISTS idx_section_logic_target_section_id ON public.section_logic(target_section_id);
CREATE INDEX IF NOT EXISTS idx_responses_survey_id ON public.responses(survey_id);
CREATE INDEX IF NOT EXISTS idx_answers_response_id ON public.answers(response_id);
CREATE INDEX IF NOT EXISTS idx_answers_question_id ON public.answers(question_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.section_logic ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-running
DROP POLICY IF EXISTS "Public surveys select policy" ON public.surveys;
DROP POLICY IF EXISTS "Admin surveys all policy" ON public.surveys;
DROP POLICY IF EXISTS "Public sections select policy" ON public.sections;
DROP POLICY IF EXISTS "Admin sections all policy" ON public.sections;
DROP POLICY IF EXISTS "Public questions select policy" ON public.questions;
DROP POLICY IF EXISTS "Admin questions all policy" ON public.questions;
DROP POLICY IF EXISTS "Public logic select policy" ON public.section_logic;
DROP POLICY IF EXISTS "Admin logic all policy" ON public.section_logic;
DROP POLICY IF EXISTS "Public responses insert policy" ON public.responses;
DROP POLICY IF EXISTS "Admin responses select policy" ON public.responses;
DROP POLICY IF EXISTS "Public answers insert policy" ON public.answers;
DROP POLICY IF EXISTS "Admin answers select policy" ON public.answers;

-- 1. Surveys Policies
CREATE POLICY "Public surveys select policy" ON public.surveys
    FOR SELECT USING (is_active = true OR auth.uid() = admin_id);

CREATE POLICY "Admin surveys all policy" ON public.surveys
    FOR ALL USING (auth.uid() = admin_id);

-- 2. Sections Policies
CREATE POLICY "Public sections select policy" ON public.sections
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.surveys s
            WHERE s.id = sections.survey_id
            AND (s.is_active = true OR s.admin_id = auth.uid())
        )
    );

CREATE POLICY "Admin sections all policy" ON public.sections
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.surveys s
            WHERE s.id = sections.survey_id
            AND s.admin_id = auth.uid()
        )
    );

-- 3. Questions Policies
CREATE POLICY "Public questions select policy" ON public.questions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.sections sec
            JOIN public.surveys s ON s.id = sec.survey_id
            WHERE sec.id = questions.section_id
            AND (s.is_active = true OR s.admin_id = auth.uid())
        )
    );

CREATE POLICY "Admin questions all policy" ON public.questions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.sections sec
            JOIN public.surveys s ON s.id = sec.survey_id
            WHERE sec.id = questions.section_id
            AND s.admin_id = auth.uid()
        )
    );

-- 4. Section Logic Policies
CREATE POLICY "Public logic select policy" ON public.section_logic
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.surveys s
            WHERE s.id = section_logic.survey_id
            AND (s.is_active = true OR s.admin_id = auth.uid())
        )
    );

CREATE POLICY "Admin logic all policy" ON public.section_logic
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.surveys s
            WHERE s.id = section_logic.survey_id
            AND s.admin_id = auth.uid()
        )
    );

-- 5. Responses Policies (Public INSERT, Admin SELECT, Immutable UPDATE/DELETE)
CREATE POLICY "Public responses insert policy" ON public.responses
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.surveys s
            WHERE s.id = responses.survey_id
            AND s.is_active = true
        )
    );

CREATE POLICY "Admin responses select policy" ON public.responses
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.surveys s
            WHERE s.id = responses.survey_id
            AND s.admin_id = auth.uid()
        )
    );

-- 6. Answers Policies (Public INSERT, Admin SELECT, Immutable UPDATE/DELETE)
CREATE POLICY "Public answers insert policy" ON public.answers
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.responses r
            JOIN public.surveys s ON s.id = r.survey_id
            WHERE r.id = answers.response_id
            AND s.is_active = true
        )
    );

CREATE POLICY "Admin answers select policy" ON public.answers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.responses r
            JOIN public.surveys s ON s.id = r.survey_id
            WHERE r.id = answers.response_id
            AND s.admin_id = auth.uid()
        )
    );
