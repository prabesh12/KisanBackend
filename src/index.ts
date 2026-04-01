import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express5';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import typeDefs from './graphql/typeDefs.js';
import resolvers from './graphql/resolvers.js';
import jwt from 'jsonwebtoken';
import User from './models/User.js';

// In production (Vercel), environment variables are provided directly by the platform.
if (process.env.NODE_ENV !== 'production') {
    dotenv.config({
        path: '.env.development',
        override: true
    });
}

const app = express();

const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [
        ApolloServerPluginLandingPageLocalDefault({ 
            embed: true,
            // Ensure playground is always available for easier debugging
            footer: false 
        }),
    ],
});

// Singleton initialization to prevent race conditions in serverless
let isInitialized = false;
const initialize = async () => {
    if (isInitialized) return;
    
    try {
        console.log('🚀 Finalizing Initialization - Starting...');
        
        // 1. Start Apollo Server
        await server.start();
        console.log('✅ Apollo Server: Initialized');
        
        // 2. Connect to Database
        await connectDB();
        console.log('✅ MongoDB Atlas: Connected');

        // 3. Middlewares
        app.use(cors({
            origin: ['https://kisan-eta.vercel.app', 'http://localhost:5173'],
            methods: ['GET', 'POST', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization'],
            credentials: true
        }));
        app.use(express.json());

        // 4. GraphQL Endpoint
        app.use('/graphql', expressMiddleware(server, {
            context: async ({ req }) => {
                const token = req.headers.authorization || '';
                if (token) {
                    try {
                        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
                        const user = await User.findById(decoded.id).select('-password');
                        return { user };
                    } catch (err) {
                        console.error('Invalid token');
                    }
                }
                return {};
            },
        }));

        // 5. Catch-all for Base URL
        app.get('/', (_req, res) => {
            res.send('Kisan Marketplace API - Ready and Healthy');
        });

        isInitialized = true;
        console.log('🏁 Initialization: Complete');
    } catch (err: any) {
        console.error('❌ CRITICAL: Initialization Failed:', err.message);
        throw err;
    }
};

// Local development server logic
if (process.env.NODE_ENV !== 'production') {
    initialize().then(() => {
        const PORT = parseInt(process.env.PORT || '4002');
        app.listen(PORT, () => console.log(`🚀 Local Server ready at http://localhost:${PORT}/graphql`));
    });
}

// Export a handler for Vercel that ensures initialization
export default async (req: any, res: any) => {
    await initialize();
    return (app as any)(req, res);
};
