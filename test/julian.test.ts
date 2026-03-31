import { describe, it, expect } from 'vitest';
import { MdyToJulian, MdytszToJulian, JulianToMdy, JulianToTime } from '../src/julian.js';

// ============================================================
// MdyToJulian – 暦日→ユリウス日
// ============================================================
describe('MdyToJulian', () => {
  it('J2000.0: Jan 1, 2000 at 0h UT = JD 2451544.5', () => {
    expect(MdyToJulian(1, 1, 2000)).toBeCloseTo(2451544.5);
  });

  it('J2000.0 noon: Jan 1.5, 2000 = JD 2451545.0', () => {
    expect(MdyToJulian(1, 1.5, 2000)).toBeCloseTo(2451545.0);
  });

  // Gregorian calendar boundary (Oct 15, 1582)
  it('first day of Gregorian calendar', () => {
    const jd = MdyToJulian(10, 15, 1582);
    expect(jd).toBeCloseTo(2299160.5);
  });

  // Julian calendar (before 1582)
  it('Julian calendar date', () => {
    // Oct 4, 1582 (last day of Julian calendar)
    const jd = MdyToJulian(10, 4, 1582);
    expect(jd).toBeCloseTo(2299159.5);
  });

  // 閏年 2月29日
  it('leap year Feb 29', () => {
    const jd28 = MdyToJulian(2, 28, 2024);
    const jd29 = MdyToJulian(2, 29, 2024);
    expect(jd29 - jd28).toBeCloseTo(1);
  });

  // 平年 3月1日は2月28日の翌日
  it('non-leap year Feb 28 to Mar 1', () => {
    const jdFeb28 = MdyToJulian(2, 28, 2023);
    const jdMar1 = MdyToJulian(3, 1, 2023);
    expect(jdMar1 - jdFeb28).toBeCloseTo(1);
  });

  // 閏年 3月1日は2月29日の翌日
  it('leap year Feb 29 to Mar 1', () => {
    const jdFeb29 = MdyToJulian(2, 29, 2024);
    const jdMar1 = MdyToJulian(3, 1, 2024);
    expect(jdMar1 - jdFeb29).toBeCloseTo(1);
  });

  // 年末年始の境界
  it('year boundary: Dec 31 to Jan 1', () => {
    const jdDec31 = MdyToJulian(12, 31, 2023);
    const jdJan1 = MdyToJulian(1, 1, 2024);
    expect(jdJan1 - jdDec31).toBeCloseTo(1);
  });

  // 月末から翌月初
  it('month boundaries', () => {
    // 31日の月: Jan→Feb
    expect(MdyToJulian(2, 1, 2024) - MdyToJulian(1, 31, 2024)).toBeCloseTo(1);
    // 30日の月: Apr→May
    expect(MdyToJulian(5, 1, 2024) - MdyToJulian(4, 30, 2024)).toBeCloseTo(1);
    // 28日の月(平年): Feb→Mar
    expect(MdyToJulian(3, 1, 2023) - MdyToJulian(2, 28, 2023)).toBeCloseTo(1);
  });

  // 世紀年の閏年
  it('century leap year boundaries', () => {
    // 2000年は閏年 (400で割り切れる)
    const jdFeb29 = MdyToJulian(2, 29, 2000);
    const jdMar1 = MdyToJulian(3, 1, 2000);
    expect(jdMar1 - jdFeb29).toBeCloseTo(1);
  });

  // 1年 = 365日 (平年) or 366日 (閏年)
  it('year length: 365 days (non-leap)', () => {
    const jd1 = MdyToJulian(1, 1, 2023);
    const jd2 = MdyToJulian(1, 1, 2024);
    expect(jd2 - jd1).toBeCloseTo(365);
  });

  it('year length: 366 days (leap)', () => {
    const jd1 = MdyToJulian(1, 1, 2024);
    const jd2 = MdyToJulian(1, 1, 2025);
    expect(jd2 - jd1).toBeCloseTo(366);
  });

  // BCE (紀元前)
  it('handles BCE dates (negative year)', () => {
    const jd = MdyToJulian(1, 1, -4712);
    // JD epoch: Jan 1, 4713 BCE (year -4712) ≈ JD 0
    expect(jd).toBeCloseTo(0, -1);
  });
});

// ============================================================
// MdytszToJulian – 日時+タイムゾーン→JD
// ============================================================
describe('MdytszToJulian', () => {
  it('noon UT on J2000', () => {
    const jd = MdytszToJulian(1, 1, 2000, 12, 0, 0);
    expect(jd).toBeCloseTo(2451545.0, 1);
  });

  it('timezone adjustment: JST (zon = -9)', () => {
    const jdUT = MdytszToJulian(1, 1, 2000, 12, 0, 0);
    const jdJST = MdytszToJulian(1, 1, 2000, 21, 0, -9);
    expect(jdJST).toBeCloseTo(jdUT, 5);
  });

  it('DST adjustment', () => {
    const jdNoDST = MdytszToJulian(6, 15, 2024, 12, 0, -5);
    const jdDST = MdytszToJulian(6, 15, 2024, 13, 1, -5);
    expect(jdDST).toBeCloseTo(jdNoDST, 5);
  });

  // 日付変更線をまたぐケース
  it('midnight boundary: time that crosses into next day via timezone', () => {
    // 23:00 UTC+0 = 翌日08:00 JST
    const jd1 = MdytszToJulian(1, 1, 2024, 23, 0, 0);
    const jd2 = MdytszToJulian(1, 2, 2024, 8, 0, -9);
    expect(jd2).toBeCloseTo(jd1, 5);
  });

  // 時刻の境界値
  it('time boundary values', () => {
    const jdMidnight = MdytszToJulian(1, 1, 2024, 0, 0, 0);
    const jdNoon = MdytszToJulian(1, 1, 2024, 12, 0, 0);
    expect(jdNoon - jdMidnight).toBeCloseTo(0.5);
  });

  it('time = 24 equals next day midnight', () => {
    const jd24 = MdytszToJulian(1, 1, 2024, 24, 0, 0);
    const jdNext = MdytszToJulian(1, 2, 2024, 0, 0, 0);
    expect(jd24).toBeCloseTo(jdNext, 5);
  });
});

// ============================================================
// JulianToMdy – JD→暦日のラウンドトリップ
// ============================================================
describe('JulianToMdy', () => {
  it('round-trips with MdyToJulian', () => {
    const jd = MdyToJulian(7, 4, 1976);
    const { mon, day, yea } = JulianToMdy(jd);
    expect(mon).toBe(7);
    expect(day).toBe(4);
    expect(yea).toBe(1976);
  });

  it('handles J2000', () => {
    const { mon, day, yea } = JulianToMdy(2451545.0);
    expect(mon).toBe(1);
    expect(day).toBe(1);
    expect(yea).toBe(2000);
  });

  // 閏年2月29日ラウンドトリップ
  it('round-trips leap year Feb 29', () => {
    const jd = MdyToJulian(2, 29, 2024);
    const { mon, day, yea } = JulianToMdy(jd);
    expect(mon).toBe(2);
    expect(day).toBe(29);
    expect(yea).toBe(2024);
  });

  // 世紀年閏年
  it('round-trips century leap year Feb 29', () => {
    const jd = MdyToJulian(2, 29, 2000);
    const { mon, day, yea } = JulianToMdy(jd);
    expect(mon).toBe(2);
    expect(day).toBe(29);
    expect(yea).toBe(2000);
  });

  // 各月の月末ラウンドトリップ
  it('round-trips end of each month', () => {
    const endOfMonth: [number, number][] = [
      [1, 31], [2, 28], [3, 31], [4, 30], [5, 31], [6, 30],
      [7, 31], [8, 31], [9, 30], [10, 31], [11, 30], [12, 31],
    ];
    for (const [m, d] of endOfMonth) {
      const jd = MdyToJulian(m, d, 2023);
      const result = JulianToMdy(jd);
      expect(result.mon).toBe(m);
      expect(result.day).toBe(d);
      expect(result.yea).toBe(2023);
    }
  });

  // 年末年始
  it('round-trips year boundary', () => {
    const jd1 = MdyToJulian(12, 31, 2023);
    const r1 = JulianToMdy(jd1);
    expect(r1.mon).toBe(12);
    expect(r1.day).toBe(31);
    expect(r1.yea).toBe(2023);

    const jd2 = MdyToJulian(1, 1, 2024);
    const r2 = JulianToMdy(jd2);
    expect(r2.mon).toBe(1);
    expect(r2.day).toBe(1);
    expect(r2.yea).toBe(2024);
  });

  // Julian calendar date
  it('round-trips Julian calendar date', () => {
    const jd = MdyToJulian(3, 15, 1000);
    const { mon, day, yea } = JulianToMdy(jd);
    expect(mon).toBe(3);
    expect(day).toBe(15);
    expect(yea).toBe(1000);
  });
});

// ============================================================
// JulianToTime – JDから時刻の抽出
// ============================================================
describe('JulianToTime', () => {
  it('noon = 12 hours', () => {
    expect(JulianToTime(2451545.0)).toBeCloseTo(12, 0);
  });

  it('midnight = 0 hours', () => {
    expect(JulianToTime(2451544.5)).toBeCloseTo(0, 0);
  });

  it('6am = 6 hours', () => {
    expect(JulianToTime(2451544.75)).toBeCloseTo(6, 0);
  });

  it('6pm = 18 hours', () => {
    expect(JulianToTime(2451545.25)).toBeCloseTo(18, 0);
  });

  // 境界: ちょうど0時と24時の間
  it('just before midnight', () => {
    const t = JulianToTime(2451545.4999);
    expect(t).toBeCloseTo(24, 0);
  });

  it('just after midnight', () => {
    const t = JulianToTime(2451545.5001);
    expect(t).toBeCloseTo(0, 0);
  });
});
