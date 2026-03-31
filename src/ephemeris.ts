/*
** AstrologJS – Swiss Ephemeris integration layer (ported from Astrolog calc.cpp
** FSwissPlanet, SwissHouse, etc.). Wraps swisseph-wasm as the calculation backend.
**
** Based on Astrolog (Version 7.80)
** Copyright (C) 1991-2025 by Walter D. Pullen (Astara@msn.com,
** http://www.astrolog.org/astrolog.htm). Permission is granted to freely
** use, modify, and distribute these routines provided these credits and
** notices remain unmodified with any altered or distributed versions of
** the program.
**
** Swiss Ephemeris: Copyright 1997-2008 Astrodienst AG. Subject to Swiss
** Ephemeris Free Edition license: https://www.astro.com/swisseph/swephinfo_e.htm
** This copyright notice must not be changed or removed.
**
** PLACALC: Copyright (C) 1989,1991,1993 Astrodienst AG and Alois Treindl.
** This copyright notice must not be changed or removed.
**
** See NOTICE file for complete third-party copyright notices.
**
** This program is free software; you can redistribute it and/or modify
** it under the terms of the GNU General Public License as published by
** the Free Software Foundation; either version 2 of the License, or
** (at your option) any later version. This program is distributed in the
** hope that it will be useful, but WITHOUT ANY WARRANTY; without even the
** implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
** See the GNU General Public License for more details.
*/

import { Obj, HouseSystem, rDegHalf, rDegMax } from './const.js';
import { Mod } from './general.js';

// Swiss Ephemeris constants (from swephexp.h)
const SE_SUN = 0;
const SE_MOON = 1;
const SE_MERCURY = 2;
const SE_VENUS = 3;
const SE_MARS = 4;
const SE_JUPITER = 5;
const SE_SATURN = 6;
const SE_URANUS = 7;
const SE_NEPTUNE = 8;
const SE_PLUTO = 9;
const SE_MEAN_NODE = 10;
const SE_TRUE_NODE = 11;
const SE_CHIRON = 15;
const SE_CERES = 17;
const SE_PALLAS = 18;
const SE_JUNO = 19;
const SE_VESTA = 20;
const SE_MEAN_APOG = 12; // Lilith (mean)

const SEFLG_SPEED = 256;
const SEFLG_SWIEPH = 2;
const SEFLG_MOSEPH = 4;

const SE_GREG_CAL = 1;
const SE_JUL_CAL = 0;

/** Map from Astrolog object index to Swiss Ephemeris planet ID */
const objToSwe: Map<number, number> = new Map([
  [Obj.Sun, SE_SUN],
  [Obj.Moon, SE_MOON],
  [Obj.Mercury, SE_MERCURY],
  [Obj.Venus, SE_VENUS],
  [Obj.Mars, SE_MARS],
  [Obj.Jupiter, SE_JUPITER],
  [Obj.Saturn, SE_SATURN],
  [Obj.Uranus, SE_URANUS],
  [Obj.Neptune, SE_NEPTUNE],
  [Obj.Pluto, SE_PLUTO],
  [Obj.Chiron, SE_CHIRON],
  [Obj.Ceres, SE_CERES],
  [Obj.Pallas, SE_PALLAS],
  [Obj.Juno, SE_JUNO],
  [Obj.Vesta, SE_VESTA],
  [Obj.NorthNode, SE_TRUE_NODE],
  [Obj.Lilith, SE_MEAN_APOG],
]);

/** Swiss Ephemeris house system code characters */
const houseSystemChar: Record<number, string> = {
  [HouseSystem.Placidus]: 'P',
  [HouseSystem.Koch]: 'K',
  [HouseSystem.Equal]: 'E',
  [HouseSystem.Campanus]: 'C',
  [HouseSystem.Meridian]: 'X',
  [HouseSystem.Regiomontanus]: 'R',
  [HouseSystem.Porphyry]: 'O',
  [HouseSystem.Morinus]: 'M',
  [HouseSystem.Topocentric]: 'T',
  [HouseSystem.Alcabitius]: 'B',
  [HouseSystem.WholeSign]: 'W',
  [HouseSystem.VedicEqual]: 'V',
  [HouseSystem.Null]: 'N',
};

/**
 * Planet computation result from Swiss Ephemeris
 */
export interface PlanetResult {
  /** Ecliptic longitude (degrees) */
  lon: number;
  /** Ecliptic latitude (degrees) */
  lat: number;
  /** Distance (AU) */
  dist: number;
  /** Longitude speed (deg/day, negative = retrograde) */
  lonSpeed: number;
  /** Latitude speed (deg/day) */
  latSpeed: number;
  /** Distance speed (AU/day) */
  distSpeed: number;
}

/**
 * House computation result from Swiss Ephemeris
 */
export interface HouseResult {
  /** House cusp positions (index 1-12) */
  cusps: number[];
  /** Ascendant */
  asc: number;
  /** Midheaven */
  mc: number;
  /** Right Ascension of MC */
  armc: number;
  /** Vertex */
  vertex: number;
  /** East Point */
  eastPoint: number;
  /** Obliquity of ecliptic */
  obliquity: number;
  /** Nutation */
  nutation: number;
}

/**
 * Ephemeris provider interface.
 * This abstraction allows swapping the Swiss Ephemeris backend.
 */
export interface EphemerisProvider {
  /** Compute Julian Day from calendar date */
  julday(year: number, month: number, day: number, hour: number, gregflag?: number): number;

  /** Compute planet position for a given Julian Day (UT) */
  calcUt(jd: number, planet: number, flags: number): PlanetResult;

  /** Compute house cusps */
  houses(jd: number, lat: number, lon: number, hsys: string): HouseResult;

  /** Set ephemeris file path (if needed) */
  setEphePath?(path: string): void;

  /** Close and free resources */
  close?(): void;
}

/**
 * Create an EphemerisProvider from the swisseph-wasm module.
 *
 * swisseph-wasm exports a class `SwissEph` that must be instantiated,
 * then initialized via `initSwissEph()`. Method names use short form
 * (e.g. `calc_ut`, `houses`, `julday`) without the `swe_` prefix.
 *
 * Return formats:
 *  - calc_ut() → Float64Array[6]: [lon, lat, dist, lonSpeed, latSpeed, distSpeed]
 *  - houses()  → { cusps: Float64Array[13], ascmc: Float64Array[10] }
 *               ascmc indices: 0=Asc, 1=MC, 2=ARMC, 3=Vertex, 4=Equatorial Asc
 */
export async function createSwissEphemeris(): Promise<EphemerisProvider> {
  // Dynamic import to allow the library to work without swisseph-wasm
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const swe: any = await import('swisseph-wasm');
  const SwissEph = swe.default ?? swe;

  // Instantiate and initialize the WASM module
  const eph = typeof SwissEph === 'function' ? new SwissEph() : SwissEph;
  if (typeof eph.initSwissEph === 'function') {
    await eph.initSwissEph();
  }

  return {
    julday(year: number, month: number, day: number, hour: number): number {
      return eph.julday(year, month, day, hour);
    },

    calcUt(jd: number, planet: number, flags: number): PlanetResult {
      const data = eph.calc_ut(jd, planet, flags | SEFLG_SPEED);
      // calc_ut returns Float64Array[6]
      return {
        lon: data[0],
        lat: data[1],
        dist: data[2],
        lonSpeed: data[3],
        latSpeed: data[4],
        distSpeed: data[5],
      };
    },

    houses(jd: number, lat: number, lon: number, hsys: string): HouseResult {
      const result = eph.houses(jd, lat, lon, hsys);
      // result.cusps: Float64Array[13] (index 0 unused, 1-12 are cusps)
      // result.ascmc: Float64Array[10] (0=Asc, 1=MC, 2=ARMC, 3=Vertex, 4=EqAsc)
      const cusps = new Array(13).fill(0);
      for (let i = 1; i <= 12; i++) {
        cusps[i] = result.cusps[i];
      }
      return {
        cusps,
        asc: result.ascmc[0],
        mc: result.ascmc[1],
        armc: result.ascmc[2],
        vertex: result.ascmc[3],
        eastPoint: result.ascmc[4],
        obliquity: 23.4393, // calc separately if needed
        nutation: 0,
      };
    },

    setEphePath(path: string): void {
      if (typeof eph.set_ephe_path === 'function') {
        eph.set_ephe_path(path);
      }
    },

    close(): void {
      if (typeof eph.close === 'function') {
        eph.close();
      }
    },
  };
}

/**
 * Built-in fallback ephemeris using the Moshier method.
 * This is used when swisseph-wasm is not available.
 */
export function createMoshierFlags(): number {
  return SEFLG_MOSEPH | SEFLG_SPEED;
}

export function createSwissFlags(): number {
  return SEFLG_SWIEPH | SEFLG_SPEED;
}

/**
 * Compute all planet positions for a chart.
 */
export function computePlanets(
  ephemeris: EphemerisProvider,
  jd: number,
  objects: number[],
  flags: number,
): Map<number, PlanetResult> {
  const results = new Map<number, PlanetResult>();

  for (const obj of objects) {
    const sweId = objToSwe.get(obj);
    if (sweId === undefined) continue;

    try {
      const result = ephemeris.calcUt(jd, sweId, flags);
      results.set(obj, result);
    } catch {
      // Skip objects that fail to compute
    }
  }

  return results;
}

/**
 * Compute houses via Swiss Ephemeris.
 */
export function computeSwissHouses(
  ephemeris: EphemerisProvider,
  jd: number,
  lat: number,
  lon: number,
  system: HouseSystem,
): HouseResult {
  const hsys = houseSystemChar[system] ?? 'P';
  return ephemeris.houses(jd, lat, -lon, hsys);
}

// Export constants for external use
export { objToSwe, houseSystemChar, SEFLG_SPEED, SEFLG_SWIEPH, SEFLG_MOSEPH };
