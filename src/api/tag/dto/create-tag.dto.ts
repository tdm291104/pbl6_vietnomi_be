import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateTagDto {
  @ApiProperty({ example: "name" })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: "url" })
  @IsString()
  @IsNotEmpty()
  image_url: string;
}
