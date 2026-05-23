# Qawam — Personal Body Coach

Qawam is an AI-powered fitness and nutrition coach designed for ectomorphs and South Asian users to gain weight and build muscle. It generates personalized plans based on what's in your kitchen and your daily schedule.

## Features

- **AI-Powered Nutrition**: Generates meal plans using only available kitchen items (Groq + OpenRouter fallback).
- **Home Workouts**: Personalized muscle-building routines requiring zero equipment.
- **Schedule-Aware**: Plans respect your university or work hours.
- **Progress Tracking**: Visualize weight gain and logging streaks.

## Tech Stack

- **Backend**: FastAPI (Python 3.11)
- **Frontend**: Flutter (Mobile + Web)
- **Database**: Supabase (PostgreSQL)
- **AI**: Groq (Llama 3) & OpenRouter (DeepSeek)
- **Deployment**: Railway (Backend)

## Environment Variables

Create a `.env` file in the root directory:

| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Your Supabase Project URL |
| `SUPABASE_KEY` | Your Supabase Anon Key |
| `GROQ_API_KEY` | Groq API Key (Primary LLM) |
| `OPENROUTER_API_KEY` | OpenRouter API Key (Fallback LLM) |

## Local Development

### Prerequisites
- Docker & Docker Compose
- Flutter SDK (for frontend)

### Running the Backend
```bash
docker-compose up --build
```
The API will be available at `http://localhost:8000`.

### Running the Frontend
```bash
cd frontend
flutter pub get
flutter run
```

## Deployment

### Backend (Railway)
1. Connect your GitHub repository to [Railway](https://railway.app).
2. The `railway.toml` file will automatically configure the build and deployment.
3. Add your environment variables in the Railway dashboard.

### Database
Run the SQL in `backend/schema.sql` inside the Supabase SQL Editor.

## License
MIT
