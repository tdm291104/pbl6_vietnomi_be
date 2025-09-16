import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateFoodTagDto } from "./dto/create-food-tag.dto";
import { UpdateFoodTagDto } from "./dto/update-food-tag.dto";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { FoodTag } from "src/entities/food-tag.entity";
import { Foods } from "src/entities";

@Injectable()
export class FoodTagService {
  constructor(
    @InjectRepository(FoodTag)
    private readonly foodTagRepository: Repository<FoodTag>
  ) {}

  async create(createFoodTagDto: CreateFoodTagDto) {
    const { food_id, tag_ids } = createFoodTagDto;
    const result: ResponseInfo = { code: 200, message: "", data: null };

    const valuesToInsert = tag_ids.map((tag_id) => ({
      food: { id: food_id },
      tag: { id: tag_id },
    }));

    await this.foodTagRepository
      .createQueryBuilder()
      .insert()
      .into(FoodTag)
      .values(valuesToInsert)
      .execute();

    result.message = "Food-Tag associations created successfully";
    return result;
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

  async update(id: number, updateFoodTagDto: UpdateFoodTagDto) {
    const foodTag = await this.findOne(id);
    if (!foodTag) {
      throw new Error(`Food-Tag with id ${id} not found`);
    }
    Object.assign(foodTag, updateFoodTagDto);
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

  async findAllTagsByFoodId(food_id: number) {
    const foodTags = await this.foodTagRepository
      .createQueryBuilder("foodTag")
      .leftJoinAndSelect("foodTag.tag", "tag")
      .where("foodTag.food_id = :food_id", { food_id })
      .getMany();

    return foodTags;
  }

  async updateTagsByFood(updateFoodTagDto: UpdateFoodTagDto) {
    const { food_id, tag_ids } = updateFoodTagDto;
    const foodIdNum = Number(food_id);
    const result: ResponseInfo = { code: 200, message: "", data: null };

    const foodExists = await Foods.findOne({
      where: { id: foodIdNum },
    });

    if (!foodExists) {
      result.code = 404;
      result.message = `Món ăn với ID ${foodIdNum} không tồn tại.`;
      return result;
    }

    await this.foodTagRepository.delete({ food: { id: foodIdNum } });

    if (tag_ids && tag_ids.length > 0) {
      const newFoodTags = tag_ids.map((tag_id) => ({
        food: { id: foodIdNum },
        tag: { id: tag_id },
      }));

      await this.foodTagRepository.save(newFoodTags);
      result.data = newFoodTags;
      result.message = `Tags của món ăn với ID ${foodIdNum} đã được cập nhật thành công.`;
    }

    return result;
  }
}
