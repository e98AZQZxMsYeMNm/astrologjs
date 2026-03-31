import { describe, it, expect } from 'vitest';
import {
  computePlanets, computeSwissHouses,
  createMoshierFlags, createSwissFlags,
  objToSwe, houseSystemChar,
  SEFLG_SPEED, SEFLG_SWIEPH, SEFLG_MOSEPH,
} from '../src/ephemeris.js';
import type { EphemerisProvider, PlanetResult, HouseResult } from '../src/ephemeris.js';
import { Obj, HouseSystem } from '../src/const.js';

// Mock ephemeris for unit testing without WASM
function createMockEphemeris(): EphemerisProvider {
  return {
    julday(year, month, day, hour) {
      return 2451545.0;
    },
    calcUt(jd, planet, flags): PlanetResult {
      if (planet === -1) {
        throw new Error('Unknown planet');
      }
      return {
        lon: planet * 30,
        lat: planet * 0.5,
        dist: planet + 1,
        lonSpeed: 1.0,
        latSpeed: 0.01,
        distSpeed: 0.001,
      };
    },
    houses(jd, lat, lon, hsys): HouseResult {
      const cusps = new Array(13).fill(0);
      for (let i = 1; i <= 12; i++) {
        cusps[i] = (i - 1) * 30;
      }
      return {
        cusps,
        asc: 0,
        mc: 270,
        armc: 270,
        vertex: 180,
        eastPoint: 90,
        obliquity: 23.4393,
        nutation: 0.001,
      };
    },
  };
}

// ============================================================
// Constants
// ============================================================
describe('ephemeris constants', () => {
  it('SEFLG_SPEED is 256', () => {
    expect(SEFLG_SPEED).toBe(256);
  });

  it('SEFLG_SWIEPH is 2', () => {
    expect(SEFLG_SWIEPH).toBe(2);
  });

  it('SEFLG_MOSEPH is 4', () => {
    expect(SEFLG_MOSEPH).toBe(4);
  });

  it('createMoshierFlags includes SPEED and MOSEPH', () => {
    const flags = createMoshierFlags();
    expect(flags & SEFLG_MOSEPH).toBeTruthy();
    expect(flags & SEFLG_SPEED).toBeTruthy();
  });

  it('createSwissFlags includes SPEED and SWIEPH', () => {
    const flags = createSwissFlags();
    expect(flags & SEFLG_SWIEPH).toBeTruthy();
    expect(flags & SEFLG_SPEED).toBeTruthy();
  });
});

// ============================================================
// objToSwe mapping
// ============================================================
describe('objToSwe mapping', () => {
  it('maps all major planets', () => {
    expect(objToSwe.has(Obj.Sun)).toBe(true);
    expect(objToSwe.has(Obj.Moon)).toBe(true);
    expect(objToSwe.has(Obj.Mercury)).toBe(true);
    expect(objToSwe.has(Obj.Pluto)).toBe(true);
  });

  it('maps Chiron and asteroids', () => {
    expect(objToSwe.has(Obj.Chiron)).toBe(true);
    expect(objToSwe.has(Obj.Ceres)).toBe(true);
    expect(objToSwe.has(Obj.Vesta)).toBe(true);
  });

  it('maps nodes and Lilith', () => {
    expect(objToSwe.has(Obj.NorthNode)).toBe(true);
    expect(objToSwe.has(Obj.Lilith)).toBe(true);
  });

  it('does not map derived objects (SouthNode, Fortune, etc.)', () => {
    expect(objToSwe.has(Obj.SouthNode)).toBe(false);
    expect(objToSwe.has(Obj.Fortune)).toBe(false);
    expect(objToSwe.has(Obj.Vertex)).toBe(false);
    expect(objToSwe.has(Obj.EastPoint)).toBe(false);
  });
});

// ============================================================
// houseSystemChar mapping
// ============================================================
describe('houseSystemChar mapping', () => {
  it('Placidus = P', () => {
    expect(houseSystemChar[HouseSystem.Placidus]).toBe('P');
  });

  it('Koch = K', () => {
    expect(houseSystemChar[HouseSystem.Koch]).toBe('K');
  });

  it('WholeSign = W', () => {
    expect(houseSystemChar[HouseSystem.WholeSign]).toBe('W');
  });

  it('all supported systems have a character', () => {
    const systems = [
      HouseSystem.Placidus, HouseSystem.Koch, HouseSystem.Equal,
      HouseSystem.Campanus, HouseSystem.Meridian, HouseSystem.Regiomontanus,
      HouseSystem.Porphyry, HouseSystem.Morinus, HouseSystem.Topocentric,
      HouseSystem.Alcabitius, HouseSystem.WholeSign, HouseSystem.VedicEqual,
      HouseSystem.Null,
    ];
    for (const sys of systems) {
      expect(houseSystemChar[sys]).toBeDefined();
      expect(houseSystemChar[sys].length).toBe(1);
    }
  });
});

// ============================================================
// computePlanets
// ============================================================
describe('computePlanets', () => {
  it('computes positions for requested objects', () => {
    const eph = createMockEphemeris();
    const objects = [Obj.Sun, Obj.Moon, Obj.Mars];
    const results = computePlanets(eph, 2451545.0, objects, createMoshierFlags());

    expect(results.size).toBe(3);
    expect(results.has(Obj.Sun)).toBe(true);
    expect(results.has(Obj.Moon)).toBe(true);
    expect(results.has(Obj.Mars)).toBe(true);
  });

  it('skips objects without Swiss Ephemeris mapping', () => {
    const eph = createMockEphemeris();
    // SouthNode (17) has no swe mapping
    const objects = [Obj.Sun, Obj.SouthNode, Obj.Fortune];
    const results = computePlanets(eph, 2451545.0, objects, createMoshierFlags());

    expect(results.has(Obj.Sun)).toBe(true);
    expect(results.has(Obj.SouthNode)).toBe(false);
    expect(results.has(Obj.Fortune)).toBe(false);
  });

  it('skips objects that throw errors', () => {
    const eph: EphemerisProvider = {
      ...createMockEphemeris(),
      calcUt(jd, planet, flags) {
        if (planet === 1) throw new Error('Moon calc failed');
        return { lon: 0, lat: 0, dist: 0, lonSpeed: 0, latSpeed: 0, distSpeed: 0 };
      },
    };
    // Moon's swe ID is 1, which will throw
    const results = computePlanets(eph, 2451545.0, [Obj.Sun, Obj.Moon], createMoshierFlags());
    expect(results.has(Obj.Sun)).toBe(true);
    expect(results.has(Obj.Moon)).toBe(false);
  });

  it('returns empty map for empty objects list', () => {
    const eph = createMockEphemeris();
    const results = computePlanets(eph, 2451545.0, [], createMoshierFlags());
    expect(results.size).toBe(0);
  });

  it('planet result has all fields', () => {
    const eph = createMockEphemeris();
    const results = computePlanets(eph, 2451545.0, [Obj.Sun], createMoshierFlags());
    const sun = results.get(Obj.Sun)!;
    expect(sun).toHaveProperty('lon');
    expect(sun).toHaveProperty('lat');
    expect(sun).toHaveProperty('dist');
    expect(sun).toHaveProperty('lonSpeed');
    expect(sun).toHaveProperty('latSpeed');
    expect(sun).toHaveProperty('distSpeed');
  });
});

// ============================================================
// computeSwissHouses
// ============================================================
describe('computeSwissHouses', () => {
  it('returns valid house cusps', () => {
    const eph = createMockEphemeris();
    const result = computeSwissHouses(eph, 2451545.0, 35.0, 139.0, HouseSystem.Placidus);

    expect(result.cusps.length).toBe(13);
    expect(result.asc).toBeDefined();
    expect(result.mc).toBeDefined();
    expect(result.armc).toBeDefined();
    expect(result.vertex).toBeDefined();
  });

  it('passes negated longitude to ephemeris', () => {
    let capturedLon = 0;
    const eph: EphemerisProvider = {
      ...createMockEphemeris(),
      houses(jd, lat, lon, hsys) {
        capturedLon = lon;
        return createMockEphemeris().houses(jd, lat, lon, hsys);
      },
    };
    // Astrolog uses negative=east, Swiss Ephemeris uses positive=east
    computeSwissHouses(eph, 2451545.0, 35.0, -139.0, HouseSystem.Placidus);
    expect(capturedLon).toBe(139.0); // negated
  });

  it('defaults to Placidus when unknown system', () => {
    let capturedHsys = '';
    const eph: EphemerisProvider = {
      ...createMockEphemeris(),
      houses(jd, lat, lon, hsys) {
        capturedHsys = hsys;
        return createMockEphemeris().houses(jd, lat, lon, hsys);
      },
    };
    computeSwissHouses(eph, 2451545.0, 35.0, 139.0, 999 as HouseSystem);
    expect(capturedHsys).toBe('P');
  });
});
