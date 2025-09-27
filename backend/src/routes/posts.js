const express = require('express');
const { Post, User, Reaction, Comment, Looproom } = require('../models');
const { authenticateUser } = require('./auth');
const Joi = require('joi');

const router = express.Router();

// Validation schemas
const createPostSchema = Joi.object({
  content: Joi.string().min(1).max(2000).required(),
  mood: Joi.string().max(50).optional(),
  looproomId: Joi.number().integer().optional(),
  mediaUrls: Joi.array().items(Joi.string().uri()).optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  isPublic: Joi.boolean().default(true)
});

const reactToPostSchema = Joi.object({
  type: Joi.string().valid('heart', 'celebrate', 'support', 'inspire', 'grateful').default('heart')
});

const createCommentSchema = Joi.object({
  content: Joi.string().min(1).max(500).required(),
  parentId: Joi.number().integer().optional()
});

// GET /api/posts - Get feed posts with pagination
router.get('/', authenticateUser, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      mood, 
      looproomId,
      userId 
    } = req.query;

    const whereClause = { isPublic: true };
    
    if (mood) whereClause.mood = mood;
    if (looproomId) whereClause.looproomId = looproomId;
    if (userId) whereClause.userId = userId;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: posts } = await Post.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'type', 'avatarUrl', 'verified']
        },
        {
          model: Looproom,
          as: 'looproom',
          attributes: ['id', 'name', 'category', 'participantCount'],
          required: false
        },
        {
          model: Reaction,
          as: 'reactions',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name']
            }
          ]
        }
      ],
      limit: parseInt(limit),
      offset: offset,
      order: [['createdAt', 'DESC']],
      distinct: true
    });

    // Add user's reaction status to each post
    const postsWithUserReactions = await Promise.all(
      posts.map(async (post) => {
        const userReaction = await Reaction.findOne({
          where: {
            postId: post.id,
            userId: req.user.id
          }
        });

        return {
          ...post.toJSON(),
          userReaction: userReaction ? userReaction.type : null,
          isLiked: !!userReaction // For backward compatibility
        };
      })
    );

    res.json({
      success: true,
      data: {
        posts: postsWithUserReactions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({
      error: 'Failed to fetch posts'
    });
  }
});

// POST /api/posts - Create new post
router.post('/', authenticateUser, async (req, res) => {
  try {
    // Validate input
    const { error, value } = createPostSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details[0].message
      });
    }

    // Create post
    const post = await Post.create({
      ...value,
      userId: req.user.id
    });

    // Fetch the created post with associations
    const createdPost = await Post.findByPk(post.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'type', 'avatarUrl', 'verified']
        },
        {
          model: Looproom,
          as: 'looproom',
          attributes: ['id', 'name', 'category', 'participantCount'],
          required: false
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: {
        ...createdPost.toJSON(),
        userReaction: null,
        isLiked: false
      }
    });

  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({
      error: 'Failed to create post'
    });
  }
});

// GET /api/posts/:id - Get specific post
router.get('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Post.findByPk(id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'type', 'avatarUrl', 'verified']
        },
        {
          model: Looproom,
          as: 'looproom',
          attributes: ['id', 'name', 'category', 'participantCount'],
          required: false
        },
        {
          model: Reaction,
          as: 'reactions',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name']
            }
          ]
        },
        {
          model: Comment,
          as: 'comments',
          include: [
            {
              model: User,
              as: 'author',
              attributes: ['id', 'name', 'avatarUrl']
            }
          ],
          order: [['createdAt', 'ASC']]
        }
      ]
    });

    if (!post) {
      return res.status(404).json({
        error: 'Post not found'
      });
    }

    // Check if user has reacted to this post
    const userReaction = await Reaction.findOne({
      where: {
        postId: post.id,
        userId: req.user.id
      }
    });

    res.json({
      success: true,
      data: {
        ...post.toJSON(),
        userReaction: userReaction ? userReaction.type : null,
        isLiked: !!userReaction
      }
    });

  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({
      error: 'Failed to fetch post'
    });
  }
});

// POST /api/posts/:id/react - React to post (like/unlike)
router.post('/:id/react', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = reactToPostSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details[0].message
      });
    }

    const { type } = value;

    // Check if post exists
    const post = await Post.findByPk(id);
    if (!post) {
      return res.status(404).json({
        error: 'Post not found'
      });
    }

    // Check if user already reacted
    const existingReaction = await Reaction.findOne({
      where: {
        postId: id,
        userId: req.user.id
      }
    });

    let reactionAdded = false;
    let reactionType = null;

    if (existingReaction) {
      if (existingReaction.type === type) {
        // Same reaction - remove it (unlike)
        await existingReaction.destroy();
        await post.decrement('reactionCount');
        reactionAdded = false;
        reactionType = null;
      } else {
        // Different reaction - update it (no count change)
        await existingReaction.update({ type });
        reactionAdded = true;
        reactionType = type;
      }
    } else {
      // New reaction - create it
      await Reaction.create({
        postId: id,
        userId: req.user.id,
        type
      });
      await post.increment('reactionCount');
      reactionAdded = true;
      reactionType = type;
    }

    // Reload the post to get the updated reaction count
    await post.reload();

    res.json({
      success: true,
      message: reactionAdded ? 'Reaction added' : 'Reaction removed',
      data: {
        reactionAdded,
        reactionType,
        reactionCount: post.reactionCount
      }
    });

  } catch (error) {
    console.error('React to post error:', error);
    res.status(500).json({
      error: 'Failed to react to post'
    });
  }
});

// GET /api/posts/:id/comments - Get post comments
router.get('/:id/comments', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: comments } = await Comment.findAndCountAll({
      where: { 
        postId: id,
        parentId: null // Only top-level comments
      },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'type', 'avatarUrl', 'verified']
        },
        {
          model: Comment,
          as: 'replies',
          include: [
            {
              model: User,
              as: 'author',
              attributes: ['id', 'name', 'type', 'avatarUrl', 'verified']
            }
          ],
          order: [['createdAt', 'ASC']]
        }
      ],
      limit: parseInt(limit),
      offset: offset,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        comments,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({
      error: 'Failed to fetch comments'
    });
  }
});

// POST /api/posts/:id/comments - Add comment to post
router.post('/:id/comments', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = createCommentSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details[0].message
      });
    }

    // Check if post exists
    const post = await Post.findByPk(id);
    if (!post) {
      return res.status(404).json({
        error: 'Post not found'
      });
    }

    // If parentId is provided, check if parent comment exists
    if (value.parentId) {
      const parentComment = await Comment.findByPk(value.parentId);
      if (!parentComment || parentComment.postId !== parseInt(id)) {
        return res.status(400).json({
          error: 'Invalid parent comment'
        });
      }
    }

    // Create comment
    const comment = await Comment.create({
      ...value,
      postId: id,
      userId: req.user.id
    });

    // Update post comment count
    await post.increment('commentCount');

    // If this is a reply, update parent comment reply count
    if (value.parentId) {
      const parentComment = await Comment.findByPk(value.parentId);
      await parentComment.increment('replyCount');
    }

    // Fetch the created comment with author info
    const createdComment = await Comment.findByPk(comment.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'type', 'avatarUrl', 'verified']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: createdComment
    });

  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({
      error: 'Failed to create comment'
    });
  }
});

// DELETE /api/posts/:id - Delete post (author only)
router.delete('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Post.findByPk(id);
    if (!post) {
      return res.status(404).json({
        error: 'Post not found'
      });
    }

    // Check if user is the author
    if (post.userId !== req.user.id) {
      return res.status(403).json({
        error: 'You can only delete your own posts'
      });
    }

    await post.destroy();

    res.json({
      success: true,
      message: 'Post deleted successfully'
    });

  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({
      error: 'Failed to delete post'
    });
  }
});

module.exports = router;