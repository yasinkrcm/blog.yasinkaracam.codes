import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';

export const uploadImage = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }

    // Create file URL
    const protocol = req.protocol;
    const host = req.get('host');
    const filePath = `/uploads/${req.file.filename}`;
    const fileUrl = `${protocol}://${host}${filePath}`;

    res.status(200).json({
      message: 'File uploaded successfully',
      file: {
        filename: req.file.filename,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        url: fileUrl,
        path: filePath,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

export const deleteImage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { filename } = req.params;

    if (!filename) {
      res.status(400).json({ message: 'Filename is required' });
      return;
    }

    const filePath = path.resolve(process.cwd(), 'public', 'uploads', filename);

    // Check if file exists
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.status(200).json({ message: 'File deleted successfully' });
    } else {
      res.status(404).json({ message: 'File not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};
