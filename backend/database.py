import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

url: str = os.environ.get("SUPABASE_URL", "")
key: str = os.environ.get("SUPABASE_KEY", "")
supabase: Client = create_client(url, key)

def get_user(user_id: str):
    response = supabase.table("users").select("*").eq("id", user_id).execute()
    return response.data[0] if response.data else None

def save_user(data: dict):
    response = supabase.table("users").insert(data).execute()
    return response.data[0] if response.data else None

def save_schedule(user_id: str, data: dict):
    data["user_id"] = user_id
    response = supabase.table("schedules").upsert(data).execute()
    return response.data[0] if response.data else None

def save_kitchen(user_id: str, data: dict):
    payload = {
        "user_id": user_id,
        "items": data["items"],
        "updated_at": "now()"
    }
    response = supabase.table("kitchen_inventory").upsert(payload).execute()
    return response.data[0] if response.data else None

def save_log(user_id: str, data: dict):
    data["user_id"] = user_id
    response = supabase.table("daily_logs").insert(data).execute()
    return response.data[0] if response.data else None

def get_logs(user_id: str, days: int = 30):
    response = supabase.table("daily_logs")\
        .select("*")\
        .eq("user_id", user_id)\
        .order("date", desc=True)\
        .limit(days)\
        .execute()
    return response.data

def save_plan(user_id: str, data: dict):
    data["user_id"] = user_id
    response = supabase.table("ai_plans").upsert(data).execute()
    return response.data[0] if response.data else None

def get_today_plan(user_id: str):
    from datetime import date
    today = date.today().isoformat()
    response = supabase.table("ai_plans")\
        .select("*")\
        .eq("user_id", user_id)\
        .eq("date", today)\
        .execute()
    return response.data[0] if response.data else None
