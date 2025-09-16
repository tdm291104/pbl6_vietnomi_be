import { PartialType } from "@nestjs/swagger";
import { CreateFoodTagDto } from "./create-food-tag.dto";

export class UpdateFoodDto extends PartialType(CreateFoodTagDto) {}
