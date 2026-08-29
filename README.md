# CropWise — Production MERN + LangChain/LangGraph

This repository is a clean MERN conversion of the supplied CropWise project and UI reference.

## Stack

- Frontend: React 19 + Vite + Tailwind CSS + Lucide React + React Router
- Backend: Node.js + Express 5 + TypeScript
- Database: MongoDB Atlas + Mongoose
- AI orchestration: LangChain JS + LangGraph JS, two sequential nodes
- AI provider: OpenRouter via its OpenAI-compatible API
- Authentication: JWT in HttpOnly cookie + server-side role middleware
- Secrets: OpenRouter key encrypted at rest with AES-256-GCM

## Repository

```text
cropwise-production/
├── backend/
│   ├── src/
│   │   ├── ai/                 # LangGraph + prompts + fallbacks
│   │   ├── config/             # environment + MongoDB connection
│   │   ├── controllers/        # HTTP handlers
│   │   ├── middleware/         # JWT + errors
│   │   ├── models/             # User, Prediction, SystemConfig
│   │   ├── routes/             # auth, prediction, admin
│   │   ├── services/           # encrypted dynamic AI config
│   │   └── utils/              # validation, crypto, JWT, seed
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/         # UI primitives and screens
│   │   ├── context/             # auth state
│   │   ├── lib/                 # API client
│   │   ├── pages/               # portal + admin
│   │   └── types/
│   ├── .env.example
│   └── package.json
└── README.md
```

## 1. MongoDB Atlas

Create a MongoDB Atlas cluster and database user. Add your development machine's IP to Network Access (or use your deployment platform's egress IPs). Copy the SRV connection string into `backend/.env` as `MONGODB_URI`.

## 2. Environment files

### Backend

```bash
cd backend
cp .env.example .env
```

Generate a 32-byte AES key for `CONFIG_ENCRYPTION_KEY`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Then set:

- `MONGODB_URI`
- `JWT_SECRET` (32+ random characters)
- `CONFIG_ENCRYPTION_KEY` (64 hex characters)
- `FRONTEND_URL`
- optional bootstrap admin values
- optional initial `OPENROUTER_API_KEY`

The OpenRouter key can also be entered later from `/admin`; it is encrypted before storage.

### Frontend

```bash
cd frontend
cp .env.example .env
```

Set `VITE_API_URL=http://localhost:5000/api` for local development.

## 3. Install and run

Open two terminals:

```bash
cd backend
npm install
npm run seed:admin
npm run dev
```

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

The bootstrap admin credentials come from `ADMIN_EMAIL` / `ADMIN_PASSWORD` in the backend `.env`. Change them before any non-local deployment.

## 4. AI configuration

The admin page can:

- see whether a key is configured (masked only)
- replace the encrypted OpenRouter key
- enable/disable AI predictions globally
- select the model dynamically

The default is `openrouter/free`. The code also exposes the user-requested free model slugs in the admin selector. Model availability can change on OpenRouter, so keep the selected model configurable rather than hard-coding it into the application.

## 5. LangGraph workflow

The backend graph is deliberately two nodes:

```text
START
  ↓
Node 1: cropSelection
  - N / P / K
  - temperature / humidity / rainfall
  - pH
  - optional desired crops / soil context
  ↓
Node 2: cultivationAdvice
  - selected crop
  - selection rationale
  - farm conditions
  ↓
END
```

Each node asks the configured OpenRouter model for JSON. The parser is intentionally defensive. If the provider fails or returns malformed JSON, a deterministic suitability heuristic and conservative cultivation advice are used as a fallback.

## 6. Security notes

- JWT token is stored in an HttpOnly cookie rather than localStorage.
- Admin authorization is enforced on the server, not just by React routing.
- OpenRouter keys are never returned in plaintext to the browser.
- AES-GCM authentication tags protect encrypted configuration values against tampering.
- Helmet, CORS, request-size limits and rate limiting are enabled.
- Passwords are bcrypt-hashed with cost factor 12.
- Prediction records are scoped to the authenticated user for normal users.

## 7. Render single-service deployment

This repository is configured to deploy the frontend and backend from one Render Web Service. Express serves the Vite build, so the public application and API share one origin.

Render uses `render.yaml` and runs:

```bash
npm ci --prefix backend
npm ci --prefix frontend
npm run build --prefix frontend
npm run build --prefix backend
npm start --prefix backend
```

The production API base URL is `/api`, so no frontend hostname needs to be hard-coded.

### Render setup

1. Push this repository to GitHub.
2. In Render, choose **New + → Blueprint** and select the repository.
3. Render detects `render.yaml`.
4. Enter the requested secret values:
   - `FRONTEND_URL`: your Render URL, e.g. `https://cropwise.onrender.com`
   - `MONGODB_URI`: your MongoDB Atlas SRV URI
   - `JWT_SECRET`: at least 32 random characters
   - `CONFIG_ENCRYPTION_KEY`: exactly 64 hexadecimal characters
   - `OPENROUTER_SITE_URL`: your Render URL
   - `ADMIN_EMAIL` and `ADMIN_PASSWORD`
5. Deploy.
6. After the service is live, run the admin seed once from the Render Shell (or another environment with the same production variables):

```bash
npm run seed:admin --prefix backend
```

7. Open `/admin/login` on your Render URL.
8. Add/update the OpenRouter key from the admin configuration screen.

For production, keep `COOKIE_SECURE=true`, use HTTPS, keep `CONFIG_ENCRYPTION_KEY` permanently stable, and never commit `.env` files.

### Important encryption note

`CONFIG_ENCRYPTION_KEY` encrypts the OpenRouter key stored in MongoDB. If you change it after a key has been saved, old ciphertext cannot be decrypted. Keep the same value across redeploys. If a development database contains ciphertext from another key, use `npm run reset:config --prefix backend` once and then save the OpenRouter key again from the admin panel.

## 8. Guest-first user experience

The public crop prediction portal does not require sign-in. Visitors can submit the full farm/environment/soil form and receive a prediction as a guest. The `Create account` action appears in the header and after a prediction so users can register only after trying the product. Guest predictions are stored with a null `userId` and remain visible to admins as global prediction logs; authenticated users' predictions are associated with their account.

Regular users can also sign in from the public portal using the **Log In** button in the header. After login, the JWT is stored in an HttpOnly cookie and the session is restored through `/api/auth/me`.

### Admin authentication

The public portal is guest-first: visitors can predict without an account, while existing users can use the **Log In** button. Authorized administrators can use `/admin/login`; the `/admin` route remains JWT- and role-protected.
