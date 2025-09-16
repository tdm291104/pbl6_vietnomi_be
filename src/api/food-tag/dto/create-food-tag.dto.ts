import { ApiProperty } from "@nestjs/swagger";
import { ArrayMinSize, IsArray, IsNotEmpty, IsNumber } from "class-validator";

export class CreateFoodTagDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  food_id: number;

  @ApiProperty({ example: [1, 2, 3] })
  @IsArray()
  @IsNumber({}, { each: true })
  @ArrayMinSize(1)
  tag_ids: number[];
}
