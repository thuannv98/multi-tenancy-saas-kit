<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

# Account Kit — Server (NestJS)

This is the demo backend for the Account Kit project. It is intentionally minimal and meant to run locally for evaluation.

## Prerequisites
- Node.js >= 20
- PostgreSQL available locally (we use `sudo -u postgres psql` in examples)

## Quick start

1. Initialize the database (creates `ak` and seeds data):

```bash
cd db
sudo -u postgres psql -f db.sql
```

2. Run the server

```bash
cd server
npm install
npm run start:dev
# listens on http://localhost:3001
```

## Notes and configuration
- The app uses environment variables for DB connection if `DATABASE_URL` is set, otherwise it attempts a unix-socket/local postgres connection.
- CORS is enabled in `src/main.ts` for local development (reflects origin). Tighten this before deploying.

## Useful endpoints
- `GET /practices/:practiceId/clients` — list clients for a practice
- `POST /practices/:practiceId/clients` — create client (requires `x-user` with `write:clients` permission)
- `POST /practices/:practiceId/actions` — trigger actions (expects `x-user` header)
- `GET /practices/:practiceId/clients/:clientId/extensions?slot=...` — resolves extensions for slot
- `GET /practices/:practiceId/audit` — audit entries for a practice

## Key trade-offs / TODOs
- **Auth:** demo uses `x-user` header; replace with real auth (JWT/sessions) for production.
- **Persistence:** audits and some state are in-memory; persist to DB to survive restarts and scale.
- **Idempotency:** basic in-memory idempotency is provided — move to DB-backed dedupe for concurrency.
- **Extensions:** manifests are hardcoded for the demo; implement a registry or DB-driven manifests.
- **Permissions:** permission checks query DB on each request; consider caching for performance.

## Where to look in the code
- Main entry: `src/main.ts`
- Actions: `src/actions/actions.controller.ts`
- Clients: `src/clients/` (controller/service/module)
- Extensions resolver: `src/extensions/extensions.service.ts`
- Audit module: `src/audit/`

If you want, I can run a quick smoke test of the endpoints or wire persistence for audits next.
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
