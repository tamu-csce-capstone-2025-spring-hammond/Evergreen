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

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
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
