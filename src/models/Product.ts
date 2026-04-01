import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  quantity: number;
  unit: string;
  category: string;
  listingType: 'sell' | 'exchange' | 'free';
  exchangePreference?: string;
  photos: string[];
  location: {
    coordinates: {
      lat: number;
      lng: number;
    };
    city: string;
  };
  seller: mongoose.Types.ObjectId;
  sellerName: string;
  status: 'active' | 'sold';
  views: number;
  tags: string[];
  createdAt: Date;
}

const ProductSchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, required: true },
  category: { type: String, required: true },
  listingType: { 
    type: String, 
    enum: ['sell', 'exchange', 'free'], 
    default: 'sell' 
  },
  exchangePreference: { type: String },
  photos: [{ type: String }],
  location: {
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    city: { type: String, required: true },
  },
  seller: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  sellerName: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['active', 'sold'], 
    default: 'active' 
  },
  views: { type: Number, default: 0 },
  tags: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IProduct>('Product', ProductSchema);
