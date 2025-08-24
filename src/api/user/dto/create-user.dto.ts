import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";
import e from "express";
import { UserRole } from "src/entities";

export class CreateUserDto {
  @ApiProperty({ example: "Họ" })
  @IsString()
  first_name: string;

  @ApiProperty({ example: "Tên" })
  @IsString()
  last_name: string;

  @ApiProperty({ example: "user" })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: "user@gmail.com" })
  @IsString()
  email: string;

  @ApiProperty({ example: "123456" })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty()
  @IsString()
  avatar_url: string;

  @ApiProperty({ example: UserRole.USER })
  @IsString()
  @IsNotEmpty()
  role: UserRole;
}
