import {
  IsEmail,
  IsString,
  IsNotEmpty,
  MinLength,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignUpDto {
  @ApiProperty({
    example: 'john@example.com',
    description: 'The email address of the user',
    required: true,
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({
    example: 'Password123!',
    description:
      'The password of the user (must be at least 8 characters long with a upper case letter, lower case letter, number and symbol)',
    required: true,
    minLength: 8,
  })
  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).*$/, {
    message:
      'Password must have at least 1 upper case letter, 1 lower case latter, 1 number and 1 symbol',
  })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'The name of the user',
    required: true,
    minLength: 4,
  })
  @IsString({ message: 'user_name must be a string' })
  @IsNotEmpty({ message: 'user_name is required' })
  @MinLength(4, { message: 'user_name must be at least 4 characters long' })
  user_name: string;
}
