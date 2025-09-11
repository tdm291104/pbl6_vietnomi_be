import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateFoodDto {
  @ApiProperty({ example: "dish_name" })
  @IsString()
  @IsNotEmpty()
  dish_name: string;

  @ApiProperty({ example: "description" })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: "dish_type" })
  @IsString()
  @IsNotEmpty()
  dish_type: string;

  @ApiProperty({ example: "serving_size" })
  @IsString()
  @IsNotEmpty()
  serving_size: string;

  @ApiProperty({ example: "cooking_time" })
  @IsString()
  @IsNotEmpty()
  cooking_time: string;

  @ApiProperty({ example: "ingredients" })
  @IsString()
  @IsNotEmpty()
  ingredients: string;

  @ApiProperty({ example: "cooking_method" })
  @IsString()
  @IsNotEmpty()
  cooking_method: string;

  @ApiProperty()
  @IsNumber()
  calories: number;

  @ApiProperty()
  @IsNumber()
  fat: number;

  @ApiProperty()
  @IsNumber()
  fiber: number;

  @ApiProperty()
  @IsNumber()
  sugar: number;

  @ApiProperty()
  @IsNumber()
  protein: number;

  @ApiProperty()
  @IsString()
  image_link: string;
}
