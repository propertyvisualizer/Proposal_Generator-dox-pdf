-- Add offer_number column to proposals table if it doesn't exist
ALTER TABLE proposals 
ADD COLUMN IF NOT EXISTS offer_number text;

-- Make it unique to prevent duplicates
ALTER TABLE proposals 
DROP CONSTRAINT IF EXISTS proposals_offer_number_key;

ALTER TABLE proposals 
ADD CONSTRAINT proposals_offer_number_key UNIQUE (offer_number);
