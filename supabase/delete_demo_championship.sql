-- ==============================================================================
-- OPERIX GYMNASTICS — ELIMINACIÓN SEGURA DEL CAMPEONATO PILOTO / DEMO
-- Torneo a eliminar: Campeonato Nacional Apertura GAF 2026 (cccccccc-cccc-cccc-cccc-cccccccccccc)
-- Torneo preservado: Campeonato Artística 2026 - Paillaco (c2026000-0000-0000-0000-000000000001)
-- Desarrollado por Comercial Hels SpA
-- ==============================================================================

BEGIN;

DO $$
DECLARE
    v_target_id UUID := 'cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid;
    v_paillaco_id UUID := 'c2026000-0000-0000-0000-000000000001'::uuid;
    v_paillaco_exists BOOLEAN;
BEGIN
    -- 0. Verificar que Paillaco 2026 existe antes de tocar nada
    SELECT EXISTS (SELECT 1 FROM public.championships WHERE id = v_paillaco_id) INTO v_paillaco_exists;
    IF NOT v_paillaco_exists THEN
        RAISE EXCEPTION 'ABORTANDO: No se puede eliminar el torneo de prueba porque Paillaco 2026 no fue detectado en la base de datos.';
    END IF;

    -- 1. Deducciones de notas
    DELETE FROM public.score_deductions 
    WHERE score_id IN (SELECT id FROM public.scores WHERE championship_id = v_target_id);

    -- 2. Puntuaciones y auditorías
    DELETE FROM public.scores WHERE championship_id = v_target_id;
    DELETE FROM public.score_audits WHERE championship_id = v_target_id;

    -- 3. Cronograma, rotaciones y estado de aparatos
    DELETE FROM public.apparatus_live_status WHERE championship_id = v_target_id;
    DELETE FROM public.competition_schedules WHERE championship_id = v_target_id;
    DELETE FROM public.rotation_groups WHERE championship_id = v_target_id;

    -- 4. Inscripciones del campeonato de prueba
    DELETE FROM public.registrations WHERE championship_id = v_target_id;

    -- 5. Configuración de premiaciones y ceremonias
    DELETE FROM public.championship_awards_ceremonies WHERE championship_id = v_target_id;
    DELETE FROM public.championship_awards_config WHERE championship_id = v_target_id;

    -- 6. Documentos oficiales generados
    DELETE FROM public.championship_documents WHERE championship_id = v_target_id;

    -- 7. Aparatos por categoría, subcategorías y categorías
    DELETE FROM public.category_apparatuses 
    WHERE category_id IN (SELECT id FROM public.categories WHERE championship_id = v_target_id);

    DELETE FROM public.subcategories 
    WHERE category_id IN (SELECT id FROM public.categories WHERE championship_id = v_target_id);

    DELETE FROM public.categories WHERE championship_id = v_target_id;

    -- 8. Eliminar el campeonato de prueba
    DELETE FROM public.championships WHERE id = v_target_id;

    -- 9. Eliminar gimnastas de prueba que NO tengan inscripciones en Paillaco 2026
    DELETE FROM public.gymnasts 
    WHERE id < 'c2026000-0000-0001-0000-000000000000'::uuid
      AND NOT EXISTS (SELECT 1 FROM public.registrations r WHERE r.gymnast_id = gymnasts.id);

    -- 10. Eliminar clubes de prueba que NO tengan inscripciones en Paillaco 2026
    DELETE FROM public.clubs 
    WHERE id < 'c2026000-0000-0000-0000-000000000000'::uuid
      AND NOT EXISTS (SELECT 1 FROM public.registrations r WHERE r.club_id = clubs.id);

    RAISE NOTICE 'OPERACIÓN EXITOSA: Campeonato de prueba eliminado limpiamente. Paillaco 2026 permanece intacto como único torneo oficial.';
END $$;

COMMIT;
