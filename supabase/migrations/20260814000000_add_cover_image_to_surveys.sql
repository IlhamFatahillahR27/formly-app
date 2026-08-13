-- Formly Migration: Add cover_image_url column to surveys table
-- Version: 1.2.0
-- Created: 2026-08-14

ALTER TABLE public.surveys 
ADD COLUMN IF NOT EXISTS cover_image_url TEXT;

COMMENT ON COLUMN public.surveys.cover_image_url IS 'URL or Data URI of the survey header cover banner image (Facebook/LinkedIn style)';
