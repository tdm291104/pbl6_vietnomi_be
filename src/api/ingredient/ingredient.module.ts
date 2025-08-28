import { Module } from "@nestjs/common";
import { IngredientService } from "./ingredient.service";
import { IngredientController } from "./ingredient.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Ingredients } from "src/entities";

@Module({
  imports: [TypeOrmModule.forFeature([Ingredients])],
  controllers: [IngredientController],
  providers: [IngredientService],
})
export class IngredientModule {}
