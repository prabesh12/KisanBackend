import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import typeDefs from './graphql/typeDefs.js';
import resolvers from './graphql/resolvers.js';
import jwt from 'jsonwebtoken';
import User from './models/User.js';

dotenv.config({
    path: process.env.NODE_ENV === 'production' ? '.env' : '.env.development',
    override: true
});

const startServer = async () => {
    // Connect to Database
    await connectDB();

    const server = new ApolloServer({
        typeDefs,
        resolvers,
        plugins: [
            ApolloServerPluginLandingPageLocalDefault({ embed: true }),
        ],
    });

    const { url } = await startStandaloneServer(server, {
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
        listen: { port: parseInt(process.env.PORT || '4000') },
    });

    console.log(`🚀 Server ready at ${url}`);
};

startServer();
