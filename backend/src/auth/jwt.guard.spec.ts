import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtGuard } from './jwt.guard';
describe('JwtGuard', () => {
  let guard: JwtGuard;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtGuard,
        {
          provide: JwtService,
          useValue: {
            verify: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<JwtGuard>(JwtGuard);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    let mockExecutionContext: ExecutionContext;
    let mockRequest: any;

    beforeEach(() => {
      mockRequest = {
        headers: {},
      };

      mockExecutionContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue(mockRequest),
        }),
      } as unknown as ExecutionContext;
    });

    it('should throw UnauthorizedException if no authorization header is present', async () => {
      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if authorization header does not start with Bearer', async () => {
      mockRequest.headers['authorization'] = 'Basic token123';

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if token verification fails', async () => {
      mockRequest.headers['authorization'] = 'Bearer invalidToken';
      jest.spyOn(jwtService, 'verify').mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        'Invalid Bearer Token',
      );
      expect(jwtService.verify).toHaveBeenCalledWith('invalidToken');
    });

    it('should set userid in request and return true on successful verification', async () => {
      mockRequest.headers['authorization'] = 'Bearer validToken';
      const mockJwtPayload = { sub: 'user123' };

      jest.spyOn(jwtService, 'verify').mockReturnValue(mockJwtPayload);

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(mockRequest.userid).toBe('user123');
      expect(jwtService.verify).toHaveBeenCalledWith('validToken');
    });
  });
});
