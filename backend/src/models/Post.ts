import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPostContent {
  json: object;
  html: string;
}

export interface IPost extends Document {
  title: string;
  slug: string;
  content: IPostContent;
  excerpt: string;
  tags: string[];
  featuredImage?: string;
  locale: 'tr' | 'en';
  status: 'draft' | 'published';
  publishedDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a title'],
      trim: true,
      maxlength: [200, 'Title cannot be more than 200 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Please provide a slug'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    content: {
      json: {
        type: Object,
        required: true,
      },
      html: {
        type: String,
        required: true,
      },
    },
    excerpt: {
      type: String,
      required: [true, 'Please provide an excerpt'],
      maxlength: [500, 'Excerpt cannot be more than 500 characters'],
    },
    tags: {
      type: [String],
      default: [],
    },
    featuredImage: {
      type: String,
    },
    locale: {
      type: String,
      enum: ['tr', 'en'],
      required: [true, 'Please specify locale'],
      index: true,
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
      required: true,
      index: true,
    },
    publishedDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index for compound queries
PostSchema.index({ locale: 1, status: 1, createdAt: -1 });
PostSchema.index({ slug: 1, locale: 1 });

// Pre-save hook to set publishedDate when status changes to published
PostSchema.pre('save', function (next) {
  if (this.status === 'published' && !this.publishedDate) {
    this.publishedDate = new Date();
  }
  next();
});

// Static method to generate slug from title
PostSchema.statics.generateSlug = function (title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const Post: Model<IPost> = mongoose.models.Post || mongoose.model<IPost>('Post', PostSchema);

export default Post;
