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
import { FoodTagService } from "./food-tag.service";
import { CreateFoodTagDto } from "./dto/create-food-tag.dto";
import { UpdateFoodDto } from "./dto/update-food-tag.dto";
import { ApiBearerAuth, ApiQuery } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { GetUser } from "src/decorators/get-user.decorator";
import { PayloadTokenDto } from "../auth/dto/payload-token.dto";

@Controller("foodTag")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth("token")
export class FoodTagController {
  constructor(private readonly foodTagService: FoodTagService) {}

  @Post()
  create(@Body() createfoodTagDto: CreateFoodTagDto) {
    return this.foodTagService.create(createfoodTagDto);
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
    return this.foodTagService.findAll(keyWord, Number(page), Number(limit));
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.foodTagService.findOne(+id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updatefoodTagDto: UpdateFoodDto) {
    return this.foodTagService.update(+id, updatefoodTagDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.foodTagService.remove(+id);
  }
}
