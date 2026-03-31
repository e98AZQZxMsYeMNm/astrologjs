/*
** AstrologJS – Data tables (ported from Astrolog data.cpp)
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

import { cAspect, cObjMain, cSign } from './const.js';

// ---- Object names ----

export const objectNames: string[] = [
  'Earth', 'Sun', 'Moon', 'Mercury', 'Venus', 'Mars',
  'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto',
  'Chiron', 'Ceres', 'Pallas', 'Juno', 'Vesta',
  'North Node', 'South Node', 'Lilith', 'Fortune', 'Vertex', 'East Point',
  'Ascendant', '2nd Cusp', '3rd Cusp', 'Nadir',
  '5th Cusp', '6th Cusp', 'Descendant', '8th Cusp',
  '9th Cusp', 'Midheaven', '11th Cusp', '12th Cusp',
];

// ---- Sign names ----

export const signNames: string[] = [
  '',
  'Aries', 'Taurus', 'Gemini', 'Cancer',
  'Leo', 'Virgo', 'Libra', 'Scorpio',
  'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

export const signAbbrev: string[] = [
  '',
  'Ar', 'Ta', 'Ge', 'Cn', 'Le', 'Vi',
  'Li', 'Sc', 'Sg', 'Cp', 'Aq', 'Pi',
];

// ---- Aspect names and angles ----

export const aspectNames: string[] = [
  '',
  'Conjunction', 'Opposition', 'Square', 'Trine', 'Sextile',
  'Inconjunct', 'Semisextile', 'Semisquare', 'Sesquiquadrate',
  'Quintile', 'Biquintile', 'Semiquintile',
  'Septile', 'Novile', 'Binovile', 'Biseptile', 'Triseptile', 'Quatronovile',
];

export const aspectAbbrev: string[] = [
  '',
  'Con', 'Opp', 'Squ', 'Tri', 'Sex',
  'Inc', 'SSx', 'SSq', 'Ses',
  'Qui', 'BQn', 'SQn',
  'Sep', 'Nov', 'BNv', 'BSp', 'TSp', 'QNv',
];

/** Exact angle for each aspect in degrees (index 0 unused) */
export const aspectAngle: number[] = [
  0,
  0, 180, 90, 120, 60,
  150, 30, 45, 135,
  72, 144, 36,
  360 / 7, 40, 80, 720 / 7, 1080 / 7, 160,
];

/** Default orb for each aspect in degrees */
export const aspectOrb: number[] = [
  0,
  7.0, 7.0, 7.0, 7.0, 6.0,
  3.0, 3.0, 3.0, 3.0,
  2.0, 2.0, 1.0,
  1.0, 1.0, 1.0, 1.0, 1.0, 1.0,
];

/** Default orb addition per object (how much extra orb each object gets) */
export const objectOrb: number[] = [
  // Earth, Sun, Moon, Merc, Venus, Mars
  360, 6.0, 6.0, 2.0, 2.0, 2.0,
  // Jup, Sat, Ura, Nep, Plu
  2.0, 2.0, 2.0, 2.0, 2.0,
  // Chiron, Ceres, Pallas, Juno, Vesta
  2.0, 1.0, 1.0, 1.0, 1.0,
  // NNode, SNode, Lilith, Fortune, Vertex, EastPt
  2.0, 2.0, 2.0, 2.0, 2.0, 2.0,
  // Cusps (Asc through 12th)
  360, 360, 360, 360, 360, 360,
  360, 360, 360, 360, 360, 360,
];

/** Object maximum orb addition */
export const objectAdd: number[] = [
  // Earth, Sun, Moon, Merc, Venus, Mars
  0, 2.0, 2.0, 0, 0, 0,
  // Jup, Sat, Ura, Nep, Plu
  0, 0, 0, 0, 0,
  // Chiron, Ceres, Pallas, Juno, Vesta
  0, 0, 0, 0, 0,
  // NNode, SNode, Lilith, Fortune, Vertex, EastPt
  0, 0, 0, 0, 0, 0,
  // Cusps
  0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0,
];

// ---- Rulership tables ----

/**
 * Primary ruler: which sign each planet rules.
 * Index = object index, value = sign number (1-12), 0 = none.
 */
export const ruler1: number[] = [
  // Earth, Sun, Moon, Merc, Venus, Mars
  0, 5, 4, 3, 7, 1,
  // Jup, Sat, Ura, Nep, Plu
  9, 10, 11, 12, 8,
  // Chiron, Ceres, Pallas, Juno, Vesta
  6, 0, 0, 0, 0,
  // NNode, SNode, Lilith, Fortune, Vertex, EastPt
  0, 0, 0, 0, 0, 0,
  // Cusps
  0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0,
];

/**
 * Secondary ruler: second sign each planet rules.
 */
export const ruler2: number[] = [
  // Earth, Sun, Moon, Merc, Venus, Mars
  0, 0, 0, 6, 2, 0,
  // Jup, Sat, Ura, Nep, Plu
  0, 0, 0, 0, 0,
  // rest
  0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0,
];

/** Sign ruler: which planet rules each sign (index 1-12) */
export const signRuler: number[] = [
  0,
  5, 4, 3, 2, 1, 3,   // Ari=Mars, Tau=Venus, Gem=Merc, Can=Moon, Leo=Sun, Vir=Merc
  4, 10, 6, 7, 8, 9,  // Lib=Venus, Sco=Pluto, Sag=Jup, Cap=Sat, Aqu=Ura, Pis=Nep
];

/** Exaltation: which sign each planet is exalted in */
export const exaltation: number[] = [
  // Earth, Sun, Moon, Merc, Venus, Mars
  0, 1, 2, 6, 12, 10,
  // Jup, Sat, Ura, Nep, Plu
  4, 7, 8, 0, 0,
  // rest
  0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0,
];

// ---- Element and modality for each sign ----

/** Element for sign 1-12: Fire=0, Earth=1, Air=2, Water=3 */
export const signElement: number[] = [
  -1,
  0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3,
];

/** Modality for sign 1-12: Cardinal=0, Fixed=1, Mutable=2 */
export const signModality: number[] = [
  -1,
  0, 1, 2, 0, 1, 2, 0, 1, 2, 0, 1, 2,
];

// ---- Influence weights ----

/** Planet influence power (for chart interpretation) */
export const objectInfluence: number[] = [
  // Earth, Sun, Moon, Merc, Venus, Mars
  0, 30, 28, 10, 10, 10,
  // Jup, Sat, Ura, Nep, Plu
  10, 10, 6, 6, 5,
  // Chiron, Ceres, Pallas, Juno, Vesta
  5, 4, 4, 4, 4,
  // NNode, SNode, Lilith, Fortune, Vertex, EastPt
  4, 4, 3, 3, 2, 2,
  // Cusps: Asc, 2, 3, IC, 5, 6, Des, 8, 9, MC, 11, 12
  20, 3, 5, 10, 3, 3, 10, 3, 5, 15, 3, 3,
];

/** Aspect influence power */
export const aspectInfluence: number[] = [
  0,
  90, 80, 60, 50, 30,
  10, 10, 10, 10,
  5, 5, 5,
  3, 3, 3, 3, 3, 3,
];

// ---- Planetary data ----

/** Mean distance from Sun in AU */
export const objectDistance: number[] = [
  // Earth, Sun, Moon, Merc, Venus, Mars
  1.0, 0.0, 0.00257, 0.387, 0.723, 1.524,
  // Jup, Sat, Ura, Nep, Plu
  5.203, 9.537, 19.191, 30.069, 39.482,
  // Chiron
  13.708,
];

/** Orbital period in years */
export const objectYear: number[] = [
  // Earth, Sun, Moon, Merc, Venus, Mars
  1.0, 0.0, 0.0748, 0.2408, 0.6152, 1.8809,
  // Jup, Sat, Ura, Nep, Plu
  11.862, 29.457, 84.011, 164.79, 247.94,
  // Chiron
  50.76,
];

/** Default objects to ignore (true = skip) */
export function defaultIgnore(): Set<number> {
  const ignore = new Set<number>();
  ignore.add(0);  // Earth (we compute from Earth's perspective)
  return ignore;
}
