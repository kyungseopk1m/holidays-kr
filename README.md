# holidays-kr

[한국어](#한국어) | [English](#english)

---

## 한국어

### 소개

- 별도의 API 키 없이 단 한 번의 호출로 간편하게 데이터를 가져올 수 있습니다.
- 모든 데이터는 공공데이터포털을 통해 한국천문연구원의 공식 공휴일 데이터베이스에서 직접 제공됩니다.
- 2004년 이후의 공휴일 데이터를 제공하며, 매월 3회 정기 업데이트로 최신 정보를 유지합니다.
- 매년 다음 해의 공휴일 정보를 조회할 수 있지만, 2년 후의 데이터는 포함되지 않습니다.
- `commonjs`와 `ESM` 모두 지원합니다.

### 설치

```bash
npm i @kyungseopk1m/holidays-kr
```

### 사용법

```typescript
import { holidays } from "@kyungseopk1m/holidays-kr";

const result = await holidays("2025");

console.log(result); // 2025.01 ~ 2025.12 데이터

// 또는

const { holidays } = require("@kyungseopk1m/holidays-kr");

const data = await holidays("2010", "2015");

console.log(data); // 2010.01 ~ 2015.12 데이터
```

### 반환 데이터

| 속성    | 설명                 |
| ------- | -------------------- |
| success | API 호출 성공 여부   |
| message | 응답 메시지          |
| name    | 공휴일 이름 (한글)   |
| date    | YYYYMMDD 형식의 날짜 |

<br>

```typescript
interface response {
  success: boolean;
  message: string;
  data: example[];
}

interface example {
  date: number;
  name: string;
}
```

### 라이선스

[MIT](LICENSE)

---

## English

### Introduction

- No need for a separate API key—just fetch data effortlessly with a single call.
- All data is sourced directly from the Korea Astronomical Research Institute's official holiday database via the Public Data Portal.
- Holiday data is available from 2004 onward, with regular updates three times a month to keep it current.
- You can retrieve holiday information for the upcoming year annually, but data for the year after next is not included.
- Supports both `commonjs` and `ESM`.

### Install

```bash
npm i @kyungseopk1m/holidays-kr
```

### Usage

```typescript
import { holidays } from "@kyungseopk1m/holidays-kr";

const result = await holidays("2025");

console.log(result); // Data from 2025.01 to 2025.12

// or

const { holidays } = require("@kyungseopk1m/holidays-kr");

const data = await holidays("2010", "2015");

console.log(data); // Data from 2010.01 to 2015.12
```

### Output

| Property | Description               |
| -------- | ------------------------- |
| success  | API call success status   |
| message  | Response message          |
| name     | Holiday name (in Korean)  |
| date     | Date in 'YYYYMMDD' format |

<br>

```typescript
interface response {
  success: boolean;
  message: string;
  data: example[];
}

interface example {
  date: number;
  name: string;
}
```

### License

[MIT](LICENSE)
