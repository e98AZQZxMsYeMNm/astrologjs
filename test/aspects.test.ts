import { describe, it, expect } from 'vitest';
import { getAspect, getOrb, listAspects, createAspectGrid } from '../src/aspects.js';
import { Asp, Obj } from '../src/const.js';

// ============================================================
// getOrb – アスペクトオーブ計算
// ============================================================
describe('getOrb', () => {
  it('Sun-Moon conjunction: 7 + (2+2)/2 = 9', () => {
    expect(getOrb(Obj.Sun, Obj.Moon, Asp.Conjunction)).toBeCloseTo(9.0);
  });

  it('Mars-Jupiter trine: 7 + (0+0)/2 = 7', () => {
    expect(getOrb(Obj.Mars, Obj.Jupiter, Asp.Trine)).toBeCloseTo(7.0);
  });

  it('minor aspects have smaller orb', () => {
    const orb = getOrb(Obj.Mars, Obj.Jupiter, Asp.Quintile);
    expect(orb).toBeLessThan(getOrb(Obj.Mars, Obj.Jupiter, Asp.Conjunction));
  });

  it('handles out-of-range object index gracefully', () => {
    const orb = getOrb(100, 200, Asp.Conjunction);
    expect(orb).toBeCloseTo(7.0); // base orb only
  });

  it('handles out-of-range aspect index', () => {
    const orb = getOrb(Obj.Sun, Obj.Moon, 99);
    // base aspect orb = 0 (out of range), obj additions still apply
    expect(orb).toBeCloseTo(2.0); // (2+2)/2
  });
});

// ============================================================
// getAspect – アスペクト検出
// ============================================================
describe('getAspect', () => {
  // --- メジャーアスペクト ---

  it('detects conjunction (0°)', () => {
    const result = getAspect(10, 12, 1.0, 0.5, Obj.Sun, Obj.Moon);
    expect(result).not.toBeNull();
    expect(result!.asp).toBe(Asp.Conjunction);
    expect(result!.orb).toBeCloseTo(2);
  });

  it('detects exact conjunction (0° orb)', () => {
    const result = getAspect(100, 100, 1.0, 0.5, Obj.Sun, Obj.Moon);
    expect(result).not.toBeNull();
    expect(result!.asp).toBe(Asp.Conjunction);
    expect(result!.orb).toBeCloseTo(0);
  });

  it('detects opposition (180°)', () => {
    const result = getAspect(0, 182, 1.0, 0.5, Obj.Sun, Obj.Moon);
    expect(result).not.toBeNull();
    expect(result!.asp).toBe(Asp.Opposition);
    expect(result!.orb).toBeCloseTo(2);
  });

  it('detects opposition across 0/360 boundary', () => {
    const result = getAspect(5, 185, 1.0, 0.5, Obj.Sun, Obj.Moon);
    expect(result).not.toBeNull();
    expect(result!.asp).toBe(Asp.Opposition);
  });

  it('detects square (90°)', () => {
    const result = getAspect(0, 92, 1.0, 0.5, Obj.Sun, Obj.Moon);
    expect(result).not.toBeNull();
    expect(result!.asp).toBe(Asp.Square);
  });

  it('detects trine (120°)', () => {
    const result = getAspect(0, 121, 1.0, 0.5, Obj.Mars, Obj.Jupiter);
    expect(result).not.toBeNull();
    expect(result!.asp).toBe(Asp.Trine);
    expect(result!.orb).toBeCloseTo(1);
  });

  it('detects sextile (60°)', () => {
    const result = getAspect(0, 62, 1.0, 0.5, Obj.Mars, Obj.Jupiter);
    expect(result).not.toBeNull();
    expect(result!.asp).toBe(Asp.Sextile);
  });

  // --- マイナーアスペクト ---

  it('detects inconjunct (150°) with nAsp >= 6', () => {
    const result = getAspect(0, 151, 1.0, 0.5, Obj.Sun, Obj.Moon, 6);
    expect(result).not.toBeNull();
    expect(result!.asp).toBe(Asp.Inconjunct);
  });

  it('detects semisextile (30°) with nAsp >= 7', () => {
    const result = getAspect(0, 31, 1.0, 0.5, Obj.Sun, Obj.Moon, 7);
    expect(result).not.toBeNull();
    expect(result!.asp).toBe(Asp.SemiSextile);
  });

  it('detects semisquare (45°) with nAsp >= 8', () => {
    const result = getAspect(0, 46, 1.0, 0.5, Obj.Sun, Obj.Moon, 8);
    expect(result).not.toBeNull();
    expect(result!.asp).toBe(Asp.SemiSquare);
  });

  it('detects sesquiquadrate (135°) with nAsp >= 9', () => {
    const result = getAspect(0, 136, 1.0, 0.5, Obj.Sun, Obj.Moon, 9);
    expect(result).not.toBeNull();
    expect(result!.asp).toBe(Asp.Sesquiquadrate);
  });

  // --- nAsp 制限 ---

  it('respects nAsp limit: semisextile not found with nAsp=5', () => {
    const result = getAspect(0, 31, 1.0, 0.5, Obj.Sun, Obj.Moon, 5);
    expect(result).toBeNull();
  });

  it('nAsp=1 only finds conjunctions', () => {
    const conj = getAspect(10, 12, 1.0, 0.5, Obj.Sun, Obj.Moon, 1);
    expect(conj).not.toBeNull();
    const opp = getAspect(0, 180, 1.0, 0.5, Obj.Sun, Obj.Moon, 1);
    expect(opp).toBeNull();
  });

  // --- アスペクトなし ---

  it('returns null when no aspect', () => {
    const result = getAspect(0, 50, 1.0, 0.5, Obj.Mars, Obj.Jupiter);
    expect(result).toBeNull();
  });

  it('returns null when just outside orb', () => {
    // Sun-Moon conjunction orb = 9. Distance = 10 → outside
    const result = getAspect(0, 10, 1.0, 0.5, Obj.Sun, Obj.Moon);
    // Distance = 10, orb for conjunction = 9 → null
    expect(result).toBeNull();
  });

  // --- 境界値: オーブ境界 ---

  it('detects aspect at exact orb boundary', () => {
    // Mars-Jupiter conjunction orb = 7.0. Distance = exactly 7
    const result = getAspect(0, 7, 1.0, 0.5, Obj.Mars, Obj.Jupiter);
    expect(result).not.toBeNull();
  });

  it('no aspect just past orb', () => {
    // Mars-Jupiter conjunction orb = 7.0. Distance = 7.01 → outside
    const result = getAspect(0, 7.01, 1.0, 0.5, Obj.Mars, Obj.Jupiter);
    expect(result).toBeNull();
  });

  // --- 0/360 境界でのアスペクト ---

  it('conjunction across 0/360 boundary', () => {
    const result = getAspect(358, 2, 1.0, 0.5, Obj.Sun, Obj.Moon);
    expect(result).not.toBeNull();
    expect(result!.asp).toBe(Asp.Conjunction);
    expect(result!.orb).toBeCloseTo(4);
  });

  it('trine across 0/360 boundary', () => {
    const result = getAspect(350, 110, 1.0, 0.5, Obj.Mars, Obj.Jupiter);
    // Distance = 120 = exact trine
    const result2 = getAspect(350, 111, 1.0, 0.5, Obj.Mars, Obj.Jupiter);
    expect(result2).not.toBeNull();
    expect(result2!.asp).toBe(Asp.Trine);
  });

  // --- applying / separating ---

  it('reports applying aspect', () => {
    // obj1 moving faster toward obj2
    const result = getAspect(118, 120, 1.0, 0.1, Obj.Mars, Obj.Jupiter);
    expect(result).not.toBeNull();
    expect(result!.applying).toBe(true);
  });

  it('reports separating aspect', () => {
    // obj1 moving away from obj2
    const result = getAspect(122, 120, 1.0, 0.1, Obj.Mars, Obj.Jupiter);
    expect(result).not.toBeNull();
    // After slight time, 122+1*0.01=122.01, 120+0.1*0.01=120.001
    // Distance changes from 2 to 2.009 → separating from trine (120)
    expect(result!.applying).toBe(false);
  });

  // --- 逆行 ---

  it('handles retrograde planet', () => {
    const result = getAspect(121, 0, -0.5, 1.0, Obj.Mars, Obj.Jupiter);
    expect(result).not.toBeNull();
    expect(result!.asp).toBe(Asp.Trine);
  });
});

// ============================================================
// listAspects
// ============================================================
describe('listAspects', () => {
  it('finds all aspects between objects', () => {
    const positions = [0, 0, 120, 180, 90, 60];
    const velocities = [0, 1, 0.5, 0.3, 0.2, 0.1];
    const aspects = listAspects(positions, velocities, 6, 5, new Set([0]));
    expect(aspects.length).toBeGreaterThan(0);
  });

  it('returns empty for single object', () => {
    const aspects = listAspects([100], [1], 1, 5);
    expect(aspects).toEqual([]);
  });

  it('ignores specified objects', () => {
    const positions = [0, 0, 120];
    const velocities = [1, 1, 0.5];
    const ignore = new Set([0, 1]);
    const aspects = listAspects(positions, velocities, 3, 5, ignore);
    expect(aspects).toEqual([]);
  });

  it('finds conjunction between objects at same position', () => {
    const positions = [0, 100, 100];
    const velocities = [0, 1, 0.8];
    const aspects = listAspects(positions, velocities, 3, 5, new Set([0]));
    const conj = aspects.find(a => a.asp === Asp.Conjunction);
    expect(conj).toBeDefined();
  });
});

// ============================================================
// createAspectGrid
// ============================================================
describe('createAspectGrid', () => {
  it('creates a symmetric grid', () => {
    const positions = [0, 0, 120, 180];
    const velocities = [0, 1, 0.5, 0.3];
    const grid = createAspectGrid(positions, velocities, 4, 5, new Set([0]));
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        expect(grid.asp[i][j]).toBe(grid.asp[j][i]);
        expect(grid.orb[i][j]).toBeCloseTo(grid.orb[j][i]);
      }
    }
  });

  it('diagonal is always 0 (no self-aspect)', () => {
    const positions = [0, 90, 180, 270];
    const velocities = [1, 0.5, 0.3, 0.2];
    const grid = createAspectGrid(positions, velocities, 4, 5);
    for (let i = 0; i < 4; i++) {
      expect(grid.asp[i][i]).toBe(0);
    }
  });

  it('handles all objects ignored', () => {
    const positions = [0, 90];
    const velocities = [1, 0.5];
    const grid = createAspectGrid(positions, velocities, 2, 5, new Set([0, 1]));
    expect(grid.asp[0][1]).toBe(0);
    expect(grid.asp[1][0]).toBe(0);
  });

  it('grid dimensions match nObj', () => {
    const grid = createAspectGrid([0, 90, 180], [1, 0.5, 0.3], 3, 5);
    expect(grid.asp.length).toBe(3);
    expect(grid.asp[0].length).toBe(3);
    expect(grid.orb.length).toBe(3);
    expect(grid.orb[0].length).toBe(3);
  });
});
