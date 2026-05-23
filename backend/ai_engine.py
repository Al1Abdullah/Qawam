import os
import json
import httpx
import asyncio
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

GROQ_MODEL = "llama-3.3-70b-versatile"
OPENROUTER_MODEL = "deepseek/deepseek-r1"

async def _call_llm(system_prompt: str, user_prompt: str):
    """Calls Groq as primary and OpenRouter as fallback."""
    
    # 1. Try Groq
    if GROQ_API_KEY:
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    GROQ_URL,
                    headers={
                        "Authorization": f"Bearer {GROQ_API_KEY}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": GROQ_MODEL,
                        "messages": [
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": user_prompt},
                        ],
                        "response_format": {"type": "json_object"},
                    },
                    timeout=30.0,
                )
                if response.status_code == 200:
                    return response.json()["choices"][0]["message"]["content"]
                else:
                    print(f"Groq failed with status {response.status_code}: {response.text}")
        except Exception as e:
            print(f"Groq error: {e}")
    else:
        print("GROQ_API_KEY not found.")

    # 2. Fallback to OpenRouter
    if OPENROUTER_API_KEY:
        print("Falling back to OpenRouter...")
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    OPENROUTER_URL,
                    headers={
                        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                        "Content-Type": "application/json",
                        "HTTP-Referer": "https://qawam.app",
                        "X-Title": "Qawam",
                    },
                    json={
                        "model": OPENROUTER_MODEL,
                        "messages": [
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": user_prompt},
                        ],
                    },
                    timeout=60.0,
                )
                if response.status_code == 200:
                    return response.json()["choices"][0]["message"]["content"]
                else:
                    print(f"OpenRouter failed with status {response.status_code}: {response.text}")
        except Exception as e:
            print(f"OpenRouter error: {e}")
    else:
        print("OPENROUTER_API_KEY not found.")

    return None

async def _get_json_response(system_prompt: str, user_prompt: str, retries=2):
    """Wrapper for JSON parsing with retry on failure."""
    for i in range(retries + 1):
        content = await _call_llm(system_prompt, user_prompt)
        if content:
            try:
                # Basic cleaning for common LLM markdown formatting
                cleaned_content = content.strip()
                if cleaned_content.startswith("```json"):
                    cleaned_content = cleaned_content.split("```json")[1].split("```")[0].strip()
                elif cleaned_content.startswith("```"):
                    cleaned_content = cleaned_content.split("```")[1].split("```")[0].strip()
                
                return json.loads(cleaned_content)
            except Exception as e:
                print(f"JSON parse error (attempt {i+1}/{retries+1}): {e}")
                if i == retries:
                    raise e
        else:
            if i == retries:
                raise Exception("LLM call failed after all retries")
    return None

async def generate_meal_plan(user_profile: dict, schedule: dict, kitchen_items: dict, date_str: str):
    # Calculate calorie target (Ectomorph bulking surplus)
    weight = user_profile.get("weight_kg", 60)
    height = user_profile.get("height_cm", 170)
    age = user_profile.get("age", 25)
    
    # BMR = 10 * weight + 6.25 * height - 5 * age + 5
    bmr = 10 * weight + 6.25 * height - 5 * age + 5
    # TDEE = BMR * 1.375 (light activity)
    tdee = bmr * 1.375
    # Target = TDEE + 500 calories (surplus for gaining)
    target_calories = int(tdee + 500)
    # Protein Target = weight_kg * 2.2 grams
    target_protein = int(weight * 2.2)

    system_prompt = f"""
You are a nutrition coach specializing in Pakistani/South Asian diets 
for ectomorph body types trying to gain weight.

User profile:
- Weight: {weight}kg, Height: {height}cm
- Body type: ectomorph
- Calorie target: {target_calories} per day
- Protein target: {target_protein}g per day
- Schedule: awake {schedule.get('wake_time')}, university {schedule.get('university_start')} to {schedule.get('university_end')}
- Available kitchen items today: {kitchen_items}

Rules:
1. ONLY suggest meals using available kitchen items
2. Respect the university schedule — no heavy meals before university
3. Suggest simple meals a student can make in under 15 minutes
4. Give exact quantities (e.g., "2 eggs", "1 roti", "1 cup lobia")
5. Include estimated calories for each meal
6. Return valid JSON only

Return format:
{{
  "meals": [
    {{
      "time": "11:30",
      "name": "Breakfast",
      "items": ["2 eggs fried", "1 roti", "1 cup chai"],
      "calories": 420,
      "instructions": "Fry eggs in minimal oil, eat with roti"
    }}
  ],
  "total_calories": {target_calories},
  "protein_est": {target_protein},
  "tips": "Eat before 1:30pm before university starts"
}}
"""
    user_prompt = f"Generate a meal plan for {date_str} based on my profile and kitchen items."
    
    try:
        return await _get_json_response(system_prompt, user_prompt)
    except Exception as e:
        print(f"Final failure in generate_meal_plan: {e}")
        # Default fallback plan if AI fails completely
        return {
            "meals": [
                {
                    "time": "09:00",
                    "name": "Quick Breakfast",
                    "items": ["2 boiled eggs", "1 roti"],
                    "calories": 400,
                    "instructions": "Boil eggs, serve with roti."
                }
            ],
            "total_calories": target_calories,
            "protein_est": target_protein,
            "tips": "AI service temporarily unavailable. Using default plan."
        }

async def generate_workout_plan(user_profile: dict, available_minutes: int, energy_level: str):
    weight = user_profile.get("weight_kg", 60)
    height = user_profile.get("height_cm", 170)

    system_prompt = f"""
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
{{
  "workout_name": "Upper Body Push",
  "duration_minutes": 25,
  "exercises": [
    {{
      "name": "Push-ups",
      "sets": 3,
      "reps": "8-10",
      "rest_seconds": 60,
      "tip": "Keep your back straight"
    }}
  ],
  "cooldown": "5 min light stretching"
}}
"""
    user_prompt = f"Generate a {available_minutes} minute workout plan for an energy level of {energy_level}."

    try:
        return await _get_json_response(system_prompt, user_prompt)
    except Exception as e:
        print(f"Final failure in generate_workout_plan: {e}")
        return {
            "workout_name": "Simple Home Workout",
            "duration_minutes": 20,
            "exercises": [
                {
                    "name": "Push-ups",
                    "sets": 3,
                    "reps": "10",
                    "rest_seconds": 60,
                    "tip": "Keep form"
                },
                {
                    "name": "Squats",
                    "sets": 3,
                    "reps": "15",
                    "rest_seconds": 60,
                    "tip": "Chest up"
                }
            ],
            "cooldown": "Stretch"
        }
