import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  UseGuards,
  Get,
  Request,
} from '@nestjs/common';

import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { User } from '../users/user.entity';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Post('register')
  async register(@Body() loginDto: LoginDto) {
    const hash = await bcrypt.hash(loginDto.password, 10);
    const user = await this.usersService.create(loginDto.username, hash);
    return { id: user.id, username: user.username };
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const user: User | null = await this.authService.validateUser(
      loginDto.username,
      loginDto.password,
    );
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.authService.login(user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('private')
  getPrivate(@Request() req) {
    return {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      message: `Hello ${req.user?.username}`,
    };
  }
}
