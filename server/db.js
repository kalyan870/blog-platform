import { neon } from '@neondatabase/serverless';

let client;
export function getSql() {
  if (!process.env.DATABASE_URL) {
    const error = new Error('DATABASE_URL is required for persistent blog storage.');
    error.code = 'DATABASE_NOT_CONFIGURED';
    throw error;
  }
  client ??= neon(process.env.DATABASE_URL);
  return client;
}

export function createBlogRepository(sql) {
  return {
    async listPosts() {
      return sql.query(`SELECT p.id, p.author_id, p.author_name, p.title, p.content, p.excerpt, p.created_at, p.updated_at, COUNT(c.id)::int AS comment_count
        FROM posts p LEFT JOIN comments c ON c.post_id = p.id GROUP BY p.id ORDER BY p.created_at DESC`);
    },
    async getPost(id) {
      const rows = await sql.query('SELECT id, author_id, author_name, title, content, excerpt, created_at, updated_at FROM posts WHERE id = $1', [id]);
      return rows[0] ?? null;
    },
    async createPost(authorId, authorName, values) {
      const rows = await sql.query(`INSERT INTO posts (author_id, author_name, title, content, excerpt)
        VALUES ($1, $2, $3, $4, $5) RETURNING id, author_id, author_name, title, content, excerpt, created_at, updated_at`,
      [authorId, authorName, values.title, values.content, values.excerpt]);
      return rows[0];
    },
    async updatePost(authorId, id, values) {
      const rows = await sql.query(`UPDATE posts SET title = $3, content = $4, excerpt = $5, updated_at = now()
        WHERE author_id = $1 AND id = $2 RETURNING id, author_id, author_name, title, content, excerpt, created_at, updated_at`,
      [authorId, id, values.title, values.content, values.excerpt]);
      return rows[0] ?? null;
    },
    async deletePost(authorId, id) {
      const rows = await sql.query('DELETE FROM posts WHERE author_id = $1 AND id = $2 RETURNING id', [authorId, id]);
      return rows.length > 0;
    },
    async listComments(postId) {
      return sql.query('SELECT id, post_id, author_id, author_name, content, created_at FROM comments WHERE post_id = $1 ORDER BY created_at ASC', [postId]);
    },
    async createComment(authorId, authorName, postId, content) {
      const rows = await sql.query(`INSERT INTO comments (post_id, author_id, author_name, content)
        VALUES ($1, $2, $3, $4) RETURNING id, post_id, author_id, author_name, content, created_at`,
      [postId, authorId, authorName, content]);
      return rows[0];
    },
    async deleteComment(authorId, id) {
      const rows = await sql.query('DELETE FROM comments WHERE author_id = $1 AND id = $2 RETURNING id', [authorId, id]);
      return rows.length > 0;
    },
  };
}

export const blogRepository = {
  listPosts: (...args) => createBlogRepository(getSql()).listPosts(...args),
  getPost: (...args) => createBlogRepository(getSql()).getPost(...args),
  createPost: (...args) => createBlogRepository(getSql()).createPost(...args),
  updatePost: (...args) => createBlogRepository(getSql()).updatePost(...args),
  deletePost: (...args) => createBlogRepository(getSql()).deletePost(...args),
  listComments: (...args) => createBlogRepository(getSql()).listComments(...args),
  createComment: (...args) => createBlogRepository(getSql()).createComment(...args),
  deleteComment: (...args) => createBlogRepository(getSql()).deleteComment(...args),
};
