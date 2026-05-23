# QAWAM — Personal Body Coach
## Complete Project Architecture & Gemini CLI Build Guide

---

## What This App Does

Qawam is a cross-platform AI fitness and nutrition coach built specifically for:
- Skinny/ectomorph body types who struggle to gain weight
- Pakistani/South Asian users with local food patterns
- People with no gym access or budget constraints
- Students with irregular schedules

It asks you what is in your kitchen, knows your body, your schedule, and tells you exactly what to eat and do today. No generic plans. No gym required.

---

## Folder Structure (Simple, Clean)

```
qawam/
├── backend/
│   ├── main.py
│   ├── routes.py
│   ├── ai_engine.py
│   ├── models.py
│   └── database.py
├── frontend/
│   ├── lib/
│   │   ├── main.dart
│   │   ├── screens/
│   │   │   ├── onboarding_screen.dart
│   │   │   ├── home_screen.dart
│   │   │   ├── meal_screen.dart
│   │   │   ├── workout_screen.dart
│   │   │   └── progress_screen.dart
│   │   ├── services/
│   │   │   ├── api_service.dart
│   │   │   └── storage_service.dart
│   │   └── widgets/
│   │       ├── meal_card.dart
│   │       ├── workout_card.dart
│   │       └── progress_card.dart
│   └── pubspec.yaml
├── .env.example
├── docker-compose.yml
├── requirements.txt
└── PROMPTS.md
```

**Rule:** Max 5 files per folder. Simple. No over-engineering.

---

## Tech Stack (All Free)

| Layer | Tool | Why |
|---|---|---|
| Frontend | Flutter | Android + iOS + Web from one codebase |
| Backend | FastAPI (Python) | Fast, simple, AI-friendly |
| Database | Supabase (free tier) | Auth + PostgreSQL, no setup needed |
| AI | Groq API (free) | Fast LLM inference, Llama 3 |
| Deployment | Railway (free tier) | One-click backend deploy |
| Frontend Deploy | Vercel (free) | Flutter web deploy |

---

## Database Schema

### Table: users
```sql
id          UUID PRIMARY KEY
name        TEXT
age         INTEGER
height_cm   FLOAT
weight_kg   FLOAT
body_type   TEXT        -- ectomorph / mesomorph / endomorph
goal        TEXT        -- gain_weight / lose_weight / maintain
activity    TEXT        -- sedentary / light / moderate
created_at  TIMESTAMP
```

### Table: schedules
```sql
id              UUID PRIMARY KEY
user_id         UUID REFERENCES users(id)
wake_time       TEXT        -- "11:00"
sleep_time      TEXT        -- "02:00"
university_start TEXT       -- "14:00"
university_end  TEXT        -- "21:30"
meal_times      TEXT[]      -- ["11:30", "13:30", "22:00"]
```

### Table: kitchen_inventory
```sql
id          UUID PRIMARY KEY
user_id     UUID REFERENCES users(id)
items       JSONB       -- {"roti": true, "eggs": true, "lobia": true, ...}
updated_at  TIMESTAMP
```

### Table: daily_logs
```sql
id              UUID PRIMARY KEY
user_id         UUID REFERENCES users(id)
date            DATE
weight_kg       FLOAT
meals_eaten     JSONB
workout_done    BOOLEAN
calories_est    INTEGER
notes           TEXT
created_at      TIMESTAMP
```

### Table: ai_plans
```sql
id              UUID PRIMARY KEY
user_id         UUID REFERENCES users(id)
date            DATE
meal_plan       JSONB
workout_plan    JSONB
calorie_target  INTEGER
protein_target  INTEGER
generated_at    TIMESTAMP
```

---

## API Endpoints

### Auth
```
POST /auth/register      -- register new user
POST /auth/login         -- login, returns token
```

### Onboarding
```
POST /onboarding/profile     -- save body stats
POST /onboarding/schedule    -- save university + sleep schedule
POST /onboarding/kitchen     -- save kitchen inventory (MCQ answers)
```

### Daily Plan
```
GET  /plan/today             -- get today's meal + workout plan
POST /plan/regenerate        -- regenerate if user didn't like it
```

### Logging
```
POST /log/meal               -- log what you actually ate
POST /log/workout            -- log workout done/skipped
POST /log/weight             -- log today's weight
GET  /log/history            -- get last 30 days
```

### Kitchen
```
PUT  /kitchen/update         -- update what's available today
GET  /kitchen/inventory      -- get current inventory
```

---

## AI Engine Logic

### Calorie Target Calculation
```
For ectomorph gaining weight:
BMR = 10 * weight + 6.25 * height - 5 * age + 5
TDEE = BMR * activity_multiplier
Target = TDEE + 500 calories (surplus for gaining)
Protein Target = weight_kg * 2.2 grams
```

### Meal Plan Generation (Groq LLM)

System prompt sent to Groq:
```
You are a nutrition coach specializing in Pakistani/South Asian diets 
for ectomorph body types trying to gain weight.

User profile:
- Weight: {weight}kg, Height: {height}cm
- Body type: ectomorph
- Calorie target: {calories} per day
- Protein target: {protein}g per day
- Schedule: awake {wake_time}, university {uni_start} to {uni_end}
- Available kitchen items today: {kitchen_items}

Rules:
1. ONLY suggest meals using available kitchen items
2. Respect the university schedule — no heavy meals before university
3. Suggest simple meals a student can make in under 15 minutes
4. Give exact quantities (e.g., "2 eggs", "1 roti", "1 cup lobia")
5. Include estimated calories for each meal
6. Return valid JSON only

Return format:
{
  "meals": [
    {
      "time": "11:30",
      "name": "Breakfast",
      "items": ["2 eggs fried", "1 roti", "1 cup chai"],
      "calories": 420,
      "instructions": "Fry eggs in minimal oil, eat with roti"
    }
  ],
  "total_calories": 2800,
  "tips": "Eat before 1:30pm before university starts"
}
```

### Workout Plan Generation (Groq LLM)

System prompt:
```
You are a fitness coach for skinny ectomorph males trying to build muscle 
at home with no gym equipment.

User: {weight}kg, {height}cm, ectomorph
Goal: gain muscle and weight
Equipment: none (home only)
Time available: {available_minutes} minutes
Energy level today: {energy_level}

Rules:
1. Home exercises only — pushups, squats, lunges, planks, dips
2. Keep it under 30 minutes — student schedule is tight
3. Focus on compound movements for maximum muscle stimulation
4. Include sets, reps, rest time
5. Return valid JSON only

Return format:
{
  "workout_name": "Upper Body Push",
  "duration_minutes": 25,
  "exercises": [
    {
      "name": "Push-ups",
      "sets": 3,
      "reps": "8-10",
      "rest_seconds": 60,
      "tip": "Keep your back straight"
    }
  ],
  "cooldown": "5 min light stretching"
}
```

---

## Kitchen Inventory — MCQ System

When user opens app for the day, they answer simple MCQs:

**Screen 1 — Grains & Bread**
- [ ] Roti / Atta (flour)
- [ ] Rice (chawal)
- [ ] Bread (sliced)
- [ ] Paratha

**Screen 2 — Protein**
- [ ] Eggs
- [ ] Chicken
- [ ] Lobia (black-eyed beans)
- [ ] Daal (lentils)
- [ ] Canned tuna
- [ ] Paneer / Cheese

**Screen 3 — Vegetables**
- [ ] Aloo (potato)
- [ ] Pyaz (onion)
- [ ] Tamatar (tomato)
- [ ] Saag (spinach)
- [ ] Karela
- [ ] Mixed sabzi

**Screen 4 — Dairy & Extras**
- [ ] Milk
- [ ] Dahi (yogurt)
- [ ] Butter / Ghee
- [ ] Peanut butter
- [ ] Banana
- [ ] Any fruit

This takes 30 seconds. AI uses only checked items.

---

## Flutter Screens

### 1. Onboarding Screen
- Name, age, height, weight inputs
- Body type selector (with simple descriptions, not medical terms)
- Goal selector: "I want to gain weight and build muscle"
- University schedule input
- Sleep/wake time input
- Kitchen inventory MCQ

### 2. Home Screen (Daily Dashboard)
- Good morning/afternoon/evening greeting with name
- Today's calorie target progress bar
- "Your meal plan for today" card
- "Today's workout" card
- Quick log buttons: "I ate this" / "I worked out"
- Current weight vs target weight

### 3. Meal Screen
- Full meal plan for the day
- Each meal as a card: time, food items, calories, simple instructions
- "Mark as eaten" button per meal
- "Swap this meal" button — regenerates just that meal

### 4. Workout Screen
- Today's workout card
- Exercise list with sets/reps
- Timer for rest periods
- "Done" / "Skipped today" buttons

### 5. Progress Screen
- Weight graph (last 30 days)
- Streak counter (days logged)
- Weekly summary: avg calories, workouts done
- Simple motivational message based on progress

---

## Gemini CLI Prompts (Run These One by One)

### PROMPT 1 — Backend Foundation
```
Create a FastAPI backend for a fitness app called Qawam with this exact structure:

backend/
  main.py
  routes.py
  ai_engine.py
  models.py
  database.py

In main.py:
- Setup FastAPI app with CORS enabled for all origins
- Include router from routes.py
- Add health check GET / that returns {"status": "ok", "app": "Qawam"}
- Load environment variables from .env

In models.py:
- Pydantic models for: UserCreate, UserProfile, Schedule, KitchenInventory, DailyLog, MealPlan, WorkoutPlan
- UserProfile has: name, age, height_cm, weight_kg, body_type, goal, activity_level
- Schedule has: wake_time, sleep_time, university_start, university_end
- KitchenInventory has: items as dict of string to boolean
- DailyLog has: date, weight_kg, meals_eaten list, workout_done bool, calories_est int

In database.py:
- Supabase client setup using SUPABASE_URL and SUPABASE_KEY from env
- Functions: get_user(user_id), save_user(data), save_schedule(user_id, data), save_kitchen(user_id, data), save_log(user_id, data), get_logs(user_id, days=30), save_plan(user_id, data), get_today_plan(user_id)

In routes.py:
- POST /auth/register — save user profile, return user_id
- POST /onboarding/profile — save body stats
- POST /onboarding/schedule — save schedule
- POST /onboarding/kitchen — save kitchen inventory
- GET /plan/today — get today's AI plan (call ai_engine if no plan exists for today)
- POST /plan/regenerate — force regenerate today's plan
- PUT /kitchen/update — update kitchen inventory
- POST /log/weight — log today weight
- POST /log/meal — log meal eaten
- POST /log/workout — log workout done or skipped
- GET /log/history — return last 30 days logs

In ai_engine.py: leave empty with placeholder functions for now, just return mock JSON

Create requirements.txt with: fastapi, uvicorn, supabase, python-dotenv, pydantic, httpx
Create .env.example with: SUPABASE_URL=, SUPABASE_KEY=, GROQ_API_KEY=
```

---

### PROMPT 2 — AI Engine
```
In backend/ai_engine.py, implement two functions using the Groq API:

1. generate_meal_plan(user_profile, schedule, kitchen_items, date) -> dict
2. generate_workout_plan(user_profile, available_minutes, energy_level) -> dict

For generate_meal_plan:
- Calculate calorie target: for ectomorph use BMR formula (10*weight + 6.25*height - 5*age + 5) * 1.375 (light activity) + 500 for bulking surplus
- Calculate protein target: weight_kg * 2.2
- Build a system prompt that tells Groq:
  * User is Pakistani ectomorph trying to gain weight
  * Only use available kitchen items from kitchen_items dict
  * Respect university schedule (no heavy meals before university_start)
  * Suggest meals with exact quantities and cooking instructions
  * Return ONLY valid JSON with this structure: {"meals": [{"time": str, "name": str, "items": list, "calories": int, "instructions": str}], "total_calories": int, "protein_est": int, "tips": str}
- Call Groq API using httpx with model llama-3.1-8b-instant
- Parse JSON response and return

For generate_workout_plan:
- System prompt tells Groq:
  * User is ectomorph male, home workout only, no equipment
  * Keep under 30 minutes
  * Focus on compound movements: pushups, squats, lunges, planks, pike pushups, dips on chair
  * Include sets, reps, rest time per exercise
  * Return ONLY valid JSON: {"workout_name": str, "duration_minutes": int, "exercises": [{"name": str, "sets": int, "reps": str, "rest_seconds": int, "tip": str}], "cooldown": str}
- Call Groq API and parse response

Add error handling: if Groq fails, return a hardcoded default plan as fallback

Update routes.py GET /plan/today to actually call these functions and save to database
```

---

### PROMPT 3 — Flutter App Setup
```
Create a Flutter app called qawam in the frontend/ folder.

In pubspec.yaml add dependencies:
- http: ^1.2.0
- shared_preferences: ^2.2.2
- fl_chart: ^0.68.0
- provider: ^6.1.2

Create frontend/lib/main.dart:
- MaterialApp with dark theme
- Primary color: #2ECC71 (green)
- Background: #0A0A0A (near black)
- Default font: system default
- Routes: /onboarding, /home, /meals, /workout, /progress
- Check shared_preferences on startup: if user_id exists go to /home else go to /onboarding

Create frontend/lib/services/api_service.dart:
- Base URL from const String baseUrl pointing to localhost:8000 for now
- Functions using http package:
  * registerUser(Map data) -> String userId
  * saveSchedule(String userId, Map data) -> bool
  * saveKitchen(String userId, Map data) -> bool
  * getTodayPlan(String userId) -> Map
  * regeneratePlan(String userId) -> Map
  * updateKitchen(String userId, Map data) -> bool
  * logWeight(String userId, double weight) -> bool
  * logMeal(String userId, Map meal) -> bool
  * logWorkout(String userId, bool done) -> bool
  * getHistory(String userId) -> List
- Add Authorization header using stored token

Create frontend/lib/services/storage_service.dart:
- Using shared_preferences
- Functions: saveUserId, getUserId, saveUserName, getUserName, saveOnboardingDone, isOnboardingDone, clearAll
```

---

### PROMPT 4 — Onboarding Screen
```
Create frontend/lib/screens/onboarding_screen.dart

This is a multi-step onboarding flow with 5 pages using a PageView widget:

Page 1 — Welcome & Basic Info:
- App name "Qawam" in big green text
- Tagline: "Built for you. Not for everyone."
- TextFields for: Full Name, Age
- Sliders for: Height (150-200cm), Current Weight (40-120kg)
- Dark card design, green accents

Page 2 — Body Type Selection:
- Title: "What best describes you?"
- 3 selection cards with simple icons:
  * "Skinny & Hard to gain weight" -> ectomorph
  * "Average build" -> mesomorph  
  * "Gain weight easily" -> endomorph
- Selected card highlights in green
- Small description under each card in simple words

Page 3 — Your Goal:
- Title: "What do you want?"
- 3 cards:
  * "Gain weight & build muscle" 
  * "Lose fat & get lean"
  * "Stay fit & maintain"
- Single select, green highlight on selection

Page 4 — Your Schedule:
- Title: "Tell me your day"
- Time pickers for: Wake up time, Sleep time
- Time pickers for: University/work start, University/work end
- If no university, checkbox "I don't have fixed schedule"

Page 5 — Kitchen Inventory MCQ:
- Title: "What's usually in your kitchen?"
- 4 sections as expandable cards: Grains, Protein, Vegetables, Dairy & Extras
- Checkboxes for each item (list from architecture doc)
- "All good, let's start" button at bottom

On final submit:
- Call api_service.registerUser with all collected data
- Save userId and userName to storage_service
- Navigate to /home

Show a loading indicator while saving. Show error snackbar if API fails.
```

---

### PROMPT 5 — Home Screen
```
Create frontend/lib/screens/home_screen.dart

Layout: ScrollView with these sections top to bottom:

1. Header:
- Greeting based on time: "Good morning Ali" / "Good afternoon" / "Good evening"
- Today's date
- Small settings icon top right (just navigates to a simple settings page for now)

2. Daily Calorie Progress Card:
- Dark card with green border
- "Today's Goal: 2800 cal"
- Progress bar showing calories logged vs target
- Text: "1200 / 2800 calories eaten"

3. Today's Meal Plan Card:
- Title "What to eat today"
- Show first 2 meals as preview
- "See full plan" button navigates to /meals
- Green accent colors

4. Today's Workout Card:
- Title "Today's workout"
- Workout name and duration
- "Start workout" button navigates to /workout
- If workout done today, show green checkmark instead

5. Quick Log Section:
- Row of 3 buttons:
  * "Log weight" — shows bottom sheet with weight input
  * "Update kitchen" — shows MCQ bottom sheet (same as onboarding page 5)
  * "I worked out" — marks workout as done for today

6. Bottom Navigation Bar:
- 4 tabs: Home, Meals, Workout, Progress
- Green active tab indicator

On screen load:
- Call api_service.getTodayPlan(userId) 
- Show loading skeleton while fetching
- If error, show "Tap to retry" card
```

---

### PROMPT 6 — Meal + Workout + Progress Screens
```
Create these 3 screens:

--- frontend/lib/screens/meal_screen.dart ---
- AppBar: "Today's Meals"
- List of meal cards, one per meal in the plan
- Each card shows:
  * Meal time (e.g. "11:30 AM — Breakfast")
  * List of food items with quantities
  * Estimated calories badge in green
  * Cooking instructions in small grey text
  * "Mark as eaten" button — calls api_service.logMeal, turns green when tapped
- Bottom: "Not happy with this plan?" button — calls regeneratePlan, shows loading, refreshes list
- Total calories and protein shown at top as a summary row

--- frontend/lib/screens/workout_screen.dart ---
- AppBar: "Today's Workout"  
- Workout name and total duration at top
- List of exercise cards:
  * Exercise name in bold
  * Sets x Reps in green
  * Rest time: "Rest 60 sec"
  * Tip in italic small text
- Cooldown section at bottom
- Big "I completed this workout" green button at bottom
  * Calls api_service.logWorkout(userId, true)
  * Shows confetti or success animation
  * Button turns grey with checkmark after tapping
- "Skip today" text button — calls logWorkout with false

--- frontend/lib/screens/progress_screen.dart ---
- AppBar: "My Progress"
- Weight chart using fl_chart LineChart:
  * X axis: last 14 days dates
  * Y axis: weight in kg
  * Green line, dark background
- Stats row below chart:
  * Starting weight
  * Current weight  
  * Change (+ or - with color)
- Streak card: "You've logged X days in a row 🔥"
- Weekly summary card:
  * Avg calories this week
  * Workouts completed this week out of 7
- All data loaded from api_service.getHistory(userId)
- Show loading skeleton while fetching
```

---

### PROMPT 7 — Docker + Deployment
```
Create deployment configuration for Qawam:

1. backend/Dockerfile:
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

2. docker-compose.yml at root:
services:
  backend:
    build: ./backend
    ports: ["8000:8000"]
    env_file: .env
    restart: unless-stopped

3. railway.toml at root:
[build]
builder = "dockerfile"
dockerfilePath = "backend/Dockerfile"
[deploy]
startCommand = "uvicorn main:app --host 0.0.0.0 --port 8000"
healthcheckPath = "/"

4. .github/workflows/ci.yml:
- Trigger on push to main
- Job: test backend
  * Setup Python 3.11
  * Install requirements
  * Run: python -c "from main import app; print('Build OK')"

5. frontend/lib/services/api_service.dart:
- Update baseUrl to use environment variable
- Add: static const String baseUrl = String.fromEnvironment('API_URL', defaultValue: 'http://localhost:8000');

6. README.md with:
- What Qawam is (2 sentences)
- Setup instructions
- Environment variables table
- How to run with docker-compose up
- How to deploy to Railway

After all files created, run:
docker-compose up --build
and confirm backend starts without errors.
```

---

## Environment Variables

Create a `.env` file with these (fill in your actual values):

```
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
GROQ_API_KEY=your_groq_api_key
```

Get these free from:
- Supabase: supabase.com → new project
- Groq: console.groq.com → API keys

---

## How to Build This Step by Step

### Setup (Do This First)

1. Create repo on GitHub named `qawam`
2. Open in GitHub Codespaces
3. In terminal run:
```bash
npm install -g @google/gemini-cli
pip install fastapi uvicorn supabase python-dotenv httpx pydantic
```
4. Run `gemini` and enter your Gemini API key
5. Paste PROMPT 1 and wait for it to finish
6. Push to GitHub: `git add . && git commit -m "backend foundation" && git push`
7. Paste PROMPT 2, wait, push
8. Continue with each prompt in order

### After Each Prompt
- Read what Gemini generated
- Test it quickly (for backend: `uvicorn main:app --reload`)
- Fix any obvious errors Gemini missed
- Push to GitHub
- Then paste next prompt

### Final Steps After All 7 Prompts
1. Create Supabase project, run the SQL schema from this doc
2. Create Groq account, get free API key
3. Deploy backend to Railway (connect GitHub repo)
4. Update Flutter baseUrl to Railway URL
5. Build Flutter APK: `flutter build apk --release`
6. Install on your phone and test

---

## What Recruiters See

When they open your GitHub:
- Clean simple codebase — not overengineered
- Real problem solved — not a todo app
- AI that reasons about personal context — not a generic chatbot
- Pakistani food dataset — shows cultural awareness and local thinking
- Production ready — Docker, CI/CD, deployed

When you explain it in interview:
> "I built this because I'm an ectomorph who struggled to gain weight. Generic fitness apps don't account for what food you actually have at home, your schedule, or your body type. So I built one that does — using Groq LLM to generate meal plans only from ingredients you actually have, and home workouts that fit inside a student schedule."

That story is real. That's the best kind.

---

## Summary

| Thing | Choice |
|---|---|
| Problem | Real — you lived it |
| Users | You + millions like you |
| Complexity | Simple — 7 prompts to build |
| AI depth | LLM reasoning + personalization |
| Stack | Production-grade but lean |
| Time to build | 3-4 weeks focused |
| Cost | Zero |

**Start with PROMPT 1. Build one prompt at a time. Test after each. Ship.**
