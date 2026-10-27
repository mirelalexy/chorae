-- The user's own picks that Rae could not match.
ALTER TABLE mixtape_versions ADD column missing_seeds jsonb NOT NULL DEFAULT '[]';