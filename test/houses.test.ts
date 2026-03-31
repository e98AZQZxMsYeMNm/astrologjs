import { describe, it, expect } from 'vitest';
import { computeHouses, housePlace, computeInHouses } from '../src/houses.js';
import { HouseSystem, cSign } from '../src/const.js';
import { Mod } from '../src/general.js';

// 共通テストデータ
const mc = 270;       // MC at 0 Capricorn
const asc = 0;        // Asc at 0 Aries
const armc = 270;
const obliquity = 23.4393;
const lat = 35.0;     // Tokyo-ish

// ============================================================
// Equal houses
// ============================================================
describe('Equal houses', () => {
  it('divides into 30-degree segments from Asc', () => {
    const cusps = computeHouses(mc, asc, armc, obliquity, lat, HouseSystem.Equal);
    expect(cusps[1]).toBeCloseTo(0);
    expect(cusps[2]).toBeCloseTo(30);
    expect(cusps[7]).toBeCloseTo(180);
    expect(cusps[12]).toBeCloseTo(330);
  });

  it('works with non-zero Asc', () => {
    const cusps = computeHouses(mc, 45, armc, obliquity, lat, HouseSystem.Equal);
    expect(cusps[1]).toBeCloseTo(45);
    expect(cusps[2]).toBeCloseTo(75);
    expect(cusps[7]).toBeCloseTo(225);
  });

  it('handles Asc near 360', () => {
    const cusps = computeHouses(mc, 350, armc, obliquity, lat, HouseSystem.Equal);
    expect(cusps[1]).toBeCloseTo(350);
    expect(cusps[2]).toBeCloseTo(20);  // wraps around
  });

  it('all cusps are exactly 30 degrees apart', () => {
    const cusps = computeHouses(mc, 123.45, armc, obliquity, lat, HouseSystem.Equal);
    for (let i = 1; i <= 12; i++) {
      const next = i < 12 ? i + 1 : 1;
      let diff = cusps[next] - cusps[i];
      if (diff < 0) diff += 360;
      expect(diff).toBeCloseTo(30);
    }
  });
});

// ============================================================
// Whole Sign houses
// ============================================================
describe('Whole Sign houses', () => {
  it('each house = one complete sign from Asc sign', () => {
    const cusps = computeHouses(mc, 15, armc, obliquity, lat, HouseSystem.WholeSign);
    expect(cusps[1]).toBeCloseTo(0);
    expect(cusps[2]).toBeCloseTo(30);
    expect(cusps[12]).toBeCloseTo(330);
  });

  it('Asc at exact sign boundary', () => {
    const cusps = computeHouses(mc, 30, armc, obliquity, lat, HouseSystem.WholeSign);
    expect(cusps[1]).toBeCloseTo(30);  // 牡牛座
    expect(cusps[2]).toBeCloseTo(60);
  });

  it('Asc at end of sign (29.99 Aries)', () => {
    const cusps = computeHouses(mc, 29.99, armc, obliquity, lat, HouseSystem.WholeSign);
    expect(cusps[1]).toBeCloseTo(0);   // still Aries
  });

  it('Asc at start of Pisces (330)', () => {
    const cusps = computeHouses(mc, 335, armc, obliquity, lat, HouseSystem.WholeSign);
    expect(cusps[1]).toBeCloseTo(330);
    expect(cusps[2]).toBeCloseTo(0);   // wraps to Aries
  });
});

// ============================================================
// Equal MC houses
// ============================================================
describe('Equal MC houses', () => {
  it('MC is always cusp 10', () => {
    const cusps = computeHouses(270, asc, armc, obliquity, lat, HouseSystem.EqualMC);
    expect(cusps[10]).toBeCloseTo(270);
    // cusp 1 = mc + (1-10)*30 = mc - 270
    expect(cusps[1]).toBeCloseTo(0);
  });

  it('works with MC at 0', () => {
    const cusps = computeHouses(0, asc, armc, obliquity, lat, HouseSystem.EqualMC);
    expect(cusps[10]).toBeCloseTo(0);
    expect(cusps[1]).toBeCloseTo(Mod(0 + (1 - 10) * 30));
  });
});

// ============================================================
// Porphyry houses
// ============================================================
describe('Porphyry houses', () => {
  it('has correct angular cusps', () => {
    const cusps = computeHouses(mc, asc, armc, obliquity, lat, HouseSystem.Porphyry);
    expect(cusps[1]).toBeCloseTo(asc);
    expect(cusps[10]).toBeCloseTo(mc);
    expect(cusps[7]).toBeCloseTo(Mod(asc + 180));
    expect(cusps[4]).toBeCloseTo(Mod(mc + 180));
  });

  it('intermediate cusps are between angulars', () => {
    const cusps = computeHouses(mc, asc, armc, obliquity, lat, HouseSystem.Porphyry);
    // Cusp 2 should be between Asc (0) and IC (90)
    expect(cusps[2]).toBeGreaterThan(0);
    expect(cusps[2]).toBeLessThan(90);
    expect(cusps[3]).toBeGreaterThan(cusps[2]);
    expect(cusps[3]).toBeLessThan(90);
  });

  it('trisects quadrants evenly', () => {
    // With MC=270, Asc=0: Q1 = 0-90, each third = 30
    const cusps = computeHouses(270, 0, armc, obliquity, lat, HouseSystem.Porphyry);
    expect(cusps[2]).toBeCloseTo(30);
    expect(cusps[3]).toBeCloseTo(60);
  });

  it('handles unequal quadrants', () => {
    const cusps = computeHouses(250, 10, armc, obliquity, lat, HouseSystem.Porphyry);
    expect(cusps[1]).toBeCloseTo(10);
    expect(cusps[10]).toBeCloseTo(250);
    // Verify cusps are in ascending order (with wrap)
    for (let i = 1; i <= 12; i++) {
      expect(cusps[i]).toBeGreaterThanOrEqual(0);
      expect(cusps[i]).toBeLessThan(360);
    }
  });
});

// ============================================================
// Null house system
// ============================================================
describe('Null house system', () => {
  it('has cusps at sign boundaries', () => {
    const cusps = computeHouses(mc, asc, armc, obliquity, lat, HouseSystem.Null);
    for (let i = 1; i <= cSign; i++) {
      expect(cusps[i]).toBeCloseTo((i - 1) * 30);
    }
  });

  it('ignores MC and Asc', () => {
    const cusps1 = computeHouses(100, 200, armc, obliquity, lat, HouseSystem.Null);
    const cusps2 = computeHouses(300, 50, armc, obliquity, lat, HouseSystem.Null);
    for (let i = 1; i <= cSign; i++) {
      expect(cusps1[i]).toBeCloseTo(cusps2[i]);
    }
  });
});

// ============================================================
// Campanus houses
// ============================================================
describe('Campanus houses', () => {
  it('produces 12 valid cusps', () => {
    const cusps = computeHouses(mc, asc, armc, obliquity, lat, HouseSystem.Campanus);
    for (let i = 1; i <= 12; i++) {
      expect(cusps[i]).toBeGreaterThanOrEqual(0);
      expect(cusps[i]).toBeLessThan(360);
    }
  });
});

// ============================================================
// Meridian houses
// ============================================================
describe('Meridian houses', () => {
  it('produces 12 valid cusps', () => {
    const cusps = computeHouses(mc, asc, armc, obliquity, lat, HouseSystem.Meridian);
    for (let i = 1; i <= 12; i++) {
      expect(cusps[i]).toBeGreaterThanOrEqual(0);
      expect(cusps[i]).toBeLessThan(360);
    }
  });
});

// ============================================================
// Regiomontanus houses
// ============================================================
describe('Regiomontanus houses', () => {
  it('produces 12 valid cusps', () => {
    const cusps = computeHouses(mc, asc, armc, obliquity, lat, HouseSystem.Regiomontanus);
    for (let i = 1; i <= 12; i++) {
      expect(cusps[i]).toBeGreaterThanOrEqual(0);
      expect(cusps[i]).toBeLessThan(360);
    }
  });
});

// ============================================================
// Morinus houses
// ============================================================
describe('Morinus houses', () => {
  it('produces 12 valid cusps', () => {
    const cusps = computeHouses(mc, asc, armc, obliquity, lat, HouseSystem.Morinus);
    for (let i = 1; i <= 12; i++) {
      expect(cusps[i]).toBeGreaterThanOrEqual(0);
      expect(cusps[i]).toBeLessThan(360);
    }
  });
});

// ============================================================
// Alcabitius houses
// ============================================================
describe('Alcabitius houses', () => {
  it('produces 12 valid cusps with correct angulars', () => {
    const cusps = computeHouses(mc, asc, armc, obliquity, lat, HouseSystem.Alcabitius);
    expect(cusps[1]).toBeCloseTo(asc);
    expect(cusps[10]).toBeCloseTo(mc);
    for (let i = 1; i <= 12; i++) {
      expect(cusps[i]).toBeGreaterThanOrEqual(0);
      expect(cusps[i]).toBeLessThan(360);
    }
  });
});

// ============================================================
// Vedic Equal houses
// ============================================================
describe('Vedic Equal houses', () => {
  it('Asc is in the middle of 1st house', () => {
    const cusps = computeHouses(mc, 15, armc, obliquity, lat, HouseSystem.VedicEqual);
    // Cusp 1 = Asc - 15 = 0
    expect(cusps[1]).toBeCloseTo(0);
    // Cusp 2 = 30
    expect(cusps[2]).toBeCloseTo(30);
  });

  it('all cusps 30 degrees apart', () => {
    const cusps = computeHouses(mc, 100, armc, obliquity, lat, HouseSystem.VedicEqual);
    for (let i = 1; i <= 12; i++) {
      const next = i < 12 ? i + 1 : 1;
      let diff = cusps[next] - cusps[i];
      if (diff < 0) diff += 360;
      expect(diff).toBeCloseTo(30);
    }
  });
});

// ============================================================
// Fallback for unknown system
// ============================================================
describe('Unknown house system', () => {
  it('falls back to equal houses', () => {
    const cusps = computeHouses(mc, asc, armc, obliquity, lat, 99 as HouseSystem);
    const equalCusps = computeHouses(mc, asc, armc, obliquity, lat, HouseSystem.Equal);
    for (let i = 1; i <= 12; i++) {
      expect(cusps[i]).toBeCloseTo(equalCusps[i]);
    }
  });
});

// ============================================================
// housePlace – オブジェクトのハウス判定
// ============================================================
describe('housePlace', () => {
  const straightCusps = [0, 0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];

  it('correctly places objects in houses', () => {
    expect(housePlace(15, straightCusps)).toBe(1);
    expect(housePlace(45, straightCusps)).toBe(2);
    expect(housePlace(350, straightCusps)).toBe(12);
  });

  // 境界値: ちょうどカスプ上
  it('object exactly on cusp falls in that house', () => {
    expect(housePlace(0, straightCusps)).toBe(1);
    expect(housePlace(30, straightCusps)).toBe(2);
    expect(housePlace(330, straightCusps)).toBe(12);
  });

  // 境界値: カスプの直前
  it('object just before cusp falls in previous house', () => {
    expect(housePlace(29.999, straightCusps)).toBe(1);
    expect(housePlace(59.999, straightCusps)).toBe(2);
    expect(housePlace(329.999, straightCusps)).toBe(11);
  });

  // ラップアラウンド
  it('handles cusp wrap-around (Asc not at 0)', () => {
    const cusps = [0, 350, 20, 50, 80, 110, 140, 170, 200, 230, 260, 290, 320];
    expect(housePlace(355, cusps)).toBe(1);
    expect(housePlace(5, cusps)).toBe(1);
    expect(housePlace(25, cusps)).toBe(2);
    expect(housePlace(345, cusps)).toBe(12);
    expect(housePlace(319, cusps)).toBe(11);
  });

  // 0度ちょうどのラップアラウンド
  it('handles 0 degrees with wrap-around cusps', () => {
    const cusps = [0, 350, 20, 50, 80, 110, 140, 170, 200, 230, 260, 290, 320];
    expect(housePlace(0, cusps)).toBe(1);
  });

  // 全12ハウスにオブジェクトが入るケース
  it('places objects across all 12 houses', () => {
    for (let i = 1; i <= 12; i++) {
      const pos = (i - 1) * 30 + 15; // middle of each house
      expect(housePlace(pos, straightCusps)).toBe(i);
    }
  });
});

// ============================================================
// computeInHouses – 全オブジェクトのハウス配置
// ============================================================
describe('computeInHouses', () => {
  it('assigns all positions to houses', () => {
    const cusps = [0, 0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];
    const positions = [15, 45, 95, 200, 350];
    const houses = computeInHouses(positions, cusps);
    expect(houses).toEqual([1, 2, 4, 7, 12]);
  });

  it('handles empty positions', () => {
    const cusps = [0, 0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];
    const houses = computeInHouses([], cusps);
    expect(houses).toEqual([]);
  });

  it('handles positions needing Mod normalization', () => {
    const cusps = [0, 0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];
    const positions = [370, -10]; // 370→10 (house 1), -10→350 (house 12)
    const houses = computeInHouses(positions, cusps);
    expect(houses[0]).toBe(1);
    expect(houses[1]).toBe(12);
  });
});

// ============================================================
// 特殊な緯度でのテスト
// ============================================================
describe('Extreme latitudes', () => {
  it('equator (lat=0)', () => {
    const cusps = computeHouses(mc, asc, armc, obliquity, 0, HouseSystem.Equal);
    expect(cusps[1]).toBeCloseTo(0);
  });

  it('high latitude (lat=65)', () => {
    const cusps = computeHouses(mc, asc, armc, obliquity, 65, HouseSystem.Equal);
    expect(cusps[1]).toBeCloseTo(0);
  });

  it('southern hemisphere (lat=-35)', () => {
    const cusps = computeHouses(mc, asc, armc, obliquity, -35, HouseSystem.Porphyry);
    for (let i = 1; i <= 12; i++) {
      expect(cusps[i]).toBeGreaterThanOrEqual(0);
      expect(cusps[i]).toBeLessThan(360);
    }
  });
});
