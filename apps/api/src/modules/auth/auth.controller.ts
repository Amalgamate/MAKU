import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Public } from '../../shared/decorators/public.decorator';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import type { JwtPayload } from './types/jwt-payload.type';
import type { User } from '../users/user.entity';

const REFRESH_COOKIE = 'refreshToken';
const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env['NODE_ENV'] === 'production',
  sameSite: 'strict' as const,
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
};

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  // POST /v1/auth/login
  @Public()
  @UseGuards(AuthGuard('local'))
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiBody({ type: LoginDto })
  async login(
    @Req() req: Request & { user: User },
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken } = await this.authService.login(req.user);
    res.cookie(REFRESH_COOKIE, refreshToken, COOKIE_OPTS);
    return {
      accessToken,
      user: this.usersService.toProfile(req.user),
    };
  }

  // POST /v1/auth/refresh
  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rotate refresh token and get a new access token' })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const rawToken = req.cookies?.[REFRESH_COOKIE] as string | undefined;
    if (!rawToken) {
      return res.status(HttpStatus.UNAUTHORIZED).json({ message: 'No refresh token' });
    }
    const { accessToken, refreshToken } = await this.authService.refresh(rawToken);
    res.cookie(REFRESH_COOKIE, refreshToken, COOKIE_OPTS);
    return { accessToken };
  }

  // POST /v1/auth/logout
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Revoke refresh token and clear cookie' })
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const rawToken = req.cookies?.[REFRESH_COOKIE] as string | undefined;
    if (rawToken) await this.authService.logout(rawToken);
    res.clearCookie(REFRESH_COOKIE, { path: '/' });
  }

  // POST /v1/auth/forgot-password
  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request a password reset OTP via email or SMS' })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    const { resetToken } = await this.authService.forgotPassword(dto);
    // resetToken is returned so the client can pass it with the OTP on reset
    return { resetToken, message: 'If the account exists, an OTP has been sent.' };
  }

  // POST /v1/auth/reset-password
  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password using OTP' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.authService.resetPassword(dto);
    return { message: 'Password reset successfully. Please log in.' };
  }

  // GET /v1/auth/me
  @Get('me')
  @ApiOperation({ summary: 'Get the current authenticated user profile' })
  async me(@CurrentUser() payload: JwtPayload) {
    const user = await this.usersService.findById(payload.sub);
    return this.usersService.toProfile(user);
  }
}
