# astrologjs

Astrolog 7.80 の占星術計算エンジンを JavaScript/TypeScript に移植したライブラリです。
Swiss Ephemeris (WASM) をバックエンドとして使用し、ネイタルチャートの計算・惑星位置・ハウスシステム・アスペクト解析を提供します。

## インストール

```bash
npm install astrologjs
```

## 使い方

```typescript
import { castChart, defaultSettings, defaultObjects, HouseSystem } from 'astrologjs';
import { createSwissEphemeris } from 'astrologjs';

const ephemeris = await createSwissEphemeris();

const result = castChart(
  {
    month: 1, day: 1, year: 1990,
    hour: 12, minute: 0, second: 0,
    longitude: 139.6917,  // 東京
    latitude: 35.6895,
    timezone: 9,
  },
  defaultSettings,
  defaultObjects,
  ephemeris
);

console.log(result.positions);  // 各天体の黄道経度・ハウス配置
console.log(result.aspects);    // アスペクト一覧
```

## 機能

- **17天体/感受点**: 太陽〜冥王星、キロン、小惑星、ノード、リリスなど
- **13ハウスシステム**: プラシダス、コッホ、ホールサイン、等分など
- **18アスペクト**: 主要5アスペクト＋マイナーアスペクト
- **サイデリアル黄道**: アヤナムサ設定対応
- **ハーモニックチャート**: 倍数設定対応
- **適用・分離**: アスペクトの進行方向判定

## API

### `castChart(info, settings, objects, ephemeris)`

チャートを計算してすべての結果を返します。

| 引数 | 型 | 説明 |
|------|-----|------|
| `info` | `ChartInfo` | 生年月日・時刻・緯経度・タイムゾーン |
| `settings` | `ChartSettings` | ハウスシステム・サイデリアル等の設定 |
| `objects` | `boolean[]` | 計算対象の天体フラグ配列 |
| `ephemeris` | `EphemerisProvider` | Swiss Ephemeris インスタンス |

戻り値 `ChartResult`:

```typescript
{
  positions: ChartPositions[],  // 各天体の位置情報
  aspects: AspectGrid,          // アスペクトグリッド
  state: InternalState,         // MC・Asc・黄道傾斜角など
}
```

### 主要な型

```typescript
interface ChartInfo {
  month: number; day: number; year: number;
  hour: number; minute: number; second: number;
  longitude: number;  // 東経が正
  latitude: number;   // 北緯が正
  timezone: number;   // UTC+X
}

interface ChartSettings {
  houseSystem: HouseSystem;
  sidereal: boolean;
  siderealOffset: number;  // アヤナムサ（度）
  harmonic: number;        // ハーモニック倍数
  numAspects: number;      // チェックするアスペクト数
}
```

### `EphemerisProvider`

Swiss Ephemeris の WASM ラッパーです。`createSwissEphemeris()` で生成します。テスト時はモック実装に差し替え可能です。

## ビルド

```bash
npm run build   # dist/ へコンパイル
npm test        # テスト実行
npm run lint    # ESLint
```

## ライセンス

GPL-2.0-only — 詳細は [LICENSE](LICENSE) を参照してください。

本ライブラリは以下を元に作成されています。サードパーティの著作権表示は [NOTICE](NOTICE) を参照してください。

- **[Astrolog](https://www.astrolog.org/)** — Copyright (C) 1991-2025 Walter D. Pullen。クレジットと著作権表示は派生・配布物においても改変せず保持する必要があります。
- **Swiss Ephemeris** — Copyright 1997-2008 Astrodienst AG。[Swiss Ephemeris Free Edition ライセンス](https://www.astro.com/swisseph/swephinfo_e.htm) に従います。
- **PLACALC** — Copyright (C) 1989,1991,1993 Astrodienst AG and Alois Treindl。
