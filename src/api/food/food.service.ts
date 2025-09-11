import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreateFoodDto } from "./dto/create-food.dto";
import { UpdateFoodDto } from "./dto/update-food.dto";
import { ILike, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { Foods } from "src/entities/food.entity";
import * as fs from "fs";
import * as csv from "csv-parser";

@Injectable()
export class FoodService {
  constructor(
    @InjectRepository(Foods)
    private readonly foodRepository: Repository<Foods>
  ) {}

  async create(createFoodDto: CreateFoodDto) {
    const food = this.foodRepository.create(createFoodDto);
    await this.foodRepository.save(food);
    return food;
  }

  async findAll(keyWord?: string, page = 1, limit = 10) {
    page = Number(page);
    limit = Number(limit);
    const skip = (page - 1) * limit;

    const where = keyWord ? [{ name: ILike(`%${keyWord}%`) }] : {};

    const [foods, totalItems] = await this.foodRepository.findAndCount({
      where,
      skip,
      take: limit,
      order: { id: "DESC" }, // có thể thay đổi theo yêu cầu
    });

    const totalPages = Math.ceil(totalItems / limit);

    return {
      data: foods,
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        pageSize: limit,
      },
    };
  }

  async findOne(id: number) {
    const food = await Foods.findOneBy({ id });
    if (!food) {
      throw new NotFoundException(`user with id ${id} not found`);
    }
    return food;
  }

  async update(id: number, updateFoodDto: UpdateFoodDto) {
    const food = await this.findOne(id);
    if (!food) {
      throw new Error(`user with id ${id} not found`);
    }
    Object.assign(food, updateFoodDto);
    await food.save();
    return food;
  }

  async remove(id: number) {
    const food = await this.foodRepository.findOne({
      where: { id },
    });
    if (!food) {
      throw new NotFoundException(`Food with ID ${id} not found`);
    }

    food.deletedAt = new Date();
    await this.foodRepository.save(food);

    return { message: `Food with ID ${id} has been soft deleted` };
  }
}
