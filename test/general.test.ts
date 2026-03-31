import { describe, it, expect } from 'vitest';
import {
  Mod, Mod12, MinDistance, MinDifference, Midpoint,
  SFromZ, ZFromS, degInSign,
  DayInMonth, DayOfWeek,
  RFromD, DFromR, RAngle,
  DecToDeg, DegToDec,
  formatZodiac,
  SphDistance,
} from '../src/general.js';

// ============================================================
// Mod – 角度正規化 (0–360)
// ============================================================
describe('Mod', () => {
  it('normalizes positive angles', () => {
    expect(Mod(370)).toBeCloseTo(10);
    expect(Mod(720)).toBeCloseTo(0);
    expect(Mod(180)).toBeCloseTo(180);
  });

  it('normalizes negative angles', () => {
    expect(Mod(-10)).toBeCloseTo(350);
    expect(Mod(-370)).toBeCloseTo(350);
    expect(Mod(-720)).toBeCloseTo(0);
  });

  it('handles zero', () => {
    expect(Mod(0)).toBe(0);
  });

  it('handles exact 360', () => {
    expect(Mod(360)).toBeCloseTo(0);
  });

  // 境界値
  it('handles values just below/above boundaries', () => {
    expect(Mod(359.9999)).toBeCloseTo(359.9999);
    expect(Mod(360.0001)).toBeCloseTo(0.0001);
    expect(Mod(-0.0001)).toBeCloseTo(359.9999);
  });

  it('handles very large values', () => {
    expect(Mod(3600)).toBeCloseTo(0);
    expect(Mod(3601)).toBeCloseTo(1);
  });

  it('handles very small negative values', () => {
    expect(Mod(-3600)).toBeCloseTo(0);
    expect(Mod(-3601)).toBeCloseTo(359);
  });
});

// ============================================================
// Mod12 – 1〜12 正規化
// ============================================================
describe('Mod12', () => {
  it('normalizes to 1-12', () => {
    expect(Mod12(1)).toBe(1);
    expect(Mod12(12)).toBe(12);
    expect(Mod12(13)).toBe(1);
    expect(Mod12(0)).toBe(12);
    expect(Mod12(-1)).toBe(11);
  });

  // 境界値
  it('handles negative wrap-around', () => {
    expect(Mod12(-11)).toBe(1);
    expect(Mod12(-12)).toBe(12);
    expect(Mod12(-13)).toBe(11);
  });

  it('handles large positive values', () => {
    expect(Mod12(24)).toBe(12);
    expect(Mod12(25)).toBe(1);
  });
});

// ============================================================
// RAngle – atan2 equivalent (0–2π)
// ============================================================
describe('RAngle', () => {
  it('returns 0 for positive x-axis', () => {
    expect(DFromR(RAngle(1, 0))).toBeCloseTo(0);
  });

  it('returns 90 for positive y-axis', () => {
    expect(DFromR(RAngle(0, 1))).toBeCloseTo(90);
  });

  it('returns 180 for negative x-axis', () => {
    expect(DFromR(RAngle(-1, 0))).toBeCloseTo(180);
  });

  it('returns 270 for negative y-axis', () => {
    expect(DFromR(RAngle(0, -1))).toBeCloseTo(270);
  });

  it('handles |y| > |x|', () => {
    // 45 degrees: x=1, y=1
    expect(DFromR(RAngle(1, 1))).toBeCloseTo(45);
  });

  it('handles |x| > |y|', () => {
    // ~26.57 degrees: x=2, y=1
    expect(DFromR(RAngle(2, 1))).toBeCloseTo(Math.atan2(1, 2) * 180 / Math.PI);
  });

  it('handles negative x with |x| > |y|', () => {
    // 180+26.57 = 206.57
    const expected = 180 + Math.atan(1 / 2) * 180 / Math.PI;
    expect(DFromR(RAngle(-2, -1))).toBeCloseTo(expected, 0);
  });
});

// ============================================================
// 星座変換
// ============================================================
describe('Zodiac conversions', () => {
  it('SFromZ converts degrees to sign', () => {
    expect(SFromZ(0)).toBe(1);    // Aries
    expect(SFromZ(29)).toBe(1);   // still Aries
    expect(SFromZ(30)).toBe(2);   // Taurus
    expect(SFromZ(359)).toBe(12); // Pisces
  });

  // 境界値: ちょうど30度刻み
  it('SFromZ at exact sign boundaries', () => {
    expect(SFromZ(0)).toBe(1);
    expect(SFromZ(29.9999)).toBe(1);
    expect(SFromZ(30)).toBe(2);
    expect(SFromZ(59.9999)).toBe(2);
    expect(SFromZ(60)).toBe(3);
    expect(SFromZ(330)).toBe(12);
    expect(SFromZ(359.9999)).toBe(12);
  });

  it('ZFromS converts sign to starting degree', () => {
    expect(ZFromS(1)).toBe(0);
    expect(ZFromS(2)).toBe(30);
    expect(ZFromS(12)).toBe(330);
  });

  it('degInSign returns degree within sign', () => {
    expect(degInSign(0)).toBeCloseTo(0);
    expect(degInSign(15)).toBeCloseTo(15);
    expect(degInSign(45)).toBeCloseTo(15);
    expect(degInSign(30)).toBeCloseTo(0);   // 牡牛座の最初
    expect(degInSign(29.99)).toBeCloseTo(29.99);
    expect(degInSign(359.99)).toBeCloseTo(29.99);
  });
});

// ============================================================
// MinDistance
// ============================================================
describe('MinDistance', () => {
  it('computes shortest arc', () => {
    expect(MinDistance(0, 90)).toBeCloseTo(90);
    expect(MinDistance(350, 10)).toBeCloseTo(20);
    expect(MinDistance(10, 350)).toBeCloseTo(20);
    expect(MinDistance(0, 180)).toBeCloseTo(180);
  });

  // 境界値
  it('same point = 0', () => {
    expect(MinDistance(0, 0)).toBeCloseTo(0);
    expect(MinDistance(180, 180)).toBeCloseTo(0);
  });

  it('just past 180 still returns via shorter arc', () => {
    expect(MinDistance(0, 181)).toBeCloseTo(179);
    expect(MinDistance(0, 179)).toBeCloseTo(179);
  });

  it('exactly 180 returns 180', () => {
    expect(MinDistance(90, 270)).toBeCloseTo(180);
  });
});

// ============================================================
// MinDifference
// ============================================================
describe('MinDifference', () => {
  it('computes signed shortest arc', () => {
    expect(MinDifference(0, 90)).toBeCloseTo(90);
    expect(MinDifference(350, 10)).toBeCloseTo(20);
    expect(MinDifference(10, 350)).toBeCloseTo(-20);
  });

  it('returns 0 for same position', () => {
    expect(MinDifference(100, 100)).toBeCloseTo(0);
  });

  it('handles 180 boundary', () => {
    expect(Math.abs(MinDifference(0, 180))).toBeCloseTo(180);
  });
});

// ============================================================
// Midpoint
// ============================================================
describe('Midpoint', () => {
  it('computes midpoint of two positions', () => {
    expect(Midpoint(0, 60)).toBeCloseTo(30);
    expect(Midpoint(350, 10)).toBeCloseTo(0);
  });

  it('same position returns that position', () => {
    expect(Midpoint(90, 90)).toBeCloseTo(90);
  });

  it('handles opposite positions', () => {
    const mid = Midpoint(0, 180);
    // Midpoint of 0 and 180 could be 90 or 270 — both valid
    expect(mid === 90 || Math.abs(mid - 90) < 1 || Math.abs(mid - 270) < 1).toBe(true);
  });

  it('handles wrap-around at 0/360', () => {
    expect(Midpoint(355, 5)).toBeCloseTo(0);
    expect(Midpoint(340, 20)).toBeCloseTo(0);
  });
});

// ============================================================
// DayInMonth – 月末・閏年境界値テスト
// ============================================================
describe('DayInMonth', () => {
  // 各月の基本日数
  it('returns correct days for each month (non-leap year)', () => {
    const expected = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    for (let m = 1; m <= 12; m++) {
      expect(DayInMonth(m, 2023)).toBe(expected[m]);
    }
  });

  // ---- 閏年の境界値テスト ----

  // 4で割り切れる → 閏年
  it('leap year: divisible by 4', () => {
    expect(DayInMonth(2, 2024)).toBe(29);
    expect(DayInMonth(2, 2028)).toBe(29);
    expect(DayInMonth(2, 1996)).toBe(29);
  });

  // 4で割り切れない → 平年
  it('non-leap year: not divisible by 4', () => {
    expect(DayInMonth(2, 2023)).toBe(28);
    expect(DayInMonth(2, 2025)).toBe(28);
    expect(DayInMonth(2, 2019)).toBe(28);
  });

  // 100で割り切れるが400では割り切れない → 平年
  it('non-leap year: divisible by 100 but not 400', () => {
    expect(DayInMonth(2, 1900)).toBe(28);
    expect(DayInMonth(2, 1800)).toBe(28);
    expect(DayInMonth(2, 2100)).toBe(28);
    expect(DayInMonth(2, 2200)).toBe(28);
    expect(DayInMonth(2, 2300)).toBe(28);
  });

  // 400で割り切れる → 閏年
  it('leap year: divisible by 400', () => {
    expect(DayInMonth(2, 2000)).toBe(29);
    expect(DayInMonth(2, 1600)).toBe(29);
    expect(DayInMonth(2, 2400)).toBe(29);
  });

  // 閏年でも2月以外は変わらない
  it('non-February months unaffected by leap year', () => {
    expect(DayInMonth(1, 2024)).toBe(31);
    expect(DayInMonth(3, 2024)).toBe(31);
    expect(DayInMonth(4, 2024)).toBe(30);
    expect(DayInMonth(12, 2024)).toBe(31);
  });
});

// ============================================================
// DayOfWeek – 月初・月末・閏年境界テスト
// ============================================================
describe('DayOfWeek', () => {
  // 既知の曜日
  it('known dates', () => {
    // 2024-01-01 Monday
    expect(DayOfWeek(1, 1, 2024)).toBe(0);
    // 2024-03-30 Saturday
    expect(DayOfWeek(3, 30, 2024)).toBe(5);
    // 2024-12-25 Wednesday
    expect(DayOfWeek(12, 25, 2024)).toBe(2);
  });

  // 月初 (各月1日)
  it('first day of each month 2024', () => {
    // 2024: Jan=Mon, Feb=Thu, Mar=Fri, Apr=Mon, May=Wed, Jun=Sat
    //       Jul=Mon, Aug=Thu, Sep=Sun, Oct=Tue, Nov=Fri, Dec=Sun
    const expected = [0, 3, 4, 0, 2, 5, 0, 3, 6, 1, 4, 6];
    for (let m = 1; m <= 12; m++) {
      expect(DayOfWeek(m, 1, 2024)).toBe(expected[m - 1]);
    }
  });

  // 月末
  it('last day of each month 2024 (leap year)', () => {
    // Jan 31=Wed, Feb 29=Thu, Mar 31=Sun, Apr 30=Tue
    expect(DayOfWeek(1, 31, 2024)).toBe(2);
    expect(DayOfWeek(2, 29, 2024)).toBe(3); // 閏年2月29日
    expect(DayOfWeek(3, 31, 2024)).toBe(6);
    expect(DayOfWeek(4, 30, 2024)).toBe(1);
  });

  // 閏年 2月28日 vs 2月29日
  it('Feb 28 and Feb 29 in leap year', () => {
    expect(DayOfWeek(2, 28, 2024)).toBe(2); // Wed
    expect(DayOfWeek(2, 29, 2024)).toBe(3); // Thu
  });

  // 平年 2月末
  it('Feb 28 in non-leap year', () => {
    expect(DayOfWeek(2, 28, 2023)).toBe(1); // Tue
  });

  // 年始・年末
  it('year boundaries', () => {
    expect(DayOfWeek(1, 1, 2025)).toBe(2);  // Wed
    expect(DayOfWeek(12, 31, 2024)).toBe(1); // Tue
  });

  // 1月・2月 (Zeller's formula で年がずれる境界)
  it('January and February edge cases', () => {
    expect(DayOfWeek(1, 1, 2000)).toBe(5);   // Sat
    expect(DayOfWeek(2, 1, 2000)).toBe(1);   // Tue
    expect(DayOfWeek(3, 1, 2000)).toBe(2);   // Wed
  });

  // 世紀年
  it('century year boundaries', () => {
    // 1900-01-01 was Monday
    expect(DayOfWeek(1, 1, 1900)).toBe(0);
    // 2000-01-01 was Saturday
    expect(DayOfWeek(1, 1, 2000)).toBe(5);
  });
});

// ============================================================
// Degree conversions (RFromD / DFromR)
// ============================================================
describe('Degree conversions', () => {
  it('RFromD and DFromR are inverse', () => {
    expect(DFromR(RFromD(90))).toBeCloseTo(90);
    expect(DFromR(RFromD(180))).toBeCloseTo(180);
    expect(DFromR(RFromD(0))).toBeCloseTo(0);
    expect(DFromR(RFromD(360))).toBeCloseTo(360);
  });

  it('RFromD(180) equals PI', () => {
    expect(RFromD(180)).toBeCloseTo(Math.PI);
  });

  it('RFromD(90) equals PI/2', () => {
    expect(RFromD(90)).toBeCloseTo(Math.PI / 2);
  });

  it('handles negative values', () => {
    expect(DFromR(RFromD(-45))).toBeCloseTo(-45);
  });
});

// ============================================================
// DecToDeg / DegToDec
// ============================================================
describe('DecToDeg', () => {
  it('converts DMS notation to decimal', () => {
    // 30.30 = 30 degrees 30 minutes 0 seconds = 30.5 decimal
    expect(DecToDeg(30.30)).toBeCloseTo(30.5);
  });

  it('handles zero', () => {
    expect(DecToDeg(0)).toBeCloseTo(0);
  });

  it('handles negative values', () => {
    expect(DecToDeg(-30.30)).toBeCloseTo(-30.5);
  });

  it('converts 10.1530 (10 deg 15 min 30 sec)', () => {
    // 10 + 15/60 + 30/3600 = 10.25833...
    expect(DecToDeg(10.1530)).toBeCloseTo(10.2583, 3);
  });

  it('whole degrees with no minutes/seconds', () => {
    expect(DecToDeg(45.00)).toBeCloseTo(45);
  });
});

describe('DegToDec', () => {
  it('converts decimal degrees to DMS notation', () => {
    // 30.5 decimal = 30 degrees 30 minutes = 30.30 DMS
    expect(DegToDec(30.5)).toBeCloseTo(30.30, 1);
  });

  it('handles zero', () => {
    expect(DegToDec(0)).toBeCloseTo(0);
  });

  it('handles negative values', () => {
    expect(DegToDec(-30.5)).toBeCloseTo(-30.30, 1);
  });

  it('round-trips with DecToDeg', () => {
    const original = 23.45;
    expect(DecToDeg(DegToDec(original))).toBeCloseTo(original, 3);
  });
});

// ============================================================
// formatZodiac
// ============================================================
describe('formatZodiac', () => {
  it('formats 0 degrees (start of Aries)', () => {
    expect(formatZodiac(0)).toBe('00 Ari 00\'00"');
  });

  it('formats 45 degrees (15 Taurus)', () => {
    expect(formatZodiac(45)).toBe('15 Tau 00\'00"');
  });

  it('formats sign boundaries', () => {
    expect(formatZodiac(30)).toBe('00 Tau 00\'00"');
    expect(formatZodiac(60)).toBe('00 Gem 00\'00"');
    expect(formatZodiac(330)).toBe('00 Psc 00\'00"');
  });

  it('formats degrees with minutes and seconds', () => {
    // 10.5 degrees in Aries = 10 degrees 30 minutes
    expect(formatZodiac(10.5)).toBe('10 Ari 30\'00"');
  });

  it('formats last degree of Pisces', () => {
    const result = formatZodiac(359.99);
    expect(result).toMatch(/29 Psc/);
  });

  it('handles wrap-around (>360)', () => {
    expect(formatZodiac(370)).toBe('10 Ari 00\'00"');
  });

  it('handles negative degrees', () => {
    expect(formatZodiac(-10)).toBe('20 Psc 00\'00"');
  });
});

// ============================================================
// SphDistance
// ============================================================
describe('SphDistance', () => {
  it('same point = 0', () => {
    expect(SphDistance(0, 0, 0, 0)).toBeCloseTo(0);
    expect(SphDistance(180, 45, 180, 45)).toBeCloseTo(0);
  });

  it('quarter sphere', () => {
    expect(SphDistance(0, 0, 90, 0)).toBeCloseTo(90);
  });

  it('half sphere (antipodal on equator)', () => {
    expect(SphDistance(0, 0, 180, 0)).toBeCloseTo(180);
  });

  it('pole to equator', () => {
    expect(SphDistance(0, 90, 0, 0)).toBeCloseTo(90);
    expect(SphDistance(0, -90, 0, 0)).toBeCloseTo(90);
  });

  it('pole to pole', () => {
    expect(SphDistance(0, 90, 0, -90)).toBeCloseTo(180);
  });

  it('Tokyo to New York (approximate)', () => {
    // Tokyo: 139.7°E, 35.7°N → lon=139.7, lat=35.7
    // New York: 74.0°W, 40.7°N → lon=-74.0, lat=40.7
    const d = SphDistance(139.7, 35.7, -74.0, 40.7);
    // Great circle distance ≈ 96.7 degrees ≈ 10,740 km
    expect(d).toBeGreaterThan(90);
    expect(d).toBeLessThan(110);
  });
});
