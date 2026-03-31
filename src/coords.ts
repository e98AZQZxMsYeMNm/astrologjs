/*
** AstrologJS – Coordinate transformation functions (ported from Astrolog calc.cpp)
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

import { RFromD, DFromR, RAngle } from './general.js';

/**
 * General coordinate transformation by tilting the reference plane.
 * Used for ecliptic<->equatorial<->local conversions.
 *
 * @param azi Azimuth/longitude in degrees (modified in place via return)
 * @param alt Altitude/latitude in degrees (modified in place via return)
 * @param tilt Tilt angle in degrees (e.g. obliquity for ecliptic<->equatorial)
 * @returns [newAzi, newAlt]
 */
export function CoorXform(azi: number, alt: number, tilt: number): [number, number] {
  const rAzi = RFromD(azi);
  const rAlt = RFromD(alt);
  const rTilt = RFromD(tilt);

  const sinAlt = Math.sin(rAlt);
  const cosAlt = Math.cos(rAlt);
  const sinAzi = Math.sin(rAzi);
  const cosAzi = Math.cos(rAzi);
  const sinTilt = Math.sin(rTilt);
  const cosTilt = Math.cos(rTilt);

  const x = cosAlt * cosAzi;
  const y = cosAlt * sinAzi * cosTilt - sinAlt * sinTilt;
  const z = cosAlt * sinAzi * sinTilt + sinAlt * cosTilt;

  const newAlt = DFromR(Math.asin(Math.max(-1, Math.min(1, z))));
  const newAzi = DFromR(RAngle(x, y));

  return [newAzi, newAlt];
}

/**
 * Convert spherical coordinates to rectangular (3D Cartesian).
 * @param r Radius
 * @param azi Azimuth in degrees
 * @param alt Altitude in degrees
 * @returns [x, y, z]
 */
export function SphToRec(r: number, azi: number, alt: number): [number, number, number] {
  const rAzi = RFromD(azi);
  const rAlt = RFromD(alt);
  const cosAlt = Math.cos(rAlt);
  return [
    r * cosAlt * Math.cos(rAzi),
    r * cosAlt * Math.sin(rAzi),
    r * Math.sin(rAlt),
  ];
}

/**
 * Convert rectangular (2D) to polar coordinates.
 * @returns [angle in degrees (0-360), radius]
 */
export function RecToPol(x: number, y: number): [number, number] {
  const a = DFromR(RAngle(x, y));
  const r = Math.sqrt(x * x + y * y);
  return [a, r];
}

/**
 * Convert 3D rectangular to spherical coordinates.
 * @returns [azimuth in degrees, altitude in degrees]
 */
export function RecToSph3(rx: number, ry: number, rz: number): [number, number] {
  const azi = DFromR(RAngle(rx, ry));
  const r = Math.sqrt(rx * rx + ry * ry);
  const alt = DFromR(Math.atan2(rz, r));
  return [azi, alt];
}
