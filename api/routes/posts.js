const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');

// GET /api/posts - Get all posts
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, author, search } = req.query;
    
    let posts, totalCount;
    
    if (search) {
      posts = await Post.search(search, parseInt(page), parseInt(limit));
      totalCount = posts.length; // For search, we'll use the returned results count
    } else if (author) {
      // Find user by name to get author_id
      const authorUser = await User.findByEmail(author) || 
                        (await User.search(author, 1, 1))[0];
      
      if (authorUser) {
        posts = await Post.findByAuthor(authorUser.id, parseInt(page), parseInt(limit));
        totalCount = await Post.count(authorUser.id);
      } else {
        posts = [];
        totalCount = 0;
      }
    } else {
      posts = await Post.findAll(parseInt(page), parseInt(limit));
      totalCount = await Post.count();
    }

    res.json({
      success: true,
      data: posts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / limit),
        totalPosts: totalCount,
        hasNext: (page * limit) < totalCount,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch posts'
    });
  }
});

// GET /api/posts/:id - Get post by ID
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const post = await Post.findById(id);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    res.json({
      success: true,
      data: post
    });
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch post'
    });
  }
});

// POST /api/posts - Create new post
router.post('/', async (req, res) => {
  try {
    const { title, content, author_id, image_url } = req.body;
    
    if (!title || !content || !author_id) {
      return res.status(400).json({
        success: false,
        message: 'Title, content, and author_id are required'
      });
    }

    // Verify author exists
    const author = await User.findById(author_id);
    if (!author) {
      return res.status(404).json({
        success: false,
        message: 'Author not found'
      });
    }
    
    const newPost = await Post.create({ title, content, author_id, image_url });
    
    res.status(201).json({
      success: true,
      data: newPost,
      message: 'Post created successfully'
    });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create post'
    });
  }
});

// PUT /api/posts/:id - Update post
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const post = await Post.findById(id);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    const { title, content, image_url } = req.body;
    const updatedPost = await post.update({ title, content, image_url });
    
    res.json({
      success: true,
      data: updatedPost,
      message: 'Post updated successfully'
    });
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update post'
    });
  }
});

// DELETE /api/posts/:id - Delete post
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const post = await Post.findById(id);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    const deleted = await post.delete();
    
    if (deleted) {
      res.json({
        success: true,
        message: 'Post deleted successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to delete post'
      });
    }
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete post'
    });
  }
});

module.exports = router;
