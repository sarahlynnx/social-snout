-- ============================================================================
-- Migration 003: Add prompts column to pets table
-- Stores pet personality prompts as JSONB array
-- Format: [{ "question": "My favorite thing is...", "answer": "belly rubs" }]
-- ============================================================================

ALTER TABLE pets ADD COLUMN prompts JSONB NOT NULL DEFAULT '[]';
