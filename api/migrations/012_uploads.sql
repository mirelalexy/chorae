-- Store Cloudinary image paths (v<version>/<public_id>), not full URLs.
-- Null means the app uses its default appearance.
ALTER TABLE users
    ADD COLUMN avatar_image text,  -- falls back to initials
    ADD COLUMN banner_image text;  -- falls back to a plain background

ALTER TABLE mixtapes
    ADD COLUMN cover_image text; -- falls back to a collage of album covers