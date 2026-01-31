/**
 * GraphQL Module
 * Configures GraphQL server with schema-first design
 */

import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { graphqlConfig } from './graphql.config';
import { UserResolver } from './resolvers/user.resolver';
import { UsersModule } from '../users/users.module';

/**
 * GraphQL module with schema-first design
 * Coexists with REST API endpoints
 */
@Module({
  imports: [
    GraphQLModule.forRoot(graphqlConfig),
    UsersModule, // Import UsersModule to use UsersService
  ],
  providers: [UserResolver],
})
export class GraphqlAppModule {}
