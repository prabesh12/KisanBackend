import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Product from '../src/models/Product.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env.development') });

async function run() {
    try {
        console.log('Connecting to:', process.env.MONGODB_URI);
        await mongoose.connect(process.env.MONGODB_URI || '');
        console.log('✅ Connected to MongoDB');

        const products = await Product.find({});
        console.log(`🔍 Found ${products.length} products to check...`);

        let count = 0;
        for (const product of products) {
            // Even if we don't compress here (no canvas), 
            // filling the thumbnail field means the GraphQL resolver works instantly
            if (product.photos && product.photos.length > 0 && !product.thumbnail) {
                console.log(`📦 Updating: ${product.name}`);
                product.thumbnail = product.photos[0];
                await product.save();
                count++;
            }
        }

        console.log(`✅ Done! Updated ${count} products with thumbnail refs.`);
        process.exit(0);
    } catch (err) {
        console.error('❌ Migration failed:', err);
        process.exit(1);
    }
}

run();

