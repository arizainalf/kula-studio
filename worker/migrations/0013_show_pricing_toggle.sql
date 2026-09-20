-- 0013_show_pricing_toggle.sql — Toggle to show/hide pricing section on landing page
ALTER TABLE platform_settings ADD COLUMN IF NOT EXISTS show_pricing boolean NOT NULL DEFAULT true;
