import { Module } from "@nestjs/common";
import { TagService } from "./tag.service";
import { TagController } from "./tag.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Tags } from "src/entities/tag.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Tags])],
  controllers: [TagController],
  providers: [TagService],
})
export class TagModule {}
