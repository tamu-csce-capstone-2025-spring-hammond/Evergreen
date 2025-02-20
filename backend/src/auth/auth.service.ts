import { Injectable } from '@nestjs/common';
import { JWTResponseType, UserInfoType } from 'src/auth/auth.type';
import { SignUpDto } from './dto/signup.dto';

@Injectable()
export class AuthService {
  async login(user: UserInfoType): Promise<JWTResponseType> {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: 'AccessTokenLmao', //this.jwtService.sign(payload),
      expires_in: 900,
    };
  }

  async signup(signUpDto: SignUpDto): Promise<UserInfoType> {
    //set user up in database
    return {
      id: 123,
      email: signUpDto.email,
      firstName: signUpDto.firstName,
      lastName: signUpDto.lastName,
    };
  }

  async validateUser(
    email: string,
    pass: string,
  ): Promise<UserInfoType | boolean> {
    if (pass == 'Password123' && email.length > 0) {
      return {
        id: 1234,
        email: email,
        firstName: 'Bob',
        lastName: 'Jones',
      };
    }
    return false;
  }
}
