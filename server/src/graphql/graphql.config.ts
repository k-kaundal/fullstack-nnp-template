/**
 * GraphQL Configuration
 * Schema-first design with Apollo Server integration
 */

import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { Request, Response } from 'express';

/**
 * GraphQL module configuration
 * Supports both REST and GraphQL APIs simultaneously
 */
export const graphqlConfig: ApolloDriverConfig = {
  driver: ApolloDriver,

  // Schema-first design: Define schema in .graphql files
  typePaths: ['./**/*.graphql'],

  // Auto-generate TypeScript definitions from schema
  definitions: {
    path: join(process.cwd(), 'src/graphql/graphql.schema.ts'),
    outputAs: 'class',
    emitTypenameField: true,
    skipResolverArgs: false,
  },

  // GraphQL Playground configuration (development only)
  playground: process.env.NODE_ENV !== 'production',

  // Apollo Studio integration (optional)
  introspection: process.env.NODE_ENV !== 'production',

  // Context function - add user auth, request data, etc.
  context: ({ req, res }: { req: Request; res: Response }) => ({ req, res }),

  // Format error responses
  formatError: (error) => {
    return {
      message: error.message,
      code: error.extensions?.code || 'INTERNAL_SERVER_ERROR',
      timestamp: new Date().toISOString(),
      path: error.path,
    };
  },

  // Enable automatic field resolver
  autoSchemaFile: false, // We're using schema-first, not code-first

  // Enable sorting of schema
  sortSchema: true,

  // Include stack trace in development
  debug: process.env.NODE_ENV !== 'production',
};
