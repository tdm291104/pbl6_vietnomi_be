import { HttpStatus, Injectable, UnauthorizedException } from "@nestjs/common";
import { RegisterAuthDto } from "./dto/register-auth.dto";
import { IsNull, Repository } from "typeorm";
import { UserRole, Users } from "src/entities";
import { compare, hashSync } from "bcryptjs";
import { InjectRepository } from "@nestjs/typeorm";
import { LoginAuthDto } from "./dto/login-auth.dto";
import { sign, verify, SignOptions } from "jsonwebtoken";
import * as nodemailer from "nodemailer";
import { join } from "path";
import { readFile } from "fs/promises";
import { PayloadTokenDto } from "./dto/payload-token.dto";
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>
  ) {}

  async checkExistEmail(email: string): Promise<boolean> {
    const user = await Users.findOneBy({ email });
    if (user) {
      return true;
    }
    return false;
  }

  async checkExistUsername(username: string): Promise<boolean> {
    const user = await Users.findOneBy({ username });
    if (user) {
      return true;
    }
    return false;
  }

  async checkPassword(password: string, hashedPassword: string) {
    const match = await compare(password, hashedPassword);
    if (match) {
      return true;
    }
    return false;
  }

  async generateToken(
    user: Users
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload: PayloadTokenDto = {
      id: user.id,
      username: user.username,
      role: user.role,
    };

    // Tạo token với thời hạn 1 giờ
    if (!process.env.AUTH_JWT_SECRET) {
      throw new Error("JWT secret is not defined in environment variables.");
    }

    const accessToken = sign(
      payload,
      process.env.AUTH_JWT_SECRET as string,
      {
        expiresIn: process.env.AUTH_JWT_TOKEN_EXPIRES_IN || "1h",
      } as SignOptions
    );

    const refreshToken = sign(
      payload,
      process.env.AUTH_JWT_REFRESH_SECRET as string,
      {
        expiresIn: process.env.AUTH_JWT_REFRESH_TOKEN_EXPIRES_IN || "7d",
      } as SignOptions
    );

    return { accessToken, refreshToken };
  }

  async verifyToken(
    token: string,
    refresh: boolean = false
  ): Promise<PayloadTokenDto | null> {
    try {
      if (refresh) {
        if (!process.env.AUTH_JWT_REFRESH_SECRET) {
          throw new Error(
            "JWT refresh secret is not defined in environment variables."
          );
        }
        const decoded = verify(token, process.env.AUTH_JWT_REFRESH_SECRET);
        return decoded as PayloadTokenDto;
      }
      if (!process.env.AUTH_JWT_SECRET) {
        throw new Error("JWT secret is not defined in environment variables.");
      }
      const decoded = verify(token, process.env.AUTH_JWT_SECRET);
      return decoded as PayloadTokenDto;
    } catch (err) {
      console.error("Invalid token:", err.message);
      return null;
    }
  }

  async generateOTP(): Promise<string> {
    const otp = Math.floor(100000 + Math.random() * 900000);
    return otp.toString();
  }

  async validateUserByPayload(payload: any): Promise<any> {
    var username = payload.username;
    return await this.userRepository.findOne({
      where: { username, delFlag: false },
    });
  }

  async validateRefreshToken(
    token: string,
    refresh: boolean = false
  ): Promise<PayloadTokenDto> {
    try {
      const payload = await this.verifyToken(token, refresh);
      if (!payload) {
        throw new UnauthorizedException(
          "Refresh token has expired or is invalid."
        );
      }
      return payload;
    } catch (e) {
      throw new UnauthorizedException(
        "Refresh token has expired or is invalid."
      );
    }
  }

  async getUserByRefreshToken(refreshToken: string): Promise<Users | null> {
    return await this.userRepository.findOne({ where: { refreshToken } });
  }

  async login(loginDto: LoginAuthDto) {
    const { username, password } = loginDto;

    const user = await this.userRepository.findOne({
      where: { username, delFlag: false },
    });

    if (!user) {
      return {
        code: HttpStatus.NOT_FOUND,
        message: "User not found",
        data: null,
      };
    }

    const isPasswordValid = await this.checkPassword(
      password,
      user.password_hash
    );
    if (!isPasswordValid) {
      return {
        code: HttpStatus.BAD_REQUEST,
        message: "Password is incorrect",
        data: null,
      };
    }

    const { accessToken, refreshToken } = await this.generateToken(user);

    return {
      code: HttpStatus.OK,
      message: "Login successful",
      data: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username,
        email: user.email,
        avatar_url: user.avatar_url,
        role: user.role,
        token: accessToken,
        refreshToken: refreshToken,
      },
    };
  }

  async register(registerDto: RegisterAuthDto) {
    const { first_name, last_name, username, email, password } = registerDto;

    const isEmailExist = await this.checkExistEmail(email);
    if (isEmailExist) {
      return {
        code: HttpStatus.BAD_REQUEST,
        message: "Email already exists",
        data: null,
      };
    }

    const isUsernameExist = await this.checkExistUsername(username);
    if (isUsernameExist) {
      return {
        code: HttpStatus.BAD_REQUEST,
        message: "Username already exists",
        data: null,
      };
    }

    let password_hash = hashSync(password, 10);

    const newUser = this.userRepository.create({
      first_name,
      last_name,
      username,
      email,
      password_hash,
      role: UserRole.USER,
    });

    await this.userRepository.save(newUser);

    return {
      code: HttpStatus.CREATED,
      message: "User registered successfully",
      data: null,
    };
  }

  async sendOtpEmail(toEmail: string, otp: string) {
    const fromEmail = process.env.EMAIL_FROM;
    const password = process.env.EMAIL_PASSWORD;

    if (!fromEmail || !password) {
      throw new Error("Email settings are not configured properly.");
    }

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT!) || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: fromEmail,
        pass: password,
      },
    });

    const templatePath = join(
      process.cwd(),
      "src",
      "templates",
      "ResetPasswordEmail.html"
    );
    let body = await readFile(templatePath, "utf8");

    body = body.replace(/{{TO_EMAIL_ADDRESS}}/g, toEmail);
    body = body.replace(/{{INSERT_OTP}}/g, otp);

    const mailOptions = {
      from: `"Vietnomi" <${fromEmail}>`,
      to: toEmail,
      subject: "Password Reset OTP",
      html: body,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log("Email sent successfully!");
    } catch (error) {
      console.error("Error sending email:", error);
      throw error;
    }
  }

  async sendResetPasswordOTPAsync(email: string): Promise<ResponseInfo> {
    try {
      var result: ResponseInfo = new Object() as ResponseInfo;
      email = email.trim();
      const user = await this.userRepository.findOne({
        where: { email, delFlag: false },
      });

      if (!user) {
        result.code = HttpStatus.NOT_FOUND;
        result.message = "User not found";
        result.data = null;
        return result;
      }

      const otp = await this.generateOTP();
      user.otp = otp;
      user.otp_expiry_time = new Date(Date.now() + 5 * 60 * 1000);
      await this.userRepository.save(user);
      await this.sendOtpEmail(email, otp);

      result.code = HttpStatus.OK;
      result.message = "OTP sent to email successfully";
      result.data = null;

      return result;
    } catch (e: any) {
      // Xử lý lỗi
      console.error("Error in send reset password OTP", e);
      throw e;
    }
  }

  async verifyResetPasswordOTP(
    email: string,
    otp: string
  ): Promise<ResponseInfo> {
    try {
      var result: ResponseInfo = new Object() as ResponseInfo;
      email = email.trim();
      otp = otp.trim();
      const user = await this.userRepository.findOne({
        where: { email, delFlag: false },
      });

      if (!user) {
        result.code = HttpStatus.NOT_FOUND;
        result.message = "User not found";
        result.data = null;
        return result;
      }
      if (user.otp !== otp) {
        result.code = HttpStatus.BAD_REQUEST;
        result.message = "Invalid OTP";
        result.data = null;
        return result;
      }
      if (!user.otp_expiry_time || user.otp_expiry_time < new Date()) {
        result.code = HttpStatus.BAD_REQUEST;
        result.message = "OTP has expired";
        result.data = null;
        return result;
      }

      user.otp = null;
      user.otp_expiry_time = null;
      await this.userRepository.save(user);
      result.code = HttpStatus.OK;
      result.message = "OTP is valid";
      result.data = null;
      return result;
    } catch (e: any) {
      // Xử lý lỗi
      console.error("Error in verify reset password OTP", e);
      throw e;
    }
  }

  async resetPassword(
    email: string,
    newPassword: string
  ): Promise<ResponseInfo> {
    try {
      var result: ResponseInfo = new Object() as ResponseInfo;
      email = email.trim();
      const user = await this.userRepository.findOne({
        where: { email, delFlag: false },
      });
      if (!user) {
        result.code = HttpStatus.NOT_FOUND;
        result.message = "User not found";
        result.data = null;
        return result;
      }

      const password_hash = hashSync(newPassword, 10);
      user.password_hash = password_hash;
      await this.userRepository.save(user);
      result.code = HttpStatus.OK;
      result.message = "Password reset successfully";
      result.data = null;
      return result;
    } catch (e: any) {
      // Xử lý lỗi
      console.error("Error in reset password", e);
      throw e;
    }
  }
}
