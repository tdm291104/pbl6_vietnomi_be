import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreateIngredientDto } from "./dto/create-ingredient.dto";
import { UpdateIngredientDto } from "./dto/update-ingredient.dto";
import { DeepPartial, ILike, Repository } from "typeorm";
import { Ingredients } from "src/entities";
import { hashSync } from "bcryptjs";
import { log } from "console";
import { InjectRepository } from "@nestjs/typeorm";
@Injectable()
export class IngredientService {
  constructor(
    @InjectRepository(Ingredients)
    private readonly ingredientRepository: Repository<Ingredients>
  ) {}

  async create(createIngredientDto: CreateIngredientDto) {
    const ingredient = this.ingredientRepository.create(createIngredientDto);
    await this.ingredientRepository.save(ingredient);
    return ingredient;
  }

  async findAll(keyWord?: string, page = 1, limit = 10) {
    page = Number(page);
    limit = Number(limit);
    const skip = (page - 1) * limit;

    const where = keyWord ? [{ name: ILike(`%${keyWord}%`) }] : {};

    const [ingredients, totalItems] =
      await this.ingredientRepository.findAndCount({
        where,
        skip,
        take: limit,
        order: { id: "ASC" }, // có thể thay đổi theo yêu cầu
      });

    const totalPages = Math.ceil(totalItems / limit);

    return {
      data: ingredients,
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        pageSize: limit,
      },
    };
  }

  async findOne(id: number) {
    const ingredient = await Ingredients.findOneBy({ id });
    if (!ingredient) {
      throw new NotFoundException(`user with id ${id} not found`);
    }
    return ingredient;
  }

  async update(id: number, updateIngredientDto: UpdateIngredientDto) {
    const ingredient = await this.findOne(id);
    if (!ingredient) {
      throw new Error(`user with id ${id} not found`);
    }
    Object.assign(ingredient, updateIngredientDto);
    await ingredient.save();
    return ingredient;
  }

  async remove(id: number) {
    const ingredient = await this.ingredientRepository.findOne({
      where: { id },
    });
    if (!ingredient) {
      throw new NotFoundException(`Ingredient with ID ${id} not found`);
    }

    ingredient.deletedAt = new Date();
    await this.ingredientRepository.save(ingredient);

    return { message: `Ingredient with ID ${id} has been soft deleted` };
  }
}
