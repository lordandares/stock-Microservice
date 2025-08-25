import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  UseGuards,
  Get,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBody, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { User } from '../users/user.entity';
import { JwtAuthGuard } from './jwt-auth.guard';

@ApiTags('Authentication') // Groups endpoints in Swagger
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Post('register')
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 201, description: 'User successfully registered.' })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  async register(@Body() loginDto: LoginDto) {
    const hash = await bcrypt.hash(loginDto.password, 10);
    const user = await this.usersService.create(loginDto.username, hash);
    return { id: user.id, username: user.username };
  }

  @Post('login')
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'User successfully logged in.' })
  @ApiResponse({ status: 401, description: 'Invalid credentials.' })
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
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Access to private route granted.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  getPrivate(@Request() req) {
    return {
      message: `Hello ${req}`,
    };
  }
}
