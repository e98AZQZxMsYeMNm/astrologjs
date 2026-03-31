/*
** AstrologJS – Core TypeScript interfaces (ported from Astrolog astrolog.h)
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

import { HouseSystem } from './const.js';

/**
 * Chart input data (CI struct in Astrolog)
 */
export interface ChartInfo {
  /** Month (1-12) */
  mon: number;
  /** Day of month */
  day: number;
  /** Year (negative for BCE) */
  yea: number;
  /** Time of day in decimal hours (0-24) */
  tim: number;
  /** Daylight saving time offset in hours */
  dst: number;
  /** Time zone offset (hours west of UTC, e.g. JST = -9) */
  zon: number;
  /** Longitude in degrees (negative = east) */
  lon: number;
  /** Latitude in degrees (negative = south) */
  lat: number;
  /** Name (optional) */
  nam?: string;
  /** Location name (optional) */
  loc?: string;
}

/**
 * 3D point in space
 */
export interface Point3D {
  x: number;
  y: number;
  z: number;
}

/**
 * Computed chart positions (CP struct in Astrolog)
 */
export interface ChartPositions {
  /** Zodiac longitude (0-360) for each object */
  obj: number[];
  /** Ecliptic latitude for each object */
  alt: number[];
  /** Velocity (negative = retrograde) */
  dir: number[];
  /** Distance from Earth (AU) */
  dist: number[];
  /** House cusp positions (index 1-12) */
  cusp: number[];
  /** House number each object falls in (1-12) */
  house: number[];
}

/**
 * Aspect data between two objects
 */
export interface AspectInfo {
  /** Index of first object */
  obj1: number;
  /** Index of second object */
  obj2: number;
  /** Aspect type (Asp enum) */
  asp: number;
  /** Orb in degrees (actual deviation from exact) */
  orb: number;
  /** Whether the aspect is applying (true) or separating (false) */
  applying: boolean;
}

/**
 * Full aspect grid
 */
export interface AspectGrid {
  /** Aspect index [i][j], 0 = no aspect */
  asp: number[][];
  /** Orb value [i][j] */
  orb: number[][];
}

/**
 * Settings for chart computation
 */
export interface ChartSettings {
  /** House system to use */
  houseSystem: HouseSystem;
  /** Number of aspects to consider (default 5 = major aspects only) */
  nAsp: number;
  /** Use sidereal zodiac */
  sidereal: boolean;
  /** Ayanamsa offset for sidereal (degrees) */
  zodiacOffset: number;
  /** Harmonic number (default 1.0) */
  harmonic: number;
  /** Objects to exclude from computation */
  ignore: Set<number>;
}

/**
 * Internal computation state (IS struct in Astrolog)
 */
export interface InternalState {
  /** Julian time in centuries from J1900 */
  T: number;
  /** Midheaven longitude */
  MC: number;
  /** Ascendant longitude */
  Asc: number;
  /** East Point */
  EP: number;
  /** Vertex */
  Vtx: number;
  /** Right Ascension of MC (ARMC) */
  RA: number;
  /** Obliquity of ecliptic */
  OB: number;
  /** Tropical-sidereal offset */
  rOff: number;
  /** Sidereal offset */
  rSid: number;
  /** Nutation offset */
  rNut: number;
  /** Delta-T correction */
  rDeltaT: number;
  /** Julian Day */
  JD: number;
}
