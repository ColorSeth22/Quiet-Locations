-- QuietLocations PostgreSQL Database Schema
-- Generated: 2025-11-06

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table
CREATE TABLE Users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    display_name TEXT,
    reputation_score INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Locations table
CREATE TABLE Locations (
    location_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    address TEXT,
    description TEXT,
    created_by UUID REFERENCES Users(user_id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tags table
CREATE TABLE Tags (
    tag_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL
);

-- LocationTags junction table (many-to-many between Locations and Tags)
CREATE TABLE LocationTags (
    location_id UUID REFERENCES Locations(location_id) ON DELETE CASCADE,
    tag_id UUID REFERENCES Tags(tag_id) ON DELETE CASCADE,
    PRIMARY KEY (location_id, tag_id)
);

-- Ratings table
CREATE TABLE Ratings (
    rating_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES Users(user_id) ON DELETE CASCADE,
    location_id UUID NOT NULL REFERENCES Locations(location_id) ON DELETE CASCADE,
    quietness_score INTEGER NOT NULL CHECK (quietness_score >= 1 AND quietness_score <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Favorites table
CREATE TABLE Favorites (
    user_id UUID NOT NULL REFERENCES Users(user_id) ON DELETE CASCADE,
    location_id UUID NOT NULL REFERENCES Locations(location_id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_id, location_id)
);

-- Indexes for better query performance
CREATE INDEX idx_locations_created_by ON Locations(created_by);
CREATE INDEX idx_locations_coords ON Locations(latitude, longitude);
CREATE INDEX idx_ratings_user_id ON Ratings(user_id);
CREATE INDEX idx_ratings_location_id ON Ratings(location_id);
CREATE INDEX idx_location_tags_location ON LocationTags(location_id);
CREATE INDEX idx_location_tags_tag ON LocationTags(tag_id);
CREATE INDEX idx_favorites_user ON Favorites(user_id);
CREATE INDEX idx_favorites_location ON Favorites(location_id);
