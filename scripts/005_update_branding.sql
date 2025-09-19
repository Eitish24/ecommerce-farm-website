-- Update category description to use Farm2Home branding
UPDATE public.categories 
SET description = 'Fresh seasonal fruits from Farm2Home' 
WHERE name = 'Fruits' AND description = 'Fresh seasonal fruits from the farm';
