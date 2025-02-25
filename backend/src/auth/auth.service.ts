import { Injectable } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { SignUpDto } from './dto/signup.dto';
import { randomInt } from 'crypto';

@Injectable()
export class AuthService {
  // Mock user storage (replace with database later)
  private users: any[] = [];

  async signup(signupDto: SignUpDto) {
    // In a real implementation, we would:
    // 1. Check if user already exists
    // 2. Hash the password
    // 3. Save to database
    // 4. Generate real JWT

    this.users.push(signupDto);

    return {
      access_token: 'mock_jwt_token_' + randomInt(22222222),
      expires_in: 900,
    };
  }

  async login(loginDto: LoginDto) {
    // Mock authentication logic
    const user = this.users.find((u) => u.email === loginDto.email);

    if (!user || user.password !== loginDto.password) {
      throw new Error('Invalid credentials');
    }

    return {
      access_token: 'mock_jwt_token_' + Date.now(),
      expires_in: 900,
    };
  }
}
