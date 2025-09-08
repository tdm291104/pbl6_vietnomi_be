import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class ForgotPasswordDto {
  @ApiProperty({ example: "user@gmail.com" })
  @IsString()
  @IsNotEmpty()
  email: string;
}
