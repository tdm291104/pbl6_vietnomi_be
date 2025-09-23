import { HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { CreateRatingDto } from "./dto/create-rating.dto";
import { UpdateRatingDto } from "./dto/update-rating.dto";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { Ratings } from "../../entities/rating.entity";

@Injectable()
export class RatingService {
  constructor(
    @InjectRepository(Ratings)
    private readonly ratingRepository: Repository<Ratings>
  ) {}

  async create(createRatingDto: CreateRatingDto, user_id: number) {
    const result: ResponseInfo = new Object({
      code: HttpStatus.OK,
      message: "",
      data: null,
    }) as ResponseInfo;

    try {
      const rating = this.ratingRepository.create(createRatingDto);
      rating.user_id = user_id;
      await this.ratingRepository.save(rating);
      result.data = rating;
      result.message = "Create rating successfully";
      return result;
    } catch (error) {
      result.code = HttpStatus.INTERNAL_SERVER_ERROR;
      result.message = "Create rating failed";
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
      const [ratings, totalItems] = await this.ratingRepository.findAndCount({
        where,
        skip,
        take: limit,
        order: { id: "DESC" }, // có thể thay đổi theo yêu cầu
      });

      const totalPages = Math.ceil(totalItems / limit);

      result.message = "Get ratings successfully";
      result.data = ratings;
      result.pagination = {
        totalItems,
        totalPages,
        currentPage: page,
        pageSize: limit,
      };
      return result;
    } catch (error) {
      result.code = HttpStatus.INTERNAL_SERVER_ERROR;
      result.message = "Get ratings failed";
      return result;
    }
  }

  async findAllWithFoodID(
    keyWord?: string,
    page = 1,
    limit = 10,
    foodID?: number
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

      const where = { food_id: foodID, delFlag: false };
      const [ratings, totalItems] = await this.ratingRepository.findAndCount({
        where,
        skip,
        take: limit,
        order: { id: "DESC" },
      });

      const totalPages = Math.ceil(totalItems / limit);

      result.message = "Get ratings successfully";
      result.data = ratings;
      result.pagination = {
        totalItems,
        totalPages,
        currentPage: page,
        pageSize: limit,
      };
      return result;
    } catch (error) {
      result.code = HttpStatus.INTERNAL_SERVER_ERROR;
      result.message = "Get ratings failed";
      return result;
    }
  }

  async findAllWithUserID(
    keyWord?: string,
    page = 1,
    limit = 10,
    userID?: number
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

      const where = { user_id: userID, delFlag: false };
      const [ratings, totalItems] = await this.ratingRepository.findAndCount({
        where,
        skip,
        take: limit,
        order: { id: "DESC" },
      });

      const totalPages = Math.ceil(totalItems / limit);

      result.message = "Get ratings successfully";
      result.data = ratings;
      result.pagination = {
        totalItems,
        totalPages,
        currentPage: page,
        pageSize: limit,
      };
      return result;
    } catch (error) {
      result.code = HttpStatus.INTERNAL_SERVER_ERROR;
      result.message = "Get ratings failed";
      return result;
    }
  }

  async findAllWithUserFood(
    keyWord?: string,
    page = 1,
    limit = 10,
    foodID?: number,
    userID?: number
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

      const where = { food_id: foodID, user_id: userID, delFlag: false };
      const [ratings, totalItems] = await this.ratingRepository.findAndCount({
        where,
        skip,
        take: limit,
        order: { id: "DESC" },
      });

      const totalPages = Math.ceil(totalItems / limit);

      result.message = "Get ratings successfully";
      result.data = ratings;
      result.pagination = {
        totalItems,
        totalPages,
        currentPage: page,
        pageSize: limit,
      };
      return result;
    } catch (error) {
      result.code = HttpStatus.INTERNAL_SERVER_ERROR;
      result.message = "Get ratings failed";
      return result;
    }
  }

  async findAverageRatingByFoodID(foodID: number) {
    const result: ResponseInfo = new Object({
      code: HttpStatus.OK,
      message: "",
      data: null,
      pagination: null,
    }) as ResponseInfo;

    try {
      const averageRatingQuery = await this.ratingRepository
        .createQueryBuilder("rating")
        .select("AVG(rating.rating)", "averageRating")
        .where("rating.food_id = :foodID", { foodID })
        .andWhere("rating.delFlag = :delFlag", { delFlag: false })
        .getRawOne();

      const averageRating = averageRatingQuery?.averageRating || 0;

      result.message = "Get average rating successfully";
      result.data = {
        foodId: foodID,
        averageRating: parseFloat(averageRating).toFixed(1), // Làm tròn đến 2 chữ số thập phân
      };

      return result;
    } catch (error) {
      result.code = HttpStatus.INTERNAL_SERVER_ERROR;
      result.message = "Get average rating failed";
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
      const rating = await Ratings.findOneBy({
        id,
        delFlag: false,
      });
      if (!rating) {
        result.code = HttpStatus.NOT_FOUND;
        result.message = `Rating with id ${id} not found`;
        return result;
      }
      result.data = rating;
      result.message = "Get rating successfully";
      return result;
    } catch (error) {
      result.code = HttpStatus.INTERNAL_SERVER_ERROR;
      result.message = "Get rating failed";
      return result;
    }
  }

  async update(id: number, updateRatingDto: UpdateRatingDto) {
    const result: ResponseInfo = new Object({
      code: HttpStatus.OK,
      message: "",
      data: null,
      pagination: null,
    }) as ResponseInfo;

    try {
      const rating = await this.ratingRepository.findOneBy({
        id,
        delFlag: false,
      });
      if (!rating) {
        result.code = HttpStatus.NOT_FOUND;
        result.message = `Rating with id ${id} not found`;
        return result;
      }
      Object.assign(rating, updateRatingDto);
      await rating.save();
      result.data = rating;
      result.message = "Update rating successful";
      return result;
    } catch (error) {
      result.code = HttpStatus.INTERNAL_SERVER_ERROR;
      result.message = "Update rating failed";
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
      const rating = await this.ratingRepository.findOne({
        where: { id },
      });
      if (!rating) {
        result.code = HttpStatus.NOT_FOUND;
        result.message = `Rating with id ${id} not found`;
        return result;
      }

      rating.deletedAt = new Date();
      rating.delFlag = true;
      await this.ratingRepository.save(rating);

      result.message = `Rating with ID ${id} has been soft deleted`;
      return result;
    } catch (error) {
      result.code = HttpStatus.INTERNAL_SERVER_ERROR;
      result.message = "Delete rating failed";
      return result;
    }
  }
}
