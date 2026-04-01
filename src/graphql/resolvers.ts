import User from '../models/User.js';
import Product from '../models/Product.js';
import jwt from 'jsonwebtoken';

const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
    expiresIn: '30d',
  });
};

const resolvers = {
  Query: {
    getProducts: async (_: any, { category, listingType, search, limit = 10, skip = 0 }: any) => {
      const query: any = {};
      if (category) query.category = category;
      if (listingType) query.listingType = listingType;
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ];
      }
      return await Product.find(query).sort({ createdAt: -1 }).limit(limit).skip(skip).populate('seller');
    },
    getProduct: async (_: any, { id }: any) => {
      const product = await Product.findById(id).populate('seller');
      if (product) {
        product.views += 1;
        await product.save();
      }
      return product;
    },
    me: async (_: any, __: any, context: any) => {
      if (!context.user) return null;
      return await User.findById(context.user.id);
    },
  },
  Mutation: {
    signup: async (_: any, args: any) => {
      try {
        console.log('Signup Attempt:', args.phoneNumber);
        const { name, email, password, farmName, bio, location, phoneNumber } = args;
        const userExists = await User.findOne({ email });
        if (userExists) throw new Error('User already exists');

        const user = await User.create({
          name,
          email,
          password,
          farmName,
          bio,
          location,
          phoneNumber,
        });

        console.log('User created:', user.email);
        return {
          token: generateToken(user.id),
          user,
        };
      } catch (err: any) {
        console.error('Signup Error:', err.message);
        throw err;
      }
    },
    login: async (_: any, { email, password }: any) => {
      try {
        console.log('Login Attempt:', email);
        const user = await User.findOne({ email });
        if (!user) throw new Error('Invalid credentials');

        const isMatch = await user.comparePassword(password);
        if (!isMatch) throw new Error('Invalid credentials');

        console.log('Login Success:', user.email);
        return {
          token: generateToken(user.id),
          user,
        };
      } catch (err: any) {
        console.error('Login Error:', err.message);
        throw err;
      }
    },
    createProduct: async (_: any, args: any, context: any) => {
      if (!context.user) throw new Error('Not authenticated');

      const user = await User.findById(context.user.id);
      if (!user) throw new Error('User not found');

      const product = await Product.create({
        ...args,
        seller: user.id,
        sellerName: user.name,
      });

      return product;
    },
    updateProduct: async (_: any, { id, ...args }: any, context: any) => {
      if (!context.user) throw new Error('Not authenticated');

      const product = await Product.findById(id);
      if (!product) throw new Error('Product not found');
      if (product.seller.toString() !== context.user.id) throw new Error('Not authorized');

      Object.assign(product, args);
      await product.save();
      return product;
    },
    deleteProduct: async (_: any, { id }: any, context: any) => {
      if (!context.user) throw new Error('Not authenticated');
      
      const product = await Product.findById(id);
      if (!product) throw new Error('Product not found');
      if (product.seller.toString() !== context.user.id) throw new Error('Not authorized');

      await Product.deleteOne({ _id: id });
      return true;
    },
  },
  Product: {
    seller: async (parent: any) => {
      return await User.findById(parent.seller);
    }
  }
};

export default resolvers;
