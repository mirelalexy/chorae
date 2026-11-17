-- Add ways to give Rae a little direction.
ALTER TABLE users
    ADD COLUMN rae_note             text,      -- a few words about the user, read with every tape (null means empty)
    ADD COLUMN discovery_preference text       -- how familiar tapes should be (null means Rae may ask each time)
        CHECK (discovery_preference IN ('familiar', 'mix', 'fresh'));

-- Artists Rae should avoid unless explicitly requested.
CREATE TABLE avoided_artists (
    user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mbid        text NOT NULL,
    name        text NOT NULL,
    created_at  timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, mbid)
);