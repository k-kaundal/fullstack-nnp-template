// Legacy custom exceptions (keep for backward compatibility)
export {
  CustomException,
  NotFoundException,
  ConflictException,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  InternalServerException,
} from './custom-exception';

// New comprehensive exception library
export * from './custom-exceptions';
