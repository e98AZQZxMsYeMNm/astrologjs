/*
** AstrologJS – Aspect calculation functions (ported from Astrolog calc.cpp)
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

import { cAspect, cObjMain } from './const.js';
import { MinDistance, MinDifference, Mod } from './general.js';
import { aspectAngle, aspectOrb, objectOrb, objectAdd } from './data.js';
import type { AspectInfo, AspectGrid } from './types.js';

/**
 * Compute the effective orb allowed for an aspect between two objects.
 * Orb = base aspect orb + average of the two objects' orb additions.
 */
export function getOrb(obj1: number, obj2: number, asp: number): number {
  const orbAsp = asp > 0 && asp <= cAspect ? aspectOrb[asp] : 0;
  const orb1 = obj1 < objectOrb.length ? objectAdd[obj1] : 0;
  const orb2 = obj2 < objectOrb.length ? objectAdd[obj2] : 0;
  return orbAsp + (orb1 + orb2) / 2.0;
}

/**
 * Check if two objects form an aspect.
 *
 * @param pos1 Zodiac longitude of object 1
 * @param pos2 Zodiac longitude of object 2
 * @param dir1 Velocity of object 1 (negative = retrograde)
 * @param dir2 Velocity of object 2 (negative = retrograde)
 * @param obj1 Index of object 1
 * @param obj2 Index of object 2
 * @param nAsp Maximum number of aspects to check
 * @returns AspectInfo or null if no aspect
 */
export function getAspect(
  pos1: number, pos2: number,
  dir1: number, dir2: number,
  obj1: number, obj2: number,
  nAsp: number = 5,
): AspectInfo | null {
  const dist = MinDistance(pos1, pos2);

  for (let a = 1; a <= Math.min(nAsp, cAspect); a++) {
    const angle = aspectAngle[a];
    const orb = getOrb(obj1, obj2, a);
    const diff = Math.abs(dist - angle);

    if (diff <= orb) {
      // Determine if applying or separating
      const signedDiff = MinDifference(pos1, pos2);
      const relativeSpeed = dir1 - dir2;
      let applying: boolean;

      if (angle === 0) {
        // Conjunction: applying if getting closer
        applying = Math.abs(signedDiff) > 0 ?
          (signedDiff > 0 ? relativeSpeed > 0 : relativeSpeed < 0) : false;
      } else if (angle === 180) {
        // Opposition
        applying = Math.abs(signedDiff) < 180 ?
          (signedDiff > 0 ? relativeSpeed < 0 : relativeSpeed > 0) : false;
      } else {
        // For other aspects, check if the actual distance is approaching the exact angle
        const futurePos1 = pos1 + dir1 * 0.01;
        const futurePos2 = pos2 + dir2 * 0.01;
        const futureDist = MinDistance(futurePos1, futurePos2);
        applying = Math.abs(futureDist - angle) < diff;
      }

      return {
        obj1,
        obj2,
        asp: a,
        orb: diff,
        applying,
      };
    }
  }

  return null;
}

/**
 * Create a full aspect grid between all objects.
 *
 * @param positions Array of zodiac longitudes
 * @param velocities Array of velocities
 * @param nObj Number of objects to consider
 * @param nAsp Number of aspects to check
 * @param ignore Set of object indices to skip
 * @returns AspectGrid with asp[i][j] and orb[i][j]
 */
export function createAspectGrid(
  positions: number[],
  velocities: number[],
  nObj: number,
  nAsp: number = 5,
  ignore: Set<number> = new Set(),
): AspectGrid {
  const asp: number[][] = Array.from({ length: nObj }, () => new Array(nObj).fill(0));
  const orb: number[][] = Array.from({ length: nObj }, () => new Array(nObj).fill(0));

  for (let i = 0; i < nObj; i++) {
    if (ignore.has(i)) continue;
    for (let j = i + 1; j < nObj; j++) {
      if (ignore.has(j)) continue;

      const result = getAspect(
        positions[i], positions[j],
        velocities[i], velocities[j],
        i, j,
        nAsp,
      );

      if (result) {
        asp[i][j] = result.asp;
        asp[j][i] = result.asp;
        orb[i][j] = result.orb;
        orb[j][i] = result.orb;
      }
    }
  }

  return { asp, orb };
}

/**
 * Get all aspects as a flat list.
 */
export function listAspects(
  positions: number[],
  velocities: number[],
  nObj: number,
  nAsp: number = 5,
  ignore: Set<number> = new Set(),
): AspectInfo[] {
  const results: AspectInfo[] = [];

  for (let i = 0; i < nObj; i++) {
    if (ignore.has(i)) continue;
    for (let j = i + 1; j < nObj; j++) {
      if (ignore.has(j)) continue;

      const result = getAspect(
        positions[i], positions[j],
        velocities[i], velocities[j],
        i, j,
        nAsp,
      );

      if (result) {
        results.push(result);
      }
    }
  }

  return results;
}
