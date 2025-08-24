import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { RegisterAuthDto } from "./dto/register-auth.dto";
import { UpdateUserDto } from "./dto/update-auth.dto";
import { ApiQuery } from "@nestjs/swagger";
import { LoginAuthDto } from "./dto/login-auth.dto";

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
}
