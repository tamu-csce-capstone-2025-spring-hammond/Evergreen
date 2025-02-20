import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SignUpDto } from './dto/signup.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: SignUpDto, description: 'User registration details' })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
    schema: {
      example: {
        access_token: 'mock_jwt_token_[random numbers]',
        expires_in: 900,
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid request',
    schema: {
      example: {
        error: 'Invalid request',
        message: 'Error message',
      },
    },
  })
  async signup(@Body() signupDto: SignUpDto) {
    try {
      return await this.authService.signup(signupDto);
    } catch (error) {
      throw new HttpException(
        {
          error: 'Invalid request',
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('login')
  @ApiOperation({ summary: 'Login a user' })
  @ApiBody({ type: LoginDto, description: 'User login credentials' })
  @ApiResponse({
    status: 200,
    description: 'User logged in successfully',
    schema: {
      example: {
        access_token: 'mock_jwt_token_[random numbers]',
        expires_in: 900,
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid credentials',
    schema: {
      example: {
        error: 'Invalid credentials',
        message: 'The email or password you entered is incorrect.',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid request',
    schema: {
      example: {
        error: 'Invalid request',
        message: 'Error message',
      },
    },
  })
  async login(@Body() loginDto: LoginDto) {
    try {
      return await this.authService.login(loginDto);
    } catch (error) {
      if (error.message === 'Invalid credentials') {
        throw new HttpException(
          {
            error: 'Invalid credentials',
            message: 'The email or password you entered is incorrect.',
          },
          HttpStatus.UNAUTHORIZED,
        );
      }
      throw new HttpException(
        {
          error: 'Invalid request',
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
