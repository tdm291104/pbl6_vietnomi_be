import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { IsNotEmpty, IsString } from "class-validator";
import e from "express";
import { UserRole } from "src/entities";

export class GetUserDto {
  @Expose()
  id: number;

  @Expose()
  first_name: string;

  @Expose()
  last_name: string;

  @Expose()
  username: string;

  @Expose()
  email: string;

  @Expose()
  avatar_url: string;

  @Expose()
  role: UserRole;
}
