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
import { CommentService } from "./comment.service";
import { CreateCommentDto } from "./dto/create-comment.dto";
import { UpdateCommentDto } from "./dto/update-comment.dto";
import { ApiBearerAuth, ApiQuery } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { GetUser } from "src/decorators/get-user.decorator";
import { PayloadTokenDto } from "../auth/dto/payload-token.dto";

@Controller("comment")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth("token")
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  create(
    @Body() createcommentDto: CreateCommentDto,
    @GetUser() user: PayloadTokenDto
  ) {
    return this.commentService.create(createcommentDto, user.id);
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
    return this.commentService.findAll(keyWord, Number(page), Number(limit));
  }

  @Get("food")
  @ApiQuery({ name: "keyWord", required: false, type: String })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiQuery({ name: "foodID", required: false, type: Number })
  findAllWithFoodID(
    @Query("keyWord") keyWord,
    @Query("page") page = 1,
    @Query("limit") limit = 10,
    @Query("foodID") foodID
  ) {
    return this.commentService.findAllWithFoodID(
      keyWord,
      Number(page),
      Number(limit),
      Number(foodID)
    );
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.commentService.findOne(+id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updatecommentDto: UpdateCommentDto) {
    return this.commentService.update(+id, updatecommentDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.commentService.remove(+id);
  }
}
