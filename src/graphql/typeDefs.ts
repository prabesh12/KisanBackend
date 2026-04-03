import { gql } from 'graphql-tag';

const typeDefs = gql`
  type Coordinates {
    lat: Float!
    lng: Float!
  }

  type Location {
    coordinates: Coordinates!
    city: String!
  }

  input CoordinatesInput {
    lat: Float!
    lng: Float!
  }

  input LocationInput {
    coordinates: CoordinatesInput!
    city: String!
  }

  type User {
    id: ID!
    name: String!
    email: String!
    farmName: String
    bio: String
    location: Location!
    phoneNumber: String!
    profilePhoto: String
    isVerified: Boolean!
    createdAt: String!
  }

  type Product {
    id: ID!
    name: String!
    description: String!
    price: Float!
    quantity: Float!
    unit: String!
    category: String!
    listingType: String!
    exchangePreference: String
    contactNumbers: [String!]!
    photos: [String!]!
    thumbnail: String!
    location: Location!
    seller: User!
    sellerName: String!
    status: String!
    views: Int!
    tags: [String!]!
    createdAt: String!
  }

  type AuthResponse {
    token: String!
    user: User!
  }

  type Query {
    getProducts(
      category: String
      listingType: String
      search: String
      sellerId: String
      status: String
      limit: Int
      skip: Int
    ): [Product!]!
    getProduct(id: ID!): Product
    getUser(id: ID!): User
    me: User
  }

  type Mutation {
    signup(
      name: String!
      email: String!
      password: String!
      farmName: String
      bio: String
      location: LocationInput!
      phoneNumber: String!
    ): AuthResponse!

    login(email: String!, password: String!): AuthResponse!

    createProduct(
      name: String!
      description: String!
      price: Float!
      quantity: Float!
      unit: String!
      category: String!
      listingType: String!
      exchangePreference: String
      contactNumbers: [String!]!
      photos: [String!]!
      thumbnail: String
      location: LocationInput!
    ): Product!

    updateProduct(
      id: ID!
      name: String
      description: String
      price: Float
      quantity: Float
      unit: String
      category: String
      listingType: String
      exchangePreference: String
      contactNumbers: [String!]
      photos: [String!]
      thumbnail: String
      location: LocationInput
      status: String
    ): Product!

    deleteProduct(id: ID!): Boolean!
  }
`;

export default typeDefs;
