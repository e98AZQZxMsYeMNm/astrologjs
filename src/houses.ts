/*
** AstrologJS – House system calculations (ported from Astrolog calc.cpp)
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

import { HouseSystem, cSign, rDegMax, rDegHalf, rDegQuad } from './const.js';
import { Mod, RFromD, DFromR, RAngle } from './general.js';
import { CoorXform } from './coords.js';

/**
 * Compute house cusps for a given house system.
 *
 * @param mc Midheaven (MC) longitude in degrees
 * @param asc Ascendant longitude in degrees
 * @param armc Right Ascension of MC in degrees
 * @param obliquity Obliquity of ecliptic in degrees
 * @param lat Geographic latitude in degrees
 * @param system House system to use
 * @returns Array of cusp positions (index 1-12)
 */
export function computeHouses(
  mc: number,
  asc: number,
  armc: number,
  obliquity: number,
  lat: number,
  system: HouseSystem,
): number[] {
  const cusp = new Array<number>(cSign + 1).fill(0);

  switch (system) {
    case HouseSystem.Equal:
      houseEqual(cusp, asc);
      break;
    case HouseSystem.WholeSign:
      houseWholeSign(cusp, asc);
      break;
    case HouseSystem.EqualMC:
      houseEqualMC(cusp, mc);
      break;
    case HouseSystem.Porphyry:
      housePorphyry(cusp, mc, asc);
      break;
    case HouseSystem.Null:
      houseNull(cusp);
      break;
    case HouseSystem.Campanus:
      houseCampanus(cusp, armc, obliquity, lat);
      break;
    case HouseSystem.Meridian:
      houseMeridian(cusp, armc, obliquity);
      break;
    case HouseSystem.Regiomontanus:
      houseRegiomontanus(cusp, armc, obliquity, lat);
      break;
    case HouseSystem.Morinus:
      houseMorinus(cusp, armc, obliquity);
      break;
    case HouseSystem.Alcabitius:
      houseAlcabitius(cusp, mc, asc, armc, obliquity, lat);
      break;
    case HouseSystem.VedicEqual:
      houseVedicEqual(cusp, asc);
      break;
    default:
      // Fallback to equal houses for unimplemented systems
      houseEqual(cusp, asc);
      break;
  }

  return cusp;
}

/** Equal house system: each house = 30 degrees starting from Asc */
function houseEqual(cusp: number[], asc: number): void {
  for (let i = 1; i <= cSign; i++) {
    cusp[i] = Mod(asc + (i - 1) * 30.0);
  }
}

/** Whole Sign houses: each house = one complete sign */
function houseWholeSign(cusp: number[], asc: number): void {
  const startSign = Math.floor(asc / 30.0);
  for (let i = 1; i <= cSign; i++) {
    cusp[i] = Mod((startSign + i - 1) * 30.0);
  }
}

/** Equal houses from MC */
function houseEqualMC(cusp: number[], mc: number): void {
  for (let i = 1; i <= cSign; i++) {
    cusp[i] = Mod(mc + (i - 10) * 30.0);
  }
}

/** Porphyry: trisect each quadrant */
function housePorphyry(cusp: number[], mc: number, asc: number): void {
  cusp[1] = asc;
  cusp[4] = Mod(mc + rDegHalf);  // IC
  cusp[7] = Mod(asc + rDegHalf); // Descendant
  cusp[10] = mc;

  // Trisect quadrant 1 (Asc -> IC)
  let q = MinDist(asc, cusp[4]);
  cusp[2] = Mod(asc + q / 3.0);
  cusp[3] = Mod(asc + 2.0 * q / 3.0);

  // Trisect quadrant 2 (IC -> Des)
  q = MinDist(cusp[4], cusp[7]);
  cusp[5] = Mod(cusp[4] + q / 3.0);
  cusp[6] = Mod(cusp[4] + 2.0 * q / 3.0);

  // Trisect quadrant 3 (Des -> MC)
  q = MinDist(cusp[7], mc);
  cusp[8] = Mod(cusp[7] + q / 3.0);
  cusp[9] = Mod(cusp[7] + 2.0 * q / 3.0);

  // Trisect quadrant 4 (MC -> Asc)
  q = MinDist(mc, Mod(asc + rDegMax));
  cusp[11] = Mod(mc + q / 3.0);
  cusp[12] = Mod(mc + 2.0 * q / 3.0);
}

/** Null house system: all cusps at 0 */
function houseNull(cusp: number[]): void {
  for (let i = 1; i <= cSign; i++) {
    cusp[i] = (i - 1) * 30.0;
  }
}

/** Campanus house system */
function houseCampanus(cusp: number[], armc: number, obliquity: number, lat: number): void {
  for (let i = 1; i <= cSign; i++) {
    const k = RFromD(armc + (i - 1) * 30.0 - rDegHalf);
    const rLat = RFromD(lat);
    const rObl = RFromD(obliquity);
    const a = Math.atan(Math.tan(k) * Math.cos(rLat));
    const b = Math.asin(Math.sin(a) * Math.sin(rLat));
    // Convert prime vertical position to ecliptic longitude
    let [lon] = CoorXform(DFromR(a), DFromR(b), -obliquity);
    cusp[i] = Mod(lon);
  }
}

/** Meridian (Axial Rotation) house system */
function houseMeridian(cusp: number[], armc: number, obliquity: number): void {
  for (let i = 1; i <= cSign; i++) {
    const ra = Mod(armc + (i - 1) * 30.0);
    const [lon] = CoorXform(ra, 0, -obliquity);
    cusp[i] = Mod(lon);
  }
}

/** Regiomontanus house system */
function houseRegiomontanus(cusp: number[], armc: number, obliquity: number, lat: number): void {
  for (let i = 1; i <= cSign; i++) {
    const k = armc + (i - 1) * 30.0 - rDegHalf;
    const rK = RFromD(k);
    const rLat = RFromD(lat);
    const rObl = RFromD(obliquity);
    const d = Math.atan(Math.tan(rLat) * Math.sin(rK));
    const [lon] = CoorXform(k, DFromR(d), -obliquity);
    cusp[i] = Mod(lon);
  }
}

/** Morinus house system */
function houseMorinus(cusp: number[], armc: number, obliquity: number): void {
  for (let i = 1; i <= cSign; i++) {
    const ra = Mod(armc + (i + 5) * 30.0);
    const [lon] = CoorXform(ra, 0, obliquity);
    cusp[i] = Mod(lon + rDegHalf);
  }
}

/** Alcabitius house system */
function houseAlcabitius(
  cusp: number[], mc: number, asc: number, armc: number, obliquity: number, lat: number
): void {
  cusp[1] = asc;
  cusp[10] = mc;
  cusp[7] = Mod(asc + rDegHalf);
  cusp[4] = Mod(mc + rDegHalf);

  const rObl = RFromD(obliquity);
  const rLat = RFromD(lat);

  // Compute semi-arc
  const decAsc = Math.asin(Math.sin(rObl) * Math.sin(RFromD(asc)));
  const adAsc = Math.asin(Math.tan(decAsc) * Math.tan(rLat));
  const sa = DFromR(adAsc) + rDegQuad;

  for (let i = 2; i <= 3; i++) {
    const frac = i - 1;
    const ra = Mod(armc + frac * sa / 3.0);
    const dec = Math.atan(Math.tan(RFromD(ra - armc)) * Math.sin(rLat));
    const [lon] = CoorXform(ra, DFromR(dec), -obliquity);
    cusp[i] = Mod(lon);
    cusp[i + 6] = Mod(cusp[i] + rDegHalf);
  }

  // Fill remaining cusps
  for (let i = 4; i <= 6; i++) {
    if (cusp[i] === 0 && i !== 4) {
      const ra = Mod(armc + rDegHalf + (i - 4) * (rDegHalf - sa + rDegQuad) / 3.0);
      const dec = Math.atan(Math.tan(RFromD(ra - armc - rDegHalf)) * Math.sin(rLat));
      const [lon] = CoorXform(ra, DFromR(dec), -obliquity);
      cusp[i] = Mod(lon);
      cusp[i + 6] = Mod(cusp[i] + rDegHalf);
    }
  }
}

/** Vedic Equal houses: Asc in middle of 1st house */
function houseVedicEqual(cusp: number[], asc: number): void {
  const offset = asc - 15.0;
  for (let i = 1; i <= cSign; i++) {
    cusp[i] = Mod(offset + (i - 1) * 30.0);
  }
}

/**
 * Determine which house a given zodiac position falls in.
 */
export function housePlace(lon: number, cusp: number[]): number {
  for (let i = 1; i <= cSign; i++) {
    const next = i < cSign ? i + 1 : 1;
    let c1 = cusp[i];
    let c2 = cusp[next];

    if (c1 > c2) {
      // Cusp wraps around 0 Aries
      if (lon >= c1 || lon < c2) return i;
    } else {
      if (lon >= c1 && lon < c2) return i;
    }
  }
  return 1; // fallback
}

/**
 * Place all objects in their respective houses.
 */
export function computeInHouses(positions: number[], cusp: number[]): number[] {
  return positions.map(pos => housePlace(Mod(pos), cusp));
}

// Helper: distance in one direction around the zodiac
function MinDist(deg1: number, deg2: number): number {
  let d = deg2 - deg1;
  if (d < 0) d += rDegMax;
  return d;
}
