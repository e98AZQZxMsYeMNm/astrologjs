import { describe, it, expect } from 'vitest';
import { CoorXform, SphToRec, RecToPol, RecToSph3 } from '../src/coords.js';

describe('CoorXform', () => {
  it('identity transform with zero tilt', () => {
    const [azi, alt] = CoorXform(45, 30, 0);
    expect(azi).toBeCloseTo(45, 5);
    expect(alt).toBeCloseTo(30, 5);
  });

  it('transforms equator point by obliquity', () => {
    // Point on ecliptic (alt=0) at summer solstice (azi=90)
    // transformed by obliquity should give equatorial declination ~23.44
    const [azi, alt] = CoorXform(90, 0, 23.4393);
    expect(alt).toBeCloseTo(23.4393, 2);
  });
});

describe('SphToRec', () => {
  it('converts unit sphere point', () => {
    const [x, y, z] = SphToRec(1, 0, 0);
    expect(x).toBeCloseTo(1);
    expect(y).toBeCloseTo(0);
    expect(z).toBeCloseTo(0);
  });

  it('north pole', () => {
    const [x, y, z] = SphToRec(1, 0, 90);
    expect(x).toBeCloseTo(0);
    expect(y).toBeCloseTo(0);
    expect(z).toBeCloseTo(1);
  });
});

describe('RecToPol', () => {
  it('converts back from rectangular', () => {
    const [angle, radius] = RecToPol(1, 0);
    expect(angle).toBeCloseTo(0);
    expect(radius).toBeCloseTo(1);
  });

  it('handles 90 degrees', () => {
    const [angle, radius] = RecToPol(0, 1);
    expect(angle).toBeCloseTo(90);
    expect(radius).toBeCloseTo(1);
  });
});

describe('RecToSph3', () => {
  it('converts 3D point to spherical', () => {
    const [azi, alt] = RecToSph3(1, 0, 0);
    expect(azi).toBeCloseTo(0);
    expect(alt).toBeCloseTo(0);
  });

  it('north pole gives alt=90', () => {
    const [azi, alt] = RecToSph3(0, 0, 1);
    expect(alt).toBeCloseTo(90);
  });
});
