/**
 * GraphQL Authentication Guard
 * Validates JWT tokens for GraphQL requests
 */

import { ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';

/**
 * Custom auth guard for GraphQL endpoints
 * Extracts request from GraphQL context instead of HTTP context
 */
@Injectable()
export class GqlAuthGuard extends AuthGuard('jwt') {
  /**
   * Get request from GraphQL context
   *
   * @param context - Execution context
   * @returns Request object from GraphQL context
   */
  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req;
  }
}
