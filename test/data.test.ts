import { describe, it, expect } from 'vitest';
import {
  objectNames, signNames, signAbbrev,
  aspectNames, aspectAbbrev, aspectAngle, aspectOrb,
  objectOrb, objectAdd,
  ruler1, ruler2, signRuler, exaltation,
  signElement, signModality,
  objectInfluence, aspectInfluence,
  objectDistance, objectYear,
  defaultIgnore,
} from '../src/data.js';
import { cObjMain, cSign, cAspect, Obj } from '../src/const.js';

describe('defaultIgnore', () => {
  it('returns a Set containing Earth', () => {
    const ignore = defaultIgnore();
    expect(ignore).toBeInstanceOf(Set);
    expect(ignore.has(Obj.Earth)).toBe(true);
    expect(ignore.size).toBe(1);
  });

  it('returns a new Set each time (no shared state)', () => {
    const a = defaultIgnore();
    const b = defaultIgnore();
    a.add(99);
    expect(b.has(99)).toBe(false);
  });
});

describe('data table sizes', () => {
  it('objectNames has cObjMain entries', () => {
    expect(objectNames.length).toBe(cObjMain);
  });

  it('signNames has cSign+1 entries', () => {
    expect(signNames.length).toBe(cSign + 1);
  });

  it('signAbbrev has cSign+1 entries', () => {
    expect(signAbbrev.length).toBe(cSign + 1);
  });

  it('aspectNames has cAspect+1 entries', () => {
    expect(aspectNames.length).toBe(cAspect + 1);
  });

  it('aspectAngle has cAspect+1 entries', () => {
    expect(aspectAngle.length).toBe(cAspect + 1);
  });

  it('aspectOrb has cAspect+1 entries', () => {
    expect(aspectOrb.length).toBe(cAspect + 1);
  });
});

describe('aspect angles are valid', () => {
  it('conjunction is 0', () => {
    expect(aspectAngle[1]).toBe(0);
  });

  it('opposition is 180', () => {
    expect(aspectAngle[2]).toBe(180);
  });

  it('all angles are between 0 and 360', () => {
    for (let i = 1; i <= cAspect; i++) {
      expect(aspectAngle[i]).toBeGreaterThanOrEqual(0);
      expect(aspectAngle[i]).toBeLessThanOrEqual(360);
    }
  });
});

describe('sign element and modality', () => {
  it('Aries is Fire Cardinal', () => {
    expect(signElement[1]).toBe(0);   // Fire
    expect(signModality[1]).toBe(0);  // Cardinal
  });

  it('Taurus is Earth Fixed', () => {
    expect(signElement[2]).toBe(1);
    expect(signModality[2]).toBe(1);
  });

  it('cycle repeats every 4 signs for element', () => {
    for (let i = 1; i <= 12; i++) {
      expect(signElement[i]).toBe((i - 1) % 4);
    }
  });

  it('cycle repeats every 3 signs for modality', () => {
    for (let i = 1; i <= 12; i++) {
      expect(signModality[i]).toBe((i - 1) % 3);
    }
  });
});

describe('rulership tables', () => {
  it('Sun rules Leo (5)', () => {
    expect(ruler1[Obj.Sun]).toBe(5);
  });

  it('Moon rules Cancer (4)', () => {
    expect(ruler1[Obj.Moon]).toBe(4);
  });

  it('signRuler maps back correctly', () => {
    // Leo (5) is ruled by Sun (1)
    expect(signRuler[5]).toBe(Obj.Sun);
    // Cancer (4) is ruled by Moon (2)
    expect(signRuler[4]).toBe(Obj.Moon);
  });
});
