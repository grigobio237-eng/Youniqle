import mongoose, { Document, Schema } from 'mongoose';

export interface IContent extends Document {
  title: string;
  description: string;
  platform: 'youtube' | 'tiktok' | 'blog' | 'instagram' | 'facebook';
  url: string;
  thumbnail?: string;
  views: number;
  likes: number;
  publishedAt: Date;
  status: 'draft' | 'published' | 'archived';
  tags: string[];
  category: string;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ContentSchema = new Schema<IContent>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  platform: {
    type: String,
    required: true,
    enum: ['youtube', 'tiktok', 'blog', 'instagram', 'facebook']
  },
  url: {
    type: String,
    required: true,
    trim: true
  },
  thumbnail: {
    type: String,
    trim: true
  },
  views: {
    type: Number,
    default: 0,
    min: 0
  },
  likes: {
    type: Number,
    default: 0,
    min: 0
  },
  publishedAt: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'published'
  },
  tags: [{
    type: String,
    trim: true
  }],
  category: {
    type: String,
    required: true,
    trim: true
  },
  featured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// 인덱스 생성
ContentSchema.index({ platform: 1, status: 1 });
ContentSchema.index({ publishedAt: -1 });
ContentSchema.index({ featured: 1, status: 1 });
ContentSchema.index({ tags: 1 });

export default mongoose.models.Content || mongoose.model<IContent>('Content', ContentSchema);

