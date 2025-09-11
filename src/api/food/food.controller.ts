import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from "@nestjs/common";
import { FoodService } from "./food.service";
import { CreateFoodDto } from "./dto/create-food.dto";
import { UpdateFoodDto } from "./dto/update-food.dto";
import { ApiBearerAuth, ApiQuery } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@Controller("food")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth("token")
export class FoodController {
  constructor(private readonly foodService: FoodService) {}

  @Post()
  create(@Body() createfoodDto: CreateFoodDto) {
    return this.foodService.create(createfoodDto);
  }

  @Get()
  @ApiQuery({ name: "keyWord", required: false, type: String })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  findAll(
    @Query("keyWord") keyWord,
    @Query("page") page = 1,
    @Query("limit") limit = 10
  ) {
    return this.foodService.findAll(keyWord, Number(page), Number(limit));
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.foodService.findOne(+id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updatefoodDto: UpdateFoodDto) {
    return this.foodService.update(+id, updatefoodDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.foodService.remove(+id);
  }
}
