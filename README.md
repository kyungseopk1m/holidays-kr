# holidays-kr

[![npm version](https://img.shields.io/npm/v/@kyungseopk1m/holidays-kr)](https://www.npmjs.com/package/@kyungseopk1m/holidays-kr)
[![npm downloads](https://img.shields.io/npm/dm/@kyungseopk1m/holidays-kr)](https://www.npmjs.com/package/@kyungseopk1m/holidays-kr)
[![license](https://img.shields.io/npm/l/@kyungseopk1m/holidays-kr)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-supported-blue)](https://www.typescriptlang.org/)
[![CodeQL](https://github.com/kyungseopk1m/holidays-kr/actions/workflows/codeql.yml/badge.svg)](https://github.com/kyungseopk1m/holidays-kr/actions/workflows/codeql.yml)

[한국어](#한국어) | [English](#english)

---

## 한국어

### 소개

- 별도의 API 키 없이 단 한 번의 호출로 한국 공휴일 데이터를 가져올 수 있습니다.
- 모든 데이터는 공공데이터포털을 통해 한국천문연구원의 공식 공휴일 데이터베이스에서 제공됩니다.
- 2004년 이후의 공휴일 데이터를 제공하며, 정기적으로 갱신됩니다.
- v2.0.0 부터 **Vercel CDN 기반 정적 JSON** 으로 동작합니다 (이전 Cloud Function 호출 방식 폐기).
- `commonjs` / `ESM` 모두 지원합니다.

### 설치

```bash
npm i @kyungseopk1m/holidays-kr
```

### 사용법

```typescript
import { holidays } from "@kyungseopk1m/holidays-kr";

// 단일 연도
const data = await holidays("2025");
console.log(data); // Holiday[] - 2025년 공휴일

// 범위 (연도별 병렬 GET 후 머지)
const range = await holidays("2024", "2026");
console.log(range); // 2024 ~ 2026 공휴일

// number 입력도 지원
const numeric = await holidays(2025);
```

### 옵션

```typescript
interface HolidaysOptions {
  baseUrl?: string; // 기본: process.env.HOLIDAYS_KR_BASE_URL ?? "https://kdata.vercel.app"
  signal?: AbortSignal;
}
```

```typescript
// 자체 미러 / 프록시 지정
const data = await holidays("2025", undefined, {
  baseUrl: "https://my-mirror.example.com",
});

// AbortSignal 로 취소/타임아웃
const controller = new AbortController();
setTimeout(() => controller.abort(), 5000);
const data2 = await holidays("2025", undefined, { signal: controller.signal });

// 환경변수로 baseUrl 대체
// HOLIDAYS_KR_BASE_URL=https://my-mirror.example.com
const data3 = await holidays("2025");
```

### 반환 / 에러

```typescript
interface Holiday {
  date: number; // YYYYMMDD 형식
  name: string; // 공휴일 이름 (한글)
}

// 반환: Promise<Holiday[]>
// - 200: 데이터 배열 반환
// - 404: 빈 배열 반환 (해당 연도 데이터가 아직 없을 때)
// - 5xx / network 실패: throw Error
// - 입력 검증 실패: throw TypeError / RangeError
```

### 마이그레이션 (v1.x → v2.0.0)

```typescript
// Before (v1.x)
const result = await holidays("2025");
if (result.success) {
  console.log(result.data);
}

// After (v2.0.0)
try {
  const data = await holidays("2025"); // Holiday[] 직접 반환
  console.log(data);
} catch (e) {
  // TypeError / RangeError / Error
}
```

자세한 변경 사항은 [CHANGELOG.md](CHANGELOG.md) 를 참고하세요.

### 데이터 hub

- 데이터 소스 레포: [`kyungseopk1m/kdata`](https://github.com/kyungseopk1m/kdata)
- 엔드포인트: `https://kdata.vercel.app/api/v1/holidays/{year}.json`
- 갱신 주기: GitHub Actions cron (주 1회) → Vercel CDN 재배포

### 라이선스

[MIT](LICENSE)

---

## English

### Introduction

- Fetch Korean public holiday data with a single call — no API key required.
- All data originates from the Korea Astronomical Research Institute via the Public Data Portal.
- Data is available from 2004 onward and updated regularly.
- Since v2.0.0, the package reads from **a Vercel-hosted static JSON CDN** (the previous Cloud Function endpoint is retired).
- Supports both `commonjs` and `ESM`.

### Install

```bash
npm i @kyungseopk1m/holidays-kr
```

### Usage

```typescript
import { holidays } from "@kyungseopk1m/holidays-kr";

// Single year
const data = await holidays("2025");
console.log(data);

// Range (parallel GET per year, then merged)
const range = await holidays("2024", "2026");

// Numeric input is also supported
const numeric = await holidays(2025);
```

### Options

```typescript
interface HolidaysOptions {
  baseUrl?: string; // default: process.env.HOLIDAYS_KR_BASE_URL ?? "https://kdata.vercel.app"
  signal?: AbortSignal;
}
```

```typescript
// Custom mirror / proxy
const data = await holidays("2025", undefined, {
  baseUrl: "https://my-mirror.example.com",
});

// AbortSignal for cancellation / timeout
const controller = new AbortController();
setTimeout(() => controller.abort(), 5000);
const data2 = await holidays("2025", undefined, { signal: controller.signal });

// baseUrl override via env var
// HOLIDAYS_KR_BASE_URL=https://my-mirror.example.com
const data3 = await holidays("2025");
```

### Return / Errors

```typescript
interface Holiday {
  date: number; // YYYYMMDD
  name: string; // Holiday name (Korean)
}

// Return: Promise<Holiday[]>
// - 200: returns array
// - 404: returns empty array (data for the requested year is not yet available)
// - 5xx / network failure: throws Error
// - validation failure: throws TypeError / RangeError
```

### Migration (v1.x → v2.0.0)

```typescript
// Before (v1.x)
const result = await holidays("2025");
if (result.success) {
  console.log(result.data);
}

// After (v2.0.0)
try {
  const data = await holidays("2025"); // returns Holiday[] directly
  console.log(data);
} catch (e) {
  // TypeError / RangeError / Error
}
```

See [CHANGELOG.md](CHANGELOG.md) for full release notes.

### Data hub

- Repo: [`kyungseopk1m/kdata`](https://github.com/kyungseopk1m/kdata)
- Endpoint: `https://kdata.vercel.app/api/v1/holidays/{year}.json`
- Refresh: GitHub Actions cron (weekly) → Vercel CDN redeploy

### License

[MIT](LICENSE)
