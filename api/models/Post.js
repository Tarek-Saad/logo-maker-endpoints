const { query } = require('../config/database');

class Post {
  constructor(data) {
    this.id = data.id;
    this.title = data.title;
    this.content = data.content;
    this.author_id = data.author_id;
    this.image_url = data.image_url;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
    this.author = data.author; // For joined queries
  }

  // Get all posts with pagination and author info
  static async findAll(page = 1, limit = 10, authorId = null) {
    const offset = (page - 1) * limit;
    let queryText = `
      SELECT p.*, u.name as author_name, u.email as author_email, u.avatar_url as author_avatar
      FROM posts p
      LEFT JOIN users u ON p.author_id = u.id
    `;
    let params = [limit, offset];
    let paramCount = 2;

    if (authorId) {
      queryText += ` WHERE p.author_id = $${++paramCount}`;
      params.push(authorId);
    }

    queryText += ` ORDER BY p.created_at DESC LIMIT $1 OFFSET $2`;

    const result = await query(queryText, params);
    return result.rows.map(row => new Post({
      ...row,
      author: {
        name: row.author_name,
        email: row.author_email,
        avatar_url: row.author_avatar
      }
    }));
  }

  // Get post by ID with author info
  static async findById(id) {
    const result = await query(`
      SELECT p.*, u.name as author_name, u.email as author_email, u.avatar_url as author_avatar
      FROM posts p
      LEFT JOIN users u ON p.author_id = u.id
      WHERE p.id = $1
    `, [id]);

    if (result.rows.length === 0) return null;
    
    const row = result.rows[0];
    return new Post({
      ...row,
      author: {
        name: row.author_name,
        email: row.author_email,
        avatar_url: row.author_avatar
      }
    });
  }

  // Create new post
  static async create(postData) {
    const { title, content, author_id, image_url } = postData;
    const result = await query(
      'INSERT INTO posts (title, content, author_id, image_url) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, content, author_id, image_url]
    );
    return new Post(result.rows[0]);
  }

  // Update post
  async update(updateData) {
    const { title, content, image_url } = updateData;
    const result = await query(
      'UPDATE posts SET title = $1, content = $2, image_url = $3 WHERE id = $4 RETURNING *',
      [title, content, image_url, this.id]
    );
    if (result.rows.length === 0) return null;
    return new Post(result.rows[0]);
  }

  // Delete post
  async delete() {
    const result = await query('DELETE FROM posts WHERE id = $1 RETURNING *', [this.id]);
    return result.rows.length > 0;
  }

  // Get total count of posts
  static async count(authorId = null) {
    let queryText = 'SELECT COUNT(*) FROM posts';
    let params = [];
    
    if (authorId) {
      queryText += ' WHERE author_id = $1';
      params.push(authorId);
    }

    const result = await query(queryText, params);
    return parseInt(result.rows[0].count);
  }

  // Search posts by title or content
  static async search(searchTerm, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const result = await query(`
      SELECT p.*, u.name as author_name, u.email as author_email, u.avatar_url as author_avatar
      FROM posts p
      LEFT JOIN users u ON p.author_id = u.id
      WHERE p.title ILIKE $1 OR p.content ILIKE $1
      ORDER BY p.created_at DESC
      LIMIT $2 OFFSET $3
    `, [`%${searchTerm}%`, limit, offset]);

    return result.rows.map(row => new Post({
      ...row,
      author: {
        name: row.author_name,
        email: row.author_email,
        avatar_url: row.author_avatar
      }
    }));
  }

  // Get posts by author
  static async findByAuthor(authorId, page = 1, limit = 10) {
    return await this.findAll(page, limit, authorId);
  }
}

module.exports = Post;
