-- Store MusicBrainz artist IDs, so Rae tells apart artists who share a name.
-- This is good if user asks to never play an artist.
ALTER TABLE tracks ADD COLUMN artist_mbids text[];