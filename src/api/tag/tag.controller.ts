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
import { TagService } from "./tag.service";
import { CreateTagDto } from "./dto/create-tag.dto";
import { UpdateTagDto } from "./dto/update-tag.dto";
import { ApiBearerAuth, ApiQuery } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@Controller("tag")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth("token")
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Post()
  create(@Body() createtagDto: CreateTagDto) {
    return this.tagService.create(createtagDto);
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
    return this.tagService.findAll(keyWord, Number(page), Number(limit));
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.tagService.findOne(+id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updatetagDto: UpdateTagDto) {
    return this.tagService.update(+id, updatetagDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.tagService.remove(+id);
  }
}
