-- Enable Realtime on messages table
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- RPC: get matches with last message and unread count for a user
CREATE OR REPLACE FUNCTION get_matches_with_messages(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  pet_a_id UUID,
  pet_b_id UUID,
  user_a_id UUID,
  user_b_id UUID,
  created_at TIMESTAMPTZ,
  pet_name TEXT,
  pet_photo TEXT,
  owner_name TEXT,
  owner_avatar TEXT,
  last_message_content TEXT,
  last_message_at TIMESTAMPTZ,
  unread_count BIGINT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT
    m.id,
    m.pet_a_id,
    m.pet_b_id,
    m.user_a_id,
    m.user_b_id,
    m.created_at,
    -- Other pet's name and first photo
    CASE WHEN m.user_a_id = p_user_id THEN pb.name ELSE pa.name END AS pet_name,
    CASE WHEN m.user_a_id = p_user_id THEN pb.photos[1] ELSE pa.photos[1] END AS pet_photo,
    -- Other owner's name and avatar
    CASE WHEN m.user_a_id = p_user_id THEN ub.name ELSE ua.name END AS owner_name,
    CASE WHEN m.user_a_id = p_user_id THEN ub.avatar_url ELSE ua.avatar_url END AS owner_avatar,
    -- Last message
    lm.content AS last_message_content,
    lm.created_at AS last_message_at,
    -- Unread count (messages from the other user that are unread)
    COALESCE(ur.unread_count, 0) AS unread_count
  FROM matches m
  JOIN pets pa ON pa.id = m.pet_a_id
  JOIN pets pb ON pb.id = m.pet_b_id
  JOIN users ua ON ua.id = m.user_a_id
  JOIN users ub ON ub.id = m.user_b_id
  LEFT JOIN LATERAL (
    SELECT msg.content, msg.created_at
    FROM messages msg
    WHERE msg.match_id = m.id
    ORDER BY msg.created_at DESC
    LIMIT 1
  ) lm ON true
  LEFT JOIN LATERAL (
    SELECT COUNT(*) AS unread_count
    FROM messages msg
    WHERE msg.match_id = m.id
      AND msg.sender_id != p_user_id
      AND msg.read = false
  ) ur ON true
  WHERE m.user_a_id = p_user_id OR m.user_b_id = p_user_id
  ORDER BY COALESCE(lm.created_at, m.created_at) DESC;
$$;
