-- ==============================================================================
-- OPERIX GYMNASTICS — SCRIPT DE LIMPIEZA Y REVERSIÓN DEL CAMPEONATO PILOTO (2026)
-- Versión Corregida y Blindada — Compatible con WORM y Libre de DELETE CASCADE
-- Desarrollado por Comercial Hels SpA
-- Fecha: 8 de noviembre de 2026
-- ==============================================================================

BEGIN;

DO $$
DECLARE
    v_champ_id UUID := 'e0000000-0000-0000-0000-000000001000'::uuid;
    v_org_id   UUID := 'e0000000-0000-0000-0000-000000000001'::uuid;
    v_club_a   UUID := 'e0000000-0000-0000-0000-000000000010'::uuid;
    v_club_b   UUID := 'e0000000-0000-0000-0000-000000000020'::uuid;
    v_has_audits BOOLEAN;
BEGIN
    -- 1. Verificar si existen pistas de auditoría inmutables generadas en score_audits
    SELECT EXISTS (
        SELECT 1 
        FROM public.score_audits sa
        JOIN public.scores s ON s.id = sa.score_id
        WHERE s.championship_id = v_champ_id
    ) INTO v_has_audits;

    IF v_has_audits THEN
        -- MODALIDAD A: ARCHIVADO SEGURO (WORM-Compliant)
        -- Si existen auditorías, un DELETE de scores o championship dispararía la protección WORM.
        -- Se ejecuta un aislamiento lógico definitivo sin alterar triggers.
        UPDATE public.championships
        SET 
            status = 'archived',
            visibility = 'private',
            name = '[ARCHIVADO] OPERIX GYMNASTICS — CAMPEONATO PILOTO 2026',
            public_portal_settings = jsonb_build_object(
                'is_testing_event', true,
                'is_archived', true,
                'show_published_results', false,
                'show_participating_clubs', false,
                'show_categories', false,
                'show_medal_tally', false,
                'show_venue_details', false
            ),
            updated_at = timezone('utc'::text, now())
        WHERE id = v_champ_id;

        UPDATE public.registrations
        SET status = 'scratched', updated_at = timezone('utc'::text, now())
        WHERE championship_id = v_champ_id;

        RAISE NOTICE 'OPERIX CLEANUP: Pistas de auditoría WORM detectadas. El torneo fue archivado y aislado lógicamente.';
    ELSE
        -- MODALIDAD B: ELIMINACIÓN FÍSICA ORDENADA (HOJA A RAÍZ, CERO DELETE CASCADE)
        -- Al no existir registros en score_audits, se elimina de forma secuencial y explícita:

        -- 1. Reclamos técnicos y deducciones
        DELETE FROM public.technical_inquiries WHERE championship_id = v_champ_id;
        DELETE FROM public.score_deductions WHERE score_id IN (SELECT id FROM public.scores WHERE championship_id = v_champ_id);

        -- 2. Puntuaciones y marshaling en vivo
        DELETE FROM public.scores WHERE championship_id = v_champ_id;
        DELETE FROM public.apparatus_live_status WHERE championship_id = v_champ_id;

        -- 3. Rotaciones, cronogramas, documentos y ceremonias
        DELETE FROM public.rotation_groups WHERE championship_id = v_champ_id;
        DELETE FROM public.competition_schedules WHERE championship_id = v_champ_id;
        DELETE FROM public.championship_documents WHERE championship_id = v_champ_id;
        DELETE FROM public.championship_awards_ceremonies WHERE championship_id = v_champ_id;
        DELETE FROM public.championship_awards_config WHERE championship_id = v_champ_id;

        -- 4. Inscripciones, asignaciones y categorías del torneo
        DELETE FROM public.registrations WHERE championship_id = v_champ_id;
        DELETE FROM public.judge_assignments WHERE championship_id = v_champ_id;
        DELETE FROM public.categories WHERE championship_id = v_champ_id;

        -- 5. Campeonato piloto
        DELETE FROM public.championships WHERE id = v_champ_id;

        -- 6. Gimnastas y membresías de clubes piloto
        DELETE FROM public.gymnasts WHERE organization_id = v_org_id;
        DELETE FROM public.club_members WHERE club_id IN (v_club_a, v_club_b);
        DELETE FROM public.clubs WHERE id IN (v_club_a, v_club_b);

        -- 7. Membresías y Organización piloto
        DELETE FROM public.organization_members WHERE organization_id = v_org_id;
        DELETE FROM public.organizations WHERE id = v_org_id;

        RAISE NOTICE 'OPERIX CLEANUP: Todos los registros del piloto fueron eliminados en orden estricto de dependencias.';
    END IF;
END $$;

COMMIT;
