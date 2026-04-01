-- Comment reactions table (same reaction types as post reactions)
CREATE TABLE comment_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type reaction_type NOT NULL,
  UNIQUE (comment_id, user_id)
);

CREATE INDEX idx_comment_reactions_comment ON comment_reactions(comment_id);

-- Add IDEA and SAD to reaction_type enum
ALTER TYPE reaction_type ADD VALUE IF NOT EXISTS 'IDEA';
ALTER TYPE reaction_type ADD VALUE IF NOT EXISTS 'SAD';

-- Enable RLS
ALTER TABLE comment_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read comment reactions"
  ON comment_reactions FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert comment reactions"
  ON comment_reactions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comment reactions"
  ON comment_reactions FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can update own comment reactions"
  ON comment_reactions FOR UPDATE USING (auth.uid() = user_id);
