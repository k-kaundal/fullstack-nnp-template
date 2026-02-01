import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsString,
  validateSync,
  IsNotEmpty,
  Min,
  Max,
  IsOptional,
} from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment;

  @IsNumber()
  @Min(1000)
  @Max(65535)
  PORT: number;

  @IsString()
  @IsNotEmpty()
  DATABASE_HOST: string;

  @IsNumber()
  @Min(1000)
  @Max(65535)
  DATABASE_PORT: number;

  @IsString()
  @IsNotEmpty()
  DATABASE_USERNAME: string;

  @IsString()
  @IsNotEmpty()
  DATABASE_PASSWORD: string;

  @IsString()
  @IsNotEmpty()
  DATABASE_NAME: string;

  @IsString()
  @IsNotEmpty()
  JWT_SECRET: string;

  @IsString()
  @IsNotEmpty()
  JWT_EXPIRATION: string;

  @IsString()
  @IsNotEmpty()
  CORS_ORIGIN: string;

  @IsString()
  @IsOptional()
  RBAC_ENABLED?: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
}
