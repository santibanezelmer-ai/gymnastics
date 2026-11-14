# OPERIX GYMNASTICS — INFORME DE ENTREGA OFICIAL FASE 22
## Configuración de Modalidades, Aparatos y Competencias GAM / GAF

**Empresa Desarrolladora:** Comercial Hels SpA  
**Proyecto:** Operix Gymnastics (SaaS de Gestión Integral para Gimnasia Deportiva)  
**Fecha de Emisión:** 14 de Noviembre de 2026  
**Versión del Sistema:** Operix 2.2.0 (Ciclo Olímpico FIG 2025–2028)  
**Estado:** Producción / Verificación 100% Exitosa (233/233 Tests Pasando)  

---

> [!IMPORTANT]
> **DECLARACIÓN DE CUMPLIMIENTO DE ALCANCE Y SEGURIDAD:**  
> Comercial Hels SpA certifica que durante la ejecución de la Fase 22:
> 1. **NO se ejecutó `git push`** hacia repositorios remotos.
> 2. **NO se ejecutó `vercel deploy`** ni despliegues en infraestructura de nube externa.
> 3. **NO se ejecutaron migraciones SQL en la base de datos de producción** de Supabase.
> 4. **Se preservó íntegra e inmutablemente la información deportiva del Campeonato Artística 2026 - Paillaco** (153 gimnastas: 137 GAF y 16 GAM, 9 clubes y todas las notas registradas).

---

## 1. RESUMEN EJECUTIVO

La **Fase 22 de Operix Gymnastics** establece la gestión reglamentaria, técnica y operativa de las dos modalidades primarias de la gimnasia artística: **Gimnasia Artística Masculina (GAM)** y **Gimnasia Artística Femenina (GAF)**.

Anteriormente, el sistema operaba asumiendo un flujo de 4 aparatos típico de la gimnasia femenina, requiriendo adaptaciones complejas cuando un campeonato convocaba varones o formatos escolares/formativos con 2 o 3 aparatos. Con la Fase 22, Operix Gymnastics incorpora un **Catálogo Universal de Aparatos FIG** con aislamiento modal estricto, configuración dinámica a nivel de campeonato y categoría, soporte integral para All-Around de hasta 6 aparatos masculinos y 4 femeninos, clasificaciones individuales independientes por aparato, competencias por equipos adaptadas con reglas Top N, matrices cíclicas de rotación, y blindaje de interfaces para jueces, organizadores y público en Arena TV.

---

## 2. CATÁLOGO OFICIAL GAM / GAF IMPLEMENTADO

Se creó el módulo especializado `src/core/gymnastics/apparatusCatalog.ts`, el cual codifica las especificaciones de la Federación Internacional de Gimnasia (FIG) para el ciclo olímpico 2025–2028.

### GAM — Gimnasia Artística Masculina (6 Aparatos)

| Código | Aparato Oficial | Nombre Internacional | Orden FIG | Intentos Salto | Puntuación Base | Configuración Rotación |
|:---:|:---|:---|:---:|:---:|:---:|:---|
| **FX** | Suelo | Floor Exercise | 1 | 1 | D + E − ND | 4 min calentamiento, máx 8 gimnastas |
| **PH** | Caballo con Arzones | Pommel Horse | 2 | 1 | D + E − ND | 4 min calentamiento, máx 8 gimnastas |
| **SR** | Anillas | Still Rings | 3 | 1 | D + E − ND | 4 min calentamiento, máx 8 gimnastas |
| **VT** | Salto | Vault | 4 | 2 (Promedio) | D + E − ND | 2 saltos por gimnasta |
| **PB** | Barras Paralelas | Parallel Bars | 5 | 1 | D + E − ND | 4 min calentamiento, máx 8 gimnastas |
| **HB** | Barra Fija | Horizontal Bar | 6 | 1 | D + E − ND | 4 min calentamiento, máx 8 gimnastas |

### GAF — Gimnasia Artística Femenina (4 Aparatos)

| Código | Aparato Oficial | Nombre Internacional | Orden FIG | Intentos Salto | Puntuación Base | Configuración Rotación |
|:---:|:---|:---|:---:|:---:|:---:|:---|
| **VT** | Salto | Vault | 1 | 2 (Promedio) | D + E − ND | Tabla de salto / 2 intentos |
| **UB** | Barras Asimétricas | Uneven Bars | 2 | 1 | D + E − ND | 4 min calentamiento, máx 8 gimnastas |
| **BB** | Viga de Equilibrio | Balance Beam | 3 | 1 | D + E − ND | 4 min calentamiento, máx 8 gimnastas |
| **FX** | Suelo | Floor Exercise | 4 | 1 | D + E − ND | Con acompañamiento musical |

### Prevención de Contaminación Cruzada (Modal Separation)
Ambas modalidades comparten los códigos mnemotécnicos `VT` y `FX`. No obstante, la identidad operativa en Operix Gymnastics está ligada a la tupla `(disciplina, código)`.
- El validador `isApparatusValidForDiscipline(discipline, code)` rechaza inmediatamente cualquier intento de registrar o asignar aparatos masculinos (`PH`, `SR`, `PB`, `HB`) en categorías o gimnastas GAF.
- De forma recíproca, rechaza aparatos femeninos (`UB`, `BB`) en categorías o gimnastas GAM.
- La función de normalización `inferModality(categoryOrName)` identifica la modalidad sin colisiones semánticas (por ejemplo, detectando `Women` como GAF antes de analizar subcadenas como `Men`).

---

## 3. ARQUITECTURA DE CONFIGURACIÓN DINÁMICA

La arquitectura de Operix Gymnastics no impone una estructura fija de 4 o 6 aparatos. Un campeonato puede definir:
1. **Configuración General del Campeonato:**
   - Preset FIG Integral Dual (`PRESET_FIG_DUAL_GAM_GAF`): GAM 6 aparatos y GAF 4 aparatos coexistiendo en el mismo evento.
   - Preset FIG GAF Exclusivo (`PRESET_FIG_GAF`): 4 aparatos oficiales.
   - Preset FIG GAM Exclusivo (`PRESET_FIG_GAM`): 6 aparatos oficiales.
   - Presets Formativos o Escolares: Formativo 3 aparatos (`VT`, `BB`, `FX`) o Promocional 2 aparatos (`VT`, `FX`).
2. **Sobreescritura Específica por Categoría (`categoryOverrides`):**
   - Una categoría formativa o infantil dentro de un campeonato oficial puede competir a 2 o 3 aparatos sin afectar a las categorías mayores que compiten en el programa completo.
3. **Validaciones de Guardia Implementadas:**
   - Se prohíbe guardar una categoría con 0 aparatos habilitados (`validateCategoryApparatuses`).
   - Se valida que todo aparato marcado como obligatorio esté presente en la lista de aparatos habilitados.
   - La interfaz advierte al usuario si existen notas ya registradas que podrían verse recalculadas ante un cambio en los aparatos habilitados.

---

## 4. EXTENSIÓN DEL MOTOR ALL-AROUND

El motor `standingsEngine.ts` fue extendido respetando y profundizando la Fase 18:
- **Cálculo Dinámico Flexible:** Procesa indistintamente 2, 3, 4, 6 o $K$ aparatos según la lista `enabledApparatuses` de la categoría.
- **Detección de Resultados Completos vs. Parciales (`isComplete`):**
  - Si un gimnasta ha completado todos los aparatos requeridos, `isComplete` es `true`.
  - Si la rotación está en curso y faltan notas, `isComplete` es `false`, y se genera la glosa explicativa: `"En curso (X/Y aparatos) - Faltan Z aparatos"`.
- **Modos de Cálculo Soportados:**
  - `sum_all_enabled`: Suma la totalidad de los aparatos habilitados para la categoría.
  - `best_n`: Selecciona las $N$ mejores notas entre los aparatos ejecutados.
  - `mandatory_plus_best_n`: Garantiza los aparatos indispensables (ej. Salto obligatorio) más las mejores notas restantes.
  - `sum_completed`: Suma de notas completadas hasta el momento.
- **Aislamiento Multidisciplina:** Las notas correspondientes a disciplinas no artísticas (como Parkour `SPD`/`FR` o Trampolín `TRA`) o notas erróneamente registradas en aparatos incompatibles con la modalidad son excluidas automáticamente del cómputo All-Around sin corromper el ranking.
- **Cascada Olímpica de Desempate FIG:**
  1. Comparación de notas totales descartando la menor nota ($N-1$, $N-2$, etc.).
  2. Mayor nota individual obtenida en cualquier aparato.
  3. Mayor suma de notas de Ejecución ($E$-Score Total).
  4. Mayor nota individual de Ejecución.
  5. Empate oficial compartido (*Ex-aequo*).

---

## 5. EXTENSIÓN DE RESULTADOS POR APARATO

Cada aparato dispone de su propia tabla de clasificación y podio independiente a través de `computeApparatusStandings`:
- **Parámetros y Filtros:** Búsqueda por `championshipId`, `discipline` (GAM/GAF), `categoryId`, `subcategoryId`, `clubId` y `apparatusCode`.
- **Control de Aprobación Oficial:** Solo las notas con estado `official_approved` computan en los resultados oficiales públicos y premiaciones cuando `onlyOfficialApproved: true`.
- **Regla Especial de Salto (VT):** Promedio aritmético de los dos intentos cuando existen dos saltos (`(V1 + V2) / 2`), manteniendo la compatibilidad con intento único.
- **Desempates Independientes por Aparato:**
  1. Mayor nota media de Ejecución ($E$-Score).
  2. Mayor nota de Dificultad ($D$-Score).
  3. En Salto: Mejor salto individual entre el intento 1 y el intento 2.
  4. Empate oficial compartido con asignación simétrica de medalla.

---

## 6. EXTENSIÓN DE COMPETENCIAS POR EQUIPOS

El cálculo por equipos (`computeTeamStandings`) se adapta dinámicamente:
- **GAM:** Admite equipos compitiendo en hasta 6 aparatos con las mejores $N$ notas (ej. formato 6-5-3 o 6-4-3).
- **GAF:** Admite equipos compitiendo en 4 aparatos con las mejores $N$ notas (ej. formato 4-3-2 o 5-4-3).
- **Control de Integrantes Mínimos:** Regla `minGymnastsPerTeam`.
- **Tratamiento de Equipos Incompletos:** Si `allowIncompleteTeams: true`, el equipo clasifica con la etiqueta `"Equipo incompleto"`; si es `false`, queda excluido del cómputo.
- **Protección de Datos:** Las notas registradas en aparatos no pertenecientes a la modalidad del equipo son purgadas antes de la suma club por club.

---

## 7. EXTENSIÓN DE ROTACIONES Y ORDEN DE COMPETICIÓN

Se enriqueció `rotationEngine.ts` con funciones de modelado olímpico:
- `generateModalityRotationMatrix(discipline, groupNames, customOrder)`: Genera la matriz de rotaciones para 6 grupos en GAM o 4 grupos en GAF siguiendo el ciclo estándar olímpico o el orden específico definido por la organización.
- `validateRotationAssignment(discipline, athletes, enabledApparatuses)`: Audita en tiempo real que ningún atleta masculino esté asignado a viga o asimétricas, ni atletas femeninas a arzones, anillas o barras paralelas.
- Visualización de la rotación actual, deportista en tapiz, deportista en preparación y deportistas en espera.

---

## 8. CAMBIOS EN LA INTERFAZ DE ADMINISTRACIÓN

El componente `ChampionshipRulesConfigModal.tsx` fue actualizado:
- **Pestaña Dedicada "Modalidades & Aparatos":**
  - Selector de modalidad: **GAM (Varones - 6 aparatos)** y **GAF (Damas - 4 aparatos)**.
  - Tarjetas visuales interactivas por aparato mostrando código FIG, nombre en español, nombre internacional en inglés, interruptor de habilitación, selector de aparato obligatorio y orden de competencia.
  - Pestaña de Presets con tarjeta destacada para el **Preset FIG Dual Integral (GAM 6 + GAF 4)**.
  - Alerta y confirmación ante modificaciones de reglas para campeonatos con notas previamente almacenadas.
  - Bloqueo de guardado si se intentan deshabilitar todos los aparatos de una modalidad.

---

## 9. CAMBIOS EN LA TERMINAL DE JUECES

En `FastJudgeTerminal.tsx`:
- **Detección Automática de Modalidad:** La terminal identifica la disciplina del gimnasta seleccionado (`activeGymnastModality`).
- **Filtro Dinámico de Aparatos:** La barra superior de selección de aparatos renderiza únicamente los aparatos que corresponden a la modalidad del gimnasta (ej. si se selecciona un gimnasta GAM, desaparecen Asimétricas y Viga, y se despliegan Arzones, Anillas, Paralelas y Barra Fija).
- **Auto-conmutación Preventiva:** Si un juez cambia de atleta y el aparato actual no es válido para el nuevo atleta, el selector salta automáticamente al primer aparato permitido.
- **Barrera Pre-envío:** Verificación previa al guardado en base de datos que bloquea envíos en caso de inconsistencia modal.

---

## 10. CAMBIOS EN PORTAL PÚBLICO Y ARENA TV

### PublicChampionshipPortal.tsx
- Inclusión de selector de modalidad: `[Todas | GAM | GAF]`.
- Conmutador de vista de resultados: `[All-Around | Por Aparato | Por Equipos]`.
- Selector dinámico de aparatos según la modalidad elegida.
- Renderizado exclusivo de puntuaciones oficiales aprobadas.

### ArenaTVDisplay.tsx
- Adaptación dinámica de columnas de tabla: encabezados de 6 aparatos para GAM y 4 aparatos para GAF.
- Selector de transmisión en vivo con filtro por modalidad.
- Glosas explicativas del estado de competencia ("En curso" vs "Podio Definitivo").

---

## 11. BASE DE DATOS Y MIGRACIONES GENERADAS

Se preparó la migración SQL versionada e idempotente:
📁 `supabase/migrations/20261113000002_gam_gaf_apparatus_config.sql`

### Estructuras Creadas:
1. **`public.championship_apparatus_configs`**:
   - `id UUID PRIMARY KEY`
   - `championship_id UUID REFERENCES public.championships(id) ON DELETE CASCADE`
   - `discipline TEXT CHECK (discipline IN ('GAM', 'GAF', ...))`
   - `enabled_apparatuses TEXT[]`
   - `mandatory_apparatuses TEXT[]`
   - `competition_order TEXT[]`
   - `all_around_rules JSONB`
   - `team_rules JSONB`
   - `created_at`, `updated_at` TIMESTAMPTZ
   - Restricción de unicidad: `UNIQUE(championship_id, discipline)`
2. **`public.category_apparatus_overrides`**:
   - `id UUID PRIMARY KEY`
   - `category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE`
   - `discipline TEXT`
   - `enabled_apparatuses TEXT[]`
   - `mandatory_apparatuses TEXT[]`
   - `competition_order TEXT[]`
   - `all_around_rules JSONB`
   - Restricción de unicidad: `UNIQUE(category_id)`
3. **Seguridad RLS (Row Level Security):**
   - Políticas de lectura pública para consumo del portal y Arena TV.
   - Políticas de escritura restringidas a administradores de plataforma y creadores del campeonato.
   - Triggers automáticos para mantenimiento del campo `updated_at`.

*(Nota: Esta migración se encuentra versionada localmente y lista para su despliegue cuando el equipo de operaciones lo instruya, sin haberse ejecutado en la base de datos de producción).*

---

## 12. RESULTADOS DE LAS PRUEBAS AUTOMATIZADAS

Se creó la suite `src/test/phase22-gam-gaf-apparatus-config.test.ts` con 29 pruebas especializadas. A su vez, se ejecutó la totalidad de las 21 suites del proyecto para garantizar cero regresiones.

### Resumen Global de Vitest:
- **Archivos de prueba evaluados:** 21 archivos
- **Total de pruebas ejecutadas:** 233 pruebas
- **Pruebas aprobadas:** **233 (100%)**
- **Pruebas fallidas:** **0 (0%)**
- **Duración de la suite:** 11.83 segundos

```text
✓ src/test/phase22-gam-gaf-apparatus-config.test.ts (29 tests)
  ✓ 1. Catálogo Oficial FIG GAM y GAF (6 tests)
    ✓ GAM reconoce exactamente sus seis aparatos oficiales con código y orden FIG
    ✓ GAF reconoce exactamente sus cuatro aparatos oficiales con código y orden FIG
    ✓ Previene estrictamente la mezcla cruzada de aparatos entre GAM y GAF
    ✓ getOfficialApparatuses retorna el catálogo correspondiente o combinado
    ✓ inferModality detecta correctamente la modalidad a partir de nombres o códigos
    ✓ getApparatusLabel y getApparatusInternationalName entregan descripciones correctas
  ✓ 2. Validación y Configuración Dinámica de Aparatos (7 tests)
    ✓ Valida correctamente una categoría GAM completa con seis aparatos
    ✓ Valida correctamente una categoría GAF completa con cuatro aparatos
    ✓ Valida una categoría formativa GAF con 3 aparatos (VT, BB, FX)
    ✓ Valida una categoría formativa GAM con 3 aparatos (FX, VT, PB)
    ✓ Rechaza configuración si una categoría tiene 0 aparatos habilitados
    ✓ Rechaza aparatos incompatibles asignados a una modalidad
    ✓ Rechaza si un aparato obligatorio no está en la lista de habilitados
  ✓ 3. Motor All-Around Dinámico para GAM y GAF (5 tests)
    ✓ Calcula All-Around GAM completo de seis aparatos y marca isComplete: true
    ✓ Identifica All-Around parcial (isComplete: false) cuando faltan aparatos en GAM
    ✓ Calcula All-Around GAF completo de cuatro aparatos (VT, UB, BB, FX)
    ✓ Ignora notas registradas en aparatos incompatibles con la modalidad
    ✓ Ejecuta reglas best_n (Mejores 3 de 4 aparatos en GAF)
  ✓ 4. Resultados y Clasificación Independiente por Aparato (3 tests)
    ✓ Genera clasificación individual por aparato para GAM (PH - Caballo con arzones)
    ✓ Filtra y excluye notas no aprobadas de los resultados oficiales de aparato
    ✓ Aplica desempate independiente por aparato por Mayor Nota E
  ✓ 5. Competencias por Equipos GAM y GAF (2 tests)
    ✓ Calcula clasificación por equipos GAM con Top 3 notas por aparato
    ✓ Excluye aparatos que no pertenecen a la modalidad del equipo
  ✓ 6. Rotaciones y Orden de Competencia GAM y GAF (4 tests)
    ✓ Genera matriz de rotación para GAM con seis grupos y orden FIG oficial
    ✓ Genera matriz de rotación para GAF con cuatro grupos y orden FIG oficial
    ✓ Permite un orden de rotación personalizado (ej. Viga -> Suelo -> Salto -> Asimétricas)
    ✓ Valida asignación de atletas en rotación detectando gimnastas en aparatos incompatibles
  ✓ 7. Presets y Configuración Dual GAM/GAF (2 tests)
    ✓ PRESET_FIG_DUAL_GAM_GAF provee configuración completa e independiente para ambas modalidades
    ✓ PRESET_FIG_GAM y PRESET_FIG_GAF mantienen compatibilidad regresiva 100%

✓ src/test/phase18-flexible-rules-and-participation.test.ts (16 tests)
✓ src/test/multi-discipline-fig.test.ts (12 tests)
✓ src/test/phase17-official-data-and-fast-judge.test.ts (14 tests)
✓ src/test/phase21-marketing-landing-and-demo-requests.test.ts (10 tests)
✓ src/test/excel-championship-importer.test.ts (13 tests)
✓ src/test/security-audit-phase10-migration00003.test.ts (26 tests)
✓ src/test/security-hardening-rls.test.ts (12 tests)
✓ src/test/public-portal-and-private-rotations.test.ts (14 tests)
✓ src/test/awards-engine.test.ts (10 tests)
✓ src/test/scoring-engine.test.ts (7 tests)
✓ src/test/vault-two-attempts-and-codes.test.ts (8 tests)
✓ src/test/rotation-engine.test.ts (8 tests)
✓ src/test/reports-engine.test.ts (7 tests)
✓ src/test/public-athletes-roster.test.ts (7 tests)
✓ src/test/fig-tie-breaking.test.ts (6 tests)
✓ src/test/supabase-stabilization-phase10.test.ts (8 tests)
✓ src/test/standings-engine.test.ts (4 tests)
✓ src/test/security-isolation.test.ts (4 tests)
✓ src/test/phase14-integral-sports-and-postgresql-validation.test.ts (15 tests)
✓ src/test/core.test.ts (3 tests)
```

### Verificación de Compilación y Empaquetado:
- `tsc -b`: Compilación limpia sin errores de tipos TypeScript.
- `vite build`: Build de producción generado con éxito en 1.51s (`dist/assets/index-BWh0Wsho.js`).

---

## 13. CONCLUSIÓN Y ESTADO DEL SISTEMA

La **Fase 22: Configuración de modalidades, aparatos y competencias GAM/GAF** ha sido completada con éxito riguroso. Operix Gymnastics cuenta ahora con una infraestructura técnica robusta y flexible para organizar torneos oficiales de la Federación Internacional de Gimnasia tanto masculinos como femeninos, torneos formativos de 2 o 3 aparatos, y eventos integrales mixtos.

Todos los componentes de software (motores matemáticos, gestión de participación, matrices de rotación, terminal de jueces, pantallas públicas y esquemas relacionales) operan en sincronía y con integridad comprobada.

---

**Comercial Hels SpA**  
*Ingeniería de Software & Soluciones Tecnológicas Deportivas*  
Valdivia / Santiago de Chile — Noviembre 2026
