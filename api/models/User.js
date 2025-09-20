const { query } = require('../config/database');

class User {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.email = data.email;
    this.avatar_url = data.avatar_url;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Get all users with pagination
  static async findAll(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const result = await query(
      'SELECT * FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    return result.rows.map(row => new User(row));
  }

  // Get user by ID
  static async findById(id) {
    const result = await query('SELECT * FROM users WHERE id = $1', [id]);
    if (result.rows.length === 0) return null;
    return new User(result.rows[0]);
  }

  // Get user by email
  static async findByEmail(email) {
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) return null;
    return new User(result.rows[0]);
  }

  // Create new user
  static async create(userData) {
    const { name, email, avatar_url } = userData;
    const result = await query(
      'INSERT INTO users (name, email, avatar_url) VALUES ($1, $2, $3) RETURNING *',
      [name, email, avatar_url]
    );
    return new User(result.rows[0]);
  }

  // Update user
  async update(updateData) {
    const { name, email, avatar_url } = updateData;
    const result = await query(
      'UPDATE users SET name = $1, email = $2, avatar_url = $3 WHERE id = $4 RETURNING *',
      [name, email, avatar_url, this.id]
    );
    if (result.rows.length === 0) return null;
    return new User(result.rows[0]);
  }

  // Delete user
  async delete() {
    const result = await query('DELETE FROM users WHERE id = $1 RETURNING *', [this.id]);
    return result.rows.length > 0;
  }

  // Get user's posts
  async getPosts(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const result = await query(
      'SELECT * FROM posts WHERE author_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
      [this.id, limit, offset]
    );
    return result.rows;
  }

  // Get total count of users
  static async count() {
    const result = await query('SELECT COUNT(*) FROM users');
    return parseInt(result.rows[0].count);
  }

  // Search users by name or email
  static async search(searchTerm, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const result = await query(
      'SELECT * FROM users WHERE name ILIKE $1 OR email ILIKE $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
      [`%${searchTerm}%`, limit, offset]
    );
    return result.rows.map(row => new User(row));
  }
}

module.exports = User;
