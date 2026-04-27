# Changelog

## [2.0.1] - 2026-04-27

### Fixed

- v2.0.0 was a misrelease that introduced unintended breaking changes. v2.0.1 restores the v1.x-compatible API.
- `holidays(year, year2?)` returns `Promise<HolidayResponse>` (`{ success, message, data }`) again — identical to v1.5.0 from a consumer's point of view.
- v1.x consumer code keeps working without modification. No migration needed.

## [2.0.0] - 2026-04-27 — DEPRECATED

- Misreleased. Please use v2.0.1 or later. The package on npm is marked `deprecated` for advisory.

For prior versions see the git history.
