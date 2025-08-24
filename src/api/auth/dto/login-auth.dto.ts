import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class LoginAuthDto {
  @ApiProperty({ example: "user" })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: "123456" })
  @IsString()
  @IsNotEmpty()
  password: string;
}
