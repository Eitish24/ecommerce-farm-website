-- Insert sample categories
INSERT INTO public.categories (name, description, image_url) VALUES
('Leafy Greens', 'Fresh leafy vegetables like spinach, lettuce, and kale', '/placeholder.svg?height=200&width=200'),
('Root Vegetables', 'Underground vegetables like carrots, potatoes, and beets', '/placeholder.svg?height=200&width=200'),
('Herbs', 'Fresh aromatic herbs for cooking and seasoning', '/placeholder.svg?height=200&width=200'),
('Fruits', 'Fresh seasonal fruits from the farm', '/placeholder.svg?height=200&width=200'),
('Seasonal Specials', 'Limited time seasonal produce', '/placeholder.svg?height=200&width=200')
ON CONFLICT (name) DO NOTHING;

-- Insert sample products
INSERT INTO public.products (name, description, price, category_id, image_url, stock_quantity, unit, is_organic, harvest_date, farm_location, nutritional_info) VALUES
(
  'Organic Spinach',
  'Fresh organic spinach leaves, perfect for salads and cooking. Rich in iron and vitamins.',
  4.99,
  (SELECT id FROM public.categories WHERE name = 'Leafy Greens'),
  '/placeholder.svg?height=300&width=300',
  50,
  'bunch',
  true,
  CURRENT_DATE - INTERVAL '1 day',
  'North Field Farm',
  '{"calories": 23, "protein": "2.9g", "fiber": "2.2g", "vitamin_k": "460mcg"}'::jsonb
),
(
  'Farm Fresh Carrots',
  'Sweet and crunchy carrots, freshly harvested. Great for snacking or cooking.',
  3.49,
  (SELECT id FROM public.categories WHERE name = 'Root Vegetables'),
  '/placeholder.svg?height=300&width=300',
  75,
  'kg',
  false,
  CURRENT_DATE - INTERVAL '2 days',
  'South Valley Farm',
  '{"calories": 41, "protein": "0.9g", "fiber": "2.8g", "vitamin_a": "835mcg"}'::jsonb
),
(
  'Fresh Basil',
  'Aromatic fresh basil leaves, perfect for pasta, pizza, and Mediterranean dishes.',
  2.99,
  (SELECT id FROM public.categories WHERE name = 'Herbs'),
  '/placeholder.svg?height=300&width=300',
  30,
  'bunch',
  true,
  CURRENT_DATE,
  'Herb Garden Farm',
  '{"calories": 22, "protein": "3.2g", "vitamin_k": "414mcg", "manganese": "1.1mg"}'::jsonb
),
(
  'Organic Tomatoes',
  'Juicy organic tomatoes, vine-ripened for maximum flavor. Perfect for salads and cooking.',
  5.99,
  (SELECT id FROM public.categories WHERE name = 'Fruits'),
  '/placeholder.svg?height=300&width=300',
  40,
  'kg',
  true,
  CURRENT_DATE - INTERVAL '1 day',
  'Greenhouse Farm',
  '{"calories": 18, "protein": "0.9g", "vitamin_c": "13.7mg", "lycopene": "2.6mg"}'::jsonb
),
(
  'Baby Potatoes',
  'Small tender potatoes, perfect for roasting or boiling. Creamy texture and delicate flavor.',
  4.49,
  (SELECT id FROM public.categories WHERE name = 'Root Vegetables'),
  '/placeholder.svg?height=300&width=300',
  60,
  'kg',
  false,
  CURRENT_DATE - INTERVAL '3 days',
  'Mountain View Farm',
  '{"calories": 77, "protein": "2.0g", "fiber": "2.2g", "potassium": "421mg"}'::jsonb
),
(
  'Mixed Salad Greens',
  'A fresh mix of lettuce, arugula, and baby spinach. Ready to eat, pre-washed.',
  6.99,
  (SELECT id FROM public.categories WHERE name = 'Leafy Greens'),
  '/placeholder.svg?height=300&width=300',
  25,
  'bag',
  true,
  CURRENT_DATE,
  'Green Valley Farm',
  '{"calories": 15, "protein": "1.4g", "fiber": "1.3g", "folate": "38mcg"}'::jsonb
);
