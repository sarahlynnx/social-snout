-- Allow users to delete (unmatch) their own matches
CREATE POLICY "Users can delete their own matches"
  ON matches FOR DELETE USING (
    auth.uid() = user_a_id OR auth.uid() = user_b_id
  );
