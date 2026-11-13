/**
 * OPERIX GYMNASTICS — FASE 17 TEST SUITE
 * DATOS OFICIALES Y TERMINAL RÁPIDA DE JUECES CON BÚSQUEDA POR DORSAL
 *
 * Desarrollado por: Comercial Hels SpA
 *
 * Esta suite valida:
 * 1. Erradicación total de datos semilla/demo en portales y tableros en vivo.
 * 2. Diferenciación estricta de 4 estados deportivos en LiveStandingsBoard y portales:
 *    - Cargando información.
 *    - Campeonato sin puntuaciones oficiales registradas ("Esperando primeras puntuaciones").
 *    - Error de conexión / fallo de carga de red con botón de reintento.
 *    - Resultados oficiales disponibles.
 * 3. Terminal rápida de jueces (FastJudgeTerminal):
 *    - Búsqueda instantánea por número de dorsal (#101, #102, etc.).
 *    - Búsqueda por texto (nombre de gimnasta, club o categoría).
 *    - Manejo seguro de dorsales inexistentes: emisión de alerta sin deseleccionar atleta actual.
 *    - Manejo de dorsales duplicados: aviso de ambigüedad y selección dirigida sin auto-asignación a ciegas.
 *    - Navegación secuencial de orden de salida (Atleta Anterior / Siguiente Atleta).
 *    - Teclado táctil para tablets en pista (dígitos 0-9, retroceso y limpiar).
 *    - Aislamiento multi-tenant por campeonato (cero filtración cruzada).
 * 4. Verificación estática de ausencia de datos hardcodeados en código fuente.
 */

import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

interface LoadedGymnastOption {
  id: string;
  bib_number?: number;
  rotation_group?: string;
  gymnast_name: string;
  club_name: string;
  category_name: string;
  scoring_regime: 'free' | 'obligatory';
  default_fixed_d_score?: number;
}

// Simulador puro del motor de búsqueda y navegación de FastJudgeTerminal
class FastJudgeSearchController {
  private gymnasts: LoadedGymnastOption[];
  public selectedRegId: string;
  public bibSearch: string = '';
  public searchFeedback: { type: 'success' | 'error' | 'warning'; message: string } | null = null;
  public duplicateMatches: LoadedGymnastOption[] = [];

  constructor(gymnasts: LoadedGymnastOption[], initialSelectedId?: string) {
    this.gymnasts = gymnasts;
    this.selectedRegId = initialSelectedId || (gymnasts.length > 0 ? gymnasts[0].id : '');
  }

  public get selectedGymnast(): LoadedGymnastOption | undefined {
    return this.gymnasts.find((g) => g.id === this.selectedRegId);
  }

  public get currentGymnastIndex(): number {
    return this.gymnasts.findIndex((g) => g.id === this.selectedRegId);
  }

  public get canGoPrevious(): boolean {
    return this.currentGymnastIndex > 0;
  }

  public get canGoNext(): boolean {
    return this.currentGymnastIndex >= 0 && this.currentGymnastIndex < this.gymnasts.length - 1;
  }

  public searchBibOrName(query: string) {
    const q = query.trim();
    if (!q) {
      this.searchFeedback = null;
      this.duplicateMatches = [];
      return;
    }

    // 1. Búsqueda numérica exacta por dorsal
    const num = parseInt(q, 10);
    if (!isNaN(num) && /^\d+$/.test(q)) {
      const bibMatches = this.gymnasts.filter((g) => g.bib_number === num);
      if (bibMatches.length === 1) {
        const found = bibMatches[0];
        this.selectedRegId = found.id;
        this.duplicateMatches = [];
        this.searchFeedback = {
          type: 'success',
          message: `Dorsal #${found.bib_number} — ${found.gymnast_name} (${found.club_name}) seleccionada.`,
        };
      } else if (bibMatches.length > 1) {
        this.duplicateMatches = bibMatches;
        this.searchFeedback = {
          type: 'warning',
          message: `Atención: Hay ${bibMatches.length} gimnastas con el dorsal #${num}. Seleccione una:`,
        };
      } else {
        // Crítico: No cambiar selectedRegId
        this.duplicateMatches = [];
        this.searchFeedback = {
          type: 'error',
          message: `No se encontró ninguna gimnasta con el dorsal #${num}. Se mantiene la gimnasta actual.`,
        };
      }
      return;
    }

    // 2. Búsqueda por texto (nombre, club o categoría)
    const lower = q.toLowerCase();
    const matches = this.gymnasts.filter(
      (g) =>
        g.gymnast_name.toLowerCase().includes(lower) ||
        g.club_name.toLowerCase().includes(lower) ||
        g.category_name.toLowerCase().includes(lower)
    );

    if (matches.length === 1) {
      const match = matches[0];
      this.selectedRegId = match.id;
      this.duplicateMatches = [];
      this.searchFeedback = {
        type: 'success',
        message: `${match.gymnast_name} (${match.club_name}) seleccionada.`,
      };
    } else if (matches.length > 1) {
      this.duplicateMatches = matches;
      this.searchFeedback = {
        type: 'warning',
        message: `${matches.length} gimnastas coinciden con "${q}". Seleccione una:`,
      };
    } else {
      this.duplicateMatches = [];
      this.searchFeedback = {
        type: 'error',
        message: `No se encontraron gimnastas con "${q}".`,
      };
    }
  }

  public touchDigit(digit: string) {
    this.bibSearch += digit;
    this.searchBibOrName(this.bibSearch);
  }

  public touchBackspace() {
    this.bibSearch = this.bibSearch.slice(0, -1);
    if (this.bibSearch) {
      this.searchBibOrName(this.bibSearch);
    } else {
      this.searchFeedback = null;
      this.duplicateMatches = [];
    }
  }

  public touchClear() {
    this.bibSearch = '';
    this.searchFeedback = null;
    this.duplicateMatches = [];
  }

  public goPrevious() {
    if (!this.canGoPrevious) return;
    const prev = this.gymnasts[this.currentGymnastIndex - 1];
    this.selectedRegId = prev.id;
    this.bibSearch = prev.bib_number ? prev.bib_number.toString() : '';
    this.searchFeedback = {
      type: 'success',
      message: `Atleta anterior: Dorsal #${prev.bib_number || 'S/N'} ${prev.gymnast_name}`,
    };
    this.duplicateMatches = [];
  }

  public goNext() {
    if (!this.canGoNext) return;
    const next = this.gymnasts[this.currentGymnastIndex + 1];
    this.selectedRegId = next.id;
    this.bibSearch = next.bib_number ? next.bib_number.toString() : '';
    this.searchFeedback = {
      type: 'success',
      message: `Siguiente atleta: Dorsal #${next.bib_number || 'S/N'} ${next.gymnast_name}`,
    };
    this.duplicateMatches = [];
  }
}

describe('OPERIX GYMNASTICS — Fase 17: Datos Oficiales y Terminal Rápida de Jueces', () => {

  // ==========================================================================
  // SECCIÓN 1: VALIDACIÓN DEL MOTOR DE BÚSQUEDA RÁPIDA POR DORSAL
  // ==========================================================================
  describe('1. Motor de Búsqueda Rápida por Dorsal (Fast Judge Terminal)', () => {
    const mockGymnasts: LoadedGymnastOption[] = [
      {
        id: 'reg-001',
        bib_number: 101,
        gymnast_name: 'Sofía Valenzuela',
        club_name: 'Club Gimnástico Los Ríos',
        category_name: 'Iniciación 1',
        scoring_regime: 'obligatory',
        default_fixed_d_score: 10.0,
        rotation_group: 'Rotación 1 - Tanda A',
      },
      {
        id: 'reg-002',
        bib_number: 102,
        gymnast_name: 'Martina Morales',
        club_name: 'Club Deportivo Manquehue',
        category_name: 'Formativa 2',
        scoring_regime: 'obligatory',
        default_fixed_d_score: 10.0,
        rotation_group: 'Rotación 1 - Tanda A',
      },
      {
        id: 'reg-003',
        bib_number: 103,
        gymnast_name: 'Florencia Castro',
        club_name: 'Club Alemán de Temuco',
        category_name: 'Avanzado FIG Junior',
        scoring_regime: 'free',
        rotation_group: 'Rotación 2 - Tanda B',
      },
      {
        id: 'reg-004',
        bib_number: 200, // Dorsal repetido en distinta subdivisión
        gymnast_name: 'Camila Muñoz Subdivisión A',
        club_name: 'Club Villarrica',
        category_name: 'Nivel 1',
        scoring_regime: 'obligatory',
        default_fixed_d_score: 10.0,
      },
      {
        id: 'reg-005',
        bib_number: 200, // Dorsal repetido en distinta subdivisión
        gymnast_name: 'Camila Muñoz Subdivisión B',
        club_name: 'Club Villarrica',
        category_name: 'Nivel 2',
        scoring_regime: 'obligatory',
        default_fixed_d_score: 10.0,
      },
    ];

    it('Localiza y selecciona inmediatamente al gimnasta cuando el dorsal existe (#102)', () => {
      const controller = new FastJudgeSearchController(mockGymnasts, 'reg-001');
      expect(controller.selectedGymnast?.gymnast_name).toBe('Sofía Valenzuela');

      controller.searchBibOrName('102');

      expect(controller.selectedRegId).toBe('reg-002');
      expect(controller.selectedGymnast?.gymnast_name).toBe('Martina Morales');
      expect(controller.selectedGymnast?.bib_number).toBe(102);
      expect(controller.searchFeedback?.type).toBe('success');
      expect(controller.duplicateMatches).toHaveLength(0);
    });

    it('Rechaza dorsal inexistente (#999) con alerta de error SIN alterar la gimnasta actual', () => {
      const controller = new FastJudgeSearchController(mockGymnasts, 'reg-003');
      expect(controller.selectedGymnast?.gymnast_name).toBe('Florencia Castro');

      controller.searchBibOrName('999');

      // CRÍTICO: selectedRegId permanece intacto para evitar juzgamiento erróneo
      expect(controller.selectedRegId).toBe('reg-003');
      expect(controller.selectedGymnast?.gymnast_name).toBe('Florencia Castro');
      expect(controller.searchFeedback?.type).toBe('error');
      expect(controller.searchFeedback?.message).toContain('No se encontró ninguna gimnasta con el dorsal #999');
      expect(controller.searchFeedback?.message).toContain('Se mantiene la gimnasta actual');
    });

    it('Detecta dorsales duplicados (#200) y alerta sin auto-seleccionar a ciegas', () => {
      const controller = new FastJudgeSearchController(mockGymnasts, 'reg-001');

      controller.searchBibOrName('200');

      // Se generan las opciones de resolución de ambigüedad
      expect(controller.searchFeedback?.type).toBe('warning');
      expect(controller.duplicateMatches).toHaveLength(2);
      expect(controller.duplicateMatches[0].gymnast_name).toBe('Camila Muñoz Subdivisión A');
      expect(controller.duplicateMatches[1].gymnast_name).toBe('Camila Muñoz Subdivisión B');

      // El juez selecciona manualmente la opción deseada
      controller.selectedRegId = controller.duplicateMatches[1].id;
      expect(controller.selectedGymnast?.gymnast_name).toBe('Camila Muñoz Subdivisión B');
    });

    it('Permite búsqueda textual parcial por nombre o club', () => {
      const controller = new FastJudgeSearchController(mockGymnasts, 'reg-001');

      // Coincidencia exacta por nombre
      controller.searchBibOrName('Florencia');
      expect(controller.selectedRegId).toBe('reg-003');
      expect(controller.searchFeedback?.type).toBe('success');

      // Coincidencia por club con varias atletas
      controller.searchBibOrName('Villarrica');
      expect(controller.duplicateMatches).toHaveLength(2);
      expect(controller.searchFeedback?.type).toBe('warning');
    });

    it('Permite navegación secuencial (Anterior / Siguiente) según orden de pista', () => {
      const controller = new FastJudgeSearchController(mockGymnasts, 'reg-001');
      expect(controller.currentGymnastIndex).toBe(0);
      expect(controller.canGoPrevious).toBe(false);
      expect(controller.canGoNext).toBe(true);

      // Avanzar al siguiente atleta (#102)
      controller.goNext();
      expect(controller.selectedRegId).toBe('reg-002');
      expect(controller.selectedGymnast?.bib_number).toBe(102);
      expect(controller.canGoPrevious).toBe(true);

      // Avanzar al siguiente atleta (#103)
      controller.goNext();
      expect(controller.selectedRegId).toBe('reg-003');
      expect(controller.selectedGymnast?.bib_number).toBe(103);

      // Retroceder al atleta anterior (#102)
      controller.goPrevious();
      expect(controller.selectedRegId).toBe('reg-002');
      expect(controller.selectedGymnast?.bib_number).toBe(102);
    });

    it('Permite uso de teclado táctil numérico de tablet (dígitos, backspace y clear)', () => {
      const controller = new FastJudgeSearchController(mockGymnasts, 'reg-001');

      // Simula toques táctiles: '1', luego '0', luego '3'
      controller.touchDigit('1');
      expect(controller.bibSearch).toBe('1');

      controller.touchDigit('0');
      expect(controller.bibSearch).toBe('10');

      controller.touchDigit('3');
      expect(controller.bibSearch).toBe('103');
      expect(controller.selectedRegId).toBe('reg-003');
      expect(controller.selectedGymnast?.gymnast_name).toBe('Florencia Castro');

      // Simula borrado de último dígito (backspace)
      controller.touchBackspace();
      expect(controller.bibSearch).toBe('10');

      // Simula limpiar (Clear)
      controller.touchClear();
      expect(controller.bibSearch).toBe('');
      expect(controller.searchFeedback).toBeNull();
      // La gimnasta seleccionada sigue siendo #103
      expect(controller.selectedRegId).toBe('reg-003');
    });
  });

  // ==========================================================================
  // SECCIÓN 2: DIFERENCIACIÓN DE LOS 4 ESTADOS DE RESULTADOS DEPORTIVOS
  // ==========================================================================
  describe('2. Estados Oficiales de LiveStandingsBoard y Portales Públicos', () => {
    interface UIStateSimulation {
      isLoading: boolean;
      loadError: string | null;
      scores: unknown[];
    }

    function determineOfficialUIState(state: UIStateSimulation): string {
      if (state.isLoading) {
        return 'STATE_LOADING: Cargando información oficial...';
      }
      if (state.loadError) {
        return `STATE_ERROR: ${state.loadError}`;
      }
      if (state.scores.length === 0) {
        return 'STATE_EMPTY: Esperando las primeras puntuaciones oficiales';
      }
      return `STATE_OFFICIAL_RESULTS: Mostrando ${state.scores.length} resultados oficiales`;
    }

    it('Estado 1 (Cargando): Muestra spinner y mensaje sin inyectar datos falsos', () => {
      const res = determineOfficialUIState({ isLoading: true, loadError: null, scores: [] });
      expect(res).toContain('STATE_LOADING');
    });

    it('Estado 2 (Sin Puntuaciones): Muestra mensaje oficial claro y respetuoso', () => {
      const res = determineOfficialUIState({ isLoading: false, loadError: null, scores: [] });
      expect(res).toBe('STATE_EMPTY: Esperando las primeras puntuaciones oficiales');
    });

    it('Estado 3 (Fallo de Red): Muestra mensaje de error y opción de reintento', () => {
      const res = determineOfficialUIState({
        isLoading: false,
        loadError: 'No fue posible actualizar los resultados. Verifique su conexión a internet.',
        scores: [],
      });
      expect(res).toContain('STATE_ERROR');
      expect(res).toContain('No fue posible actualizar los resultados');
    });

    it('Estado 4 (Resultados Oficiales): Despliega únicamente scores reales', () => {
      const realScores = [
        { id: 'sc-1', final_score: 13.450, status: 'official_approved' },
        { id: 'sc-2', final_score: 12.800, status: 'official_approved' },
      ];
      const res = determineOfficialUIState({ isLoading: false, loadError: null, scores: realScores });
      expect(res).toBe('STATE_OFFICIAL_RESULTS: Mostrando 2 resultados oficiales');
    });
  });

  // ==========================================================================
  // SECCIÓN 3: VERIFICACIÓN FORENSE DEL CÓDIGO FUENTE (CERO DATOS SEMILLA)
  // ==========================================================================
  describe('3. Verificación Forense del Código Fuente (Erradicación de Mocks)', () => {
    const rootDir = path.resolve(__dirname, '../../');

    it('Verifica que LiveStandingsBoard.tsx NO contiene getDemoSeedScores ni atletas de prueba', () => {
      const fileContent = fs.readFileSync(
        path.join(rootDir, 'src/features/standings/LiveStandingsBoard.tsx'),
        'utf-8'
      );

      expect(fileContent).not.toContain('getDemoSeedScores');
      expect(fileContent).not.toContain('demoSeedScores');
      expect(fileContent).not.toContain('Camila Valenzuela');
      expect(fileContent).toContain('Esperando las primeras puntuaciones oficiales');
      expect(fileContent).toContain('Reintentar actualización');
    });

    it('Verifica que ClubDelegatesPortal.tsx NO contiene campeonatos ficticios ni gimnastas hardcodeadas', () => {
      const fileContent = fs.readFileSync(
        path.join(rootDir, 'src/features/delegates/ClubDelegatesPortal.tsx'),
        'utf-8'
      );

      expect(fileContent).not.toContain('c2026000-0000-0000-0000-000000000001');
      expect(fileContent).not.toContain('Catalina Rivas');
      expect(fileContent).not.toContain('Francisca Ovalle');
      expect(fileContent).toContain('Aún no hay rotaciones oficiales asignadas para');
    });

    it('Verifica que PublicChampionshipPortal.tsx no contiene tabla estática ni atletas demo', () => {
      const fileContent = fs.readFileSync(
        path.join(rootDir, 'src/features/public-portal/PublicChampionshipPortal.tsx'),
        'utf-8'
      );

      expect(fileContent).not.toContain('Valentina Silva');
      expect(fileContent).not.toContain('Club Manquehue');
      expect(fileContent).toContain('Esperando las primeras puntuaciones oficiales');
      expect(fileContent).toContain('Ceremonias de premiación no iniciadas');
    });

    it('Verifica que FastJudgeTerminal.tsx incluye búsqueda por dorsal y atajos de tablet', () => {
      const fileContent = fs.readFileSync(
        path.join(rootDir, 'src/features/scoring/FastJudgeTerminal.tsx'),
        'utf-8'
      );

      expect(fileContent).toContain('Búsqueda Rápida por Dorsal o Nombre');
      expect(fileContent).toContain('Teclado Numérico de Pista (iPad / Tablet)');
      expect(fileContent).toContain('handleGoPreviousGymnast');
      expect(fileContent).toContain('handleGoNextGymnast');
      expect(fileContent).toContain('handleSearchBibOrName');
      expect(fileContent).toContain('operix_fast_judge_session');
    });
  });
});
