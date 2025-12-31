import mongoose, { Document, Schema } from 'mongoose';

export interface IPavilionItem {
    id: string;
    type: 'ARTWORK' | 'PRODUCT' | 'COACHING' | 'MEDICAL' | 'OMAKASE';
    title: string;
    subtitle?: string;
    description: string;
    specs: Record<string, string>;
    price: string;
    rental?: string;
    image?: string;
}

export interface IFloorOwner {
    id: string; // e.g., 'artist-a'
    name: string;
    role: string;
    bio: string;
    items: IPavilionItem[];
}

export interface IPavilionFloor extends Document {
    floor: number;
    owners: IFloorOwner[];
    createdAt: Date;
    updatedAt: Date;
}

const PavilionItemSchema = new Schema<IPavilionItem>({
    id: { type: String, required: true },
    type: {
        type: String,
        required: true,
        enum: ['ARTWORK', 'PRODUCT', 'COACHING', 'MEDICAL', 'OMAKASE']
    },
    title: { type: String, required: true },
    subtitle: { type: String },
    description: { type: String, required: true },
    specs: { type: Schema.Types.Mixed, default: {} },
    price: { type: String, required: true },
    rental: { type: String },
    image: { type: String }
});

const FloorOwnerSchema = new Schema<IFloorOwner>({
    id: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, required: true },
    bio: { type: String, required: true },
    items: [PavilionItemSchema]
});

const PavilionFloorSchema = new Schema<IPavilionFloor>({
    floor: {
        type: Number,
        required: true,
        unique: true,
        min: 1,
        max: 5
    },
    owners: [FloorOwnerSchema]
}, {
    timestamps: true
});

export default mongoose.models.PavilionFloor || mongoose.model<IPavilionFloor>('PavilionFloor', PavilionFloorSchema);
