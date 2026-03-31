/*
** AstrologJS – Constants and enumerations (ported from Astrolog astrolog.h)
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

// ---- Mathematical constants ----

export const rPi = Math.PI;
export const rDegMax = 360.0;
export const rDegHalf = 180.0;
export const rDegQuad = 90.0;
export const rDegRad = 180.0 / Math.PI;
export const rAUToKm = 149597870.7;
export const rLYToAU = 63241.07708427;
export const rDayInYear = 365.24219;
export const rEarthDist = 149.59787;
export const rEpoch2000 = -24.736467;
export const rJD2000 = 2451545.0;
export const rAxis = 23.44578889;
export const rSmall = 1.7453e-9;
export const yeaJ2G = 1582;

// ---- Object indices ----

export const enum Obj {
  Earth = 0,
  Sun = 1,
  Moon = 2,
  Mercury = 3,
  Venus = 4,
  Mars = 5,
  Jupiter = 6,
  Saturn = 7,
  Uranus = 8,
  Neptune = 9,
  Pluto = 10,
  Chiron = 11,
  Ceres = 12,
  Pallas = 13,
  Juno = 14,
  Vesta = 15,
  NorthNode = 16,
  SouthNode = 17,
  Lilith = 18,
  Fortune = 19,
  Vertex = 20,
  EastPoint = 21,
  Asc = 22,
  _2ndCusp = 23,
  _3rdCusp = 24,
  IC = 25,
  _5thCusp = 26,
  _6thCusp = 27,
  Des = 28,
  _8thCusp = 29,
  _9thCusp = 30,
  MC = 31,
  _11thCusp = 32,
  _12thCusp = 33,
}

/** Total number of main objects (planets + points + cusps) */
export const cObjMain = 34;

/** Number of zodiac signs */
export const cSign = 12;

// ---- Zodiac signs ----

export const enum Sign {
  Aries = 1,
  Taurus = 2,
  Gemini = 3,
  Cancer = 4,
  Leo = 5,
  Virgo = 6,
  Libra = 7,
  Scorpio = 8,
  Sagittarius = 9,
  Capricorn = 10,
  Aquarius = 11,
  Pisces = 12,
}

// ---- Aspects ----

export const enum Asp {
  Conjunction = 1,
  Opposition = 2,
  Square = 3,
  Trine = 4,
  Sextile = 5,
  Inconjunct = 6,
  SemiSextile = 7,
  SemiSquare = 8,
  Sesquiquadrate = 9,
  Quintile = 10,
  BiQuintile = 11,
  SemiQuintile = 12,
  Septile = 13,
  Novile = 14,
  BiNovile = 15,
  BiSeptile = 16,
  TriSeptile = 17,
  QuatroNovile = 18,
}

/** Total number of aspects */
export const cAspect = 18;

// ---- House systems ----

export const enum HouseSystem {
  Placidus = 0,
  Koch = 1,
  Equal = 2,
  Campanus = 3,
  Meridian = 4,
  Regiomontanus = 5,
  Porphyry = 6,
  Morinus = 7,
  Topocentric = 8,
  Alcabitius = 9,
  EqualMC = 10,
  WholeSign = 14,
  VedicEqual = 15,
  Null = 22,
}

// ---- Element & Modality ----

export const enum Element {
  Fire = 0,
  Earth = 1,
  Air = 2,
  Water = 3,
}

export const enum Modality {
  Cardinal = 0,
  Fixed = 1,
  Mutable = 2,
}
