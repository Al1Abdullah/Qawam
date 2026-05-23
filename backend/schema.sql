-- QAWAM Database Schema

-- Table: users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT,
    age INTEGER,
    height_cm FLOAT,
    weight_kg FLOAT,
    body_type TEXT,        -- ectomorph / mesomorph / endomorph
    goal TEXT,             -- gain_weight / lose_weight / maintain
    activity TEXT,         -- sedentary / light / moderate
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: schedules
CREATE TABLE schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    wake_time TEXT,        -- "11:00"
    sleep_time TEXT,        -- "02:00"
    university_start TEXT,  -- "14:00"
    university_end TEXT,    -- "21:30"
    meal_times TEXT[]       -- ["11:30", "13:30", "22:00"]
);

-- Table: kitchen_inventory
CREATE TABLE kitchen_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    items JSONB,           -- {"roti": true, "eggs": true, "lobia": true, ...}
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: daily_logs
CREATE TABLE daily_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    date DATE DEFAULT CURRENT_DATE,
    weight_kg FLOAT,
    meals_eaten JSONB,
    workout_done BOOLEAN DEFAULT FALSE,
    calories_est INTEGER,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: ai_plans
CREATE TABLE ai_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    date DATE DEFAULT CURRENT_DATE,
    meal_plan JSONB,
    workout_plan JSONB,
    calorie_target INTEGER,
    protein_target INTEGER,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
