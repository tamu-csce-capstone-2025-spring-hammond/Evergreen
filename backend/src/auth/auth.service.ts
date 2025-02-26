import { Injectable } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { SignUpDto } from './dto/signup.dto';
import { randomInt } from 'crypto';
import { PrismaService } from 'src/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';

@Injectable()
export class AuthService {
  // Mock user storage (replace with database later)
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
  ) {}

  generateToken(userId: number, email: string, name: string): string {
    const payload = {
      sub: userId,
      email: email,
      name: name,
    };
    return this.jwtService.sign(payload);
  }

  verifyToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      return payload;
    } catch (error) {
      return null;
    }
  }

  async signup(signupDto: SignUpDto) {
    const userTest = await this.findUserByEmail(signupDto.email);
    if (userTest) {
      throw new Error('Duplicate email');
    }
    const password_hash = await argon2.hash(signupDto.password);
    const user = await this.createUser(
      signupDto.email,
      password_hash,
      signupDto.user_name,
    );
    if (!user) {
      throw new Error('User creation failed');
    }

    const token = this.generateToken(user.user_id, user.email, user.user_name);

    return {
      access_token: token,
      expires_in: 900,
    };
  }

  async login(loginDto: LoginDto) {
    // Mock authentication logic
    const user = await this.findUserByEmail(loginDto.email);
    if (!user) {
      throw new Error('Invalid credentials');
    }
    const passwordIsValid = await argon2.verify(
      user.password_hash,
      loginDto.password,
    );
    if (!passwordIsValid) {
      throw new Error('Invalid credentials');
    }

    // Generate token
    const token = this.generateToken(user.user_id, user.email, user.user_name);

    return {
      access_token: token,
      expires_in: 900,
    };
  }

  private async findUserByEmail(email: string) {
    const user = await this.prismaService.users.findUnique({
      where: {
        email: email,
      },
    });
    return user;
  }

  private async createUser(
    email: string,
    password_hash: string,
    user_name: string,
  ) {
    try {
      const user = await this.prismaService.users.create({
        data: {
          email: email,
          password_hash: password_hash,
          user_name: user_name,
        },
      });
      return user;
    } catch (error) {
      return null;
    }
  }
}
