from fastapi import APIRouter, HTTPException, Depends
from typing import List
from datetime import date
from . import models, database, ai_engine

router = APIRouter()

@router.post("/auth/register")
async def register(user: models.UserCreate):
    try:
        res = database.save_user(user.dict())
        if not res:
            raise HTTPException(status_code=400, detail="Registration failed")
        return {"user_id": res["id"]}
    except Exception as e:
        print(f"ERROR in /auth/register: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

@router.post("/onboarding/profile")
async def save_profile(user_id: str, profile: models.UserProfile):
    # In a real app, we'd use the user_id from a token
    res = database.save_user(profile.dict()) # Simplification for now
    return res

@router.post("/onboarding/schedule")
async def save_schedule(user_id: str, schedule: models.Schedule):
    res = database.save_schedule(user_id, schedule.dict())
    return res

@router.post("/onboarding/kitchen")
async def save_kitchen(user_id: str, kitchen: models.KitchenInventory):
    res = database.save_kitchen(user_id, kitchen.dict())
    return res

@router.get("/plan/today")
async def get_today_plan(user_id: str):
    plan = database.get_today_plan(user_id)
    if not plan:
        # Generate new plan
        user = database.get_user(user_id)
        # We'd also need schedule and kitchen info
        # For now, using mock
        meal_plan = await ai_engine.generate_meal_plan({}, {}, {}, date.today().isoformat())
        workout_plan = await ai_engine.generate_workout_plan({}, 30, "normal")
        
        plan_data = {
            "date": date.today().isoformat(),
            "meal_plan": meal_plan,
            "workout_plan": workout_plan,
            "calorie_target": meal_plan["total_calories"],
            "protein_target": meal_plan.get("protein_est", 0)
        }
        plan = database.save_plan(user_id, plan_data)
    return plan

@router.post("/plan/regenerate")
async def regenerate_plan(user_id: str):
    meal_plan = await ai_engine.generate_meal_plan({}, {}, {}, date.today().isoformat())
    workout_plan = await ai_engine.generate_workout_plan({}, 30, "normal")
    
    plan_data = {
        "date": date.today().isoformat(),
        "meal_plan": meal_plan,
        "workout_plan": workout_plan,
        "calorie_target": meal_plan["total_calories"],
        "protein_target": meal_plan.get("protein_est", 0)
    }
    plan = database.save_plan(user_id, plan_data)
    return plan

@router.put("/kitchen/update")
async def update_kitchen(user_id: str, kitchen: models.KitchenInventory):
    res = database.save_kitchen(user_id, kitchen.dict())
    return res

@router.post("/log/weight")
async def log_weight(user_id: str, weight: float):
    res = database.save_log(user_id, {"date": date.today().isoformat(), "weight_kg": weight})
    return res

@router.post("/log/meal")
async def log_meal(user_id: str, meal: dict):
    # This would update today's log
    res = database.save_log(user_id, {"date": date.today().isoformat(), "meals_eaten": [meal]})
    return res

@router.post("/log/workout")
async def log_workout(user_id: str, done: bool):
    res = database.save_log(user_id, {"date": date.today().isoformat(), "workout_done": done})
    return res

@router.get("/log/history")
async def get_history(user_id: str):
    return database.get_logs(user_id)
