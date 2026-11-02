-- Postpone getting and storing profile pictures for artists.
-- Table is no longer needed for now, since that was its purpose.
-- Artists picked in onboarding flow are stored in taste_items table.
DROP TABLE artists;