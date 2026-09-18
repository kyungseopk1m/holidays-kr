# Contributing to holidays-kr

Thank you for helping improve `holidays-kr`. Contributions of bug fixes,
tests, documentation, and focused features are welcome.

## Before opening a pull request

1. Open an issue first for a substantial change so that its scope and design
   can be discussed. Small fixes and documentation improvements may go
   directly to a pull request.
2. Fork the repository, create a focused branch, and keep commits easy to
   review.
3. Install the supported Node.js version and dependencies with `npm ci`.
4. Run all required checks:

   ```sh
   npm test
   npm run build
   npm run check
   ```

5. Add or update automated tests for every bug fix and for all new or changed
   behavior. New major functionality is not complete without tests. The tests
   live in `__test__/` and use Jest; run them with `npm test`.
6. Update the Korean and English documentation when user-visible behavior or
   the public API changes.

Pull requests must pass CI, preserve backward compatibility unless a breaking
change has been agreed in advance, and follow the existing TypeScript style.
Maintainers may ask for changes before merging.

## Reporting security issues

Do not open a public issue for a suspected vulnerability. Follow the private
reporting process in [SECURITY.md](SECURITY.md).

By contributing, you agree that your contribution is licensed under the
project's [MIT License](LICENSE).
