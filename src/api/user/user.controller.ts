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
import { UserService } from "./user.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { ApiBearerAuth, ApiQuery } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { log } from "console";

@Controller("user")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth("token")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createuserDto: CreateUserDto) {
    return this.userService.create(createuserDto);
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
    return this.userService.findAll(keyWord, Number(page), Number(limit));
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.userService.findOne(+id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateuserDto: UpdateUserDto) {
    log("updateuserDto", updateuserDto);
    return this.userService.update(+id, updateuserDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.userService.remove(+id);
  }
}
