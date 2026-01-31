/**
 * Advanced Swagger Configuration
 * Comprehensive API documentation with examples, authentication, and customization
 */

import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Configure comprehensive Swagger documentation
 */
export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('Fullstack NNP API')
    .setDescription(
      `
# NestJS + Next.js + PostgreSQL Template API

## Overview
Production-ready RESTful API with comprehensive authentication, user management, and database features.

## Features
- 🔐 JWT Authentication (Access + Refresh tokens)
- 👤 User Management (CRUD operations)
- 🗄️ PostgreSQL Database with TypeORM
- 📧 Email Service (Password reset, verification)
- 🔒 Session Management (Multi-device support)
- 🛡️ Security (XSS, SQL injection prevention)
- ⚡ Performance (Query optimization, caching)
- 📊 Database Migrations & Seeding
- 🔄 API Versioning (URI & Header-based)

## Authentication
All protected endpoints require a valid JWT access token in the Authorization header:

\`\`\`
Authorization: Bearer <your-access-token>
\`\`\`

### Token Lifecycle
- **Access Token**: 15 minutes expiry
- **Refresh Token**: 7 days expiry
- **Refresh Endpoint**: \`POST /api/v1/auth/refresh\`

## API Versioning
This API supports multiple versioning strategies:

### URI Versioning (Recommended)
\`\`\`
GET /api/v1/users
GET /api/v2/users
\`\`\`

### Header Versioning
\`\`\`
X-API-Version: 1
Accept-Version: 1
\`\`\`

## Deprecation Policy
Deprecated endpoints include warning headers:
- \`X-API-Deprecated\`: Indicates deprecation
- \`X-API-Sunset\`: Date when endpoint will be removed
- \`X-API-Alternative\`: Suggested alternative endpoint

## Error Handling
All errors follow a consistent format:
\`\`\`json
{
  "status": "error",
  "statusCode": 400,
  "message": "Error description",
  "errors": ["Detailed validation errors"],
  "timestamp": "2026-01-31T20:00:00.000Z",
  "path": "/api/v1/endpoint"
}
\`\`\`

## Rate Limiting
- **Default**: 100 requests per 15 minutes per IP
- **Authentication**: 5 failed attempts = 15 minute lockout

## Support
- **Documentation**: [GitHub Repository](https://github.com/k-kaundal/fullstack-nnp-template)
- **Issues**: [Report Issues](https://github.com/k-kaundal/fullstack-nnp-template/issues)
    `,
    )
    .setVersion('1.0.0')
    .setContact(
      process.env.API_CONTACT_NAME || 'K K Kaundal',
      process.env.API_CONTACT_URL || 'https://github.com/k-kaundal',
      process.env.API_CONTACT_EMAIL || 'kk@kaundal.vip',
    )
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addServer(
      process.env.API_URL_LOCAL || 'http://localhost:3001',
      'Local Development',
    )
    .addServer(
      process.env.API_URL_PRODUCTION || 'https://your-api.vercel.app',
      'Production',
    )
    .addTag('health', 'Health check endpoints')
    .addTag('auth', 'Authentication & Authorization endpoints')
    .addTag('users', 'User management endpoints')
    .addTag('sessions', 'Session management endpoints')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter your JWT access token',
        in: 'header',
      },
      'JWT',
    )
    .addApiKey(
      {
        type: 'apiKey',
        name: 'X-API-Key',
        in: 'header',
        description: 'API Key for external integrations (optional)',
      },
      'X-API-Key',
    )
    .addGlobalParameters({
      name: 'X-API-Version',
      in: 'header',
      required: false,
      description: 'API version for header-based versioning',
      schema: {
        type: 'string',
        enum: ['1', '2'],
        default: '1',
      },
    })
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    operationIdFactory: (_controllerKey: string, methodKey: string) =>
      methodKey,
  });

  // Customize Swagger UI options
  const customOptions = {
    swaggerOptions: {
      persistAuthorization: true, // Persist auth token in browser
      displayRequestDuration: true, // Show request duration
      filter: true, // Enable search/filter
      showExtensions: true,
      showCommonExtensions: true,
      syntaxHighlight: {
        activate: true,
        theme: 'monokai',
      },
      tryItOutEnabled: true,
      requestSnippetsEnabled: true,
      defaultModelsExpandDepth: 3,
      defaultModelExpandDepth: 3,
      docExpansion: 'list', // 'list', 'full', 'none'
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
    customSiteTitle: 'Fullstack NNP API Documentation',
    customfavIcon: '/favicon.ico',
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info { margin: 20px 0 }
      .swagger-ui .info .title { font-size: 36px }
      .swagger-ui .scheme-container { background: #fafafa; padding: 15px; border-radius: 4px }
      .swagger-ui .opblock-tag { font-size: 20px; font-weight: bold }
      .swagger-ui .opblock.opblock-deprecated { opacity: 0.6; border-color: #f93; }
    `,
  };

  SwaggerModule.setup('api/docs', app, document, customOptions);

  // Export OpenAPI JSON and YAML
  if (process.env.NODE_ENV !== 'production') {
    const outputPath = path.join(process.cwd(), 'docs', 'api');

    // Create docs directory if it doesn't exist
    if (!fs.existsSync(outputPath)) {
      fs.mkdirSync(outputPath, { recursive: true });
    }

    // Export OpenAPI JSON
    fs.writeFileSync(
      path.join(outputPath, 'openapi.json'),
      JSON.stringify(document, null, 2),
    );

    // Export OpenAPI YAML
    const yaml = convertToYaml(document);
    fs.writeFileSync(path.join(outputPath, 'openapi.yaml'), yaml);

    console.log('📄 OpenAPI documentation exported to docs/api/');
  }
}

/**
 * Convert OpenAPI JSON to YAML format
 */
function convertToYaml(obj: unknown, indent = 0): string {
  const spaces = '  '.repeat(indent);
  let yaml = '';

  if (typeof obj === 'object' && obj !== null) {
    if (Array.isArray(obj)) {
      obj.forEach((item) => {
        yaml += `${spaces}- ${convertToYaml(item, indent + 1).trim()}\n`;
      });
    } else {
      Object.entries(obj).forEach(([key, value]) => {
        if (typeof value === 'object' && value !== null) {
          yaml += `${spaces}${key}:\n${convertToYaml(value, indent + 1)}`;
        } else if (typeof value === 'string' && value.includes('\n')) {
          yaml += `${spaces}${key}: |\n${value
            .split('\n')
            .map((line) => `${spaces}  ${line}`)
            .join('\n')}\n`;
        } else {
          yaml += `${spaces}${key}: ${value}\n`;
        }
      });
    }
  } else {
    yaml += String(obj);
  }

  return yaml;
}
