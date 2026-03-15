import express from 'express';
import { uploadImage, deleteImage } from '../controllers/uploadController';
import { protect } from '../middleware/auth';
import { uploadSingle } from '../middleware/upload';

const router = express.Router();

// Protected routes
router.post('/', protect, uploadSingle, uploadImage);
router.delete('/:filename', protect, deleteImage);

export default router;
