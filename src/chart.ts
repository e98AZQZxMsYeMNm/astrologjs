/*
** AstrologJS – Main chart casting function (ported from Astrolog calc.cpp CastChart())
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

import {
  Obj, cObjMain, cSign, HouseSystem,
  rDegMax, rDegHalf,
} from './const.js';
import { Mod, SFromZ } from './general.js';
import { defaultIgnore } from './data.js';
import { MdytszToJulian } from './julian.js';
import { housePlace } from './houses.js';
import { listAspects, createAspectGrid } from './aspects.js';
import {
  EphemerisProvider, computePlanets, computeSwissHouses,
  createSwissFlags, createMoshierFlags,
  objToSwe,
} from './ephemeris.js';
import type { ChartInfo, ChartPositions, ChartSettings, AspectInfo, AspectGrid, InternalState } from './types.js';

/** Default chart settings */
export function defaultSettings(): ChartSettings {
  return {
    houseSystem: HouseSystem.Placidus,
    nAsp: 5,
    sidereal: false,
    zodiacOffset: 0,
    harmonic: 1.0,
    ignore: defaultIgnore(),
  };
}

/**
 * Standard objects to compute for a natal chart.
 */
export const defaultObjects = [
  Obj.Sun, Obj.Moon, Obj.Mercury, Obj.Venus, Obj.Mars,
  Obj.Jupiter, Obj.Saturn, Obj.Uranus, Obj.Neptune, Obj.Pluto,
  Obj.Chiron, Obj.Ceres, Obj.Pallas, Obj.Juno, Obj.Vesta,
  Obj.NorthNode, Obj.Lilith,
];

/**
 * Full chart computation result.
 */
export interface ChartResult {
  /** Input chart data */
  input: ChartInfo;
  /** Computed positions */
  positions: ChartPositions;
  /** Internal state */
  state: InternalState;
  /** Aspect list */
  aspects: AspectInfo[];
  /** Settings used */
  settings: ChartSettings;
}

/**
 * Cast (compute) a natal chart.
 * This is the main entry point for chart calculation, equivalent to Astrolog's CastChart().
 *
 * @param ci Chart input data (date, time, location)
 * @param ephemeris Swiss Ephemeris provider
 * @param settings Chart settings (optional, uses defaults)
 * @returns Full chart result
 */
export function castChart(
  ci: ChartInfo,
  ephemeris: EphemerisProvider,
  settings: Partial<ChartSettings> = {},
): ChartResult {
  const s: ChartSettings = { ...defaultSettings(), ...settings };

  // Step 1: Compute Julian Day
  const jd = MdytszToJulian(ci.mon, ci.day, ci.yea, ci.tim, ci.dst, ci.zon);

  // Step 2: Compute houses via Swiss Ephemeris
  const houseResult = computeSwissHouses(
    ephemeris, jd, ci.lat, ci.lon, s.houseSystem,
  );

  // Step 3: Build internal state
  const state: InternalState = {
    T: (jd - 2415020.5) / 36525.0,
    MC: houseResult.mc,
    Asc: houseResult.asc,
    EP: houseResult.eastPoint,
    Vtx: houseResult.vertex,
    RA: houseResult.armc,
    OB: houseResult.obliquity,
    rOff: 0,
    rSid: 0,
    rNut: houseResult.nutation,
    rDeltaT: 0,
    JD: jd,
  };

  // Step 4: Compute planet positions
  const flags = createMoshierFlags();
  const planetResults = computePlanets(ephemeris, jd, defaultObjects, flags);

  // Step 5: Build positions arrays
  const obj = new Array(cObjMain).fill(0);
  const alt = new Array(cObjMain).fill(0);
  const dir = new Array(cObjMain).fill(0);
  const dist = new Array(cObjMain).fill(0);

  for (const [idx, result] of planetResults) {
    if (idx < cObjMain) {
      obj[idx] = Mod(result.lon);
      alt[idx] = result.lat;
      dir[idx] = result.lonSpeed;
      dist[idx] = result.dist;
    }
  }

  // Step 6: Compute derived objects

  // South Node = North Node + 180
  if (!s.ignore.has(Obj.SouthNode) && planetResults.has(Obj.NorthNode)) {
    obj[Obj.SouthNode] = Mod(obj[Obj.NorthNode] + rDegHalf);
    alt[Obj.SouthNode] = -alt[Obj.NorthNode];
    dir[Obj.SouthNode] = dir[Obj.NorthNode];
  }

  // Part of Fortune = Asc + Moon - Sun (day chart) or Asc + Sun - Moon (night chart)
  if (!s.ignore.has(Obj.Fortune)) {
    const sunPos = obj[Obj.Sun];
    const moonPos = obj[Obj.Moon];
    const ascPos = state.Asc;
    // Day chart: Sun above horizon
    const isDay = housePlace(sunPos, houseResult.cusps) <= 6;
    if (isDay) {
      obj[Obj.Fortune] = Mod(ascPos + moonPos - sunPos);
    } else {
      obj[Obj.Fortune] = Mod(ascPos + sunPos - moonPos);
    }
  }

  // Vertex and East Point from house computation
  obj[Obj.Vertex] = state.Vtx;
  obj[Obj.EastPoint] = state.EP;

  // Step 7: Fill house cusps into object positions
  const cusp = houseResult.cusps;
  for (let i = 1; i <= cSign; i++) {
    const cuspObjIdx = Obj.Asc + i - 1;
    if (cuspObjIdx < cObjMain) {
      obj[cuspObjIdx] = cusp[i];
    }
  }

  // Step 8: Apply sidereal offset if needed
  if (s.sidereal && s.zodiacOffset !== 0) {
    for (let i = 0; i < cObjMain; i++) {
      if (!s.ignore.has(i)) {
        obj[i] = Mod(obj[i] - s.zodiacOffset);
      }
    }
    for (let i = 1; i <= cSign; i++) {
      cusp[i] = Mod(cusp[i] - s.zodiacOffset);
    }
  }

  // Step 9: Apply harmonic if != 1
  if (s.harmonic !== 1.0) {
    for (let i = 0; i < cObjMain; i++) {
      if (!s.ignore.has(i)) {
        obj[i] = Mod(obj[i] * s.harmonic);
      }
    }
  }

  // Step 10: Compute house placements
  const house = new Array(cObjMain).fill(0);
  for (let i = 0; i < cObjMain; i++) {
    if (!s.ignore.has(i)) {
      house[i] = housePlace(obj[i], cusp);
    }
  }

  const positions: ChartPositions = {
    obj, alt, dir, dist, cusp, house,
  };

  // Step 11: Compute aspects
  const aspects = listAspects(obj, dir, cObjMain, s.nAsp, s.ignore);

  return {
    input: ci,
    positions,
    state,
    aspects,
    settings: s,
  };
}
