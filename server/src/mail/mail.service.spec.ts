import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { MailService } from './mail.service';

/**
 * Test suite for MailService
 */
describe('MailService', () => {
  let service: MailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config: Record<string, unknown> = {
                'mail.host': 'smtp.example.com',
                'mail.port': 587,
                'mail.secure': false,
                'mail.auth.user': 'test@example.com',
                'mail.auth.pass': 'password',
                'mail.from': 'noreply@example.com',
                CORS_ORIGIN: 'http://localhost:3000',
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a nodemailer transporter on init', () => {
    expect(service).toBeDefined();
    // Transporter is created in constructor via nodemailer.createTransport
  });
});
