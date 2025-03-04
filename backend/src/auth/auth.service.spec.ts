import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';

jest.mock('argon2');

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  const mockPrismaService = {
    users: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signup', () => {
    const signupDto = {
      email: 'test@example.com',
      password: 'Password123!',
      user_name: 'testuser',
    };

    const mockUser = {
      user_id: 1,
      email: 'test@example.com',
      user_name: 'testuser',
      password_hash: 'hashed_password',
    };

    it('should create a new user and return a token', async () => {
      // Mock user not existing
      mockPrismaService.users.findUnique.mockResolvedValue(null);

      // Mock password hashing
      (argon2.hash as jest.Mock).mockResolvedValue('hashed_password');

      // Mock user creation
      mockPrismaService.users.create.mockResolvedValue(mockUser);

      // Mock token generation
      mockJwtService.sign.mockReturnValue('mock_token');

      const result = await service.signup(signupDto);

      expect(mockPrismaService.users.findUnique).toHaveBeenCalledWith({
        where: { email: signupDto.email },
      });

      expect(argon2.hash).toHaveBeenCalledWith(signupDto.password);

      expect(mockPrismaService.users.create).toHaveBeenCalledWith({
        data: {
          email: signupDto.email,
          password_hash: 'hashed_password',
          user_name: signupDto.user_name,
          watchlist: {
            create: [
              { ticker: 'SPY' },
              { ticker: 'QQQ' },
              { ticker: 'VTI' },
              { ticker: 'AAPL' },
              { ticker: 'TSLA' },
              { ticker: 'MSFT' },
              { ticker: 'XLF' },
              { ticker: 'GLD' },
              { ticker: 'USO' },
              { ticker: 'AMZN' },
            ],
          },
        },
      });

      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.user_id,
        email: mockUser.email,
        name: mockUser.user_name,
      });

      expect(result).toEqual({
        access_token: 'mock_token',
      });
    });

    it('should throw an error if email already exists', async () => {
      // Mock user already exists
      mockPrismaService.users.findUnique.mockResolvedValue(mockUser);

      await expect(service.signup(signupDto)).rejects.toThrow(
        'Duplicate email',
      );

      expect(mockPrismaService.users.findUnique).toHaveBeenCalledWith({
        where: { email: signupDto.email },
      });

      expect(mockPrismaService.users.create).not.toHaveBeenCalled();
    });

    it('should throw an error if user creation fails', async () => {
      // Mock user not existing
      mockPrismaService.users.findUnique.mockResolvedValue(null);

      // Mock password hashing
      (argon2.hash as jest.Mock).mockResolvedValue('hashed_password');

      // Mock user creation failing
      mockPrismaService.users.create.mockResolvedValue(null);

      await expect(service.signup(signupDto)).rejects.toThrow(
        'User creation failed',
      );

      expect(mockPrismaService.users.create).toHaveBeenCalled();
      expect(mockJwtService.sign).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'Password123!',
    };

    const mockUser = {
      user_id: 1,
      email: 'test@example.com',
      user_name: 'testuser',
      password_hash: 'hashed_password',
    };

    it('should login a user and return a token', async () => {
      // Mock user exists
      mockPrismaService.users.findUnique.mockResolvedValue(mockUser);

      // Mock password verification
      (argon2.verify as jest.Mock).mockResolvedValue(true);

      // Mock token generation
      mockJwtService.sign.mockReturnValue('mock_token');

      const result = await service.login(loginDto);

      expect(mockPrismaService.users.findUnique).toHaveBeenCalledWith({
        where: { email: loginDto.email },
      });

      expect(argon2.verify).toHaveBeenCalledWith(
        mockUser.password_hash,
        loginDto.password,
      );

      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.user_id,
        email: mockUser.email,
        name: mockUser.user_name,
      });

      expect(result).toEqual({
        access_token: 'mock_token',
      });
    });

    it('should throw an error if user is not found', async () => {
      // Mock user not found
      mockPrismaService.users.findUnique.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        'Invalid credentials',
      );

      expect(mockPrismaService.users.findUnique).toHaveBeenCalledWith({
        where: { email: loginDto.email },
      });

      expect(argon2.verify).not.toHaveBeenCalled();
    });

    it('should throw an error if password is invalid', async () => {
      // Mock user exists
      mockPrismaService.users.findUnique.mockResolvedValue(mockUser);

      // Mock password verification failure
      (argon2.verify as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(
        'Invalid credentials',
      );

      expect(mockPrismaService.users.findUnique).toHaveBeenCalledWith({
        where: { email: loginDto.email },
      });

      expect(argon2.verify).toHaveBeenCalledWith(
        mockUser.password_hash,
        loginDto.password,
      );

      expect(mockJwtService.sign).not.toHaveBeenCalled();
    });
  });
});
