import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signup', () => {
    it('should create a new user and return access token', async () => {
      const signupDto: SignUpDto = {
        email: 'test@example.com',
        password: 'password123',
        user_name: 'Bob Jones',
      };

      const result = await service.signup(signupDto);

      expect(result).toHaveProperty('access_token');
      expect(result.access_token).toContain('mock_jwt_token_');
      expect(result).toHaveProperty('expires_in', 900);
    });

    it('should store the user in the users array', async () => {
      const signupDto: SignUpDto = {
        email: 'test@example.com',
        password: 'password123',
        user_name: 'Bob Jones',
      };

      await service.signup(signupDto);

      // Access private users array using type assertion
      const users = (service as any).users;
      expect(users).toHaveLength(1);
      expect(users[0]).toEqual(signupDto);
    });
  });

  describe('login', () => {
    beforeEach(async () => {
      // Setup test user
      const signupDto: SignUpDto = {
        email: 'test@example.com',
        password: 'password123',
        user_name: 'Bob Jones',
      };
      await service.signup(signupDto);
    });

    it('should return access token for valid credentials', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = await service.login(loginDto);

      expect(result).toHaveProperty('access_token');
      expect(result.access_token).toContain('mock_jwt_token_');
      expect(result).toHaveProperty('expires_in', 900);
    });

    it('should throw error for invalid email', async () => {
      const loginDto: LoginDto = {
        email: 'wrong@example.com',
        password: 'password123',
      };

      await expect(service.login(loginDto)).rejects.toThrow(
        'Invalid credentials',
      );
    });

    it('should throw error for invalid password', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      await expect(service.login(loginDto)).rejects.toThrow(
        'Invalid credentials',
      );
    });
  });

  // Time-sensitive test to verify token uniqueness
  describe('token generation', () => {
    it('should generate unique tokens for different signups', async () => {
      const signupDto1: SignUpDto = {
        email: 'user1@example.com',
        password: 'password123',
        user_name: 'Bob Jones',
      };

      const signupDto2: SignUpDto = {
        email: 'user2@example.com',
        password: 'password1234',
        user_name: 'Bob Jones',
      };

      const result1 = await service.signup(signupDto1);
      const result2 = await service.signup(signupDto2);

      expect(result1.access_token).not.toEqual(result2.access_token);
    });
  });
});
