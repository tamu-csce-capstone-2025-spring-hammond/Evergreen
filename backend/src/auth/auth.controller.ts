import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JWTResponseType, UserInfoType } from 'src/auth/auth.type';
import { SignUpDto } from './dto/signup.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  async signup(@Body signupDTO: SignUpDto): JWTResponseType {
    const user = await this.authService.signup(signupDTO);
    const response = await this.authService.login(user);
    return response;
  }
}
// import { Controller, Get } from '@nestjs/common';
// import { AppService } from './app.service';

// @Controller()
// export class AppController {
//   constructor(private readonly appService: AppService) {}

//   @Get()
//   getHello(): string {
//     return this.appService.getHello();
//   }
// }
