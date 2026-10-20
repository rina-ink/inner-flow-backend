
# Inner Flow — Backend

**REST API for a massage therapy and appointment-booking platform.**

Inner Flow is a full-stack project built around a calm, personalized massage experience. This repository contains the backend: authentication, massage offerings, scheduling, bookings, blog content, and member preferences.

**Frontend:** [Inner Flow live site](https://inner-flow-frontend.onrender.com/) · [Frontend repository](https://github.com/rina-ink/inner-flow-frontend)

## Tech Stack

- **Node.js, Express 5, TypeScript** — API and application logic
- **MongoDB, Mongoose** — data persistence and models
- **Zod** — request validation and environment configuration
- **JWT, bcrypt, Node.js crypto** — authentication, password hashing, refresh-token hashing
- **cookie-parser, CORS, Helmet, express-rate-limit** — cookie handling and security middleware

extended:

| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime |
| Express.js | REST API framework |
| TypeScript | Type-safe application development |
| MongoDB | NoSQL database |
| Mongoose | Database modeling and queries |
| Zod | Request and configuration validation |
| JSON Web Tokens | Authentication and session management |
| bcrypt | Password hashing |
| cookie-parser | Cookie handling |
| Helmet | HTTP security headers |
| express-rate-limit | API request rate limiting |
| CORS | Frontend-backend communication |

## Features

- **Authentication:** Register, log in, log out, refresh sessions, and retrieve the current user.
- **Session management:** 15-minute JWT access tokens, rotating refresh tokens, hashed refresh-token storage, reuse detection, and a five-session limit per user.
- **Massage catalogue:** Public listing and detail endpoints; administrator management of massage offerings.
- **Availability:** Weekly schedules, date-specific exceptions, available time slots, and administrator scheduling endpoints.
- **Bookings:** Guest or authenticated booking requests, duration and availability validation, overlap checks, personal booking history, and booking cancellation.
- **Blog:** Public posts and administrator create/update operations.
- **Member preferences:** Authenticated profile access and updates to music and quieter-session preferences.
- **Authorization:** Protected routes and administrator role checks.
- **Error handling:** Centralized error middleware, 404 handling, and a health endpoint.

## API Endpoints

All endpoints are prefixed with `/api`.

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| GET | `/health` | Public | Health check |
| POST | `/auth/register` | Public | Create an account |
| POST | `/auth/login` | Public | Log in |
| POST | `/auth/refresh` | Refresh cookie | Rotate session tokens |
| DELETE | `/auth/logout` | Cookie session | Log out |
| GET | `/auth/me` | Authenticated | Get current user |
| GET | `/massages` | Public | List massages |
| GET | `/massages/:slug` | Public | Get massage details |
| POST | `/massages` | Admin | Create massage |
| PUT | `/massages/:id` | Admin | Update massage |
| DELETE | `/massages/:id` | Admin | Delete massage |
| GET | `/availability` | Public | View availability rules |
| GET | `/availability/date/:date` | Public | View availability for a date |
| GET | `/availability/slots` | Public | Retrieve available slots |
| POST | `/availability` | Admin | Create availability |
| PUT | `/availability/:id` | Admin | Update availability |
| DELETE | `/availability/:id` | Admin | Delete availability |
| POST | `/bookings` | Public / optional authentication | Create a booking |
| GET | `/bookings` | Admin | List all bookings |
| GET | `/bookings/me` | Authenticated | List own bookings |
| PATCH | `/bookings/:id/cancel` | Owner / admin | Cancel booking |
| GET | `/blog` | Public | List blog posts |
| GET | `/blog/:slug` | Public | Read a blog post |
| POST | `/blog` | Admin | Create blog post |
| PUT | `/blog/:id` | Admin | Update blog post |
| GET | `/members/me` | Authenticated | Get member profile |
| PATCH | `/members/me/preferences` | Authenticated | Update member preferences |

## Booking Flow

When a client requests an appointment, the API:

1. Confirms that the selected massage exists and is active.
2. Checks that the requested duration is offered.
3. Resolves the date-specific exception or recurring weekly availability.
4. Ensures the appointment fits within the available hours.
5. Checks for overlapping, non-cancelled bookings.
6. Saves the booking with optional authenticated user association.

## Project Structure

```text
src/
├── app.ts                 # Express setup and server startup
├── config.ts              # Validated environment configuration
├── db.ts                  # MongoDB connection
├── controllers/           # Request handlers and business logic
├── middleware/            # Authentication, authorization, validation, errors
├── models/                # Mongoose data models
├── routes/                # REST endpoint definitions
├── schemas/               # Zod validation schemas
└── utils/                 # JWT, token, and HTTP error helpers
```

The API separates route definitions, request validation, business logic, and persistence models to keep features easier to extend and maintain.

## Getting Started

### Prerequisites

- Node.js compatible with the repository's dependencies
- npm
- A running MongoDB instance or MongoDB Atlas connection

### Installation

Install dependencies:

```bash
npm install
```

Create a `.env` file in the repository root:

```dotenv
NODE_ENV=
PORT=
MONGO_URI=
DB_NAME=
SALT_ROUNDS=
ACCESS_JWT_SECRET=replace_with_a_random_secret_of_at_least_64_characters_long
REFRESH_TOKEN_TTL=
CLIENT_BASE_URL=
```

Use a securely generated JWT secret, and **never commit real credentials or `.env` files**.

`REFRESH_TOKEN_TTL` is expressed in seconds (default: 30 days). `CLIENT_BASE_URL` must match the frontend origin used by the browser.

Start the development server:

```bash
npm run dev
```

Check the API at:

```text
http://localhost:8080/api/health
```

To compile and run the server:

```bash
npm run build
npm start
```

## Authentication and Security

Authentication uses short-lived JWT access tokens and refresh tokens delivered via **HTTP-only cookies**.

Passwords are hashed with bcrypt. Refresh tokens are hashed before being persisted, rotated when refreshed, and tracked for revocation.

The application also includes:

- `SameSite=Strict` cookies in development; `SameSite=None` and `Secure` cookies in production for cross-site frontend/backend deployments.
- CORS configured for a specific frontend origin with credentials enabled.
- Helmet security headers and rate limiting on registration and login.
- Zod validation for selected request bodies and configuration.
- Role-based protection of administrative endpoints.

## Frontend Integration

The backend is designed to work with the Inner Flow frontend, providing API services for authentication, massage information, availability, bookings, and member functionality.

The frontend communicates with the REST API through HTTP requests and uses cookie-based authentication for protected operations.

**Frontend:** [inner-flow-frontend](https://github.com/rina-ink/inner-flow-frontend)

**Live Application:** [inner-flow-frontend.onrender.com](https://inner-flow-frontend.onrender.com/)

## About the Project

Inner Flow was developed as a full-stack software development project, combining technical implementation with a personal interest in massage therapy, well-being, and user-centered digital experiences.

The project provided an opportunity to design and implement a backend architecture from the ground up, including authentication, database modeling, API development, scheduling logic, and integration with a React frontend.

It reflects an interest in building applications that are both technically structured and meaningful to the people using them.

---

## Author

**rina ink** — software development · interaction · illustration

[Portfolio](https://rina-ink.vercel.app/) · [GitHub](https://github.com/rina-ink)
