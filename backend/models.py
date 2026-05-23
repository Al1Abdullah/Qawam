from pydantic import BaseModel
from typing import List, Dict, Optional
from datetime import date, datetime

class UserCreate(BaseModel):
    name: str
    age: int
    height_cm: float
    weight_kg: float
    body_type: str
    goal: str
    activity_level: str

class UserProfile(BaseModel):
    name: str
    age: int
    height_cm: float
    weight_kg: float
    body_type: str
    goal: str
    activity_level: str

class Schedule(BaseModel):
    wake_time: str
    sleep_time: str
    university_start: Optional[str] = None
    university_end: Optional[str] = None
    meal_times: List[str] = []

class KitchenInventory(BaseModel):
    items: Dict[str, bool]

class DailyLog(BaseModel):
    date: date
    weight_kg: float
    meals_eaten: List[Dict] = []
    workout_done: bool = False
    calories_est: int = 0
    notes: Optional[str] = None

class MealPlan(BaseModel):
    date: date
    meals: List[Dict]
    total_calories: int
    protein_target: int
    generated_at: datetime = datetime.now()

class WorkoutPlan(BaseModel):
    date: date
    workout_name: str
    duration_minutes: int
    exercises: List[Dict]
    cooldown: str
    generated_at: datetime = datetime.now()
