-- ==============================================================================
-- OPERIX GYMNASTICS — SCRIPT DE LIMPIEZA Y REVERSIÓN DEL CAMPEONATO PILOTO (2026)
-- Desarrollado por Comercial Hels SpA
-- Fecha: 8 de noviembre de 2026
--
-- PROPÓSITO:
-- Desmantelar o archivar de forma segura el campeonato piloto sin alterar
-- torneos reales ni violar la inmutabilidad WORM de score_audits.
-- ==============================================================================

BEGIN;

DO $$
DECLARE
    v_champ_id UUID := 'e0000000-0000-0000-0000-000000001000'::uuid;
    v_org_id UUID := 'e0000000-0000-0000-0000-000000000001'::uuid;
    v_has_audits BOOLEAN;
BEGIN
    -- 1. Verificar si se generaron pistas inmutables en score_audits
    SELECT EXISTS (
        SELECT 1 
        FROM public.score_audits sa
        JOIN public.scores s ON s.id = sa.score_id
        WHERE s.championship_id = v_champ_id
    ) INTO v_has_audits;

    IF v_has_audits THEN
        -- MODALIDAD A: ARCHIVADO SEGURO (WORM-Compliant)
        -- Si existen auditorías registradas, no se ejecutan DELETE en cascada que dispararían
        -- el trigger de excepción WORM. Se realiza un aislamiento lógico definitivo.
        UPDATE public.championships
        SET 
            status = 'archived',
            visibility = 'private',
            name = '[ARCHIVADO] OPERIX GYMNASTICS — CAMPEONATO PILOTO 2026',
            public_portal_settings = jsonb_build_object(
                'is_testing_event', true,
                'is_archived', true,
                'show_published_results', false,
                'show_participating_clubs', false
            ),
            updated_at = timezone('utc'::text, now())
        WHERE id = v_champ_id;

        UPDATE public.registrations
        SET status = 'scratched', updated_at = timezone('utc'::text, now())
        WHERE championship_id = v_champ_id;

        RAISE NOTICE 'OPERIX CLEANUP: El torneo contenía registros de auditoría WORM. Fue archivado y aislado lógicamente con éxito.';
    ELSE
        -- MODALIDAD B: ELIMINACIÓN FÍSICA COMPLETA
        -- Al no existir registros en score_audits, es seguro eliminar físicamente los datos del piloto.
        DELETE FROM public.apparatus_live_status WHERE championship_id = v_champ_id;
        DELETE FROM public.rotation_groups WHERE championship_id = v_champ_id;
        DELETE FROM public.competition_schedules WHERE championship_id = v_champ_id;
        DELETE FROM public.championship_awards_config WHERE championship_id = v_champ_id;
        DELETE FROM public.registrations WHERE championship_id = v_champ_id;
        DELETE FROM public.scores WHERE championship_id = v_champ_id;
        DELETE FROM public.categories WHERE championship_id = v_champ_id;
        DELETE FROM public.championships WHERE id = v_champ_id;
        DELETE FROM public.gymnasts WHERE organization_id = v_org_id;
        DELETE FROM public.clubs WHERE organization_id = v_org_id;
        DELETE FROM public.organizations WHERE id = v_org_id;

        RAISE NOTICE 'OPERIX CLEANUP: Se eliminaron completamente todos los registros ficticios del campeonato piloto.';
    END IF;
END $$;

COMMIT;
