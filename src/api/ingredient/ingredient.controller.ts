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
import { IngredientService } from "./ingredient.service";
import { CreateIngredientDto } from "./dto/create-ingredient.dto";
import { UpdateIngredientDto } from "./dto/update-ingredient.dto";
import { ApiBearerAuth, ApiQuery } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

// @Controller("ingredient")
// @UseGuards(JwtAuthGuard)
// @ApiBearerAuth("token")
export class IngredientController {
  // constructor(private readonly ingredientService: IngredientService) {}
  // @Post()
  // create(@Body() createingredientDto: CreateIngredientDto) {
  //   return this.ingredientService.create(createingredientDto);
  // }
  // @Get()
  // @ApiQuery({ name: "keyWord", required: false, type: String })
  // @ApiQuery({ name: "page", required: false, type: Number })
  // @ApiQuery({ name: "limit", required: false, type: Number })
  // findAll(
  //   @Query("keyWord") keyWord,
  //   @Query("page") page = 1,
  //   @Query("limit") limit = 10
  // ) {
  //   return this.ingredientService.findAll(keyWord, Number(page), Number(limit));
  // }
  // @Get(":id")
  // findOne(@Param("id") id: string) {
  //   return this.ingredientService.findOne(+id);
  // }
  // @Patch(":id")
  // update(
  //   @Param("id") id: string,
  //   @Body() updateingredientDto: UpdateIngredientDto
  // ) {
  //   return this.ingredientService.update(+id, updateingredientDto);
  // }
  // @Delete(":id")
  // remove(@Param("id") id: string) {
  //   return this.ingredientService.remove(+id);
  // }
}
