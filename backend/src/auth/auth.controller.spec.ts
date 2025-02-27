import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SignUpDto } from './dto/signup.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  // Mock successful response
  const mockAuthResponse = {
    access_token: 'mock_jwt_token_123',
    expires_in: 900,
  };

  // Mock AuthService
  const mockAuthService = {
    signup: jest.fn(),
    login: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signup', () => {
    const signupDto: SignUpDto = {
      email: 'test@example.com',
      password: 'password123',
      user_name: 'bob_jones',
    };

    it('should successfully create a new user', async () => {
      mockAuthService.signup.mockResolvedValue(mockAuthResponse);

      const result = await controller.signup(signupDto);

      expect(result).toEqual(mockAuthResponse);
      expect(authService.signup).toHaveBeenCalledWith(signupDto);
      expect(authService.signup).toHaveBeenCalledTimes(1);
    });

    it('should throw HttpException with BAD_REQUEST status on signup error', async () => {
      const errorMessage = 'User already exists';
      mockAuthService.signup.mockRejectedValue(new Error(errorMessage));

      await expect(controller.signup(signupDto)).rejects.toThrow(HttpException);

      try {
        await controller.signup(signupDto);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.getStatus()).toBe(HttpStatus.BAD_REQUEST);
        expect(error.getResponse()).toEqual({
          error: 'Invalid request',
          message: errorMessage,
        });
      }
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should successfully login a user', async () => {
      mockAuthService.login.mockResolvedValue(mockAuthResponse);

      const result = await controller.login(loginDto);

      expect(result).toEqual(mockAuthResponse);
      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(authService.login).toHaveBeenCalledTimes(1);
    });

    it('should throw HttpException with UNAUTHORIZED status for invalid credentials', async () => {
      mockAuthService.login.mockRejectedValue(new Error('Invalid credentials'));

      await expect(controller.login(loginDto)).rejects.toThrow(HttpException);

      try {
        await controller.login(loginDto);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.getStatus()).toBe(HttpStatus.UNAUTHORIZED);
        expect(error.getResponse()).toEqual({
          error: 'Invalid credentials',
          message: 'The email or password you entered is incorrect.',
        });
      }
    });

    it('should throw HttpException with BAD_REQUEST status for other errors', async () => {
      const errorMessage = 'Database connection error';
      mockAuthService.login.mockRejectedValue(new Error(errorMessage));

      await expect(controller.login(loginDto)).rejects.toThrow(HttpException);

      try {
        await controller.login(loginDto);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.getStatus()).toBe(HttpStatus.BAD_REQUEST);
        expect(error.getResponse()).toEqual({
          error: 'Invalid request',
          message: errorMessage,
        });
      }
    });
  });
});
