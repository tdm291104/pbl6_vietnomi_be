import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UnauthorizedException,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { RegisterAuthDto } from "./dto/register-auth.dto";
import { UpdateUserDto } from "./dto/update-auth.dto";
import { ApiQuery } from "@nestjs/swagger";
import { LoginAuthDto } from "./dto/login-auth.dto";
import { ForgotPasswordDto } from "./dto/forgot-pasword.dto";
import { VerifyOtpDto } from "./dto/verify-otp.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { RefreshTokenDto } from "./dto/refresh-token.dto";
import { PayloadTokenDto } from "./dto/payload-token.dto";
import { ref } from "process";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("/login")
  login(@Body() loginDto: LoginAuthDto) {
    return this.authService.login(loginDto);
  }

  @Post("/register")
  register(@Body() registerDto: RegisterAuthDto) {
    return this.authService.register(registerDto);
  }

  @Post("/forgot-password")
  forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.sendResetPasswordOTPAsync(forgotPasswordDto.email);
  }

  @Post("/verify-otp")
  verifyOTP(@Body() verifyOTPDto: VerifyOtpDto) {
    return this.authService.verifyResetPasswordOTP(
      verifyOTPDto.email,
      verifyOTPDto.otp
    );
  }

  @Post("/reset-password")
  resetPassword(
    @Body()
    resetPasswordDto: ResetPasswordDto
  ) {
    return this.authService.resetPassword(
      resetPasswordDto.email,
      resetPasswordDto.newPassword
    );
  }

  @Post("/refresh")
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    const { refreshToken } = refreshTokenDto;

    try {
      const decoded: PayloadTokenDto =
        await this.authService.validateRefreshToken(refreshToken, true);

      const user = await this.authService.getUserByRefreshToken(refreshToken);

      if (!user || user.id !== decoded.id) {
        throw new UnauthorizedException("Invalid refresh token");
      }

      const newTokens = (await this.authService.generateToken(user))
        .accessToken;
      return { data: newTokens };
    } catch (e) {
      throw new UnauthorizedException("Invalid refresh token");
    }
  }
}
