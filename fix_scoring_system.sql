-- Script pour corriger le système de scoring
-- À exécuter dans Supabase Dashboard > SQL Editor

-- 1. S'assurer que la colonne score existe
ALTER TABLE public.activities 
ADD COLUMN IF NOT EXISTS score INTEGER CHECK (score >= 1 AND score <= 10);

-- 2. Calculer des scores pour les activités existantes qui n'en ont pas
UPDATE public.activities 
SET score = CASE 
    WHEN time IS NOT NULL AND distance IS NOT NULL AND distance > 0 AND time > 0 THEN
        -- Calcul du score basé sur le pace (70%) et sentiment par défaut (30%)
        LEAST(10, GREATEST(1, 
            CASE 
                WHEN (time::float / 60.0) / distance <= 4.0 THEN 8  -- Très rapide
                WHEN (time::float / 60.0) / distance <= 5.0 THEN 7  -- Rapide  
                WHEN (time::float / 60.0) / distance <= 6.0 THEN 6  -- Bon
                WHEN (time::float / 60.0) / distance <= 7.0 THEN 5  -- Moyen
                WHEN (time::float / 60.0) / distance <= 8.0 THEN 4  -- Lent
                ELSE 3  -- Très lent
            END +
            -- Bonus/malus basé sur les mots dans la review
            CASE 
                WHEN review ILIKE '%great%' OR review ILIKE '%amazing%' OR review ILIKE '%excellent%' OR review ILIKE '%fantastic%' OR review ILIKE '%strong%' THEN 2
                WHEN review ILIKE '%good%' OR review ILIKE '%easy%' OR review ILIKE '%comfortable%' THEN 1
                WHEN review ILIKE '%tired%' OR review ILIKE '%difficult%' OR review ILIKE '%hard%' OR review ILIKE '%struggled%' THEN -1
                WHEN review ILIKE '%terrible%' OR review ILIKE '%awful%' OR review ILIKE '%exhausted%' THEN -2
                ELSE 0
            END
        ))
    ELSE 5  -- Score par défaut pour les activités sans données de performance
END
WHERE score IS NULL AND reviewed = true;

-- 3. Vérifier les résultats
SELECT 
    id, 
    distance, 
    time,
    CASE 
        WHEN distance IS NOT NULL AND distance > 0 THEN 
            CAST((time::float / 60.0) / distance AS DECIMAL(5,2))
        ELSE NULL 
    END as pace_min_per_km,
    score,
    CASE 
        WHEN LENGTH(review) > 50 THEN LEFT(review, 47) || '...'
        ELSE review
    END as review_preview
FROM public.activities 
WHERE reviewed = true 
ORDER BY created_at DESC 
LIMIT 10;

-- 4. Statistiques des scores
SELECT 
    'Total activities with scores' as metric,
    COUNT(*) as value
FROM public.activities 
WHERE score IS NOT NULL
UNION ALL
SELECT 
    'Average score' as metric,
    CAST(AVG(score) AS DECIMAL(3,1)) as value
FROM public.activities 
WHERE score IS NOT NULL
UNION ALL
SELECT 
    'Score distribution (1-3)' as metric,
    COUNT(*) as value
FROM public.activities 
WHERE score BETWEEN 1 AND 3
UNION ALL
SELECT 
    'Score distribution (4-6)' as metric,
    COUNT(*) as value
FROM public.activities 
WHERE score BETWEEN 4 AND 6
UNION ALL
SELECT 
    'Score distribution (7-10)' as metric,
    COUNT(*) as value
FROM public.activities 
WHERE score BETWEEN 7 AND 10;
