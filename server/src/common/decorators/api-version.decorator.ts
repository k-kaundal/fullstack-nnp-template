/**
 * API Versioning Decorators
 * Support for URI and header-based versioning with deprecation notices
 */

import { applyDecorators, SetMetadata } from '@nestjs/common';
import { ApiHeader, ApiOperation } from '@nestjs/swagger';

export const API_VERSION_KEY = 'api_version';
export const API_DEPRECATED_KEY = 'api_deprecated';
export const API_DEPRECATION_INFO_KEY = 'api_deprecation_info';

/**
 * Deprecation information interface
 */
export interface DeprecationInfo {
  version: string;
  deprecatedAt: string;
  sunsetDate?: string;
  migrationGuide?: string;
  alternativeEndpoint?: string;
  reason?: string;
}

/**
 * Mark an endpoint as belonging to a specific API version
 * @param version - API version (e.g., '1', '2')
 */
export const ApiVersion = (version: string) =>
  SetMetadata(API_VERSION_KEY, version);

/**
 * Mark an endpoint as deprecated
 * @param info - Deprecation information
 */
export function ApiDeprecated(info: DeprecationInfo) {
  return applyDecorators(
    SetMetadata(API_DEPRECATED_KEY, true),
    SetMetadata(API_DEPRECATION_INFO_KEY, info),
    ApiOperation({
      deprecated: true,
      summary: `[DEPRECATED] This endpoint will be sunset on ${info.sunsetDate || 'TBD'}`,
      description: `
**⚠️ DEPRECATION NOTICE**

This endpoint is deprecated and will be removed in a future version.

- **Deprecated Since**: ${info.deprecatedAt}
- **Sunset Date**: ${info.sunsetDate || 'To be determined'}
- **Reason**: ${info.reason || 'API version upgrade'}
${info.alternativeEndpoint ? `- **Alternative**: Use \`${info.alternativeEndpoint}\` instead` : ''}
${info.migrationGuide ? `- **Migration Guide**: ${info.migrationGuide}` : ''}

Please update your integration as soon as possible.
      `,
    }),
    ApiHeader({
      name: 'X-API-Warn',
      description: 'Deprecation warning header',
      required: false,
      schema: {
        type: 'string',
        example: `299 - "Deprecated API - Sunset: ${info.sunsetDate}"`,
      },
    }),
  );
}

/**
 * Support header-based versioning
 */
export function ApiHeaderVersioning() {
  return applyDecorators(
    ApiHeader({
      name: 'X-API-Version',
      description: 'API version for header-based versioning',
      required: false,
      schema: {
        type: 'string',
        enum: ['1', '2'],
        default: '1',
        example: '1',
      },
    }),
    ApiHeader({
      name: 'Accept-Version',
      description: 'Alternative header for API version',
      required: false,
      schema: {
        type: 'string',
        enum: ['1', '2'],
        example: '1',
      },
    }),
  );
}
