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
        await mongoose.connect(process.env.MONGODB_URI || '');
        console.log('Connected to MongoDB');

        const products = await Product.find({ status: { $exists: false } });
        console.log(`Found ${products.length} products with missing status.`);

        for (const product of products) {
            product.status = 'active';
            await product.save();
            console.log(`✅ Fixed: ${product.name}`);
        }

        const res = await Product.updateMany({ status: null }, { $set: { status: 'active' } });
        console.log(`Updated ${res.modifiedCount} null statuses.`);

        console.log('Done!');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

run();
