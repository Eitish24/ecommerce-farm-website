-- Add security-related fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS two_factor_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS login_attempts INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Create security_logs table for monitoring
CREATE TABLE IF NOT EXISTS public.security_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'login', 'logout', 'failed_login', 'password_change', 'otp_sent', 'otp_verified'
  ip_address INET,
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on security_logs
ALTER TABLE public.security_logs ENABLE ROW LEVEL SECURITY;

-- Security logs policies (users can only see their own logs)
CREATE POLICY "security_logs_select_own" ON public.security_logs 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "security_logs_insert_own" ON public.security_logs 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create function to log security events
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_user_id UUID,
  p_event_type TEXT,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.security_logs (user_id, event_type, ip_address, user_agent, metadata)
  VALUES (p_user_id, p_event_type, p_ip_address, p_user_agent, p_metadata);
END;
$$;

-- Create function to check and update login attempts
CREATE OR REPLACE FUNCTION public.handle_login_attempt(
  p_user_id UUID,
  p_success BOOLEAN,
  p_ip_address INET DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_attempts INTEGER;
  is_locked BOOLEAN := false;
BEGIN
  -- Get current login attempts
  SELECT login_attempts, (locked_until > now()) 
  INTO current_attempts, is_locked
  FROM public.profiles 
  WHERE id = p_user_id;

  -- If account is locked, return false
  IF is_locked THEN
    RETURN false;
  END IF;

  IF p_success THEN
    -- Reset login attempts on successful login
    UPDATE public.profiles 
    SET login_attempts = 0, 
        last_login_at = now(),
        locked_until = NULL
    WHERE id = p_user_id;
    
    -- Log successful login
    PERFORM public.log_security_event(p_user_id, 'login', p_ip_address);
  ELSE
    -- Increment login attempts
    current_attempts := COALESCE(current_attempts, 0) + 1;
    
    UPDATE public.profiles 
    SET login_attempts = current_attempts,
        locked_until = CASE 
          WHEN current_attempts >= 5 THEN now() + interval '30 minutes'
          ELSE NULL
        END
    WHERE id = p_user_id;
    
    -- Log failed login
    PERFORM public.log_security_event(p_user_id, 'failed_login', p_ip_address);
  END IF;

  RETURN true;
END;
$$;
