import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  stock: number;
  category: string;
  status: 'active' | 'hidden';
  featured?: boolean;
  images: Array<{
    url: string;
    w?: number;
    h?: number;
    type?: string;
  }>;
  summary: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  originalPrice: {
    type: Number,
    min: 0,
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
  category: {
    type: String,
    required: true,
    trim: true,
  },
  status: {
    type: String,
    enum: ['active', 'hidden'],
    default: 'active',
  },
  featured: {
    type: Boolean,
    default: false,
  },
  images: [{
    url: { type: String, required: true },
    w: { type: Number },
    h: { type: Number },
    type: { type: String },
  }],
  summary: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

// Index for search and filtering
ProductSchema.index({ name: 'text', summary: 'text', description: 'text' });
ProductSchema.index({ category: 1, status: 1 });
ProductSchema.index({ price: 1 });

export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

