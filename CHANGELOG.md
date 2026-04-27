# Changelog

## [2.0.0] - 2026-04-27

### Breaking changes

- 데이터 소스를 Cloud Function (POST) 에서 Vercel CDN (GET) 으로 전환.
  - 기본 엔드포인트: `https://kdata.vercel.app/api/v1/holidays/{year}.json`
  - hub 레포: [`kyungseopk1m/kdata`](https://github.com/kyungseopk1m/kdata)
- 반환 타입을 `Promise<HolidayResponse>` 에서 `Promise<Holiday[]>` 로 단순화. `success` / `message` 래핑 제거 — HTTP status 와 throw 로 성공/실패 판별.
- 에러는 객체 감싸기 대신 throw.
  - 4자리 숫자가 아니면 `TypeError`
  - 2004 미만이거나 `year2 < year` 면 `RangeError`
  - HTTP 5xx 또는 fetch 실패 시 `Error`
  - 404 (해당 연도 데이터 미존재) 는 throw 하지 않고 빈 배열 반환
- `year2` 범위 호출은 서버측 range 응답 대신 연도별 병렬 GET 후 클라이언트에서 머지.

### Added

- `HolidaysOptions { baseUrl?, signal? }` — CDN URL 오버라이드 + AbortSignal 지원.
- 환경변수 `HOLIDAYS_KR_BASE_URL` — 옵션 미지정 시 기본 baseUrl 대체.
- `year` / `year2` 가 `string | number` 모두 허용.
- `Holiday[]` 명시적 export.

### Removed

- Cloud Function 엔드포인트 호출.
- `X-Holidays-Client` 커스텀 헤더 (CDN GET 으로 불필요).
- `success` / `message` 응답 필드.

### Migration

```ts
// Before (v1.x)
const result = await holidays("2025");
if (result.success) console.log(result.data);

// After (v2.0.0)
try {
  const data = await holidays("2025");
  console.log(data);
} catch (e) {
  // TypeError / RangeError / Error
}
```

```ts
// 자체 미러 / 프록시
await holidays("2025", undefined, { baseUrl: "https://my-mirror.example.com" });

// 환경변수로도 지정 가능
// HOLIDAYS_KR_BASE_URL=https://my-mirror.example.com
await holidays("2025");
```

```ts
// AbortSignal
const controller = new AbortController();
setTimeout(() => controller.abort(), 5000);
await holidays("2025", undefined, { signal: controller.signal });
```

### Notes

- v1.x 사용자 코드는 당분간 동작 (Cloud Function 유지). v2 안정화 이후 별도로 deprecate.
- 데이터 갱신: GitHub Actions cron 주 1회 → Vercel CDN 재배포.

이전 버전 변경사항은 git log 를 참고.
