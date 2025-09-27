import mongoose, { Document, Schema } from 'mongoose';

export interface IOrder extends Document {
  userId: mongoose.Types.ObjectId;
  items: Array<{
    productId: mongoose.Types.ObjectId;
    name: string;
    price: number;
    qty: number;
    imageUrl?: string;
  }>;
  total: number;
  addressSnapshot: {
    label: string;
    recipient: string;
    phone: string;
    zip: string;
    addr1: string;
    addr2?: string;
  };
  status: 'paid' | 'processing' | 'shipped' | 'completed' | 'canceled';
  payment: {
    pg: 'nicepay';
    tid?: string;
    amount: number;
    approvedAt?: Date;
  };
  partnerId?: mongoose.Types.ObjectId; // for referral commission
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  items: [{
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    qty: { type: Number, required: true, min: 1 },
    imageUrl: { type: String },
  }],
  total: {
    type: Number,
    required: true,
    min: 0,
  },
  addressSnapshot: {
    label: { type: String, required: true },
    recipient: { type: String, required: true },
    phone: { type: String, required: true },
    zip: { type: String, required: true },
    addr1: { type: String, required: true },
    addr2: { type: String },
  },
  status: {
    type: String,
    enum: ['paid', 'processing', 'shipped', 'completed', 'canceled'],
    default: 'processing',
  },
  payment: {
    pg: { type: String, default: 'nicepay' },
    tid: { type: String },
    amount: { type: Number, required: true },
    approvedAt: { type: Date },
  },
  partnerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

// Index for efficient queries
OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ partnerId: 1 });

export default mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);

