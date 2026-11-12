#!/usr/bin/env python3
import zipfile
import xml.etree.ElementTree as ET
import re
import json
from collections import defaultdict
from datetime import datetime, timedelta

excel_path = '/Users/macbook/.gemini/antigravity/scratch/operix-gymnastics/data/ARTISTICA CAMPEONATO 2026.xlsx'
ns = {'main': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}

def parse_excel(path):
    with zipfile.ZipFile(path, 'r') as z:
        # shared strings
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

sheets = parse_excel(excel_path)
print("Parsed sheets successfully:", list(sheets.keys()))

# 1. Analyze GAM
gam_grid = sheets['GAM']
gam_rows = set(r for r, c in gam_grid.keys())
gam_gymnasts = []
for r in sorted(gam_rows):
    name = gam_grid.get((r, 'A'), '')
    level = gam_grid.get((r, 'B'), '')
    franja = gam_grid.get((r, 'C'), '')
    club = gam_grid.get((r, 'D'), '')
    salto = gam_grid.get((r, 'E'), '')
    suelo = gam_grid.get((r, 'F'), '')
    viga = gam_grid.get((r, 'G'), '')
    barra = gam_grid.get((r, 'H'), '')
    paralela = gam_grid.get((r, 'I'), '')
    if r == 1:
        continue
    if name and 'NOMBRE' not in name:
        gam_gymnasts.append({
            'row': r, 'name': name, 'level': level, 'franja': franja, 'club': club,
            'salto': salto, 'suelo': suelo, 'viga': viga, 'barra': barra, 'paralela': paralela
        })

print(f"\nTotal GAM Gymnasts in 'GAM' sheet: {len(gam_gymnasts)}")
for idx, g in enumerate(gam_gymnasts, 1):
    print(f" {idx:2d}. {g['name']:<35} | {g['club']:<20} | Nivel: {g['level']:<8} | Franja: {g['franja']:<3} | S:{g['salto']} Su:{g['suelo']} P:{g['paralela']}")

# 2. Analyze GAF
gaf_grid = sheets['GAF']
gaf_rows = set(r for r, c in gaf_grid.keys())
gaf_gymnasts = []
for r in sorted(gaf_rows):
    name = gaf_grid.get((r, 'A'), '')
    level = gaf_grid.get((r, 'B'), '')
    franja = gaf_grid.get((r, 'C'), '')
    club = gaf_grid.get((r, 'D'), '')
    salto = gaf_grid.get((r, 'E'), '')
    suelo = gaf_grid.get((r, 'F'), '')
    viga = gaf_grid.get((r, 'G'), '')
    barra = gaf_grid.get((r, 'H'), '')
    f_nac = gaf_grid.get((r, 'I'), '')
    edad = gaf_grid.get((r, 'J'), '')
    if r == 1:
        continue
    if name and 'NOMBRE' not in name:
        gaf_gymnasts.append({
            'row': r, 'name': name, 'level': level, 'franja': franja, 'club': club,
            'salto': salto, 'suelo': suelo, 'viga': viga, 'barra': barra,
            'f_nac': f_nac, 'edad': edad
        })

print(f"\nTotal GAF Gymnasts in 'GAF' sheet: {len(gaf_gymnasts)}")
clubs_gaf = set(g['club'] for g in gaf_gymnasts)
print("Clubs in GAF:", sorted(clubs_gaf))

# 3. Analyze Hoja1
h1_grid = sheets['Hoja1']
h1_rows = set(r for r, c in h1_grid.keys())
h1_gymnasts = []
for r in sorted(h1_rows):
    name = h1_grid.get((r, 'A'), '')
    level = h1_grid.get((r, 'B'), '')
    franja = h1_grid.get((r, 'C'), '')
    club = h1_grid.get((r, 'D'), '')
    salto = h1_grid.get((r, 'E'), '')
    suelo = h1_grid.get((r, 'F'), '')
    viga = h1_grid.get((r, 'G'), '')
    barra = h1_grid.get((r, 'H'), '')
    paralela = h1_grid.get((r, 'I'), '')
    if 'NOMBRE' in name:
        continue
    if name:
        h1_gymnasts.append({
            'row': r, 'name': name, 'level': level, 'franja': franja, 'club': club,
            'salto': salto, 'suelo': suelo, 'viga': viga, 'barra': barra, 'paralela': paralela
        })

print(f"\nTotal Gymnasts in 'Hoja1': {len(h1_gymnasts)}")

# 4. Compare Hoja1 vs (GAM + GAF)
print("\n=== RECONCILIATION: Hoja1 vs (GAM + GAF) ===")
def normalize_name(n):
    n = n.strip().lower()
    # replace multiple spaces
    n = re.sub(r'\s+', ' ', n)
    # remove accents
    repls = {'á':'a', 'é':'e', 'í':'i', 'ó':'o', 'ú':'u', 'ñ':'n', 'ü':'u'}
    for k, v in repls.items():
        n = n.replace(k, v)
    return n

gam_names_norm = {normalize_name(g['name']): g for g in gam_gymnasts}
gaf_names_norm = {normalize_name(g['name']): g for g in gaf_gymnasts}
h1_names_norm = {normalize_name(g['name']): g for g in h1_gymnasts}

print(f"Unique normalized in GAM: {len(gam_names_norm)}")
print(f"Unique normalized in GAF: {len(gaf_names_norm)}")
print(f"Unique normalized in Hoja1: {len(h1_names_norm)}")

in_gam_or_gaf = set(gam_names_norm.keys()) | set(gaf_names_norm.keys())
in_h1 = set(h1_names_norm.keys())

only_h1 = in_h1 - in_gam_or_gaf
only_gam_gaf = in_gam_or_gaf - in_h1

print(f"\nNames only in Hoja1 ({len(only_h1)}):")
for n in sorted(only_h1):
    orig = h1_names_norm[n]
    print(f"  Row {orig['row']}: '{orig['name']}' (Club: '{orig['club']}', Nivel: '{orig['level']}', Franja: '{orig['franja']}')")

print(f"\nNames only in GAM/GAF ({len(only_gam_gaf)}):")
for n in sorted(only_gam_gaf):
    source = 'GAM' if n in gam_names_norm else 'GAF'
    orig = gam_names_norm[n] if n in gam_names_norm else gaf_names_norm[n]
    print(f"  [{source}] Row {orig['row']}: '{orig['name']}' (Club: '{orig['club']}', Nivel: '{orig['level']}')")

# 5. Check PAPELETA VARONES
print("\n=== PAPELETA VARONES ===")
pv_grid = sheets['PAPELETA VARONES']
pv_rows = set(r for r, c in pv_grid.keys())
current_apparatus = None
pv_entries = []
for r in sorted(pv_rows):
    if pv_grid.get((r, 'B')) == 'APARATO':
        current_apparatus = pv_grid.get((r, 'C'))
        print(f" Aparato header at row {r}: {current_apparatus}")
    elif pv_grid.get((r, 'B')) == 'NOMBRE GIMNASTA':
        continue
    else:
        name = pv_grid.get((r, 'B'), '')
        club = pv_grid.get((r, 'C'), '')
        level = pv_grid.get((r, 'D'), '')
        d = pv_grid.get((r, 'E'), '')
        e = pv_grid.get((r, 'F'), '')
        final = pv_grid.get((r, 'G'), '')
        if name:
            pv_entries.append({
                'apparatus': current_apparatus, 'name': name, 'club': club, 'level': level,
                'd': d, 'e': e, 'final': final
            })

print(f"Total entries in PAPELETA VARONES: {len(pv_entries)}")
scores_with_values = [p for p in pv_entries if p['d'] or p['e'] or p['final']]
print(f"Scores entered in PAPELETA VARONES: {len(scores_with_values)}")

# 6. Check PAPELETA GAF
print("\n=== PAPELETA GAF ===")
pgaf_grid = sheets['PAPELETA GAF']
pgaf_rows = set(r for r, c in pgaf_grid.keys())
pgaf_scores_count = 0
for r in sorted(pgaf_rows):
    for c in ['E', 'F', 'G']:
        v = pgaf_grid.get((r, c), '')
        if v and v not in ['DIFICULTAD', 'DESCUENTO', 'FINAL']:
            pgaf_scores_count += 1
print(f"Scores entered in PAPELETA GAF: {pgaf_scores_count}")

# 7. Check PROGRAMA
print("\n=== PROGRAMA ===")
prog_grid = sheets['PROGRAMA']
for r in sorted(set(r for r, c in prog_grid.keys())):
    time_val = prog_grid.get((r, 'A'), '')
    event_val = prog_grid.get((r, 'B'), '')
    if time_val or event_val:
        print(f"  Row {r}: Time '{time_val}' | Event '{event_val}'")

# 8. Check MEDALLAS
print("\n=== MEDALLAS ===")
med_grid = sheets['MEDALLAS']
med_categories = []
for r in sorted(set(r for r, c in med_grid.keys())):
    cat_name = med_grid.get((r, 'A'), '')
    total = med_grid.get((r, 'J'), '')
    if cat_name and cat_name != 'Categoría':
        places = [med_grid.get((r, col), '') for col in ['B', 'C', 'D', 'E', 'F', 'G', 'H', 'I']]
        med_categories.append((cat_name, places, total))

print(f"Total award rows in MEDALLAS: {len(med_categories)}")
print("Sample award rows:")
for c, pl, tot in med_categories[:5]:
    print(f"  {c}: Places {[i+1 for i, p in enumerate(pl) if p]} -> Total: {tot}")
for c, pl, tot in med_categories[-5:]:
    print(f"  {c}: Places {[i+1 for i, p in enumerate(pl) if p]} -> Total: {tot}")

