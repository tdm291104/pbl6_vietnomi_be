import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber } from "class-validator";

export class CreateFoodTagDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  food_id: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  tag_id: number;
}
