CREATE TABLE users (
    id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email              text NOT NULL,
    password_hash      text NOT NULL,
    display_name       text NOT NULL,
    age_confirmed_at   timestamptz NOT NULL,
    created_at         timestamptz NOT NULL DEFAULT now()
);

-- One account per email, ignoring capital letters.
CREATE UNIQUE INDEX users_email_lower_idx ON users (lower(email));

-- Logins, one row per signed-in device. Logging out deletes the row.
CREATE TABLE sessions (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash    text NOT NULL UNIQUE,
    created_at    timestamptz NOT NULL DEFAULT now(),
    last_used_at  timestamptz NOT NULL DEFAULT now(),
    expires_at    timestamptz NOT NULL
);

-- What the user says they love: artists, songs and albums, each picked from MusicBrainz.
-- Name is kept so we can show it without asking MusicBrainz again.
CREATE TABLE taste_items (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    kind        text NOT NULL CHECK (kind IN ('artist', 'song', 'album')),
    mbid        text NOT NULL,                         -- artist, recording or release group ID
    name        text NOT NULL,
    created_at  timestamptz NOT NULL DEFAULT now(),
    UNIQUE (user_id, kind, mbid)
);

-- A cache of MusicBrainz recordings, so a song is only looked up once.
CREATE TABLE tracks (
    mbid          text PRIMARY KEY,
    title         text NOT NULL,
    artist        text NOT NULL,
    length_ms     integer,
    isrc          text,                                -- helps match the song in streaming services
    release_mbid  text,                                -- used to find cover art
    cover_url     text,
    fetched_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE mixtapes (
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title               text NOT NULL,
    origin              text NOT NULL CHECK (origin IN ('rae_generated', 'rae_curated')), -- user can build from a prompt (Rae generated) or remake a playlist they imported (Rae curated)
    current_version_id  uuid,                                                             -- set once version 1 exists
    share_slug          text NOT NULL UNIQUE,                                             -- the public link: /mixtape/<share_slug>
    created_at          timestamptz NOT NULL DEFAULT now(),
    updated_at          timestamptz NOT NULL DEFAULT now()
);

-- Every change makes a new version. Nothing is overwritten.
CREATE TABLE mixtape_versions (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    mixtape_id      uuid NOT NULL REFERENCES mixtapes(id) ON DELETE CASCADE,
    version_number  integer NOT NULL,
    source          text NOT NULL CHECK (source IN ('rae', 'feedback', 'user_edit')),
    prompt          text,
    answers         jsonb,                             -- the answers to Rae's questions
    feedback        text,                              -- what the user said was off, for later versions
    intro           text NOT NULL,
    is_story        boolean NOT NULL DEFAULT false,
    created_at      timestamptz NOT NULL DEFAULT now(),
    UNIQUE (mixtape_id, version_number)
);

ALTER TABLE mixtapes
    ADD CONSTRAINT mixtapes_current_version_fk
    FOREIGN KEY (current_version_id) REFERENCES mixtape_versions(id);

-- The sides of a mixtape: A, B, C...
CREATE TABLE version_sides (
    version_id  uuid NOT NULL REFERENCES mixtape_versions(id) ON DELETE CASCADE,
    position    integer NOT NULL,                      -- 0 for side A, 1 for side B...
    title       text NOT NULL,
    mood_line   text NOT NULL,
    PRIMARY KEY (version_id, position)
);

-- The tracks of a version, in order, with Rae's note.
CREATE TABLE version_tracks (
    version_id        uuid NOT NULL REFERENCES mixtape_versions(id) ON DELETE CASCADE,
    position          integer NOT NULL,                -- order across the whole mixtape
    side_position     integer NOT NULL,
    recording_mbid    text NOT NULL REFERENCES tracks(mbid),
    note              text NOT NULL,
    is_seed           boolean NOT NULL DEFAULT false,  -- one of the user's own picks
    PRIMARY KEY (version_id, position),
    FOREIGN KEY (version_id, side_position) REFERENCES version_sides(version_id, position)
);

-- One row per build request. The app polls it for progress.
CREATE TABLE generation_jobs (
    id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id            uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mixtape_id         uuid REFERENCES mixtapes(id) ON DELETE CASCADE,  -- set for feedback runs
    status             text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'drafting', 'matching', 'saving', 'done', 'failed')),
    input              jsonb NOT NULL,                                  -- prompt, answers, seeds, length, story
    tracks_total       integer,
    tracks_matched     integer NOT NULL DEFAULT 0,
    result_version_id  uuid REFERENCES mixtape_versions(id) ON DELETE SET NULL,
    error              text,
    created_at         timestamptz NOT NULL DEFAULT now(),
    updated_at         timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX sessions_user_idx        ON sessions (user_id);
CREATE INDEX mixtapes_user_idx        ON mixtapes (user_id, updated_at DESC);
CREATE INDEX generation_jobs_status   ON generation_jobs (status, created_at);
CREATE INDEX generation_jobs_user_day ON generation_jobs (user_id, created_at);  -- daily limit