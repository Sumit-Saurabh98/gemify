# GamerHub AI Live Chat Agent

An AI-powered customer support chat application for GamerHub - an online gaming accessories store operating in USA, India, Japan, and China.

## 🎮 Project Overview

This is a full-stack TypeScript application that provides intelligent customer support through an AI-powered chat interface. Built as part of the Spur Founding Full-Stack Engineer take-home assignment.

## 🛠️ Tech Stack

- **Backend**: Node.js + TypeScript + Express
- **Frontend**: SvelteKit + Tailwind CSS + shadcn/ui
- **Database**: PostgreSQL
- **Cache**: Redis
- **LLM**: OpenAI GPT-4

## 📁 Project Structure

```
gemify/
├── backend/          # Node.js + TypeScript backend
├── frontend/         # SvelteKit frontend
├── README.md         # This file
└── implementation.md # Development plan
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL (running on localhost:5432)
- Redis (running on localhost:6379)
- OpenAI API Key

### Environment Setup

1. **Backend Setup**:
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your configuration
   npm install
   npm run dev
   ```

2. **Frontend Setup**:
   ```bash
   cd frontend
   cp .env.example .env
   # Edit .env with your configuration
   npm install
   npm run dev
   ```

### Database Setup

```bash
cd backend
npm run migrate
npm run seed
```

## 🌍 Supported Regions

- 🇺🇸 **USA** - USD currency
- 🇮🇳 **India** - INR currency
- 🇯🇵 **Japan** - JPY currency
- 🇨🇳 **China** - CNY currency

## 📝 Features

✅ Real-time AI chat interface  
✅ Conversation history persistence  
✅ Redis caching for performance  
✅ Region-specific FAQ support  
✅ Gaming accessories product knowledge  
✅ Error handling and validation  
✅ Rate limiting and security  

## 🏗️ Development Status

See [implementation.md](./implementation.md) for the detailed development plan.

## 📚 Documentation

- [API Documentation](./docs/API.md) _(coming soon)_
- [Architecture Overview](./docs/ARCHITECTURE.md) _(coming soon)_

## 📄 License

MIT

---

**Built with ❤️ for Spur**
