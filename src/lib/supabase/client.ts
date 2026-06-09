import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    "https://ulkvbkrhyndjnrckfptt.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVsa3Via3JoeW5kam5yY2tmcHR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5ODE4MzEsImV4cCI6MjA5NjU1NzgzMX0.rnGQo8R-MQx-vy1lw41Z4CJXcIhhuq3HmalS8lhWg4I"
  );
}
