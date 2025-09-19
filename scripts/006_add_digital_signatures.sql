-- Create order_signatures table for digital signatures
CREATE TABLE IF NOT EXISTS public.order_signatures (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  signature_data JSONB NOT NULL,
  document_hash TEXT NOT NULL,
  is_verified BOOLEAN DEFAULT false,
  verification_timestamp TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on order_signatures
ALTER TABLE public.order_signatures ENABLE ROW LEVEL SECURITY;

-- Order signatures policies (users can only see their own signatures)
CREATE POLICY "order_signatures_select_own" ON public.order_signatures 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "order_signatures_insert_own" ON public.order_signatures 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "order_signatures_update_own" ON public.order_signatures 
  FOR UPDATE USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_order_signatures_order_id ON public.order_signatures(order_id);
CREATE INDEX IF NOT EXISTS idx_order_signatures_user_id ON public.order_signatures(user_id);
CREATE INDEX IF NOT EXISTS idx_order_signatures_document_hash ON public.order_signatures(document_hash);

-- Add signature fields to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS has_digital_signature BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS signature_created_at TIMESTAMP WITH TIME ZONE;

-- Function to automatically update signature status
CREATE OR REPLACE FUNCTION public.update_order_signature_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the orders table when a signature is created
  UPDATE public.orders 
  SET has_digital_signature = true,
      signature_created_at = NEW.created_at
  WHERE id = NEW.order_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update order signature status
DROP TRIGGER IF EXISTS trigger_update_order_signature_status ON public.order_signatures;
CREATE TRIGGER trigger_update_order_signature_status
  AFTER INSERT ON public.order_signatures
  FOR EACH ROW
  EXECUTE FUNCTION public.update_order_signature_status();

-- Function to verify signature integrity
CREATE OR REPLACE FUNCTION public.verify_signature_integrity(
  p_order_id UUID,
  p_expected_hash TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  stored_hash TEXT;
BEGIN
  SELECT document_hash INTO stored_hash
  FROM public.order_signatures
  WHERE order_id = p_order_id;
  
  RETURN stored_hash = p_expected_hash;
END;
$$;
