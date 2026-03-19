-- 用户表 (users)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    plan VARCHAR(20) DEFAULT 'free' CHECK (plan IN ('free', 'premium')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 权限设置
GRANT SELECT ON users TO anon;
GRANT ALL PRIVILEGES ON users TO authenticated;

-- 视频表 (videos)
CREATE TABLE videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    title VARCHAR(500) NOT NULL,
    url VARCHAR(1000),
    file_path VARCHAR(1000),
    duration INTEGER,
    status VARCHAR(50) DEFAULT 'processing',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 权限设置
GRANT SELECT ON videos TO anon;
GRANT ALL PRIVILEGES ON videos TO authenticated;

-- 字幕表 (subtitles)
CREATE TABLE subtitles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    video_id UUID REFERENCES videos(id),
    start_time INTEGER NOT NULL,
    end_time INTEGER NOT NULL,
    english_text TEXT NOT NULL,
    chinese_text TEXT,
    sequence INTEGER NOT NULL
);

-- 权限设置
GRANT SELECT ON subtitles TO anon;
GRANT ALL PRIVILEGES ON subtitles TO authenticated;

-- 词汇表 (vocabulary)
CREATE TABLE vocabulary (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    video_id UUID REFERENCES videos(id),
    word VARCHAR(100) NOT NULL,
    phonetic VARCHAR(200),
    part_of_speech VARCHAR(20),
    definition TEXT NOT NULL,
    difficulty INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 权限设置
GRANT SELECT ON vocabulary TO anon;
GRANT ALL PRIVILEGES ON vocabulary TO authenticated;

-- 短语表 (phrases)
CREATE TABLE phrases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    video_id UUID REFERENCES videos(id),
    phrase VARCHAR(255) NOT NULL,
    meaning VARCHAR(255) NOT NULL,
    explanation TEXT,
    usage TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 权限设置
GRANT SELECT ON phrases TO anon;
GRANT ALL PRIVILEGES ON phrases TO authenticated;

-- 学习会话表 (learning_sessions)
CREATE TABLE learning_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    video_id UUID REFERENCES videos(id),
    current_stage INTEGER DEFAULT 1,
    completed BOOLEAN DEFAULT FALSE,
    total_duration INTEGER DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 权限设置
GRANT SELECT ON learning_sessions TO anon;
GRANT ALL PRIVILEGES ON learning_sessions TO authenticated;

-- 学习进度表 (progress)
CREATE TABLE progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES learning_sessions(id),
    stage INTEGER NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    duration INTEGER DEFAULT 0,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 权限设置
GRANT SELECT ON progress TO anon;
GRANT ALL PRIVILEGES ON progress TO authenticated;
