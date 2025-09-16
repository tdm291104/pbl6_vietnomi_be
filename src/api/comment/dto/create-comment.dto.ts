import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateCommentDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  user_id: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  food_id: number;

  @ApiProperty({ example: "content" })
  @IsString()
  @IsNotEmpty()
  content: string;
}
