import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class RegisterAuthDto {
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
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: "123456" })
  @IsString()
  @IsNotEmpty()
  password: string;
}
