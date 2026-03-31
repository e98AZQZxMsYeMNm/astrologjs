import { describe, it, expect } from 'vitest';
import { castChart, defaultSettings, defaultObjects } from '../src/chart.js';
import { HouseSystem, Obj, cObjMain, cSign, Asp } from '../src/const.js';
import type { EphemerisProvider } from '../src/ephemeris.js';
import type { ChartInfo } from '../src/types.js';

/**
 * Mock ephemeris provider for testing chart.ts without WASM dependency.
 * Returns deterministic positions for known planets.
 */
function createMockEphemeris(): EphemerisProvider {
  const planetPositions: Record<number, [number, number, number, number]> = {
    // [lon, lat, dist, lonSpeed]
    0: [280.5, 0, 1.0, 1.02],      // Sun at ~10 Capricorn
    1: [45.3, 5.1, 0.0025, 13.2],  // Moon at ~15 Taurus
    2: [290.1, -1.2, 0.8, 1.5],    // Mercury
    3: [310.7, 2.0, 1.2, 1.1],     // Venus
    4: [15.5, 0.5, 1.8, 0.7],      // Mars at ~15 Aries
    5: [35.2, -0.3, 5.5, 0.08],    // Jupiter at ~5 Taurus
    6: [340.8, 1.1, 10.0, 0.03],   // Saturn
    7: [50.2, -0.4, 19.0, 0.01],   // Uranus
    8: [355.1, 0.2, 30.0, 0.005],  // Neptune
    9: [298.5, 3.0, 35.0, 0.004],  // Pluto
    11: [280.0, 0, 0, -0.02],      // True Node
    15: [10.5, 5.0, 13.0, 0.02],   // Chiron
    17: [80.3, 0, 2.7, 0.1],       // Ceres
    18: [120.1, 0, 2.5, 0.15],     // Pallas
    19: [200.5, 0, 2.4, 0.12],     // Juno
    20: [155.0, 0, 2.3, 0.08],     // Vesta
    12: [110.0, 3.5, 0, -0.05],    // Lilith (mean apogee)
  };

  return {
    julday(year, month, day, hour) {
      return 2451545.0 + (year - 2000) * 365.25 + (month - 1) * 30 + day + hour / 24;
    },
    calcUt(jd, planet, flags) {
      const data = planetPositions[planet] ?? [0, 0, 0, 0];
      return {
        lon: data[0],
        lat: data[1],
        dist: data[2],
        lonSpeed: data[3],
        latSpeed: 0,
        distSpeed: 0,
      };
    },
    houses(jd, lat, lon, hsys) {
      const cusps = new Array(13).fill(0);
      const ascVal = 5.0;
      for (let i = 1; i <= 12; i++) {
        cusps[i] = (ascVal + (i - 1) * 30) % 360;
      }
      return {
        cusps,
        asc: ascVal,
        mc: 275.0,
        armc: 275.0,
        vertex: 185.0,
        eastPoint: 10.0,
        obliquity: 23.4393,
        nutation: 0,
      };
    },
  };
}

// 共通テスト入力
const testChart: ChartInfo = {
  mon: 1, day: 15, yea: 2024,
  tim: 12.0, dst: 0, zon: -9,  // JST noon
  lat: 35.6762, lon: -139.6503, // Tokyo (lon negative = east in Astrolog convention)
};

// ============================================================
// castChart – メインの計算フロー
// ============================================================
describe('castChart', () => {
  it('returns a valid ChartResult', () => {
    const eph = createMockEphemeris();
    const result = castChart(testChart, eph);

    expect(result.input).toBe(testChart);
    expect(result.settings).toBeDefined();
    expect(result.state).toBeDefined();
    expect(result.positions).toBeDefined();
    expect(result.aspects).toBeDefined();
  });

  it('positions have correct array sizes', () => {
    const eph = createMockEphemeris();
    const result = castChart(testChart, eph);
    const p = result.positions;

    expect(p.obj.length).toBe(cObjMain);
    expect(p.alt.length).toBe(cObjMain);
    expect(p.dir.length).toBe(cObjMain);
    expect(p.dist.length).toBe(cObjMain);
    expect(p.cusp.length).toBe(cSign + 1);
    expect(p.house.length).toBe(cObjMain);
  });

  it('computes Sun position', () => {
    const eph = createMockEphemeris();
    const result = castChart(testChart, eph);
    expect(result.positions.obj[Obj.Sun]).toBeCloseTo(280.5);
  });

  it('computes Moon position', () => {
    const eph = createMockEphemeris();
    const result = castChart(testChart, eph);
    expect(result.positions.obj[Obj.Moon]).toBeCloseTo(45.3);
  });

  it('computes South Node as North Node + 180', () => {
    const eph = createMockEphemeris();
    const result = castChart(testChart, eph);
    const northNode = result.positions.obj[Obj.NorthNode];
    const southNode = result.positions.obj[Obj.SouthNode];
    expect(southNode).toBeCloseTo((northNode + 180) % 360);
  });

  it('computes Part of Fortune', () => {
    const eph = createMockEphemeris();
    const result = castChart(testChart, eph);
    expect(result.positions.obj[Obj.Fortune]).toBeGreaterThanOrEqual(0);
    expect(result.positions.obj[Obj.Fortune]).toBeLessThan(360);
  });

  it('fills Vertex and East Point from house data', () => {
    const eph = createMockEphemeris();
    const result = castChart(testChart, eph);
    expect(result.positions.obj[Obj.Vertex]).toBeCloseTo(185);
    expect(result.positions.obj[Obj.EastPoint]).toBeCloseTo(10);
  });

  it('fills cusp objects (Asc through 12th)', () => {
    const eph = createMockEphemeris();
    const result = castChart(testChart, eph);
    // Asc object position should match cusp[1]
    expect(result.positions.obj[Obj.Asc]).toBeCloseTo(result.positions.cusp[1]);
    // MC object position should match cusp[10]
    expect(result.positions.obj[Obj.MC]).toBeCloseTo(result.positions.cusp[10]);
  });

  it('assigns house to each object', () => {
    const eph = createMockEphemeris();
    const result = castChart(testChart, eph);
    for (let i = 1; i < cObjMain; i++) {
      if (result.settings.ignore.has(i)) continue;
      expect(result.positions.house[i]).toBeGreaterThanOrEqual(1);
      expect(result.positions.house[i]).toBeLessThanOrEqual(12);
    }
  });

  it('computes aspects', () => {
    const eph = createMockEphemeris();
    const result = castChart(testChart, eph);
    expect(Array.isArray(result.aspects)).toBe(true);
    // With the mock data there should be at least some aspects
    expect(result.aspects.length).toBeGreaterThan(0);
  });

  it('internal state has valid JD', () => {
    const eph = createMockEphemeris();
    const result = castChart(testChart, eph);
    expect(result.state.JD).toBeGreaterThan(2400000);
    expect(result.state.Asc).toBeCloseTo(5.0);
    expect(result.state.MC).toBeCloseTo(275.0);
  });
});

// ============================================================
// castChart – 設定バリエーション
// ============================================================
describe('castChart settings', () => {
  it('uses default settings when none provided', () => {
    const eph = createMockEphemeris();
    const result = castChart(testChart, eph);
    expect(result.settings.houseSystem).toBe(HouseSystem.Placidus);
    expect(result.settings.nAsp).toBe(5);
    expect(result.settings.sidereal).toBe(false);
    expect(result.settings.harmonic).toBe(1.0);
  });

  it('overrides house system', () => {
    const eph = createMockEphemeris();
    const result = castChart(testChart, eph, { houseSystem: HouseSystem.WholeSign });
    expect(result.settings.houseSystem).toBe(HouseSystem.WholeSign);
  });

  it('applies sidereal offset', () => {
    const eph = createMockEphemeris();
    const tropical = castChart(testChart, eph);
    const sidereal = castChart(testChart, eph, {
      sidereal: true,
      zodiacOffset: 24.0,
    });
    // Sidereal positions should be shifted back by ~24 degrees
    const diff = tropical.positions.obj[Obj.Sun] - sidereal.positions.obj[Obj.Sun];
    expect(diff).toBeCloseTo(24, 0);
  });

  it('applies harmonic', () => {
    const eph = createMockEphemeris();
    const normal = castChart(testChart, eph);
    const h2 = castChart(testChart, eph, { harmonic: 2 });
    // Harmonic 2: positions * 2, mod 360
    const expectedSun = (normal.positions.obj[Obj.Sun] * 2) % 360;
    expect(h2.positions.obj[Obj.Sun]).toBeCloseTo(expectedSun, 0);
  });

  it('more aspects found with higher nAsp', () => {
    const eph = createMockEphemeris();
    const major = castChart(testChart, eph, { nAsp: 5 });
    const minor = castChart(testChart, eph, { nAsp: 18 });
    expect(minor.aspects.length).toBeGreaterThanOrEqual(major.aspects.length);
  });

  it('respects ignore set', () => {
    const eph = createMockEphemeris();
    const ignore = new Set([Obj.Sun, Obj.Moon, Obj.Mercury, Obj.Venus]);
    const result = castChart(testChart, eph, { ignore });
    // Ignored objects should remain at 0 (default position)
    // The house placement should also be 0 (not computed)
    expect(result.positions.house[Obj.Sun]).toBe(0);
    expect(result.positions.house[Obj.Moon]).toBe(0);
  });
});

// ============================================================
// defaultSettings / defaultObjects
// ============================================================
describe('defaultSettings', () => {
  it('returns sensible defaults', () => {
    const s = defaultSettings();
    expect(s.houseSystem).toBe(HouseSystem.Placidus);
    expect(s.nAsp).toBe(5);
    expect(s.sidereal).toBe(false);
    expect(s.zodiacOffset).toBe(0);
    expect(s.harmonic).toBe(1.0);
    expect(s.ignore.has(Obj.Earth)).toBe(true);
    expect(s.ignore.has(Obj.Sun)).toBe(false);
  });
});

describe('defaultObjects', () => {
  it('contains all major planets and points', () => {
    expect(defaultObjects).toContain(Obj.Sun);
    expect(defaultObjects).toContain(Obj.Moon);
    expect(defaultObjects).toContain(Obj.Pluto);
    expect(defaultObjects).toContain(Obj.Chiron);
    expect(defaultObjects).toContain(Obj.NorthNode);
    expect(defaultObjects).toContain(Obj.Lilith);
  });

  it('does not contain Earth', () => {
    expect(defaultObjects).not.toContain(Obj.Earth);
  });
});
