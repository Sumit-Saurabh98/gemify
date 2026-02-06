# GamerHub AI Agent 🎮

GamerHub AI is a full-stack e-commerce support chat agent designed to assist users with gaming product queries. It features a React-based frontend and an Express/Node.js backend, leveraging OpenAI's GPT models to provide intelligent, context-aware responses.

<img width="1650" height="1050" alt="SCR-20260206-tpdr" src="https://github.com/user-attachments/assets/00f7c534-8594-4560-b87d-018023611b6e" />


## 🛠 Tech Stack

### Backend
-   **Runtime**: [Node.js](https://nodejs.org/)
-   **Framework**: [Express.js](https://expressjs.com/)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Database**: [PostgreSQL](https://www.postgresql.org/) (via [Prisma ORM](https://www.prisma.io/))
-   **Caching**: [Redis](https://redis.io/) (for caching conversations and rate limiting)
-   **LLM**: [OpenAI API](https://openai.com/) (GPT-3.5-turbo)

### Frontend
-   **Framework**: [React](https://react.dev/)
-   **Build Tool**: [Vite](https://vitejs.dev/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)

---

## 🚀 Getting Started

### Prerequisites
Ensure you have the following installed on your machine:
-   **Node.js** (v18+)
-   **PostgreSQL** (running locally or a cloud URL)
-   **Redis** (running locally or a cloud URL)

### 1. Clone the Repository
```bash
git clone https://github.com/Sumit-Saurabh98/gemify.git
cd gemify
```

### 2. Backend Setup
Navigate to the server directory:
```bash
cd server
```

Install dependencies:
```bash
npm install
```

Set up environment variables:
Create a `.env` file in the `server` directory (see [Environment Variables](#environment-variables) below).

Run Database Migrations:
```bash
npx prisma migrate dev --name init
```

Seed the Database (Optional but recommended):
```bash
npm run seed
```

Start the Development Server:
```bash
npm run dev
# Server should run on http://localhost:3000
```

### 3. Frontend Setup
Open a new terminal and navigate to the frontend directory:
```bash
cd frontend
```

Install dependencies:
```bash
npm install
```

Set up environment variables:
Create a `.env` file in the `frontend` directory.

Start the Development Server:
```bash
npm run dev
# App should run on http://localhost:5173
```

---

## 🔑 Environment Variables

### Backend (`server/.env`)
| Variable | Description | Example |
| :--- | :--- | :--- |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/gamerhub` |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379` |
| `OPENAI_API_KEY` | OpenAI API Key | `sk-...` |
| `PORT` | Server Port | `3000` |
| `CORS_ORIGIN` | Allowed Client Origin | `http://localhost:5173` |

### Frontend (`frontend/.env`)
| Variable | Description | Example |
| :--- | :--- | :--- |
| `VITE_API_URL` | Backend API URL | `http://localhost:3000` |

---

## 🏗 Architecture Overview

The backend follows a **Service-Oriented Architecture** with distinct layers for separation of concerns:

1.  **Routes** (`/routes`): Defines API endpoints and handles request routing.
2.  **Controllers** (`/controllers`): Handles HTTP request/response logic and input validation.
3.  **Services** (`/services`): Contains core business logic (Chat processing, LLM interaction).
4.  **Utils** (`/utils`): Helper functions for validation, moderation, and response generation.

### Key Design Decisions
-   **Separate Services**: OpenAI client and Redis client are initialized as separate singletons to ensure efficient resource management.
-   **Prisma ORM**: Used for type-safe database interactions and easy schema management.
-   **Redis Caching**: Implemented to cache conversation history and potentially reduce database load, though strictly for session management in this version.

---

## 🤖 LLM Implementation Notes

### Provider
-   **Model**: OpenAI `gpt-3.5-turbo`.
-   **Reasoning**: Provides a good balance of speed, cost, and capability for support based tasks.

### Prompting Strategy
The agent uses a **System-Role Prompt** strategy.
-   **Persona**: "GamerHub Support AI".
-   **Constraints**: Strictly limited to store-related queries (Products, Shipping, Returns).
-   **Context Injection**:
    -   **FAQ Context**: We embed relevant FAQs into the prompt to ground the model's answers.
    -   **Conversation History**: The last 5 message exchanges are included to maintain conversational continuity.

### Response Validation
-   **Moderation**: We check both user input and AI output for harmful content.
-   **Logic**: Custom validation ensures the AI doesn't hallucinate shipping to unsupported countries (Restricted to USA, India, Japan, China).

---

## ⚖️ Trade-offs & "If I had more time..."

### 1. Docker / Containerization
**Current**: Setup requires manual installation of Node, Postgres, and Redis.
**Ideal**: A `docker-compose.yml` file to spin up the entire stack with one command.

### 2. Testing
**Current**: Validation logic exists, but automated unit/integration tests are minimal.
**Ideal**: Add comprehensive test suites using Jest or Vitest for both backend services and frontend components.

### 3. Rate Limiting
**Current**: Basic rate limit logic is planned/stubbed.
**Ideal**: Implement robust IP-based or User-based rate limiting using Redis to prevent abuse.

### 4. Job Queue
**Current**: AI requests are processed synchronously.
**Ideal**: Offload AI processing to a queue (e.g., BullMQ) to handle high concurrency and prevent request timeouts.
