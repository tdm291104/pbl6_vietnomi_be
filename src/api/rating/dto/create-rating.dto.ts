import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, Max, Min } from "class-validator";

export class CreateRatingDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  user_id: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  food_id: number;

  @ApiProperty({ example: 5 })
  @IsNumber()
  @IsNotEmpty()
  @Min(1, { message: "Giá trị đánh giá phải lớn hơn hoặc bằng 1." })
  @Max(5, { message: "Giá trị đánh giá phải nhỏ hơn hoặc bằng 5." })
  rating: number;
}
