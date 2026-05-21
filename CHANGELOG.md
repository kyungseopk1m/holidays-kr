# Changelog

## [2.0.2] - 2026-05-22

- Data source endpoint migrated from `kdata.vercel.app` to `kdata.kxxseop.workers.dev` (Cloudflare) due to traffic limits on the previous host. The v2.0.1 endpoint is being phased out — upgrade to v2.0.2+.
- Added an optional third `options` argument: `{ baseUrl, signal }`. `baseUrl` can also be set via the `HOLIDAYS_KR_BASE_URL` env var.
- Added in-memory cache (24-hour TTL) so repeat calls for the same year no longer re-fetch. `clearCache()` is exported to invalidate it.
- Backward-compatible with v2.0.1 / v1.x: `holidays(year, year2?)` signature is unchanged.

## [2.0.1] - 2026-04-27

### Fixed

- v2.0.0 was a misrelease that introduced unintended breaking changes. v2.0.1 restores the v1.x-compatible API.
- `holidays(year, year2?)` returns `Promise<HolidayResponse>` (`{ success, message, data }`) again — identical to v1.5.0 from a consumer's point of view.
- v1.x consumer code keeps working without modification. No migration needed.

## [2.0.0] - 2026-04-27 — DEPRECATED

- Misreleased. Please use v2.0.1 or later. The package on npm is marked `deprecated` for advisory.

For prior versions see the git history.
