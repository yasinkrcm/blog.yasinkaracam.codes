import { Request, Response } from 'express';
import Post from '../models/Post';
import { generateUniqueSlug } from '../utils/slugify';

export const createPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, content, excerpt, tags, featuredImage, locale, status } = req.body;

    // Generate unique slug
    const slug = await generateUniqueSlug(Post, title, locale);

    const post = await Post.create({
      title,
      slug,
      content,
      excerpt,
      tags: tags || [],
      featuredImage,
      locale,
      status: status || 'draft',
    });

    res.status(201).json({
      message: 'Post created successfully',
      post,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

export const getAllPosts = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 10,
      locale,
      status,
      tag,
      search,
    } = req.query;

    // Build query
    const query: any = {};

    // Filter by locale
    if (locale && (locale === 'tr' || locale === 'en')) {
      query.locale = locale;
    }

    // Filter by status (only show published posts if not authenticated)
    if (!req.user) {
      query.status = 'published';
    } else if (status && (status === 'draft' || status === 'published')) {
      query.status = status;
    } else if (status) {
      query.status = status;
    }

    // Filter by tag
    if (tag) {
      query.tags = tag as string;
    }

    // Search by title or excerpt
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
      ];
    }

    // Calculate pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Execute query
    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    const total = await Post.countDocuments(query);

    res.status(200).json({
      posts,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

export const getPostBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    const { locale } = req.query;

    const query: any = { slug };

    // Add locale filter if provided
    if (locale && (locale === 'tr' || locale === 'en')) {
      query.locale = locale;
    }

    const post = await Post.findOne(query);

    if (!post) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }

    // Check if post is published or user is authenticated
    if (post.status === 'draft' && !req.user) {
      res.status(403).json({ message: 'This post is not published' });
      return;
    }

    res.status(200).json({ post });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

export const getPostById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const post = await Post.findById(id);

    if (!post) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }

    res.status(200).json({ post });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

export const updatePost = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const post = await Post.findById(id);

    if (!post) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }

    // If title is being updated, regenerate slug
    if (updates.title && updates.title !== post.title) {
      post.slug = await generateUniqueSlug(Post, updates.title, post.locale);
    }

    // Update fields
    Object.keys(updates).forEach((key) => {
      if (key !== '_id' && key !== 'slug') {
        (post as any)[key] = updates[key];
      }
    });

    await post.save();

    res.status(200).json({
      message: 'Post updated successfully',
      post,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

export const deletePost = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const post = await Post.findById(id);

    if (!post) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }

    await Post.findByIdAndDelete(id);

    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

export const getTags = async (req: Request, res: Response): Promise<void> => {
  try {
    const { locale } = req.query;

    const query: any = { status: 'published' };
    if (locale && (locale === 'tr' || locale === 'en')) {
      query.locale = locale;
    }

    const posts = await Post.find(query).select('tags').lean();

    // Extract unique tags
    const tagsSet = new Set<string>();
    posts.forEach((post) => {
      post.tags.forEach((tag: string) => {
        tagsSet.add(tag);
      });
    });

    const tags = Array.from(tagsSet).sort();

    res.status(200).json({ tags });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};
