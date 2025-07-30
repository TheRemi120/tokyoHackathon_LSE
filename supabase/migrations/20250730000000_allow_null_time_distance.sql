-- Allow NULL values for time and distance columns in activities table
-- This is to support cases where users skip entering these values

ALTER TABLE public.activities 
ALTER COLUMN time DROP NOT NULL;

ALTER TABLE public.activities 
ALTER COLUMN distance DROP NOT NULL;
