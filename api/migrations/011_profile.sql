ALTER TABLE users
    ADD COLUMN about text,                              -- null until written
    ADD COLUMN genres text[] NOT NULL DEFAULT '{}';     -- up to three, in the order chosen

-- Allow users to have a favorite artist, album, and song.
ALTER TABLE taste_items ADD COLUMN is_favorite boolean NOT NULL DEFAULT false;
CREATE UNIQUE INDEX taste_items_one_favorite_per_kind ON taste_items (user_id, kind) WHERE is_favorite;