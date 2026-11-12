-- ==============================================================================
-- OPERIX GYMNASTICS — REVERSIÓN SEGURA: CAMPEONATO PAILLACO 2026
-- Archivo Fuente: ARTISTICA CAMPEONATO 2026.xlsx
-- Libre de DELETE CASCADE, con validación de score_audits WORM
-- Desarrollado por Comercial Hels SpA
-- Fecha: 12 de noviembre de 2026
-- ==============================================================================

BEGIN;

DO $$
DECLARE
    v_champ_id UUID := 'c2026000-0000-0000-0000-000000000001'::uuid;
    v_has_audits BOOLEAN;
    v_has_scores BOOLEAN;
BEGIN
    -- 1. Verificar inmutabilidad en score_audits
    SELECT EXISTS (
        SELECT 1 FROM public.score_audits sa
        JOIN public.scores s ON s.id = sa.score_id
        WHERE s.championship_id = v_champ_id
    ) INTO v_has_audits;

    SELECT EXISTS (
        SELECT 1 FROM public.scores WHERE championship_id = v_champ_id
    ) INTO v_has_scores;

    IF v_has_audits OR v_has_scores THEN
        -- ARCHIVADO SEGURO
        UPDATE public.championships
        SET status = 'archived', visibility = 'private', updated_at = timezone('utc'::text, now())
        WHERE id = v_champ_id;

        RAISE NOTICE 'PAILLACO CLEANUP: Existen notas o auditorías. Se ejecutó archivado lógico para preservar trazabilidad inmutable.';
    ELSE
        -- ELIMINACIÓN FÍSICA SECUENCIAL HOJA A RAÍZ (CERO CASCADE)
        DELETE FROM public.championship_awards_config WHERE championship_id = v_champ_id;
        DELETE FROM public.competition_schedules WHERE championship_id = v_champ_id;
        DELETE FROM public.rotation_groups WHERE championship_id = v_champ_id;
        DELETE FROM public.registrations WHERE championship_id = v_champ_id;
        DELETE FROM public.category_apparatuses WHERE category_id IN (SELECT id FROM public.categories WHERE championship_id = v_champ_id);
        DELETE FROM public.subcategories WHERE category_id IN (SELECT id FROM public.categories WHERE championship_id = v_champ_id);
        DELETE FROM public.categories WHERE championship_id = v_champ_id;
        DELETE FROM public.championships WHERE id = v_champ_id;
        DELETE FROM public.gymnasts WHERE id BETWEEN 'c2026000-0000-0001-0000-000000000001'::uuid AND 'c2026000-0000-0001-0000-000000000153'::uuid;
        DELETE FROM public.clubs WHERE id BETWEEN 'c2026000-0000-0000-0000-000000000010'::uuid AND 'c2026000-0000-0000-0000-0000000000a0'::uuid
          AND NOT EXISTS (SELECT 1 FROM public.registrations r WHERE r.club_id = clubs.id);

        RAISE NOTICE 'PAILLACO CLEANUP: Estructura del campeonato eliminada de forma segura.';
    END IF;
END $$;

COMMIT;
