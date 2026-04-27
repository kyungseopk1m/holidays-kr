# Changelog

## [2.0.0] - 2026-04-27

### Breaking changes

- The data source moved from a Cloud Function POST endpoint to a static JSON CDN read over GET. Default endpoint: `https://kdata.vercel.app/api/v1/holidays/{year}.json`.
- The return type of `holidays()` is now `Promise<Holiday[]>` instead of `Promise<HolidayResponse>`. The `success` / `message` wrappers are gone — success is signalled by HTTP status, failure by `throw`.
- Validation and runtime errors now throw instead of being wrapped in a result object:
  - `TypeError` if `year` / `year2` is not a 4-digit value.
  - `RangeError` if a year is below 2004 or `year2 < year`.
  - `Error` for HTTP 5xx or fetch failures.
  - HTTP 404 (data for that year not yet published) resolves to an empty array — no throw.
- Range queries (`year2` set) are now resolved by issuing one GET per year in parallel and concatenating the results client-side. Server-side range responses are no longer used.

### Added

- `HolidaysOptions { baseUrl?, signal? }` — endpoint override and `AbortSignal` support.
- `HOLIDAYS_KR_BASE_URL` environment variable — overrides the default endpoint when no `baseUrl` option is passed.
- `year` and `year2` now accept both `string` and `number`.
- `Holiday[]` is exported as an explicit type.

### Removed

- The Cloud Function endpoint and its `X-Holidays-Client` request header.
- The `success` / `message` fields on the response.

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
// Custom mirror or proxy
await holidays("2025", undefined, { baseUrl: "https://my-mirror.example.com" });

// Or via env var
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

- v1.x consumer code will keep working for now; the legacy Cloud Function stays online until v2 has settled. Deprecation will follow in a separate release.

For prior versions see the git history.
