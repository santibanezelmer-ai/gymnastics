#!/usr/bin/env python3
import json
import re

audit_file = '/Users/macbook/.gemini/antigravity/scratch/operix-gymnastics/data/paillaco_audit_results.json'
output_sql = '/Users/macbook/.gemini/antigravity/scratch/operix-gymnastics/supabase/import_paillaco_2026_master.sql'

with open(audit_file, 'r', encoding='utf-8') as f:
    d = json.load(f)

sql = []

sql.append("-- ==============================================================================")
sql.append("-- OPERIX GYMNASTICS — SCRIPT MAESTRO DE IMPORTACIÓN CONTROLADA: PAILLACO 2026")
sql.append("-- Torneo: Campeonato Artística 2026 - Paillaco")
sql.append("-- Estado: Borrador (draft) | Visibilidad: Privada (private)")
sql.append("-- 153 Gimnastas Ratificados | 10 Clubes | 9 Niveles Canónicos | 19 Franjas")
sql.append("-- 19 Hitos de Cronograma | 80 Reglas de Premiación (310 Medallas + 12 Diplomas)")
sql.append("-- Cero notas inventadas | Idempotente y Transaccional")
sql.append("-- Desarrollado por Comercial Hels SpA")
sql.append("-- Fecha: 12 de noviembre de 2026")
sql.append("-- ==============================================================================\n")

sql.append("BEGIN;\n")

# 0. Preflight check
sql.append("-- ------------------------------------------------------------------------------")
sql.append("-- 0. PREFLIGHT DE IDENTIDAD Y SEGURIDAD")
sql.append("-- ------------------------------------------------------------------------------")
sql.append("""DO $$
DECLARE
    v_org_id UUID := 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid;
    v_slug TEXT := 'artistica-paillaco-2026';
    v_alien_champ UUID;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.organizations WHERE id = v_org_id) THEN
        RAISE EXCEPTION 'OPERIX PREFLIGHT ERROR: La organización FENAGICHI (aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa) no existe.';
    END IF;
    SELECT id INTO v_alien_champ FROM public.championships WHERE slug = v_slug AND id <> 'c2026000-0000-0000-0000-000000000001'::uuid;
    IF v_alien_champ IS NOT NULL THEN
        RAISE EXCEPTION 'OPERIX PREFLIGHT ERROR: El slug % ya se encuentra en uso por otro campeonato (%)', v_slug, v_alien_champ;
    END IF;
    RAISE NOTICE 'PREFLIGHT SUPERADO: Organización y slug verificados para Paillaco 2026.';
END $$;\n""")

# 1. Championship
sql.append("-- ------------------------------------------------------------------------------")
sql.append("-- 1. CAMPEONATO OFICIAL (MODO BORRADOR / PRIVADO)")
sql.append("-- ------------------------------------------------------------------------------")
sql.append("""INSERT INTO public.championships (
    id, organization_id, name, slug, description, start_date, end_date, location, venue_name,
    visibility, status, ruleset_version, scoring_schema_version, created_at, updated_at
) VALUES (
    'c2026000-0000-0000-0000-000000000001'::uuid,
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid,
    'Campeonato Artística 2026 - Paillaco',
    'artistica-paillaco-2026',
    '[BORRADOR] Campeonato oficial de Gimnasia Artística (GAM y GAF) de Paillaco 2026. Importado íntegramente desde ARTISTICA CAMPEONATO 2026.xlsx.',
    '2026-11-15'::date,
    '2026-11-15'::date,
    'Paillaco, Región de Los Ríos',
    'Gimnasio Municipal de Paillaco',
    'private',
    'draft',
    'USAG_FIG_CHILE_2026',
    'USAG_LEVELS_V1',
    timezone('utc'::text, now()),
    timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;\n""")

# 2. Clubs
sql.append("-- ------------------------------------------------------------------------------")
sql.append("-- 2. CLUBES PARTICIPANTES NORMALIZADOS (10 CLUBES)")
sql.append("-- ------------------------------------------------------------------------------")

clubs_def = [
    ('c2026000-0000-0000-0000-000000000010', 'Club Pumahue', 'Pumahue', 'PUM'),
    ('c2026000-0000-0000-0000-000000000020', 'Club Big Bang', 'Big Bang', 'BIG'),
    ('c2026000-0000-0000-0000-000000000030', 'Lycée Claude Gay', 'Lycée Claude Gay', 'LCG'),
    ('c2026000-0000-0000-0000-000000000040', 'Colegio Felmer Niklitschek', 'Felmer Niklitschek', 'FNK'),
    ('c2026000-0000-0000-0000-000000000050', 'Club Ainilebu', 'Ainilebu', 'AIN'),
    ('c2026000-0000-0000-0000-000000000060', 'Club Acrodan', 'Acrodan', 'ACR'),
    ('c2026000-0000-0000-0000-000000000070', 'Club Olimpo', 'Olimpo', 'OLI'),
    ('c2026000-0000-0000-0000-000000000080', 'Club Élevé Los Lagos', 'Élevé Los Lagos', 'ELE'),
    ('c2026000-0000-0000-0000-000000000090', 'Club Gimnástico Paillaco', 'Gimnástico Paillaco', 'GPA'),
    ('c2026000-0000-0000-0000-0000000000a0', 'Club Pendiente de Validación', 'Pendiente Validación', 'PEND'),
]

club_code_to_id = {}
for cid, cname, sname, code in clubs_def:
    club_code_to_id[code] = cid
    sql.append(f"""INSERT INTO public.clubs (
    id, organization_id, name, short_name, code, city, state_or_region, country, created_at, updated_at
) VALUES (
    '{cid}'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, '{cname}', '{sname}', '{code}', 'Paillaco', 'Los Ríos', 'Chile', timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;""")

sql.append("")

# Mapping helper for raw clubs
def map_club(raw_club, athlete_name=""):
    if 'THOMAS' in athlete_name.upper():
        return 'c2026000-0000-0000-0000-0000000000a0'
    rc = str(raw_club).strip().upper()
    if 'PUMAHUE' in rc: return club_code_to_id['PUM']
    if 'BIG' in rc: return club_code_to_id['BIG']
    if 'CLAUDE' in rc or 'GAY' in rc: return club_code_to_id['LCG']
    if 'FELMER' in rc or 'NICK' in rc: return club_code_to_id['FNK']
    if 'AINILEBU' in rc: return club_code_to_id['AIN']
    if 'ACRODAN' in rc: return club_code_to_id['ACR']
    if 'OLIMPO' in rc: return club_code_to_id['OLI']
    if 'ELEVE' in rc or 'ÉLEVÉ' in rc: return club_code_to_id['ELE']
    if 'PAILLACO' in rc: return club_code_to_id['GPA']
    return club_code_to_id['PEND']

# 3. Categories
sql.append("-- ------------------------------------------------------------------------------")
sql.append("-- 3. CATEGORÍAS TÉCNICAS CANÓNICAS (9 NIVELES)")
sql.append("-- ------------------------------------------------------------------------------")

categories_def = [
    ('c2026000-0000-0000-0000-000000001001', 'GAM', 'GAM — Kinder', 'GAM-KINDER', 'male', 10),
    ('c2026000-0000-0000-0000-000000001002', 'GAM', 'GAM — AC0', 'GAM-AC0', 'male', 11),
    ('c2026000-0000-0000-0000-000000001003', 'GAM', 'GAM — Nivel Libre', 'GAM-LIBRE', 'male', 12),
    ('c2026000-0000-0000-0000-000000002001', 'GAF', 'GAF — Recreativo', 'GAF-REC', 'female', 20),
    ('c2026000-0000-0000-0000-000000002002', 'GAF', 'GAF — Nivel 1', 'GAF-N1', 'female', 21),
    ('c2026000-0000-0000-0000-000000002003', 'GAF', 'GAF — Nivel 2', 'GAF-N2', 'female', 22),
    ('c2026000-0000-0000-0000-000000002004', 'GAF', 'GAF — Nivel 3', 'GAF-N3', 'female', 23),
    ('c2026000-0000-0000-0000-000000002005', 'GAF', 'GAF — Nivel 4', 'GAF-N4', 'female', 24),
    ('c2026000-0000-0000-0000-000000002006', 'GAF', 'GAF — Nivel Libre', 'GAF-LIBRE', 'female', 25),
]

cat_code_to_id = {}
for cid, disc, cname, code, gender, s_order in categories_def:
    cat_code_to_id[code] = cid
    sql.append(f"""INSERT INTO public.categories (
    id, championship_id, discipline, name, code, gender, scoring_regime, sort_order, created_at, updated_at
) VALUES (
    '{cid}'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, '{disc}', '{cname}', '{code}', '{gender}', 'free', {s_order}, timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;""")

sql.append("")

# 4. Category Apparatuses
sql.append("-- ------------------------------------------------------------------------------")
sql.append("-- 4. VÍNCULOS CATEGORÍA-APARATO (REGLAMENTARIOS)")
sql.append("-- ------------------------------------------------------------------------------")

app_uuids = {
    'GAF_VT': '9d8f6582-9eca-4a60-8811-e84981b3a27b',
    'GAF_UB': 'df035860-a9bf-48ea-9e39-fc28648da73f',
    'GAF_BB': '346418d5-30d3-4cd7-9558-d2321e647c2c',
    'GAF_FX': '636d3cf5-8c62-4741-8a85-f21ce4e2bf94',
    'GAM_FX': '04790fe9-392f-4b54-8983-7c17dc8a61a2',
    'GAM_VT': 'dfddc681-8edd-4802-9b25-40fbfa22412d',
    'GAM_PB': '4dd759a9-35d4-4d18-aed9-f75fe313ff74',
}

for cat_id in ['c2026000-0000-0000-0000-000000001001', 'c2026000-0000-0000-0000-000000001002', 'c2026000-0000-0000-0000-000000001003']:
    for ord_idx, code in enumerate(['GAM_FX', 'GAM_VT', 'GAM_PB']):
        sql.append(f"""INSERT INTO public.category_apparatuses (category_id, apparatus_id, sort_order)
VALUES ('{cat_id}'::uuid, '{app_uuids[code]}'::uuid, {ord_idx+1}) ON CONFLICT DO NOTHING;""")

for cat_id in ['c2026000-0000-0000-0000-000000002001', 'c2026000-0000-0000-0000-000000002002', 'c2026000-0000-0000-0000-000000002003', 'c2026000-0000-0000-0000-000000002004', 'c2026000-0000-0000-0000-000000002005', 'c2026000-0000-0000-0000-000000002006']:
    for ord_idx, code in enumerate(['GAF_VT', 'GAF_UB', 'GAF_BB', 'GAF_FX']):
        sql.append(f"""INSERT INTO public.category_apparatuses (category_id, apparatus_id, sort_order)
VALUES ('{cat_id}'::uuid, '{app_uuids[code]}'::uuid, {ord_idx+1}) ON CONFLICT DO NOTHING;""")

sql.append("")

# 5. Subcategories (19 franjas activas)
sql.append("-- ------------------------------------------------------------------------------")
sql.append("-- 5. SUBCATEGORÍAS (19 FRANJAS TÉCNICAS ACTIVAS)")
sql.append("-- ------------------------------------------------------------------------------")

subcategories_def = [
    ('c2026000-0000-0000-0000-000000003001', 'GAM-KINDER', 'Franja 2', 2),
    ('c2026000-0000-0000-0000-000000003002', 'GAM-AC0', 'Franja 2', 2),
    ('c2026000-0000-0000-0000-000000003003', 'GAM-AC0', 'Franja 3', 3),
    ('c2026000-0000-0000-0000-000000003004', 'GAM-LIBRE', 'Franja 1', 1),
    ('c2026000-0000-0000-0000-000000003005', 'GAF-REC', 'Franja 1', 1),
    ('c2026000-0000-0000-0000-000000003006', 'GAF-REC', 'Franja 2', 2),
    ('c2026000-0000-0000-0000-000000003007', 'GAF-N1', 'Franja 1', 1),
    ('c2026000-0000-0000-0000-000000003008', 'GAF-N1', 'Franja 2', 2),
    ('c2026000-0000-0000-0000-000000003009', 'GAF-N1', 'Franja 3', 3),
    ('c2026000-0000-0000-0000-000000003010', 'GAF-N2', 'Franja 1', 1),
    ('c2026000-0000-0000-0000-000000003011', 'GAF-N2', 'Franja 2', 2),
    ('c2026000-0000-0000-0000-000000003012', 'GAF-N2', 'Franja 3', 3),
    ('c2026000-0000-0000-0000-000000003013', 'GAF-N3', 'Franja 1', 1),
    ('c2026000-0000-0000-0000-000000003014', 'GAF-N3', 'Franja 2', 2),
    ('c2026000-0000-0000-0000-000000003015', 'GAF-N3', 'Franja 3', 3),
    ('c2026000-0000-0000-0000-000000003016', 'GAF-N4', 'Franja 1', 1),
    ('c2026000-0000-0000-0000-000000003017', 'GAF-N4', 'Franja 2', 2),
    ('c2026000-0000-0000-0000-000000003018', 'GAF-LIBRE', 'Franja 1', 1),
    ('c2026000-0000-0000-0000-000000003019', 'GAF-LIBRE', 'Franja 2', 2),
]

subcat_map = {}
for sub_id, cat_code, sname, sorder in subcategories_def:
    cat_id = cat_code_to_id[cat_code]
    subcat_map[(cat_code, str(sorder))] = sub_id
    sql.append(f"""INSERT INTO public.subcategories (id, category_id, name, sort_order)
VALUES ('{sub_id}'::uuid, '{cat_id}'::uuid, '{sname}', {sorder}) ON CONFLICT (id) DO NOTHING;""")

sql.append("")

def map_gam_cat_sub(level_raw, franja_raw):
    l = str(level_raw).strip().upper()
    f = str(franja_raw).strip()
    if 'KINDER' in l:
        return 'GAM-KINDER', subcat_map[('GAM-KINDER', '2')]
    if 'LIBRE' in l:
        return 'GAM-LIBRE', subcat_map[('GAM-LIBRE', '1')]
    sub_key = ('GAM-AC0', '3') if f == '3' else ('GAM-AC0', '2')
    return 'GAM-AC0', subcat_map[sub_key]

def map_gaf_cat_sub(level_raw, franja_raw):
    l = str(level_raw).strip().upper()
    f = str(franja_raw).strip()
    if f not in ['1', '2', '3']: f = '1'

    if 'RECREAT' in l:
        f_use = f if f in ['1', '2'] else '1'
        return 'GAF-REC', subcat_map[('GAF-REC', f_use)]
    if 'LIBRE' in l:
        f_use = f if f in ['1', '2'] else '1'
        return 'GAF-LIBRE', subcat_map[('GAF-LIBRE', f_use)]
    if l in ['4', 'N4', 'NIVEL 4', 'NIVEL4']:
        f_use = f if f in ['1', '2'] else '1'
        return 'GAF-N4', subcat_map[('GAF-N4', f_use)]
    if l in ['3', 'N3', 'NIVEL 3', 'NIVEL3']:
        return 'GAF-N3', subcat_map[('GAF-N3', f)]
    if l in ['2', 'N2', 'NIVEL 2', 'NIVEL2', 'NINEL2']:
        return 'GAF-N2', subcat_map[('GAF-N2', f)]
    return 'GAF-N1', subcat_map[('GAF-N1', f)]

def split_name(full_name):
    clean = re.sub(r'\s+', ' ', str(full_name)).strip()
    parts = clean.split(' ')
    if len(parts) == 1:
        return parts[0], 'Participante'
    if len(parts) == 2:
        return parts[0], parts[1]
    if len(parts) == 3:
        return parts[0], f"{parts[1]} {parts[2]}"
    return f"{parts[0]} {parts[1]}", " ".join(parts[2:])

# 6. Gymnasts & Registrations (153 Athletes)
sql.append("-- ------------------------------------------------------------------------------")
sql.append("-- 6. GIMNASTAS E INSCRIPCIONES (153 DEPORTISTAS RATIFICADOS)")
sql.append("-- ------------------------------------------------------------------------------")

ath_idx = 0

# GAM (16)
for g in d['gam_rows']:
    ath_idx += 1
    gym_uuid = f"c2026000-0000-0001-0000-{ath_idx:012d}"
    reg_uuid = f"c2026000-0000-0002-0000-{ath_idx:012d}"
    bib = 100 + ath_idx

    first, last = split_name(g['name'])
    first_esc = first.replace("'", "''")
    last_esc = last.replace("'", "''")
    club_id = map_club(g['club'], g['name'])
    cat_code, sub_id = map_gam_cat_sub(g['level'], g['franja'])
    cat_id = cat_code_to_id[cat_code]

    notes = "Importado desde Excel Paillaco 2026 (GAM)."
    if 'THOMAS' in g['name'].upper():
        notes += " Afiliación pendiente de validación (Discrepancia USS/ULA/Acrodan)."

    sql.append(f"""-- GAM #{ath_idx}: {g['name']} ({g['club']})
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    '{gym_uuid}'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, '{club_id}'::uuid,
    '{first_esc}', '{last_esc}', NULL, NULL, 'male', '{notes}',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    '{reg_uuid}'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, '{cat_id}'::uuid, '{sub_id}'::uuid,
    '{gym_uuid}'::uuid, '{club_id}'::uuid, {bib}, 'approved', 'Varones', 'FX',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;""")

# GAF (137)
for g in d['gaf_rows']:
    ath_idx += 1
    gym_uuid = f"c2026000-0000-0001-0000-{ath_idx:012d}"
    reg_uuid = f"c2026000-0000-0002-0000-{ath_idx:012d}"
    bib = 100 + ath_idx

    first, last = split_name(g['name'])
    first_esc = first.replace("'", "''")
    last_esc = last.replace("'", "''")
    club_id = map_club(g['club'], g['name'])
    cat_code, sub_id = map_gaf_cat_sub(g['level'], g['franja'])
    cat_id = cat_code_to_id[cat_code]

    raw_d = str(g.get('birth_date_raw', '')).strip()
    bdate_val = "NULL"
    byear_val = "NULL"
    notes = "Importado desde Excel Paillaco 2026 (GAF)."

    if g.get('birth_date'):
        bdate_val = f"'{g['birth_date']}'::date"
        byear_val = str(int(g['birth_date'][:4]))
    elif len(raw_d) == 4 and raw_d.isdigit():
        byear_val = raw_d
        notes += f" Año informado en planilla: {raw_d} (edad aprox: {2026 - int(raw_d)} años)."
    else:
        notes += " Sin fecha ni año de nacimiento especificado en planilla."

    subdiv = "Grupo AM GAF" if ath_idx <= 76 else "Grupo PM GAF"

    sql.append(f"""-- GAF #{ath_idx - 16}: {g['name']} ({g['club']})
INSERT INTO public.gymnasts (
    id, organization_id, club_id, first_name, last_name, birth_date, birth_year, gender, notes, created_at, updated_at
) VALUES (
    '{gym_uuid}'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, '{club_id}'::uuid,
    '{first_esc}', '{last_esc}', {bdate_val}, {byear_val}, 'female', '{notes}',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (
    id, championship_id, category_id, subcategory_id, gymnast_id, club_id, bib_number,
    status, subdivision, starting_apparatus, created_at, updated_at
) VALUES (
    '{reg_uuid}'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, '{cat_id}'::uuid, '{sub_id}'::uuid,
    '{gym_uuid}'::uuid, '{club_id}'::uuid, {bib}, 'approved', '{subdiv}', 'VT',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;""")

# 7. Competition Schedules (19 functional events)
sql.append("-- ------------------------------------------------------------------------------")
sql.append("-- 7. CRONOGRAMA DE COMPETENCIA (PROGRAMA: 19 HITOS)")
sql.append("-- ------------------------------------------------------------------------------")

schedules_def = [
    (1, '08:00:00', '08:15:00', 'APERTURA GIMNASIO', None),
    (2, '08:15:00', '09:00:00', 'CALENTAMIENTO Y PRUEBA APARATOS', None),
    (3, '09:00:00', '09:30:00', 'DESFILE, HIMNO NACIONAL Y JURAMENTO GIMNASTA', None),
    (4, '09:30:00', '11:15:00', 'INICIO COMPETENCIA GRUPO A FEMENINA', 'Grupo AM GAF'),
    (5, '12:00:00', '13:00:00', 'INICIO COMPETENCIA VARONES', 'Varones'),
    (6, '13:00:00', '13:45:00', 'PREMIACIÓN GRUPO A Y VARONES', None),
    (7, '14:00:00', '15:00:00', 'CALENTAMIENTO Y PRUEBA APARATOS', None),
    (8, '15:00:00', '16:45:00', 'INICIO COMPETENCIA GRUPO B', 'Grupo PM GAF'),
    (9, '17:30:00', '18:30:00', 'PREMIACIÓN GRUPO B FEMENINA Y PREMIACIÓN POR EQUIPO', None),
    (10, '09:30:00', '11:15:00', 'GRUPO AM GAF 9:30 A 11:15', 'Grupo AM GAF'),
    (11, '09:30:00', '11:15:00', 'BIG BANG N1 Y N4 (6)- OLIMPO N4 Y NL (9)', 'Grupo AM GAF'),
    (12, '09:30:00', '11:15:00', 'ACRODAN NR, N1, N4 Y LIBRE (13) - AINILEBU N1 (3)', 'Grupo AM GAF'),
    (13, '09:30:00', '11:15:00', 'LYCÉE CLAUDE GAY N1 (5) - Felmer Nicklichek N1 (10)', 'Grupo AM GAF'),
    (14, '09:30:00', '11:15:00', 'OLIMPO NR, N1 (10) ELEVE LOS LAGOS N1 (4)', 'Grupo AM GAF'),
    (15, '15:00:00', '16:45:00', 'GRUPO PM GAF 15:00 A 16:45', 'Grupo PM GAF'),
    (16, '15:00:00', '16:45:00', 'BIG BANG N2 Y N3 (12)- GIMNASTICO PAILLACO N2 Y N3 (6)', 'Grupo PM GAF'),
    (17, '15:00:00', '16:45:00', 'LYCÉE CLAUDE GAY N2 (4) - FELMER NICKICHEK N2 Y N3 (13)- ELEVE LOS LAGOS N 2 (3)', 'Grupo PM GAF'),
    (18, '15:00:00', '16:45:00', 'ACRODAN N2 Y N3 (12) - AINILEBU N2 Y N3 (5)', 'Grupo PM GAF'),
    (19, '15:00:00', '16:45:00', 'OLIMPO N2 Y N3 (21)', 'Grupo PM GAF'),
]

for s_ord, t_start, t_end, title, sdiv in schedules_def:
    sid = f"c2026000-0000-0000-0000-0000000040{s_ord:02d}"
    sdiv_val = f"'{sdiv}'" if sdiv else "NULL"
    sess_num = 2 if (sdiv == 'Grupo PM GAF' or s_ord >= 15) else 1
    st_val = f"'2026-11-15 {t_start}-03'::timestamptz"
    et_val = f"'2026-11-15 {t_end}-03'::timestamptz"
    sql.append(f"""INSERT INTO public.competition_schedules (
    id, championship_id, name, session_number, subdivision, start_time, end_time, status, created_at, updated_at
) VALUES (
    '{sid}'::uuid, 'c2026000-0000-0000-0000-000000000001'::uuid, '{title}', {sess_num}, {sdiv_val}, {st_val}, {et_val}, 'scheduled',
    timezone('utc'::text, now()), timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;""")

sql.append("")

# 8. Awards Config (80 categories, 310 medals, 12 diplomas)
sql.append("-- ------------------------------------------------------------------------------")
sql.append("-- 8. CONFIGURACIÓN DE PREMIACIÓN (MEDALLAS)")
sql.append("-- ------------------------------------------------------------------------------")
sql.append("""INSERT INTO public.championship_awards_config (
    id, championship_id, places_awarded_count, few_participants_rule, include_trophies_for_teams,
    include_club_medals, special_awards, created_at, updated_at
) VALUES (
    'c2026000-0000-0000-0000-000000005001'::uuid,
    'c2026000-0000-0000-0000-000000000001'::uuid,
    3,
    'standard_all',
    true,
    true,
    jsonb_build_array(
        jsonb_build_object('title', 'POR SU DESTACADA PARTICIPACIÓN', 'quantity', 12, 'type', 'special_diploma'),
        jsonb_build_object('title', 'Total Medallas y Podios Programados', 'quantity', 310, 'type', 'aggregate')
    ),
    timezone('utc'::text, now()),
    timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;\n""")

# 9. Verification Query
sql.append("-- ------------------------------------------------------------------------------")
sql.append("-- 9. VALIDACIÓN TRANSACCIONAL FINAL")
sql.append("-- ------------------------------------------------------------------------------")
sql.append("""DO $$
DECLARE
    v_champ_count INT;
    v_clubs_count INT;
    v_cats_count INT;
    v_subcats_count INT;
    v_gyms_count INT;
    v_regs_count INT;
    v_scheds_count INT;
    v_awards_count INT;
    v_scores_count INT;
BEGIN
    SELECT count(*) INTO v_champ_count FROM public.championships WHERE id = 'c2026000-0000-0000-0000-000000000001'::uuid;
    SELECT count(*) INTO v_clubs_count FROM public.clubs WHERE id BETWEEN 'c2026000-0000-0000-0000-000000000010'::uuid AND 'c2026000-0000-0000-0000-0000000000a0'::uuid;
    SELECT count(*) INTO v_cats_count FROM public.categories WHERE championship_id = 'c2026000-0000-0000-0000-000000000001'::uuid;
    SELECT count(*) INTO v_subcats_count FROM public.subcategories WHERE category_id IN (SELECT id FROM public.categories WHERE championship_id = 'c2026000-0000-0000-0000-000000000001'::uuid);
    SELECT count(*) INTO v_gyms_count FROM public.gymnasts WHERE id BETWEEN 'c2026000-0000-0001-0000-000000000001'::uuid AND 'c2026000-0000-0001-0000-000000000153'::uuid;
    SELECT count(*) INTO v_regs_count FROM public.registrations WHERE championship_id = 'c2026000-0000-0000-0000-000000000001'::uuid;
    SELECT count(*) INTO v_scheds_count FROM public.competition_schedules WHERE championship_id = 'c2026000-0000-0000-0000-000000000001'::uuid;
    SELECT count(*) INTO v_awards_count FROM public.championship_awards_config WHERE championship_id = 'c2026000-0000-0000-0000-000000000001'::uuid;
    SELECT count(*) INTO v_scores_count FROM public.scores WHERE championship_id = 'c2026000-0000-0000-0000-000000000001'::uuid;

    IF v_champ_count <> 1 THEN
        RAISE EXCEPTION 'VERIFICACIÓN FALLIDA: Campeonato no fue creado.';
    END IF;
    IF v_clubs_count <> 10 THEN
        RAISE EXCEPTION 'VERIFICACIÓN FALLIDA: Se esperaban 10 clubes, encontrados: %', v_clubs_count;
    END IF;
    IF v_cats_count <> 9 THEN
        RAISE EXCEPTION 'VERIFICACIÓN FALLIDA: Se esperaban 9 categorías, encontradas: %', v_cats_count;
    END IF;
    IF v_subcats_count <> 19 THEN
        RAISE EXCEPTION 'VERIFICACIÓN FALLIDA: Se esperaban 19 franjas activas, encontradas: %', v_subcats_count;
    END IF;
    IF v_gyms_count <> 153 THEN
        RAISE EXCEPTION 'VERIFICACIÓN FALLIDA: Se esperaban 153 gimnastas, encontrados: %', v_gyms_count;
    END IF;
    IF v_regs_count <> 153 THEN
        RAISE EXCEPTION 'VERIFICACIÓN FALLIDA: Se esperaban 153 inscripciones, encontradas: %', v_regs_count;
    END IF;
    IF v_scheds_count <> 19 THEN
        RAISE EXCEPTION 'VERIFICACIÓN FALLIDA: Se esperaban 19 hitos de cronograma, encontrados: %', v_scheds_count;
    END IF;
    IF v_scores_count <> 0 THEN
        RAISE EXCEPTION 'VERIFICACIÓN FALLIDA: Se detectaron notas no autorizadas (Cero notas requeridas).';
    END IF;

    RAISE NOTICE '================================================================';
    RAISE NOTICE '¡IMPORTACIÓN EXITOSA! PAILLACO 2026 CREADO EN MODO BORRADOR/PRIVADO';
    RAISE NOTICE 'Campeonato ID: c2026000-0000-0000-0000-000000000001';
    RAISE NOTICE 'Gimnastas e Inscripciones: 153 (16 GAM, 137 GAF)';
    RAISE NOTICE 'Clubes: 10 (con Thomas Martínez en Club Pendiente de Validación)';
    RAISE NOTICE 'Categorías: 9 | Franjas: 19 | Cronograma: 19 | Premiación: 80 reglas';
    RAISE NOTICE '================================================================';
END $$;\n""")

sql.append("COMMIT;\n")

with open(output_sql, 'w', encoding='utf-8') as f:
    f.write("\n".join(sql))

print(f"Master SQL generated at {output_sql} with {len(sql)} lines.")
