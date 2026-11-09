-- ==============================================================================
-- OPERIX GYMNASTICS — LIMPIEZA DEFINITIVA DEL CAMPEONATO PILOTO (2026)
-- Versión Auditada: Validación Estricta de Propiedad, Protección de Archivos
-- en Storage, Preservación WORM de score_audits y Cero DELETE CASCADE
-- Desarrollado por Comercial Hels SpA
-- Fecha: 8 de noviembre de 2026
-- ==============================================================================

BEGIN;

DO $$
DECLARE
    -- Identificadores canónicos estrictos del piloto
    v_champ_id    UUID := 'e0000000-0000-0000-0000-000000001000'::uuid;
    v_org_id      UUID := 'e0000000-0000-0000-0000-000000000001'::uuid;
    v_club_a      UUID := 'e0000000-0000-0000-0000-000000000010'::uuid;
    v_club_b      UUID := 'e0000000-0000-0000-0000-000000000020'::uuid;
    v_gym_1       UUID := 'e0000000-0000-0000-0000-000000000101'::uuid;
    v_gym_2       UUID := 'e0000000-0000-0000-0000-000000000102'::uuid;
    v_gym_3       UUID := 'e0000000-0000-0000-0000-000000000201'::uuid;
    v_gym_4       UUID := 'e0000000-0000-0000-0000-000000000202'::uuid;
    v_cat_id      UUID := 'e0000000-0000-0000-0000-000000002001'::uuid;
    v_reg_1       UUID := 'e0000000-0000-0000-0000-000000003001'::uuid;
    v_reg_2       UUID := 'e0000000-0000-0000-0000-000000003002'::uuid;
    v_reg_3       UUID := 'e0000000-0000-0000-0000-000000003003'::uuid;
    v_reg_4       UUID := 'e0000000-0000-0000-0000-000000003004'::uuid;
    v_sched_1     UUID := 'e0000000-0000-0000-0000-000000004001'::uuid;
    v_rot_1       UUID := 'e0000000-0000-0000-0000-000000005001'::uuid;
    v_rot_2       UUID := 'e0000000-0000-0000-0000-000000005002'::uuid;
    v_live_vt     UUID := 'e0000000-0000-0000-0000-000000006001'::uuid;
    v_live_ub     UUID := 'e0000000-0000-0000-0000-000000006002'::uuid;
    v_live_bb     UUID := 'e0000000-0000-0000-0000-000000006003'::uuid;
    v_live_fx     UUID := 'e0000000-0000-0000-0000-000000006004'::uuid;
    v_awards_cfg  UUID := 'e0000000-0000-0000-0000-000000007001'::uuid;

    v_has_audits     BOOLEAN;
    v_has_scores     BOOLEAN;
    v_has_documents  BOOLEAN;
    v_has_inquiries  BOOLEAN;
BEGIN
    -- 1. EVALUAR CONDICIONES DE SEGURIDAD Y PRESERVACIÓN
    -- 1.1 ¿Existen pistas inmutables en score_audits?
    SELECT EXISTS (
        SELECT 1 FROM public.score_audits sa
        JOIN public.scores s ON s.id = sa.score_id
        WHERE s.championship_id = v_champ_id
    ) INTO v_has_audits;

    -- 1.2 ¿Se ingresaron puntuaciones deportivas durante la prueba?
    SELECT EXISTS (
        SELECT 1 FROM public.scores WHERE championship_id = v_champ_id
    ) INTO v_has_scores;

    -- 1.3 ¿Se generaron documentos oficiales (actas, PDFs que puedan existir en Storage)?
    SELECT EXISTS (
        SELECT 1 FROM public.championship_documents WHERE championship_id = v_champ_id
    ) INTO v_has_documents;

    -- 1.4 ¿Se ingresaron reclamos técnicos?
    SELECT EXISTS (
        SELECT 1 FROM public.technical_inquiries WHERE championship_id = v_champ_id
    ) INTO v_has_inquiries;

    -- 2. DECISIÓN DE LIMPIEZA
    IF v_has_audits OR v_has_scores OR v_has_documents OR v_has_inquiries THEN
        -- MODALIDAD A: ARCHIVADO SEGURO Y DETENCIÓN DE ELIMINACIÓN FÍSICA
        -- Preserva la inmutabilidad jurídica de score_audits, previene inconsistencias con archivos
        -- en Storage y mantiene la trazabilidad sin violar triggers.
        UPDATE public.championships
        SET 
            status = 'archived',
            visibility = 'private',
            name = '[ARCHIVADO] OPERIX GYMNASTICS — CAMPEONATO PILOTO 2026',
            description = '[ARCHIVADO] Campeonato piloto finalizado. Datos técnicos archivados bajo trazabilidad inmutable.',
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
        WHERE id = v_champ_id AND organization_id = v_org_id;

        UPDATE public.registrations
        SET status = 'scratched', updated_at = timezone('utc'::text, now())
        WHERE championship_id = v_champ_id AND id IN (v_reg_1, v_reg_2, v_reg_3, v_reg_4);

        RAISE NOTICE 'OPERIX CLEANUP SEGURO: Se detectaron registros operativos (auditorías, notas o documentos). Se ejecutó archivado lógico estricto para preservar la inmutabilidad.';
    ELSE
        -- MODALIDAD B: ELIMINACIÓN FÍSICA ESTRICTA (HOJA A RAÍZ, ID POR ID, CERO CASCADE)
        -- Solo se ejecuta si el piloto no generó registros de actividad.
        -- Cada sentencia valida ID exacto y relación de pertenencia.

        -- 1. Estados de pista (Marshaling)
        DELETE FROM public.apparatus_live_status 
        WHERE championship_id = v_champ_id 
          AND id IN (v_live_vt, v_live_ub, v_live_bb, v_live_fx);

        -- 2. Grupos de rotación
        DELETE FROM public.rotation_groups 
        WHERE championship_id = v_champ_id 
          AND id IN (v_rot_1, v_rot_2);

        -- 3. Cronograma de competencia
        DELETE FROM public.competition_schedules 
        WHERE championship_id = v_champ_id 
          AND id = v_sched_1;

        -- 4. Configuración de premiación
        DELETE FROM public.championship_awards_config 
        WHERE championship_id = v_champ_id 
          AND id = v_awards_cfg;

        -- 5. Inscripciones
        DELETE FROM public.registrations 
        WHERE championship_id = v_champ_id 
          AND id IN (v_reg_1, v_reg_2, v_reg_3, v_reg_4);

        -- 6. Categoría
        DELETE FROM public.categories 
        WHERE championship_id = v_champ_id 
          AND id = v_cat_id;

        -- 7. Campeonato piloto
        DELETE FROM public.championships 
        WHERE id = v_champ_id 
          AND organization_id = v_org_id;

        -- 8. Gimnastas
        DELETE FROM public.gymnasts 
        WHERE organization_id = v_org_id 
          AND id IN (v_gym_1, v_gym_2, v_gym_3, v_gym_4);

        -- 9. Clubes piloto
        DELETE FROM public.clubs 
        WHERE organization_id = v_org_id 
          AND id IN (v_club_a, v_club_b);

        -- 10. Organización piloto
        DELETE FROM public.organizations 
        WHERE id = v_org_id 
          AND slug = 'fed-piloto-operix';

        RAISE NOTICE 'OPERIX CLEANUP COMPLETO: Todos los registros del piloto fueron eliminados secuencialmente sin residuo alguno.';
    END IF;
END $$;

COMMIT;
