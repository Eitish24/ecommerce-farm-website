-- Create security_alerts table
CREATE TABLE IF NOT EXISTS public.security_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  message TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}',
  is_resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on security_alerts
ALTER TABLE public.security_alerts ENABLE ROW LEVEL SECURITY;

-- Security alerts policies (admin access only)
CREATE POLICY "security_alerts_admin_access" ON public.security_alerts 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Add severity column to security_logs if not exists
ALTER TABLE public.security_logs 
ADD COLUMN IF NOT EXISTS severity TEXT DEFAULT 'low' CHECK (severity IN ('low', 'medium', 'high', 'critical'));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_security_alerts_type ON public.security_alerts(type);
CREATE INDEX IF NOT EXISTS idx_security_alerts_severity ON public.security_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_security_alerts_user_id ON public.security_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_security_alerts_created_at ON public.security_alerts(created_at);
CREATE INDEX IF NOT EXISTS idx_security_alerts_is_resolved ON public.security_alerts(is_resolved);

CREATE INDEX IF NOT EXISTS idx_security_logs_severity ON public.security_logs(severity);
CREATE INDEX IF NOT EXISTS idx_security_logs_event_type ON public.security_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_security_logs_created_at ON public.security_logs(created_at);

-- Function to automatically create alerts for critical events
CREATE OR REPLACE FUNCTION public.auto_create_security_alert()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-create alert for critical severity events
  IF NEW.severity = 'critical' THEN
    INSERT INTO public.security_alerts (
      type, 
      severity, 
      message, 
      user_id, 
      metadata
    ) VALUES (
      NEW.event_type,
      NEW.severity,
      'Critical security event detected: ' || NEW.event_type,
      NEW.user_id,
      NEW.metadata
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto-creating alerts
DROP TRIGGER IF EXISTS trigger_auto_create_security_alert ON public.security_logs;
CREATE TRIGGER trigger_auto_create_security_alert
  AFTER INSERT ON public.security_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_create_security_alert();

-- Function to get security dashboard metrics
CREATE OR REPLACE FUNCTION public.get_security_metrics(
  p_time_range INTERVAL DEFAULT '24 hours'
)
RETURNS TABLE (
  total_events BIGINT,
  events_by_type JSONB,
  alerts_by_type JSONB,
  threat_level TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  start_time TIMESTAMP WITH TIME ZONE;
  critical_count INTEGER;
  high_count INTEGER;
BEGIN
  start_time := now() - p_time_range;
  
  -- Get total events
  SELECT COUNT(*) INTO total_events
  FROM public.security_logs
  WHERE created_at >= start_time;
  
  -- Get events by type
  SELECT jsonb_object_agg(event_type, event_count) INTO events_by_type
  FROM (
    SELECT event_type, COUNT(*) as event_count
    FROM public.security_logs
    WHERE created_at >= start_time
    GROUP BY event_type
  ) events;
  
  -- Get alerts by type
  SELECT jsonb_object_agg(type, alert_count) INTO alerts_by_type
  FROM (
    SELECT type, COUNT(*) as alert_count
    FROM public.security_alerts
    WHERE created_at >= start_time
    GROUP BY type
  ) alerts;
  
  -- Calculate threat level
  SELECT 
    COUNT(*) FILTER (WHERE severity = 'critical'),
    COUNT(*) FILTER (WHERE severity = 'high')
  INTO critical_count, high_count
  FROM public.security_alerts
  WHERE created_at >= start_time AND is_resolved = false;
  
  IF critical_count > 0 THEN
    threat_level := 'critical';
  ELSIF high_count > 2 THEN
    threat_level := 'high';
  ELSIF high_count > 0 THEN
    threat_level := 'medium';
  ELSE
    threat_level := 'low';
  END IF;
  
  RETURN NEXT;
END;
$$;
