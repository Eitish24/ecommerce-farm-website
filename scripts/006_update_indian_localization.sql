-- Update existing products with Indian pricing (convert from USD to INR approximately)
UPDATE products 
SET price = price * 83 -- Approximate USD to INR conversion
WHERE price < 1000; -- Only update if not already converted

-- Update address format in profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS pin_code VARCHAR(6);

-- Migrate existing zip codes to pin_code
UPDATE profiles 
SET pin_code = (address->>'zip')::VARCHAR(6)
WHERE address->>'zip' IS NOT NULL 
AND pin_code IS NULL;

-- Update country to India
UPDATE profiles 
SET address = jsonb_set(
  COALESCE(address, '{}'::jsonb), 
  '{country}', 
  '"IN"'
)
WHERE address->>'country' = 'US' OR address->>'country' IS NULL;

-- Removed states table insert as the table doesn't exist in current schema
-- The frontend will handle state selection with a predefined list

-- Add some sample Indian products if they don't exist
INSERT INTO products (id, name, description, price, unit, stock_quantity, is_organic, is_active, category_id, farm_location)
SELECT 
  gen_random_uuid(),
  'Basmati Rice',
  'Premium quality aged basmati rice from Punjab',
  415, -- ₹415 (5kg bag)
  '5kg',
  100,
  true,
  true,
  (SELECT id FROM categories LIMIT 1),
  'Punjab, India'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Basmati Rice');

INSERT INTO products (id, name, description, price, unit, stock_quantity, is_organic, is_active, category_id, farm_location)
SELECT 
  gen_random_uuid(),
  'Fresh Alphonso Mangoes',
  'Sweet and juicy Alphonso mangoes from Ratnagiri',
  830, -- ₹830 per dozen
  'dozen',
  50,
  true,
  true,
  (SELECT id FROM categories LIMIT 1),
  'Ratnagiri, Maharashtra'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Fresh Alphonso Mangoes');
