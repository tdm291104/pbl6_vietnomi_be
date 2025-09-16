import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateFoodTagDto } from "./dto/create-food-tag.dto";
import { UpdateFoodDto } from "./dto/update-food-tag.dto";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { FoodTag } from "src/entities/food-tag.entity";

@Injectable()
export class FoodTagService {
  constructor(
    @InjectRepository(FoodTag)
    private readonly foodTagRepository: Repository<FoodTag>
  ) {}

  async create(createFoodTagDto: CreateFoodTagDto) {
    const foodTag = this.foodTagRepository.create(createFoodTagDto);

    await this.foodTagRepository.save(foodTag);
    return foodTag;
  }

  async findAll(keyWord?: string, page = 1, limit = 10) {
    page = Number(page);
    limit = Number(limit);
    const skip = (page - 1) * limit;

    const where = { delFlag: false };
    const [foodTag, totalItems] = await this.foodTagRepository.findAndCount({
      where,
      skip,
      take: limit,
      order: { id: "DESC" }, // có thể thay đổi theo yêu cầu
    });

    const totalPages = Math.ceil(totalItems / limit);

    return {
      data: foodTag,
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        pageSize: limit,
      },
    };
  }

  async findAllWithFoodId(
    keyWord?: string,
    page = 1,
    limit = 10,
    foodId?: number
  ) {
    page = Number(page);
    limit = Number(limit);
    const skip = (page - 1) * limit;

    const where = { food_id: foodId, delFlag: false };
    const [foodTag, totalItems] = await this.foodTagRepository.findAndCount({
      where,
      skip,
      take: limit,
      order: { id: "DESC" },
    });

    const totalPages = Math.ceil(totalItems / limit);

    return {
      data: foodTag,
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        pageSize: limit,
      },
    };
  }

  async findOne(id: number) {
    const foodTag = await FoodTag.findOneBy({ id, delFlag: false });
    if (!foodTag) {
      throw new NotFoundException(`Food with id ${id} not found`);
    }
    return foodTag;
  }

  async update(id: number, updateFoodDto: UpdateFoodDto) {
    const foodTag = await this.findOne(id);
    if (!foodTag) {
      throw new Error(`Food-Tag with id ${id} not found`);
    }
    Object.assign(foodTag, updateFoodDto);
    await foodTag.save();
    return foodTag;
  }

  async remove(id: number) {
    const foodTag = await this.foodTagRepository.findOne({
      where: { id },
    });
    if (!foodTag) {
      throw new NotFoundException(`Food-Tag with ID ${id} not found`);
    }

    foodTag.deletedAt = new Date();
    foodTag.delFlag = true;
    await this.foodTagRepository.save(foodTag);

    return { message: `Food-Tag with ID ${id} has been soft deleted` };
  }
}
