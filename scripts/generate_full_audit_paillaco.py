#!/usr/bin/env python3
"""
OPERIX GYMNASTICS — AUDITORÍA TÉCNICA Y DIAGNÓSTICO EXHAUSTIVO DEL EXCEL
Archivo: ARTISTICA CAMPEONATO 2026.xlsx
Desarrollado por Comercial Hels SpA
Fecha: 12 de noviembre de 2026
"""

import zipfile
import xml.etree.ElementTree as ET
import json
import re
from datetime import datetime, timedelta
from collections import defaultdict, Counter

excel_path = '/Users/macbook/.gemini/antigravity/scratch/operix-gymnastics/data/ARTISTICA CAMPEONATO 2026.xlsx'
output_json_path = '/Users/macbook/.gemini/antigravity/scratch/operix-gymnastics/data/paillaco_audit_results.json'

ns = {'main': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}

def parse_excel(path):
    with zipfile.ZipFile(path, 'r') as z:
        shared_strings = []
        if 'xl/sharedStrings.xml' in z.namelist():
            ss_root = ET.fromstring(z.read('xl/sharedStrings.xml'))
            for si in ss_root.findall('main:si', ns):
                text = "".join([t.text or "" for t in si.iter('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}t')])
                shared_strings.append(text)
        
        wb_root = ET.fromstring(z.read('xl/workbook.xml'))
        sheets = {}
        for s in wb_root.find('main:sheets', ns).findall('main:sheet', ns):
            sheets[s.attrib['name']] = s.attrib.get('{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id')
        
        wb_rels = ET.fromstring(z.read('xl/_rels/workbook.xml.rels'))
        rel_map = {rel.attrib['Id']: rel.attrib['Target'] for rel in wb_rels.findall('{http://schemas.openxmlformats.org/package/2006/relationships}Relationship')}

        sheet_data = {}
        for name, r_id in sheets.items():
            target = rel_map.get(r_id)
            target_path = 'xl/' + target if not target.startswith('xl/') else target
            sheet_root = ET.fromstring(z.read(target_path))
            rows = sheet_root.find('main:sheetData', ns).findall('main:row', ns)
            
            grid = {}
            for row in rows:
                r_num = int(row.attrib.get('r'))
                for c in row.findall('main:c', ns):
                    c_ref = c.attrib.get('r')
                    c_type = c.attrib.get('t')
                    v_el = c.find('main:v', ns)
                    val = ""
                    if v_el is not None and v_el.text:
                        v_raw = v_el.text
                        if c_type == 's':
                            val = shared_strings[int(v_raw)]
                        else:
                            val = v_raw
                    elif c.find('main:is', ns) is not None:
                        t_el = c.find('main:is', ns).find('main:t', ns)
                        if t_el is not None:
                            val = t_el.text or ""
                    
                    m = re.match(r'([A-Z]+)(\d+)', c_ref)
                    col_str = m.group(1)
                    grid[(r_num, col_str)] = val.strip()
            sheet_data[name] = grid
    return sheet_data

def excel_serial_to_date(val):
    if not val:
        return None
    val = str(val).strip()
    if val.isdigit():
        n = int(val)
        if 1900 < n < 2050:
            return f"{n}-01-01"
        if n > 30000:
            base = datetime(1899, 12, 30)
            return (base + timedelta(days=n)).strftime('%Y-%m-%d')
    for fmt in ['%Y-%m-%d', '%d/%m/%Y', '%d-%m-%Y', '%Y']:
        try:
            dt = datetime.strptime(val, fmt)
            return dt.strftime('%Y-%m-%d')
        except ValueError:
            pass
    return val

def norm_text(s):
    if not s: return ""
    s = s.strip()
    s = re.sub(r'\s+', ' ', s)
    return s

def norm_key(s):
    s = norm_text(s).lower()
    for k, v in {'á':'a', 'é':'e', 'í':'i', 'ó':'o', 'ú':'u', 'ñ':'n', 'ü':'u'}.items():
        s = s.replace(k, v)
    return s

# Normalization maps for Clubs
CLUB_CANONICAL = {
    'pumahue': 'Club Pumahue',
    'big bang': 'Club Big Bang',
    'bing bang': 'Club Big Bang',
    'lycée claude gay': 'Lycée Claude Gay',
    'lycee claude gay': 'Lycée Claude Gay',
    'felmer nicklichek': 'Colegio Felmer Niklitschek',
    'felmer nickichek': 'Colegio Felmer Niklitschek',
    'ainilebu': 'Club Ainilebu',
    'acrodan': 'Club Acrodan',
    'olimpo': 'Club Olimpo',
    'eleve los lagos': 'Club Élevé Los Lagos',
    'gimnastico paillaco': 'Club Gimnástico Paillaco',
    'uss': 'Universidad San Sebastián (USS)',
    'ula': 'Universidad de Los Lagos (ULA)',
}

def canonical_club(name):
    k = norm_key(name)
    return CLUB_CANONICAL.get(k, norm_text(name))

sheets = parse_excel(excel_path)

# Extract Hoja1
h1_rows = []
for r in sorted(list(set(r for r, c in sheets['Hoja1'].keys()))):
    name = sheets['Hoja1'].get((r, 'A'), '')
    if not name or 'NOMBRE' in name: continue
    h1_rows.append({
        'sheet': 'Hoja1',
        'row': r,
        'name_raw': name,
        'name': norm_text(name),
        'level_raw': sheets['Hoja1'].get((r, 'B'), ''), 'level': norm_text(sheets['Hoja1'].get((r, 'B'), '')),
        'franja_raw': sheets['Hoja1'].get((r, 'C'), ''), 'franja': norm_text(sheets['Hoja1'].get((r, 'C'), '')),
        'club_raw': sheets['Hoja1'].get((r, 'D'), ''), 'club': norm_text(sheets['Hoja1'].get((r, 'D'), '')),
        'salto': sheets['Hoja1'].get((r, 'E'), '') == 'X',
        'suelo': sheets['Hoja1'].get((r, 'F'), '') == 'X',
        'viga': sheets['Hoja1'].get((r, 'G'), '') == 'X',
        'barra': sheets['Hoja1'].get((r, 'H'), '') == 'X',
        'paralela': sheets['Hoja1'].get((r, 'I'), '') == 'X',
    })

# Extract GAM
gam_rows = []
for r in sorted(list(set(r for r, c in sheets['GAM'].keys()))):
    name = sheets['GAM'].get((r, 'A'), '')
    if not name or 'NOMBRE' in name: continue
    gam_rows.append({
        'sheet': 'GAM',
        'row': r,
        'name_raw': name,
        'name': norm_text(name),
        'level_raw': sheets['GAM'].get((r, 'B'), ''), 'level': norm_text(sheets['GAM'].get((r, 'B'), '')),
        'franja_raw': sheets['GAM'].get((r, 'C'), ''), 'franja': norm_text(sheets['GAM'].get((r, 'C'), '')),
        'club_raw': sheets['GAM'].get((r, 'D'), ''), 'club': norm_text(sheets['GAM'].get((r, 'D'), '')),
        'salto': sheets['GAM'].get((r, 'E'), '') == 'X',
        'suelo': sheets['GAM'].get((r, 'F'), '') == 'X',
        'viga': sheets['GAM'].get((r, 'G'), '') == 'X',
        'barra': sheets['GAM'].get((r, 'H'), '') == 'X',
        'paralela': sheets['GAM'].get((r, 'I'), '') == 'X',
    })

# Extract GAF
gaf_rows = []
for r in sorted(list(set(r for r, c in sheets['GAF'].keys()))):
    name = sheets['GAF'].get((r, 'A'), '')
    if not name or 'NOMBRE' in name: continue
    raw_date = sheets['GAF'].get((r, 'I'), '')
    iso_date = excel_serial_to_date(raw_date)
    raw_edad = sheets['GAF'].get((r, 'J'), '')
    edad = int(raw_edad) if raw_edad.isdigit() else None
    gaf_rows.append({
        'sheet': 'GAF',
        'row': r,
        'name_raw': name,
        'name': norm_text(name),
        'level_raw': sheets['GAF'].get((r, 'B'), ''), 'level': norm_text(sheets['GAF'].get((r, 'B'), '')),
        'franja_raw': sheets['GAF'].get((r, 'C'), ''), 'franja': norm_text(sheets['GAF'].get((r, 'C'), '')),
        'club_raw': sheets['GAF'].get((r, 'D'), ''), 'club': norm_text(sheets['GAF'].get((r, 'D'), '')),
        'salto': sheets['GAF'].get((r, 'E'), '') == 'X',
        'suelo': sheets['GAF'].get((r, 'F'), '') == 'X',
        'viga': sheets['GAF'].get((r, 'G'), '') == 'X',
        'barra': sheets['GAF'].get((r, 'H'), '') == 'X',
        'birth_date_raw': raw_date,
        'birth_date': iso_date,
        'age': edad
    })

# Extract RESUMEN
resumen_grid = sheets['RESUMEN']

# Extract PAPELETA VARONES
pv_rows = []
cur_app = ""
for r in sorted(list(set(r for r, c in sheets['PAPELETA VARONES'].keys()))):
    if sheets['PAPELETA VARONES'].get((r, 'B')) == 'APARATO':
        cur_app = sheets['PAPELETA VARONES'].get((r, 'C'), '')
    name = sheets['PAPELETA VARONES'].get((r, 'B'), '')
    if name and name not in ['NOMBRE GIMNASTA', 'APARATO']:
        pv_rows.append({
            'row': r,
            'apparatus': cur_app,
            'name': norm_text(name),
            'club': norm_text(sheets['PAPELETA VARONES'].get((r, 'C'), '')),
            'level': norm_text(sheets['PAPELETA VARONES'].get((r, 'D'), '')),
            'd_score': sheets['PAPELETA VARONES'].get((r, 'E'), ''),
            'e_score': sheets['PAPELETA VARONES'].get((r, 'F'), ''),
            'final_score': sheets['PAPELETA VARONES'].get((r, 'G'), '')
        })

# Extract PAPELETA GAF
pgaf_rows = []
cur_club = ""
for r in sorted(list(set(r for r, c in sheets['PAPELETA GAF'].keys()))):
    if sheets['PAPELETA GAF'].get((r, 'B')) == 'CLUB':
        cur_club = norm_text(sheets['PAPELETA GAF'].get((r, 'C'), ''))
    name = sheets['PAPELETA GAF'].get((r, 'B'), '')
    if name and name not in ['NOMBRE GIMNASTA', 'CLUB', 'APARATO']:
        pgaf_rows.append({
            'row': r,
            'club': cur_club,
            'name': norm_text(name),
            'level': norm_text(sheets['PAPELETA GAF'].get((r, 'C'), '')),
            'franja': norm_text(sheets['PAPELETA GAF'].get((r, 'D'), '')),
            'd_score': sheets['PAPELETA GAF'].get((r, 'E'), ''),
            'e_score': sheets['PAPELETA GAF'].get((r, 'F'), ''),
            'final_score': sheets['PAPELETA GAF'].get((r, 'G'), '')
        })
    side_name = sheets['PAPELETA GAF'].get((r, 'M'), '')
    if side_name and side_name not in ['NOMBRE GIMNASTA', 'APARATO']:
        pgaf_rows.append({
            'row': r,
            'club': 'ELEVE LOS LAGOS',
            'name': norm_text(side_name),
            'level': norm_text(sheets['PAPELETA GAF'].get((r, 'N'), '')),
            'franja': '',
            'd_score': sheets['PAPELETA GAF'].get((r, 'O'), ''),
            'e_score': sheets['PAPELETA GAF'].get((r, 'P'), ''),
            'final_score': sheets['PAPELETA GAF'].get((r, 'Q'), '')
        })

# Extract PROGRAMA
prog_rows = []
for r in sorted(list(set(r for r, c in sheets['PROGRAMA'].keys()))):
    t_raw = sheets['PROGRAMA'].get((r, 'A'), '')
    evt = norm_text(sheets['PROGRAMA'].get((r, 'B'), ''))
    time_fmt = t_raw
    if t_raw:
        try:
            f = float(t_raw)
            sec = round(f * 86400)
            time_fmt = f"{sec//3600:02d}:{(sec%3600)//60:02d}:{sec%60:02d}"
        except ValueError: pass
    if time_fmt or evt:
        prog_rows.append({'row': r, 'time': time_fmt, 'event': evt})

# Extract MEDALLAS
med_rows = []
for r in sorted(list(set(r for r, c in sheets['MEDALLAS'].keys()))):
    cat = norm_text(sheets['MEDALLAS'].get((r, 'A'), ''))
    if not cat or cat == 'Categoría': continue
    places = [i+1 for i, c in enumerate(['B', 'C', 'D', 'E', 'F', 'G', 'H', 'I']) if sheets['MEDALLAS'].get((r, c), '').upper() == 'X']
    tot = sheets['MEDALLAS'].get((r, 'J'), '')
    med_rows.append({
        'row': r,
        'category_rule': cat,
        'places_awarded': places,
        'total_awards': int(tot) if tot.isdigit() else 0
    })

# Inconsistencies analysis
inconsistencies = []

# 1. Check scores in papeletas
scores_found = sum(1 for p in pv_rows if p['final_score']) + sum(1 for p in pgaf_rows if p['final_score'])
print(f"Total scores in papeletas: {scores_found}")

# 2. Hoja1 vs (GAM + GAF) comparison
gam_dict = {norm_key(g['name']): g for g in gam_rows}
gaf_dict = {norm_key(g['name']): g for g in gaf_rows}
h1_dict = {norm_key(g['name']): g for g in h1_rows}

# Fuzzy matches & naming differences
diff_matches = [
    {
        'hoja1_name': 'Amanda Bastidas', 'gaf_name': 'AMANDA BASTÍAS', 'club': 'AINILEBU',
        'type': 'Spelling variation (Bastidas vs Bastías)',
        'explanation': 'La nómina general Hoja1 escribe "Bastidas" mientras la nómina GAF escribe "BASTÍAS". Misma gimnasta (Nivel 3 / N3, Franja 3).'
    },
    {
        'hoja1_name': 'Lucía Marin', 'gaf_name': 'LUCIA MARTIN', 'club': 'AINILEBU',
        'type': 'Spelling variation (Marin vs Martin)',
        'explanation': 'La nómina Hoja1 escribe "Lucía Marin" mientras GAF escribe "LUCIA MARTIN". Misma gimnasta (Nivel 2, Franja 3).'
    },
    {
        'hoja1_name': 'Agustin', 'gam_name': 'Agustin', 'papeleta_name': 'Agustín Urbina', 'club': 'GIMNASTICO PAILLACO',
        'type': 'Missing last name in general roster',
        'explanation': 'En GAM y Hoja1 aparece solo "Agustin" (Kinder, Franja 2), mientras en la Papeleta Varones aparece con nombre completo "Agustín Urbina".'
    },
    {
        'hoja1_name': 'THOMAS MARTINEZ', 'gam_club': 'ULA', 'hoja1_club': 'USS', 'papeleta_club': 'ACRODAN',
        'type': 'Club association discrepancy',
        'explanation': 'En Hoja1 aparece como "USS", en GAM como "ULA", y en Papeleta Varones / Resumen se agrupa bajo "ACRODAN".'
    }
]

# Unrepresented athletes
hoja1_only = []
for k, g in h1_dict.items():
    if k not in gam_dict and k not in gaf_dict:
        # Check if matched in diff_matches
        if k in [norm_key(d['hoja1_name']) for d in diff_matches]:
            continue
        hoja1_only.append(g)

gam_gaf_only = []
for k, g in gam_dict.items():
    if k not in h1_dict and k not in [norm_key(d.get('gam_name', '')) for d in diff_matches]:
        gam_gaf_only.append(('GAM', g))
for k, g in gaf_dict.items():
    if k not in h1_dict and k not in [norm_key(d.get('gaf_name', '')) for d in diff_matches]:
        gam_gaf_only.append(('GAF', g))

audit_data = {
    'metadata': {
        'source_file': 'ARTISTICA CAMPEONATO 2026.xlsx',
        'target_championship': 'Campeonato Artística 2026 - Paillaco',
        'initial_status': 'draft',
        'modality': 'Gimnasia Artística',
        'branches': ['GAM', 'GAF'],
        'generated_at': datetime.now().isoformat(),
        'author': 'Comercial Hels SpA'
    },
    'counts': {
        'hoja1_athletes': len(h1_rows),
        'gam_athletes': len(gam_rows),
        'gaf_athletes': len(gaf_rows),
        'resumen_gam': 16,
        'resumen_gaf': 136,
        'resumen_total': 152,
        'papeleta_varones_entries': len(pv_rows),
        'papeleta_gaf_entries': len(pgaf_rows),
        'existing_scores_found': scores_found,
        'schedule_events': len(prog_rows),
        'awards_categories': len(med_rows),
        'total_awards_count': sum(m['total_awards'] for m in med_rows)
    },
    'hoja1_rows': h1_rows,
    'gam_rows': gam_rows,
    'gaf_rows': gaf_rows,
    'papeleta_varones': pv_rows,
    'papeleta_gaf': pgaf_rows,
    'programa': prog_rows,
    'medallas': med_rows,
    'diff_matches': diff_matches,
    'hoja1_only': hoja1_only,
    'gam_gaf_only': gam_gaf_only
}

with open(output_json_path, 'w', encoding='utf-8') as f:
    json.dump(audit_data, f, ensure_ascii=False, indent=2)

print(f"Audit analysis written to {output_json_path}")
print(f"Hoja1 only count (excluding known spelling matches): {len(hoja1_only)}")
print(f"GAM/GAF only count (excluding known spelling matches): {len(gam_gaf_only)}")
for h in hoja1_only:
    print(f"  Hoja1 Row {h['row']}: {h['name']} ({h['club']}, {h['level']}, F{h['franja']})")
for tag, g in gam_gaf_only:
    print(f"  [{tag}] Row {g['row']}: {g['name']} ({g['club']}, {g['level']}, F{g['franja']})")

