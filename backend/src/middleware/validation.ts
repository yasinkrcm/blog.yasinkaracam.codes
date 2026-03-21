import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

// Validation schemas
export const postCreateSchema = Joi.object({
  title: Joi.string().min(1).max(200).required(),
  slug: Joi.string().optional(),
  content: Joi.object({
    json: Joi.object().required(),
    html: Joi.string().required(),
  }).required(),
  excerpt: Joi.string().min(1).max(500).required(),
  tags: Joi.array().items(Joi.string()).optional(),
  featuredImage: Joi.string().allow('').optional(),
  locale: Joi.string().valid('tr', 'en').required(),
  status: Joi.string().valid('draft', 'published').optional(),
});

export const postUpdateSchema = Joi.object({
  title: Joi.string().min(1).max(200).optional(),
  content: Joi.object({
    json: Joi.object().required(),
    html: Joi.string().required(),
  }).optional(),
  excerpt: Joi.string().min(1).max(500).optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  featuredImage: Joi.string().allow('').optional(),
  locale: Joi.string().valid('tr', 'en').optional(),
  status: Joi.string().valid('draft', 'published').optional(),
}).min(1);

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const registerSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

// Validation middleware factory
export const validate =
  (schema: Joi.ObjectSchema) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log('Validation request body:', JSON.stringify(req.body, null, 2));
      await schema.validateAsync(req.body, { abortEarly: false });
      next();
    } catch (error: any) {
      const errors = error.details.map((detail: any) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      console.error('Validation errors:', JSON.stringify(errors, null, 2));

      res.status(400).json({
        message: 'Validation error',
        errors,
      });
    }
  };
