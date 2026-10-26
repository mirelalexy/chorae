-- Keep Rae's draft on the job if written already.
-- If matching fails or the server restarts, the job can carry on from the draft instead of paying again for a new one.
ALTER TABLE generation_jobs ADD column draft jsonb;