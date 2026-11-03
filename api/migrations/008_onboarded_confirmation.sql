-- When the person finished or skipped onboarding, null means they haven't yet.
-- Kept on the account, not the phone, so every device agrees.
ALTER TABLE users ADD COLUMN onboarded_at timestamptz;