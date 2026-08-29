# CropWise Backend

Production-oriented Express + MongoDB + LangChain/LangGraph API for CropWise.

## Key design decisions
- JWT is delivered as an HttpOnly cookie, while middleware also accepts a Bearer token for API clients.
- OpenRouter keys are encrypted at rest using AES-256-GCM. The encryption master key lives only in the server environment.
- LangGraph executes exactly two sequential nodes: `cropSelection` -> `cultivationAdvice`.
- If OpenRouter is unavailable, the graph falls back to a deterministic crop suitability heuristic and conservative advice so the API remains usable.
- Admin endpoints are protected by both JWT authentication and role checks.

## API
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `POST /api/predictions`
- `GET /api/predictions/mine`
- `GET/PATCH /api/admin/config`
- `GET /api/admin/users`
- `PATCH/DELETE /api/admin/users/:id`
- `GET /api/admin/predictions?crop=rice`
- `DELETE /api/admin/predictions/:id`
