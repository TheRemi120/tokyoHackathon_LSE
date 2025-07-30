-- Script pour calculer les scores des activités existantes
-- À exécuter dans Supabase Dashboard > SQL Editor après avoir ajouté la colonne score

-- 1. D'abord, ajoutez la colonne si ce n'est pas déjà fait
ALTER TABLE public.activities 
ADD COLUMN IF NOT EXISTS score INTEGER CHECK (score >= 1 AND score <= 10);

-- 2. Calculer des scores basiques pour les activités existantes basés sur le pace
UPDATE public.activities 
SET score = CASE 
    WHEN time IS NOT NULL AND distance IS NOT NULL AND distance > 0 THEN
        CASE 
            WHEN (time::float / 60.0) / distance <= 4.0 THEN 9  -- Très rapide (< 4 min/km)
            WHEN (time::float / 60.0) / distance <= 5.0 THEN 8  -- Rapide (4-5 min/km)
            WHEN (time::float / 60.0) / distance <= 6.0 THEN 7  -- Bon (5-6 min/km)
            WHEN (time::float / 60.0) / distance <= 7.0 THEN 6  -- Moyen (6-7 min/km)
            WHEN (time::float / 60.0) / distance <= 8.0 THEN 5  -- Lent (7-8 min/km)
            ELSE 4  -- Très lent (> 8 min/km)
        END
    ELSE 5  -- Score par défaut si pas de données de performance
END
WHERE score IS NULL AND reviewed = true;

-- 3. Améliorer les scores basés sur l'analyse de sentiment simple des reviews
UPDATE public.activities 
SET score = LEAST(10, score + 
    CASE 
        WHEN review ILIKE '%great%' OR review ILIKE '%amazing%' OR review ILIKE '%excellent%' OR review ILIKE '%fantastic%' THEN 2
        WHEN review ILIKE '%good%' OR review ILIKE '%strong%' OR review ILIKE '%easy%' THEN 1
        WHEN review ILIKE '%tired%' OR review ILIKE '%difficult%' OR review ILIKE '%hard%' OR review ILIKE '%struggled%' THEN -1
        WHEN review ILIKE '%terrible%' OR review ILIKE '%awful%' OR review ILIKE '%exhausted%' THEN -2
        ELSE 0
    END
)
WHERE score IS NOT NULL AND reviewed = true AND review IS NOT NULL;

-- 4. S'assurer que tous les scores restent dans la plage 1-10
UPDATE public.activities 
SET score = GREATEST(1, LEAST(10, score))
WHERE score IS NOT NULL;

-- 5. Vérifier les résultats
SELECT id, distance, time, 
       CASE 
           WHEN distance IS NOT NULL AND distance > 0 THEN 
               ROUND(((time::float / 60.0) / distance)::numeric, 2)
           ELSE NULL 
       END as pace_min_per_km,
       score, 
       LEFT(review, 50) as review_preview
FROM public.activities 
WHERE reviewed = true 
ORDER BY created_at DESC 
LIMIT 10;
