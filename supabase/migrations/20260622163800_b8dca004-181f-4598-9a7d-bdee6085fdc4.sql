DROP POLICY IF EXISTS "Anyone can insert logs" ON public.app_logs;

CREATE POLICY "Validated app logs can be inserted"
  ON public.app_logs
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    level IN ('debug', 'info', 'warn', 'error', 'fatal')
    AND message IS NOT NULL
    AND length(trim(message)) BETWEEN 1 AND 2000
  );