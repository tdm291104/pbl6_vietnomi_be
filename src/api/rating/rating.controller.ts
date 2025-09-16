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
import { RatingService } from "./rating.service";
import { CreateRatingDto } from "./dto/create-rating.dto";
import { UpdateRatingDto } from "./dto/update-rating.dto";
import { ApiBearerAuth, ApiQuery } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { GetUser } from "src/decorators/get-user.decorator";
import { PayloadTokenDto } from "../auth/dto/payload-token.dto";

@Controller("rating")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth("token")
export class RatingController {
  constructor(private readonly ratingService: RatingService) {}

  @Post()
  create(
    @Body() createratingDto: CreateRatingDto,
    @GetUser() user: PayloadTokenDto
  ) {
    return this.ratingService.create(createratingDto, user.id);
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
    return this.ratingService.findAll(keyWord, Number(page), Number(limit));
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.ratingService.findOne(+id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateratingDto: UpdateRatingDto) {
    return this.ratingService.update(+id, updateratingDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.ratingService.remove(+id);
  }
}
