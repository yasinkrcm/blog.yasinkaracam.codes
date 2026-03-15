export interface PostContent {
  json: object;
  html: string;
}

export interface Post {
  _id: string;
  title: string;
  slug: string;
  content: PostContent;
  excerpt: string;
  tags: string[];
  featuredImage?: string;
  locale: 'tr' | 'en';
  status: 'draft' | 'published';
  publishedDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostInput {
  title: string;
  content: PostContent;
  excerpt: string;
  tags?: string[];
  featuredImage?: string;
  locale: 'tr' | 'en';
  status?: 'draft' | 'published';
}

export interface UpdatePostInput {
  title?: string;
  content?: PostContent;
  excerpt?: string;
  tags?: string[];
  featuredImage?: string;
  status?: 'draft' | 'published';
}

export interface PostsResponse {
  posts: Post[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface Admin {
  id: string;
  username: string;
  email: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  admin: Admin;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  username: string;
  email: string;
  password: string;
}

export interface UploadResponse {
  message: string;
  file: {
    filename: string;
    originalname: string;
    mimetype: string;
    size: number;
    url: string;
    path: string;
  };
}
