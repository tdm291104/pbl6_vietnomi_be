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
  Req,
} from "@nestjs/common";
import { FoodService } from "./food.service";
import { CreateFoodDto } from "./dto/create-food.dto";
import { UpdateFoodDto } from "./dto/update-food.dto";
import { ApiBearerAuth, ApiQuery } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { Request } from "express";
import { GetUser } from "../../decorators/get-user.decorator";
import { PayloadTokenDto } from "../auth/dto/payload-token.dto";

@Controller("food")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth("token")
export class FoodController {
  constructor(private readonly foodService: FoodService) {}

  @Post()
  create(
    @Body() createfoodDto: CreateFoodDto,
    @GetUser() user: PayloadTokenDto
  ) {
    return this.foodService.create(createfoodDto, user.id);
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

  @Get("user")
  @ApiQuery({ name: "keyWord", required: false, type: String })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiQuery({ name: "userID", required: false, type: Number })
  findAllByUser(
    @Query("keyWord") keyWord,
    @Query("page") page = 1,
    @Query("limit") limit = 10,
    @Query("userID") userID
  ) {
    return this.foodService.findAllByUser(
      userID,
      keyWord,
      Number(page),
      Number(limit)
    );
  }

  @Get("no-posted")
  @ApiQuery({ name: "keyWord", required: false, type: String })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  findAllFoodNoPosted(
    @Query("keyWord") keyWord,
    @Query("page") page = 1,
    @Query("limit") limit = 10
  ) {
    return this.foodService.findAllFoodNoPosted(
      keyWord,
      Number(page),
      Number(limit)
    );
  }

  @Get("favorite")
  @ApiQuery({ name: "keyWord", required: false, type: String })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiQuery({ name: "userID", required: false, type: Number })
  findAllFoodFavorite(
    @Query("keyWord") keyWord,
    @Query("page") page = 1,
    @Query("limit") limit = 10,
    @Query("userID") userID
  ) {
    return this.foodService.findAllFoodFavorite(
      userID,
      keyWord,
      Number(page),
      Number(limit)
    );
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.foodService.findOne(+id);
  }

  @Post("post/:id")
  post_food(@Param("id") id: string) {
    return this.foodService.post_food(+id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updatefoodDto: UpdateFoodDto) {
    return this.foodService.update(+id, updatefoodDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.foodService.remove(+id);
  }

  @Post("mapping-tags")
  autoMapTagsBasedOnIngredients() {
    return this.foodService.autoMapTagsBasedOnIngredients();
  }
}
