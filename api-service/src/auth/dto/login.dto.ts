import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'user123', description: "The user's login username" })
  username: string;

  @ApiProperty({ example: 'secret123', description: "The user's password" })
  password: string;
}

export class RegisterDto {
  @ApiProperty({ example: 'user123', description: "The user's login username" })
  username: string;

  @ApiProperty({ example: 'abx@test.com', description: 'Email of the user' })
  email: string;
}
