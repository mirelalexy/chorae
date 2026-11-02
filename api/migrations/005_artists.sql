CREATE TABLE artists (
    mbid                text PRIMARY KEY,
    name                text NOT NULL,
    country             text,
    image_url           text,
    image_checked_at    timestamptz,
    updated_at          timestamptz NOT NULL DEFAULT now()
);