import express from 'express';
import {
  createPost,
  getAllPosts,
  getPostBySlug,
  getPostById,
  updatePost,
  deletePost,
  getTags,
} from '../controllers/postController';
import { protect, optionalAuth } from '../middleware/auth';
import { validate, postCreateSchema, postUpdateSchema } from '../middleware/validation';

const router = express.Router();

// Public routes (with optional auth for draft posts)
router.get('/', optionalAuth, getAllPosts);
router.get('/tags', getTags);
router.get('/slug/:slug', optionalAuth, getPostBySlug);

// Protected routes (require authentication)
router.post('/', protect, validate(postCreateSchema), createPost);
router.get('/:id', protect, getPostById);
router.put('/:id', protect, validate(postUpdateSchema), updatePost);
router.delete('/:id', protect, deletePost);

export default router;
