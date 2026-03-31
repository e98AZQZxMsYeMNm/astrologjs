/*
** AstrologJS – General utility functions (ported from Astrolog general.cpp)
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

import { rDegMax, rDegHalf, rDegRad, rPi, cSign, yeaJ2G } from './const.js';

// ---- Angle conversion ----

/** Degrees to radians */
export function RFromD(d: number): number {
  return d / rDegRad;
}

/** Radians to degrees */
export function DFromR(r: number): number {
  return r * rDegRad;
}

// ---- Zodiac conversion ----

/** Sign number (1-12) to starting zodiac degree (0, 30, 60, ..., 330) */
export function ZFromS(s: number): number {
  return (s - 1) * 30.0;
}

/** Zodiac degree (0-360) to sign number (1-12) */
export function SFromZ(z: number): number {
  return Math.floor(z / 30.0) + 1;
}

/** Degree within sign (0-30) from zodiac degree */
export function degInSign(z: number): number {
  return z - ZFromS(SFromZ(z));
}

// ---- Angle normalization ----

/** Normalize angle to 0-360 range */
export function Mod(d: number): number {
  d = d % rDegMax;
  if (d < 0.0) d += rDegMax;
  return d;
}

/** Normalize value to 1-12 range */
export function Mod12(i: number): number {
  let r = ((i - 1) % cSign);
  if (r < 0) r += cSign;
  return r + 1;
}

/** atan2-like function returning 0-360 degrees */
export function RAngle(x: number, y: number): number {
  let a: number;
  if (x !== 0.0) {
    if (Math.abs(x) > Math.abs(y)) {
      a = Math.atan(y / x);
    } else {
      a = rPi / 2.0 - Math.atan(x / y);
    }
    if (x < 0.0) a += rPi;
  } else {
    a = y < 0.0 ? 3 * rPi / 2 : rPi / 2;
  }
  if (a < 0.0) a += 2.0 * rPi;
  return a;
}

// ---- Arc distance functions ----

/** Shortest arc between two zodiac positions (0-180) */
export function MinDistance(deg1: number, deg2: number): number {
  let d = Math.abs(deg1 - deg2);
  if (d > rDegHalf) d = rDegMax - d;
  return d;
}

/** Signed shortest arc from deg1 to deg2 (-180 to +180) */
export function MinDifference(deg1: number, deg2: number): number {
  let d = deg2 - deg1;
  if (d > rDegHalf) d -= rDegMax;
  if (d < -rDegHalf) d += rDegMax;
  return d;
}

/** Midpoint of two zodiac positions */
export function Midpoint(deg1: number, deg2: number): number {
  let mid = (deg1 + deg2) / 2.0;
  if (MinDistance(mid, deg1) > rDegQuad) {
    mid = Mod(mid + rDegHalf);
  }
  return mid;
}

const rDegQuad = 90.0;

/** Great circle distance between two points on a sphere (in degrees) */
export function SphDistance(lon1: number, lat1: number, lon2: number, lat2: number): number {
  const rlat1 = RFromD(lat1);
  const rlat2 = RFromD(lat2);
  const rlon = RFromD(MinDistance(lon1, lon2));
  const d = Math.acos(
    Math.min(1.0, Math.sin(rlat1) * Math.sin(rlat2) +
    Math.cos(rlat1) * Math.cos(rlat2) * Math.cos(rlon))
  );
  return DFromR(d);
}

// ---- Date functions ----

/** Number of days in a given month */
export function DayInMonth(mon: number, yea: number): number {
  const daysPerMonth = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let d = daysPerMonth[mon];
  if (mon === 2 && yea % 4 === 0 &&
      (yea % 100 !== 0 || yea % 400 === 0)) {
    d++;
  }
  return d;
}

/** Day of week (0=Monday ... 6=Sunday) for a given date */
export function DayOfWeek(mon: number, day: number, yea: number): number {
  let m = mon;
  let y = yea;
  if (m < 3) {
    m += 12;
    y--;
  }
  // Zeller's formula → 0=Saturday
  const k = y % 100;
  const j = Math.floor(y / 100);
  let h = (day + Math.floor(13 * (m + 1) / 5) + k + Math.floor(k / 4) +
    Math.floor(j / 4) - 2 * j) % 7;
  if (h < 0) h += 7;
  // Convert from Zeller (0=Sat) to ISO (0=Mon)
  return (h + 5) % 7;
}

// ---- Degree/Minute/Second conversion ----

/** Convert DMS (degrees.minutesseconds) to decimal degrees */
export function DecToDeg(d: number): number {
  let r: number;
  const sgn = d < 0.0 ? -1 : 1;
  d = Math.abs(d);
  const deg = Math.floor(d);
  const frac = d - deg;
  const min = Math.floor(frac * 100.0);
  const sec = (frac * 100.0 - min) * 100.0;
  r = deg + min / 60.0 + sec / 3600.0;
  return r * sgn;
}

/** Convert decimal degrees to DMS format (degrees.minutesseconds) */
export function DegToDec(d: number): number {
  const sgn = d < 0.0 ? -1 : 1;
  d = Math.abs(d);
  const deg = Math.floor(d);
  const frac = (d - deg) * 60.0;
  const min = Math.floor(frac);
  const sec = (frac - min) * 60.0;
  return (deg + min / 100.0 + sec / 10000.0) * sgn;
}

// ---- Formatting helpers ----

/** Format zodiac degree as "DD Sign MM'SS\"" */
export function formatZodiac(deg: number): string {
  const signNames = ['', 'Ari', 'Tau', 'Gem', 'Cnc', 'Leo', 'Vir',
                     'Lib', 'Sco', 'Sgr', 'Cap', 'Aqr', 'Psc'];
  const d = Mod(deg);
  const sign = SFromZ(d);
  const inSign = d - ZFromS(sign);
  const dd = Math.floor(inSign);
  const mm = Math.floor((inSign - dd) * 60);
  const ss = Math.floor(((inSign - dd) * 60 - mm) * 60);
  return `${String(dd).padStart(2, '0')} ${signNames[sign]} ${String(mm).padStart(2, '0')}'${String(ss).padStart(2, '0')}"`;
}
