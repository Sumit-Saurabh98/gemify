# Spur AI Live Chat Agent - Implementation Plan

## Project Overview
Building an AI-powered customer support chat application for **GamerHub** - an online gaming accessories store operating in USA, India, Japan, and China.

**Tech Stack:**
- Backend: Node.js + TypeScript
- Frontend: SvelteKit
- Database: PostgreSQL
- Cache: Redis
- LLM: OpenAI GPT-4

---

## Phase 1: Project Setup & Infrastructure

### 1.1 Initialize Project Structure
**Commit:** `feat: initialize project with monorepo structure`
- Create root directory with README.md
- Set up `.gitignore` for Node.js, environment files
- Initialize git repository
- Create `/backend` and `/frontend` directories
- Add `.env.example` files for both

### 1.2 Backend Foundation Setup
**Commit:** `feat: setup backend with TypeScript and Express`
- Initialize `backend/package.json`
- Install core dependencies:
  - `express`, `@types/express`
  - `typescript`, `ts-node`, `nodemon`
  - `dotenv`
  - `cors`, `helmet`, `express-rate-limit`
- Create `tsconfig.json` with strict mode
- Set up folder structure:
  ```
  backend/
  ├── src/
  │   ├── config/
  │   ├── routes/
  │   ├── services/
  │   ├── models/
  │   ├── middleware/
  │   ├── types/
  │   └── utils/
  └── index.ts
  ```
- Create basic Express server with health check endpoint

### 1.3 Frontend Foundation Setup
**Commit:** `feat: setup SvelteKit frontend with Tailwind CSS`
- Initialize SvelteKit project in `/frontend`
- Install dependencies:
  - `@sveltejs/kit`
  - `svelte`
  - `typescript`
  - `vite`
  - `tailwindcss`
  - `postcss`
  - `autoprefixer`
- Configure Tailwind CSS:
  - Run `npx tailwindcss init -p`
  - Configure `tailwind.config.js` with content paths
  - Add Tailwind directives to global CSS
- Create basic page structure
- Set up TypeScript configuration
- Create basic layout component

---

## Phase 2: Database Layer

### 2.1 Database Configuration
**Commit:** `feat: add PostgreSQL connection and configuration`
- Install `pg`, `@types/pg`
- Create database configuration in `backend/src/config/database.ts`
- Use existing PostgreSQL connection: `postgresql://user:password@localhost:5432/db`
- Implement connection pool
- Add connection health check

### 2.2 Database Schema Design
**Commit:** `feat: create database schema and migrations`
- Create migration system (using `node-pg-migrate` or raw SQL)
- Define schema:
  ```sql
  -- conversations table
  CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    metadata JSONB
  );

  -- messages table
  CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    sender VARCHAR(10) CHECK (sender IN ('user', 'ai')),
    text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    metadata JSONB
  );

  -- faq_knowledge table
  CREATE TABLE faq_knowledge (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category VARCHAR(100) NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    region VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
  );
  ```
- Add indexes for performance

### 2.3 Seed FAQ Data
**Commit:** `feat: add FAQ seed data for gaming accessories store`
- Create seed script
- Add FAQ data covering:
  - **Shipping Policy** (USA, India, Japan, China specific)
  - **Return/Refund Policy** (region-specific)
  - **Support Hours** (timezone-aware for all regions)
  - **Product Categories** (controllers, headsets, keyboards, mice, chairs)
  - **Payment Methods** (region-specific: USD, INR, JPY, CNY)
  - **Warranty Information**
  - **Regional Availability**

### 2.4 Database Repository Layer
**Commit:** `feat: implement database repository pattern`
- Create `ConversationRepository` class
- Create `MessageRepository` class
- Create `FAQRepository` class
- Implement CRUD operations with proper error handling
- Add TypeScript interfaces for all entities

---

## Phase 3: Redis Cache Layer

### 3.1 Redis Configuration
**Commit:** `feat: setup Redis client and configuration`
- Install `redis`, `@types/redis`
- Create Redis client in `backend/src/config/redis.ts`
- Use existing Redis connection: `redis://localhost:6379`
- Implement connection with retry logic
- Add health check

### 3.2 Caching Service
**Commit:** `feat: implement Redis caching service`
- Create `CacheService` class
- Implement methods:
  - `get(key: string)`
  - `set(key: string, value: any, ttl?: number)`
  - `delete(key: string)`
  - `exists(key: string)`
- Add conversation history caching (TTL: 1 hour)
- Add FAQ caching (TTL: 24 hours)

---

## Phase 4: LLM Integration

### 4.1 OpenAI Client Setup
**Commit:** `feat: setup OpenAI API client`
- Install `openai` package
- Create `backend/src/config/openai.ts`
- Configure API client with environment variables
- Add request timeout configuration (30s)

### 4.2 LLM Service Implementation
**Commit:** `feat: implement LLM service with prompt engineering`
- Create `LLMService` class in `backend/src/services/llm.service.ts`
- Implement `generateReply(history, userMessage, faqContext)` method
- Design system prompt:
  ```
  You are a helpful AI support agent for GamerHub, an online gaming accessories store.
  We operate in USA, India, Japan, and China.
  
  Your role:
  - Answer questions clearly and concisely
  - Be friendly and professional
  - Use the provided FAQ knowledge to answer accurately
  - If unsure, offer to connect user with human support
  - Acknowledge regional differences when relevant
  ```
- Include conversation history (last 10 messages)
- Include relevant FAQs in context

### 4.3 Error Handling & Guardrails
**Commit:** `feat: add LLM error handling and rate limiting`
- Implement error handling for:
  - API timeout
  - Invalid API key
  - Rate limits
  - Network errors
- Add retry logic with exponential backoff
- Cap max tokens (500 per response)
- Add fallback responses for errors
- Implement cost tracking/logging

---

## Phase 5: Backend API Development

### 5.1 Input Validation Middleware
**Commit:** `feat: add request validation middleware with Zod`
- Install `zod` for type-safe validation
- Create validation schemas using Zod
- Create validation middleware
- Validate:
  - Message not empty (trim whitespace)
  - Message length <= 2000 characters
  - SessionId format (UUID)
- Return clear validation error messages

### 5.2 Chat API Endpoints
**Commit:** `feat: implement chat API endpoints`
- Create `backend/src/routes/chat.routes.ts`
- Implement `POST /api/chat/message`:
  - Request: `{ message: string, sessionId?: string }`
  - Response: `{ reply: string, sessionId: string, messageId: string }`
  - Logic:
    1. Create/retrieve conversation
    2. Save user message to DB
    3. Fetch conversation history from cache or DB
    4. Fetch relevant FAQs
    5. Call LLM service
    6. Save AI response to DB
    7. Update cache
    8. Return response
- Implement `GET /api/chat/history/:sessionId`:
  - Fetch all messages for a conversation
  - Return in chronological order

### 5.3 Error Handling Middleware
**Commit:** `feat: add global error handling middleware`
- Create error handling middleware
- Standardize error responses:
  ```json
  {
    "success": false,
    "error": {
      "code": "ERROR_CODE",
      "message": "User-friendly message"
    }
  }
  ```
- Log errors appropriately
- Never expose internal details to client

### 5.4 Security & Rate Limiting
**Commit:** `feat: add security middleware and rate limiting`
- Configure CORS properly
- Add `helmet` for security headers
- Implement rate limiting:
  - 30 requests per minute per IP
  - 100 requests per hour per session
- Add request logging

---

## Phase 6: Frontend Development

### 6.1 Chat UI Components - Structure
**Commit:** `feat: create basic chat UI layout`
- Create `routes/+page.svelte` as main chat page
- Create component structure:
  ```
  frontend/src/lib/components/
  ├── ChatWidget.svelte          (main container)
  ├── ChatHeader.svelte          (header with branding)
  ├── ChatMessageList.svelte     (scrollable message area)
  ├── ChatMessage.svelte         (individual message bubble)
  ├── ChatInput.svelte           (input box + send button)
  └── TypingIndicator.svelte     (typing animation)
  ```

### 6.2 Chat UI Components - Styling with Tailwind & shadcn/ui
**Commit:** `style: implement chat UI design with Tailwind and shadcn`
- Install and configure shadcn-svelte:
  - Run `npx shadcn-svelte@latest init`
  - Add required components: Button, Card, Input, ScrollArea
- Use Tailwind utility classes for styling
- Design considerations:
  - User messages: right-aligned, blue/purple gradient background
  - AI messages: left-aligned, gray/slate background
  - Clear visual distinction
  - Responsive design (mobile-first)
  - Gaming theme: dark mode with vibrant accents (neon blue, purple, green)
  - Smooth animations and transitions
- Add GamerHub branding with custom logo area

### 6.3 Chat State Management
**Commit:** `feat: implement chat state management`
- Create Svelte stores for:
  - `messages` (array of message objects)
  - `isLoading` (boolean)
  - `sessionId` (string, persisted to localStorage)
  - `error` (string | null)
- Implement auto-scroll to latest message
- Add message timestamp formatting

### 6.4 API Integration
**Commit:** `feat: integrate frontend with backend API`
- Create `lib/api/chat.ts` with:
  - `sendMessage(message, sessionId)`
  - `loadHistory(sessionId)`
- Implement fetch with error handling
- Add retry logic for network errors
- Store sessionId in localStorage

### 6.5 UX Enhancements
**Commit:** `feat: add UX enhancements to chat`
- Disable send button while loading
- Show "Agent is typing..." indicator
- Add Enter key to send (Shift+Enter for new line)
- Validate empty messages on client-side
- Show error messages in UI
- Add message delivery status indicators
- Add welcome message on first load

---

## Phase 7: Documentation & Deployment

### 7.1 Comprehensive README
**Commit:** `docs: add comprehensive README`
- Project overview
- Architecture diagram (using Mermaid)
- Tech stack details
- Local development setup:
  - Prerequisites
  - Environment variables
  - Database setup
  - Running backend
  - Running frontend
- API documentation
- LLM integration notes
- Trade-offs section

### 7.2 API Documentation
**Commit:** `docs: add API documentation`
- Document all endpoints with examples
- Request/response schemas
- Error codes and meanings
- Rate limiting details

### 7.3 Environment Configuration
**Commit:** `docs: add environment setup guide`
- Update `.env.example` files
- Document all environment variables:
  - `DATABASE_URL`
  - `REDIS_URL`
  - `OPENAI_API_KEY`
  - `PORT`
  - `NODE_ENV`
  - `CORS_ORIGIN`

### 7.4 Deployment - Backend
**Commit:** `deploy: prepare backend for production`
- Choose platform: Render or Railway
- Add `Procfile` or deployment config
- Configure production environment variables
- Set up PostgreSQL instance
- Set up Redis instance
- Deploy and test

### 7.5 Deployment - Frontend
**Commit:** `deploy: deploy frontend to Vercel`
- Configure SvelteKit for Vercel
- Set up environment variables (API URL)
- Deploy to Vercel
- Test production build

### 7.6 Final Touches
**Commit:** `docs: add architecture notes and trade-offs`
- Add architecture documentation:
  - Layered architecture explanation
  - Service separation rationale
  - Extensibility points for WhatsApp/IG
- Document trade-offs:
  - Using Redis for session cache vs DB-only
  - Token limits and cost management
  - Conversation history limits
- "If I had more time..." section:
  - User authentication
  - Admin dashboard
  - Analytics and monitoring
  - A/B testing for prompts
  - Multi-language support beyond English

---

## Summary of Deliverables

### Git Commits
- **~30 commits** across 7 phases
- Each commit is atomic and trackable
- Clear commit messages following conventional commits

### Key Features
✅ Full-stack TypeScript application  
✅ Real-time chat UI with UX niceties  
✅ PostgreSQL persistence  
✅ Redis caching  
✅ OpenAI LLM integration  
✅ Gaming accessories store FAQ (USA, India, Japan, China)  
✅ Comprehensive error handling  
✅ Input validation and security  
✅ Rate limiting  
✅ Conversation history  
✅ Production deployment  
✅ Complete documentation  

### Extensibility Points
- **New Channels**: Abstract `MessageService` can be extended for WhatsApp, Instagram
- **LLM Providers**: `LLMService` interface can support Claude, Gemini
- **Multi-tenancy**: Schema supports metadata for multiple stores
- **Analytics**: Message metadata field ready for tracking
- **Tools/Actions**: LLM service ready for function calling

---

## Estimated Timeline
- **Phase 1-2**: 3-4 hours (Setup & DB)
- **Phase 3-4**: 3-4 hours (Redis & LLM)
- **Phase 5**: 4-5 hours (Backend API)
- **Phase 6**: 6-7 hours (Frontend with Tailwind & shadcn)
- **Phase 7**: 3-4 hours (Docs & Deploy)

**Total: ~20-24 hours** (comfortable weekend timeframe)

---

## Next Steps
Once this plan is approved:
1. Start with Phase 1.1 - Initialize project structure
2. Maintain frequent, meaningful commits
3. Test each phase before moving to next
4. Document as we build
