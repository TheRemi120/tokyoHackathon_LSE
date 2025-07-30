-- Add score column to activities table
ALTER TABLE public.activities 
ADD COLUMN score INTEGER CHECK (score >= 1 AND score <= 10);

-- Add comment for the score column
COMMENT ON COLUMN public.activities.score IS 'Performance score from 1 to 10 calculated by LLM based on user feedback and performance metrics';
