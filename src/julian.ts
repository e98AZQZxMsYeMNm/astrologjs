/*
** AstrologJS – Julian Day calculations (ported from Astrolog calc.cpp)
** Algorithm: Meeus, "Astronomical Algorithms" 2nd ed.
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

import { yeaJ2G } from './const.js';

/**
 * Convert a calendar date to Julian Day Number.
 * Supports both Julian and Gregorian calendars.
 */
export function MdyToJulian(mon: number, day: number, yea: number): number {
  let y = yea;
  let m = mon;
  if (m <= 2) {
    y -= 1;
    m += 12;
  }

  let B = 0;
  // Gregorian calendar correction (after Oct 15, 1582)
  if (yea > yeaJ2G || (yea === yeaJ2G && (mon > 10 || (mon === 10 && day >= 15)))) {
    const A = Math.floor(y / 100);
    B = 2 - A + Math.floor(A / 4);
  }

  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + B - 1524.5;
}

/**
 * Convert full date/time/timezone to Julian Day (fractional).
 */
export function MdytszToJulian(
  mon: number, day: number, yea: number,
  tim: number, dst: number, zon: number
): number {
  // Convert local time to UT
  const ut = tim - dst + zon;
  const dayFrac = day + ut / 24.0;
  return MdyToJulian(mon, dayFrac, yea);
}

/**
 * Convert Julian Day to calendar date.
 * Meeus, "Astronomical Algorithms" chapter 7.
 */
export function JulianToMdy(jd: number): { mon: number; day: number; yea: number } {
  const z = Math.floor(jd + 0.5);
  const f = jd + 0.5 - z;

  let A: number;
  if (z < 2299161) {
    A = z;
  } else {
    const alpha = Math.floor((z - 1867216.25) / 36524.25);
    A = z + 1 + alpha - Math.floor(alpha / 4);
  }

  const B = A + 1524;
  const C = Math.floor((B - 122.1) / 365.25);
  const D = Math.floor(365.25 * C);
  const E = Math.floor((B - D) / 30.6001);

  const day = B - D - Math.floor(30.6001 * E);
  const mon = E < 14 ? E - 1 : E - 13;
  const yea = mon > 2 ? C - 4716 : C - 4715;

  return { mon, day, yea };
}

/**
 * Julian Day to time of day in decimal hours.
 */
export function JulianToTime(jd: number): number {
  const frac = jd + 0.5 - Math.floor(jd + 0.5);
  return frac * 24.0;
}
