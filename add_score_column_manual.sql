-- Script SQL à exécuter manuellement dans Supabase Dashboard
-- Aller dans : Dashboard > SQL Editor > New Query

-- 1. Ajouter la colonne score à la table activities
ALTER TABLE public.activities 
ADD COLUMN IF NOT EXISTS score INTEGER CHECK (score >= 1 AND score <= 10);

-- 2. Ajouter un commentaire pour documenter la colonne
COMMENT ON COLUMN public.activities.score IS 'Performance score from 1 to 10 calculated by LLM based on user feedback and performance metrics';

-- 3. Vérifier que la colonne a été ajoutée correctement
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'activities' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Optionnel : mettre à jour les activités existantes avec un score par défaut
-- UPDATE public.activities 
-- SET score = 5 
-- WHERE score IS NULL AND reviewed = true;
