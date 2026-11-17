CREATE TABLE IF NOT EXISTS posts (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  author_id TEXT NOT NULL,
  author_name TEXT NOT NULL DEFAULT 'Blog member',
  title TEXT NOT NULL CHECK (char_length(title) BETWEEN 1 AND 200),
  content TEXT NOT NULL CHECK (char_length(content) BETWEEN 1 AND 100000),
  excerpt TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS comments (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  post_id BIGINT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_id TEXT NOT NULL,
  author_name TEXT NOT NULL DEFAULT 'Blog member',
  content TEXT NOT NULL CHECK (char_length(content) BETWEEN 1 AND 5000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS posts_created_idx ON posts (created_at DESC);
CREATE INDEX IF NOT EXISTS posts_author_idx ON posts (author_id, id);
CREATE INDEX IF NOT EXISTS comments_post_created_idx ON comments (post_id, created_at);
CREATE INDEX IF NOT EXISTS comments_author_idx ON comments (author_id, id);
