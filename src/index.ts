/*
** AstrologJS – Astrolog astrology calculation engine for JavaScript/TypeScript
** Public API entry point.
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

// Core types
export type {
  ChartInfo,
  ChartPositions,
  ChartSettings,
  AspectInfo,
  AspectGrid,
  InternalState,
  Point3D,
} from './types.js';

// Constants and enums
export {
  Obj, Sign, Asp, HouseSystem, Element, Modality,
  cObjMain, cSign, cAspect,
  rPi, rDegMax, rDegHalf, rDegQuad, rDegRad,
  rAUToKm, rLYToAU, rDayInYear, rJD2000, rAxis,
} from './const.js';

// Data tables
export {
  objectNames, signNames, signAbbrev,
  aspectNames, aspectAbbrev, aspectAngle, aspectOrb,
  objectOrb, objectAdd,
  ruler1, ruler2, signRuler, exaltation,
  signElement, signModality,
  objectInfluence, aspectInfluence,
  objectDistance, objectYear,
  defaultIgnore,
} from './data.js';

// General utilities
export {
  RFromD, DFromR, ZFromS, SFromZ, degInSign,
  Mod, Mod12, MinDistance, MinDifference, Midpoint,
  SphDistance, DayInMonth, DayOfWeek,
  DecToDeg, DegToDec, formatZodiac,
} from './general.js';

// Julian day calculations
export {
  MdyToJulian, MdytszToJulian, JulianToMdy, JulianToTime,
} from './julian.js';

// Coordinate transformations
export {
  CoorXform, SphToRec, RecToPol, RecToSph3,
} from './coords.js';

// House calculations
export {
  computeHouses, housePlace, computeInHouses,
} from './houses.js';

// Aspect calculations
export {
  getOrb, getAspect, createAspectGrid, listAspects,
} from './aspects.js';

// Ephemeris
export type { PlanetResult, HouseResult, EphemerisProvider } from './ephemeris.js';
export {
  createSwissEphemeris, computePlanets, computeSwissHouses,
  createSwissFlags, createMoshierFlags,
} from './ephemeris.js';

// Chart casting
export type { ChartResult } from './chart.js';
export { castChart, defaultSettings, defaultObjects } from './chart.js';
