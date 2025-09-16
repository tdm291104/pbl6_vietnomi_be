import { Module } from "@nestjs/common";
import { FoodTagService } from "./food-tag.service";
import { FoodTagController } from "./food-tag.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { FoodTag } from "src/entities/food-tag.entity";

@Module({
  imports: [TypeOrmModule.forFeature([FoodTag])],
  controllers: [FoodTagController],
  providers: [FoodTagService],
})
export class FoodTagModule {}
