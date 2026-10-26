-- Remember what each requested song matched, so asking for the same song skips MusicBrainz.
CREATE TABLE track_lookups (
    song_key          text PRIMARY KEY,                               -- normalized as "title|artist"
    recording_mbid    text REFERENCES tracks(mbid) ON DELETE CASCADE,
    looked_up_at      timestamptz NOT NULL DEFAULT now()
);