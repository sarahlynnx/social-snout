-- Add missing UPDATE policy for reactions table
CREATE POLICY "Users can update own reactions"
  ON reactions FOR UPDATE USING (auth.uid() = user_id);
