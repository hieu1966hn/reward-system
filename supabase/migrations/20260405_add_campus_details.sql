-- Migration to add details to the campuses table
ALTER TABLE campuses
ADD COLUMN address TEXT,
ADD COLUMN city TEXT,
ADD COLUMN district TEXT,
ADD COLUMN hotline TEXT,
ADD COLUMN map_link TEXT;
