# Development

## Requirements

- Node.js 24 or later
- npm

## Install dependencies

```bash
npm install
```

## Run all checks

```bash
npm test
```

This runs the coverage suite and compiles the public declarations against both
Express major versions.

## Individual commands

```bash
npm run test:unit
npm run test:coverage
npm run test:types
```

## Coverage thresholds

| Metric | Minimum |
| --- | ---: |
| Lines | 95% |
| Functions | 100% |
| Branches | 90% |

## Package verification

```bash
npm pack --dry-run
```

## Wiki development

Wiki pages live in `wiki/`. Changes pushed to `develop` are published by the
`Sync Wiki` GitHub Actions workflow. The repository Wiki must be enabled and
initialized before the workflow can clone its `.wiki.git` repository.
