import { HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { CreateFoodDto } from "./dto/create-food.dto";
import { UpdateFoodDto } from "./dto/update-food.dto";
import { ILike, IsNull, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { Foods } from "../../entities/food.entity";
import { Ratings } from "src/entities/rating.entity";

@Injectable()
export class FoodService {
  constructor(
    @InjectRepository(Foods)
    private readonly foodRepository: Repository<Foods>
  ) {}

  async create(createFoodDto: CreateFoodDto, userId: number) {
    const result: ResponseInfo = new Object({
      code: HttpStatus.OK,
      message: "",
      data: null,
      pagination: null,
    }) as ResponseInfo;
    try {
      const food = this.foodRepository.create(createFoodDto);
      food.user_id = userId;
      food.posted = false;
      await this.foodRepository.save(food);
      result.data = food;
      result.message = "Create food successfully";
      return food;
    } catch (error) {
      result.code = HttpStatus.INTERNAL_SERVER_ERROR;
      result.message = "Create food failed";
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

      const where = keyWord
        ? {
            dish_name: ILike(`%${keyWord}%`),
            delFlag: false,
            posted: true,
          }
        : { delFlag: false, posted: true };
      const [foods, totalItems] = await this.foodRepository.findAndCount({
        where,
        skip,
        take: limit,
        order: { id: "DESC" }, // có thể thay đổi theo yêu cầu
      });

      const totalPages = Math.ceil(totalItems / limit);

      result.message = "Get foods successfully";
      result.data = foods;
      result.pagination = {
        totalItems,
        totalPages,
        currentPage: page,
        pageSize: limit,
      };
      return result;
    } catch (error) {
      result.code = HttpStatus.INTERNAL_SERVER_ERROR;
      result.message = "Get foods failed";
      return result;
    }
  }

  async findAllByUser(userId: number, keyWord?: string, page = 1, limit = 10) {
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

      const where = keyWord
        ? {
            dish_name: ILike(`%${keyWord}%`),
            delFlag: false,
            posted: true,
            user_id: userId,
          }
        : { delFlag: false, posted: true, user_id: userId };
      const [foods, totalItems] = await this.foodRepository.findAndCount({
        where,
        skip,
        take: limit,
        order: { id: "DESC" }, // có thể thay đổi theo yêu cầu
      });

      const totalPages = Math.ceil(totalItems / limit);

      result.message = "Get foods successfully";
      result.data = foods;
      result.pagination = {
        totalItems,
        totalPages,
        currentPage: page,
        pageSize: limit,
      };
      return result;
    } catch (error) {
      result.code = HttpStatus.INTERNAL_SERVER_ERROR;
      result.message = "Get foods failed";
      return result;
    }
  }

  async findAllFoodNoPosted(keyWord?: string, page = 1, limit = 10) {
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

      const where = keyWord
        ? {
            dish_name: ILike(`%${keyWord}%`),
            delFlag: false,
            posted: false,
          }
        : { delFlag: false, posted: false };
      const [foods, totalItems] = await this.foodRepository.findAndCount({
        where,
        skip,
        take: limit,
        order: { id: "DESC" },
      });

      const totalPages = Math.ceil(totalItems / limit);

      result.message = "Get foods successfully";
      result.data = foods;
      result.pagination = {
        totalItems,
        totalPages,
        currentPage: page,
        pageSize: limit,
      };
      return result;
    } catch (error) {
      result.code = HttpStatus.INTERNAL_SERVER_ERROR;
      result.message = "Get foods failed";
      return result;
    }
  }

  async findAllFoodFavorite(
    userId: number,
    keyWord?: string,
    page = 1,
    limit = 10
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

      const query = this.foodRepository.createQueryBuilder("food");

      // 1. CHỌN cột rating của người dùng đó (BẮT BUỘC)
      query.addSelect("rating.rating", "userRating");

      // 2. INNER JOIN thủ công
      query.innerJoin(
        "ratings", // Tên bảng Ratings trong cơ sở dữ liệu
        "rating",
        "food.id = rating.food_id AND rating.user_id = :userId AND rating.rating >= 4.0 AND rating.delFlag = :delFlag",
        { userId, delFlag: false }
      );

      // 3. Lọc Food theo điều kiện cơ bản
      query.where("food.delFlag = :delFlag", { delFlag: false });

      // 4. Áp dụng điều kiện tìm kiếm theo keyWord
      if (keyWord) {
        query.andWhere(
          "food.dish_name ILIKE :keyword AND food.posted = :posted",
          {
            keyword: `%${keyWord}%`,
            posted: true,
          }
        );
      } else {
        query.andWhere("food.posted = :posted", { posted: true });
      }

      // 5. GROUP BY để loại bỏ Food trùng lặp
      query.addGroupBy("rating.rating");
      query.addGroupBy("food.id");

      // --- BƯỚC 6: TÍNH TỔNG SỐ LƯỢNG (getCount) ---
      // Clone query để chạy count TRƯỚC khi áp dụng skip/take
      const countQuery = query.clone();
      const totalItems = await countQuery.getCount();

      // --- BƯỚC 7: ÁP DỤNG PHÂN TRANG VÀ LẤY DỮ LIỆU THÔ (getRawMany) ---
      const foods = await query
        .orderBy("food.id", "DESC")
        .skip(skip)
        .take(limit)
        .getMany();

      const totalPages = Math.ceil(totalItems / limit);

      // ... (logic trả về result, data, pagination)
      result.message = "Get foods successfully";
      result.data = foods;
      result.pagination = {
        totalItems,
        totalPages,
        currentPage: page,
        pageSize: limit,
      };
      return result;
    } catch (error) {
      result.code = HttpStatus.INTERNAL_SERVER_ERROR;
      result.message = "Get foods failed";
      console.error(error); // Nên log lỗi ra console để debug
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
      const food = await Foods.findOneBy({ id, delFlag: false, posted: true });
      if (!food) {
        result.code = HttpStatus.NOT_FOUND;
        result.message = `Food with id ${id} not found`;
        return result;
      }
      result.data = food;
      result.message = "Get food successfully";
      return result;
    } catch (error) {
      result.code = HttpStatus.INTERNAL_SERVER_ERROR;
      result.message = "Get food failed";
      return result;
    }
  }

  async post_food(id: number) {
    const result: ResponseInfo = new Object({
      code: HttpStatus.OK,
      message: "",
      data: null,
      pagination: null,
    }) as ResponseInfo;

    try {
      const food = await this.foodRepository.findOneBy({ id, delFlag: false });
      if (!food) {
        result.code = HttpStatus.NOT_FOUND;
        result.message = `Food with id ${id} not found`;
        return result;
      }
      Object.assign(food, { posted: true });
      await food.save();
      result.data = food;
      result.message = `Posted food with id ${id} `;
      return result;
    } catch (error) {
      result.code = HttpStatus.INTERNAL_SERVER_ERROR;
      result.message = "Post food failed";
      return result;
    }
  }

  async update(id: number, updateFoodDto: UpdateFoodDto) {
    const result: ResponseInfo = new Object({
      code: HttpStatus.OK,
      message: "",
      data: null,
      pagination: null,
    }) as ResponseInfo;
    try {
      const food = await this.foodRepository.findOneBy({ id, delFlag: false });
      if (!food) {
        result.code = HttpStatus.NOT_FOUND;
        result.message = `Food with id ${id} not found`;
        return result;
      }
      Object.assign(food, updateFoodDto);
      await food.save();
      result.data = food;
      result.message = "Update food successful";
      return result;
    } catch (error) {
      result.code = HttpStatus.INTERNAL_SERVER_ERROR;
      result.message = "Update food failed";
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
      const food = await this.foodRepository.findOne({
        where: { id },
      });
      if (!food) {
        result.code = HttpStatus.NOT_FOUND;
        result.message = `Food with id ${id} not found`;
        return result;
      }

      food.deletedAt = new Date();
      food.delFlag = true;
      await this.foodRepository.save(food);

      result.message = `Food with ID ${id} has been soft deleted`;
      return result;
    } catch (error) {
      result.code = HttpStatus.INTERNAL_SERVER_ERROR;
      result.message = "Delete comment failed";
      return result;
    }
  }
}
