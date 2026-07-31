# Changelog

## [2.1.1] - 2026-07-29

### Fixed

- Ship separate ESM and CommonJS type declarations instead of one copy of the ESM output. The build previously collapsed both into `dist/index.d.ts`, and because the package is `"type": "module"` that single file was an ESM declaration served to every `exports` condition. A CommonJS TypeScript project on `moduleResolution: node16` or `nodenext` therefore failed to compile against 2.1.0 with `TS1479: the referenced file is an ECMAScript module and cannot be imported with 'require'`, even though `require()` resolved to the CommonJS build and worked at runtime. Each condition now carries its own `types` and both consumer shapes type-check.

### Added

- `attw`, `publint`, and `check` scripts, plus a package quality check step in CI and in the publish workflow, so a packaging regression fails before release.
- A CI workflow that runs tests and the package check on pull requests.
- `"sideEffects": false`, which lets bundlers drop the package when it is unused.
- README coverage for the `options` argument (`baseUrl`, `signal`), the `HOLIDAYS_KR_BASE_URL` environment variable, and `clearCache()`. All four shipped in 2.0.2 but were documented only in this changelog.

## [2.1.0] - 2026-07-01

### Added

- Cap the queryable year range at 100 years. A range spanning more than 100 years now returns an input error instead of issuing one concurrent request per year.

### Fixed

- `holidays()` no longer throws when `year` is `null` or `undefined`; it returns the standard `{ success: false }` response, consistent with other invalid input.

## [2.0.3] - 2026-06-20

### Fixed

- Anchor the trailing-slash trim in `baseUrl` resolution with a negative lookbehind (`/(?<!\/)\/+$/`) to avoid polynomial backtracking on adversarial input. Same behavior, linear matching. (CodeQL `js/polynomial-redos`)

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
