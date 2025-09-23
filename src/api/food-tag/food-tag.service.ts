import { HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { CreateFoodTagDto } from "./dto/create-food-tag.dto";
import { UpdateFoodTagDto } from "./dto/update-food-tag.dto";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { FoodTag } from "../../entities/food-tag.entity";
import { Foods } from "../../entities";

@Injectable()
export class FoodTagService {
  constructor(
    @InjectRepository(FoodTag)
    private readonly foodTagRepository: Repository<FoodTag>
  ) {}

  async create(createFoodTagDto: CreateFoodTagDto) {
    const result: ResponseInfo = new Object({
      code: HttpStatus.OK,
      message: "",
      data: null,
    }) as ResponseInfo;
    try {
      const { food_id, tag_ids } = createFoodTagDto;

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
    } catch (error) {
      result.code = HttpStatus.INTERNAL_SERVER_ERROR;
      result.message = "Create Food-Tag failed";
      return result;
    }
  }

  async findAll(keyWord?: string, page = 1, limit = 10) {
    const result: ResponseInfo = new Object({
      code: HttpStatus.OK,
      message: "",
      data: null,
      pagination: null,
    }) as ResponseInfo;

    try {
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

      result.message = "Get food-tag successfully";
      result.data = foodTag;
      result.pagination = {
        totalItems,
        totalPages,
        currentPage: page,
        pageSize: limit,
      };
      return result;
    } catch (error) {
      result.code = HttpStatus.INTERNAL_SERVER_ERROR;
      result.message = "Get food-tag failed";
      return result;
    }
  }

  async findAllWithFoodId(
    keyWord?: string,
    page = 1,
    limit = 10,
    foodId?: number
  ) {
    const result: ResponseInfo = new Object({
      code: HttpStatus.OK,
      message: "",
      data: null,
      pagination: null,
    }) as ResponseInfo;

    try {
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

      result.message = "Get comments successfully";
      result.data = foodTag;
      result.pagination = {
        totalItems,
        totalPages,
        currentPage: page,
        pageSize: limit,
      };
      return result;
    } catch (error) {
      result.code = HttpStatus.INTERNAL_SERVER_ERROR;
      result.message = "Get food-tag failed";
      return result;
    }
  }

  async findOne(id: number) {
    const result: ResponseInfo = new Object({
      code: HttpStatus.OK,
      message: "",
      data: null,
      pagination: null,
    }) as ResponseInfo;

    try {
      const foodTag = await FoodTag.findOneBy({ id, delFlag: false });
      if (!foodTag) {
        result.code = HttpStatus.NOT_FOUND;
        result.message = `Food-tag with id ${id} not found`;
        return result;
      }
      result.data = foodTag;
      result.message = "Get food-tag successfully";
      return result;
    } catch (error) {
      result.code = HttpStatus.INTERNAL_SERVER_ERROR;
      result.message = "Get food-tag failed";
      return result;
    }
  }

  async update(id: number, updateFoodTagDto: UpdateFoodTagDto) {
    const result: ResponseInfo = new Object({
      code: HttpStatus.OK,
      message: "",
      data: null,
      pagination: null,
    }) as ResponseInfo;

    try {
      const foodTag = await this.foodTagRepository.findOneBy({
        id,
        delFlag: false,
      });
      if (!foodTag) {
        result.code = HttpStatus.NOT_FOUND;
        result.message = `Food-tag with id ${id} not found`;
        return result;
      }
      Object.assign(foodTag, updateFoodTagDto);
      await foodTag.save();
      result.data = foodTag;
      result.message = "Update comment successful";
      return result;
    } catch (error) {
      result.code = HttpStatus.INTERNAL_SERVER_ERROR;
      result.message = "Update food-tag failed";
      return result;
    }
  }

  async remove(id: number) {
    const result: ResponseInfo = new Object({
      code: HttpStatus.OK,
      message: "",
      data: null,
      pagination: null,
    }) as ResponseInfo;

    try {
      const foodTag = await this.foodTagRepository.findOne({
        where: { id },
      });
      if (!foodTag) {
        result.code = HttpStatus.NOT_FOUND;
        result.message = `Food-tag with id ${id} not found`;
        return result;
      }

      foodTag.deletedAt = new Date();
      foodTag.delFlag = true;
      await this.foodTagRepository.save(foodTag);

      result.message = `Food-tag with ID ${id} has been soft deleted`;
      return result;
    } catch (error) {
      result.code = HttpStatus.INTERNAL_SERVER_ERROR;
      result.message = "Delete comment failed";
      return result;
    }
  }

  async findAllTagsByFoodId(food_id: number) {
    const result: ResponseInfo = new Object({
      code: HttpStatus.OK,
      message: "",
      data: null,
      pagination: null,
    }) as ResponseInfo;

    try {
      const foodTags = await this.foodTagRepository
        .createQueryBuilder("foodTag")
        .leftJoinAndSelect("foodTag.tag", "tag")
        .where("foodTag.food_id = :food_id", { food_id })
        .getMany();

      result.message = "Get food-tags successfully";
      result.data = foodTags;
      return result;
    } catch (error) {
      result.code = HttpStatus.INTERNAL_SERVER_ERROR;
      result.message = "Get food-tags failed";
      return result;
    }
  }

  async updateTagsByFood(updateFoodTagDto: UpdateFoodTagDto) {
    const result: ResponseInfo = new Object({
      code: HttpStatus.OK,
      message: "",
      data: null,
      pagination: null,
    }) as ResponseInfo;

    try {
      const { food_id, tag_ids } = updateFoodTagDto;
      const foodIdNum = Number(food_id);

      const foodExists = await Foods.findOne({
        where: { id: foodIdNum },
      });

      if (!foodExists) {
        result.code = 404;
        result.message = `Food with id ${foodIdNum} not found`;
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
        result.message = `Updated tags of food with ID ${foodIdNum} successfully.`;
      }

      return result;
    } catch (error) {
      result.code = HttpStatus.INTERNAL_SERVER_ERROR;
      result.message = "Update comment failed";
      return result;
    }
  }
}
