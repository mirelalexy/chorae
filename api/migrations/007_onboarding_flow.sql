ALTER TABLE taste_items
    ADD COLUMN artist       text,      -- who made it, null for artists themselves
    ADD COLUMN cover_url    text;      -- album or song cover, null for artists