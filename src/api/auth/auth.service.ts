import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { RegisterAuthDto } from "./dto/register-auth.dto";
import { UpdateUserDto } from "./dto/update-auth.dto";
import { DeepPartial, ILike, Repository } from "typeorm";
import { UserRole, Users } from "src/entities";
import { compare } from "bcryptjs";
import { log } from "console";
import { InjectRepository } from "@nestjs/typeorm";
import { LoginAuthDto } from "./dto/login-auth.dto";
import { first } from "rxjs";
import { sign, verify } from "jsonwebtoken";
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

  async generateToken(user: Users): Promise<string> {
    const payload = {
      id: user.id,
      username: user.username,
      role: user.role,
    };

    // Tạo token với thời hạn 1 giờ
    if (!process.env.AUTH_JWT_SECRET) {
      throw new Error("JWT secret is not defined in environment variables.");
    }

    return sign(payload, process.env.AUTH_JWT_SECRET, {
      expiresIn: process.env.AUTH_JWT_TOKEN_EXPIRES_IN || "1h",
    });
  }

  async verifyToken(token: string): Promise<any> {
    try {
      if (!process.env.AUTH_JWT_SECRET) {
        throw new Error("JWT secret is not defined in environment variables.");
      }
      const decoded = verify(token, process.env.AUTH_JWT_SECRET);
      console.log("Decoded Token:", decoded);
      return decoded;
    } catch (err) {
      console.error("Invalid token:", err.message);
      return null;
    }
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

    const token = await this.generateToken(user);

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
        token,
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

    const newUser = this.userRepository.create({
      first_name,
      last_name,
      username,
      email,
      password_hash: password,
      role: UserRole.USER,
    });

    await this.userRepository.save(newUser);

    return {
      code: HttpStatus.CREATED,
      message: "User registered successfully",
      data: null,
    };
  }
}
