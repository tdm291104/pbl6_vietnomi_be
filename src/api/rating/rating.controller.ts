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
import { GetUser } from "../../decorators/get-user.decorator";
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

  @Get("food")
  @ApiQuery({ name: "keyWord", required: false, type: String })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiQuery({ name: "foodID", required: false, type: Number })
  findAllWithFoodID(
    @Query("keyWord") keyWord,
    @Query("page") page = 1,
    @Query("limit") limit = 10,
    @Query("foodID") foodID
  ) {
    return this.ratingService.findAllWithFoodID(
      keyWord,
      Number(page),
      Number(limit),
      Number(foodID)
    );
  }

  @Get("food/count")
  @ApiQuery({ name: "foodID", required: false, type: Number })
  countRatingByFood(@Query("foodID") foodID) {
    return this.ratingService.countRatingByFood(Number(foodID));
  }

  @Get("user")
  @ApiQuery({ name: "keyWord", required: false, type: String })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiQuery({ name: "userID", required: false, type: Number })
  findAllWithUserID(
    @Query("keyWord") keyWord,
    @Query("page") page = 1,
    @Query("limit") limit = 10,
    @Query("userID") userID
  ) {
    return this.ratingService.findAllWithUserID(
      keyWord,
      Number(page),
      Number(limit),
      Number(userID)
    );
  }

  @Get("user-food")
  @ApiQuery({ name: "keyWord", required: false, type: String })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiQuery({ name: "foodID", required: false, type: Number })
  @ApiQuery({ name: "userID", required: false, type: Number })
  findAllWithUserFood(
    @Query("keyWord") keyWord,
    @Query("page") page = 1,
    @Query("limit") limit = 10,
    @Query("foodID") foodID,
    @Query("userID") userID
  ) {
    return this.ratingService.findAllWithUserFood(
      keyWord,
      Number(page),
      Number(limit),
      Number(foodID),
      Number(userID)
    );
  }

  @Get("average")
  @ApiQuery({ name: "foodID", required: false, type: Number })
  findAverageRatingByFoodID(@Query("foodID") foodID) {
    return this.ratingService.findAverageRatingByFoodID(Number(foodID));
  }

  @Get("total")
  getTotalRatings() {
    return this.ratingService.getTotalRatings();
  }

  @Get("chart-core-engagement-index")
  getCoreEngagementIndex() {
    return this.ratingService.getCoreEngagementIndex();
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
