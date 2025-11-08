import { HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { CreateRatingDto } from "./dto/create-rating.dto";
import { UpdateRatingDto } from "./dto/update-rating.dto";
import { Between, MoreThanOrEqual, Repository } from "typeorm";
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

  async countRatingByFood(foodId: number) {
    const result: ResponseInfo = new Object({
      code: HttpStatus.OK,
      message: "",
      data: null,
      pagination: null,
    }) as ResponseInfo;

    try {
      const where = { delFlag: false };
      const totalItems = await this.ratingRepository.count({
        where: { ...where, food_id: foodId },
      });

      result.message = "Get count ratings successfully";
      result.data = totalItems;

      return result;
    } catch (error) {
      result.code = HttpStatus.INTERNAL_SERVER_ERROR;
      result.message = "Get ratings failed";
      return result;
    }
  }

  async getTotalRatings() {
    const result: ResponseInfo = new Object({
      code: HttpStatus.OK,
      message: "",
      data: null,
    }) as ResponseInfo;

    try {
      const now = new Date();

      const startOfToday = new Date(now);
      startOfToday.setHours(0, 0, 0, 0);

      const startOfYesterday = new Date(startOfToday);
      startOfYesterday.setDate(startOfYesterday.getDate() - 1);

      const totalRatings = await this.ratingRepository.count({
        where: { delFlag: false },
      });

      const todayNewRatings = await this.ratingRepository.count({
        where: {
          delFlag: false,
          createdAt: MoreThanOrEqual(startOfToday),
        },
      });

      const yesterdayNewRatings = await this.ratingRepository.count({
        where: {
          delFlag: false,
          createdAt: Between(startOfYesterday, startOfToday),
        },
      });

      let percentageChange = 0;

      if (yesterdayNewRatings > 0) {
        percentageChange =
          ((todayNewRatings - yesterdayNewRatings) / yesterdayNewRatings) * 100;
      } else if (todayNewRatings > 0) {
        percentageChange = 100;
      } else {
        percentageChange = 0;
      }

      const data = {
        totalRatings: totalRatings,
        todayNewRatings: todayNewRatings,
        yesterdayNewRatings: yesterdayNewRatings,
        percentageChange: parseFloat(percentageChange.toFixed(2)),
        changeDirection: percentageChange >= 0 ? "increase" : "decrease",
      };

      result.message = "Get total ratings and daily change successfully";
      result.data = data;

      return result;
    } catch (error) {
      console.error("Error fetching total ratings:", error);
      result.code = HttpStatus.INTERNAL_SERVER_ERROR;
      result.message = "Get total ratings failed";
      return result;
    }
  }

  async getCoreEngagementIndex() {
    const result: ResponseInfo = new Object({
      code: HttpStatus.OK,
      message: "",
      data: [],
    }) as ResponseInfo;

    try {
      const now = new Date();
      const dailyData: { date: string; count: number }[] = [];

      // Lặp từ 29 ngày trước đến hôm nay (i=0)
      for (let i = 29; i >= 0; i--) {
        // Tính toán mốc thời gian cho ngày thứ i
        const date = new Date(now);
        date.setDate(now.getDate() - i);

        const startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0); // 00:00:00 của ngày

        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999); // 23:59:59 của ngày

        // Nếu là ngày hiện tại, end_date sẽ là thời điểm hiện tại
        if (i === 0) {
          endDate.setHours(
            now.getHours(),
            now.getMinutes(),
            now.getSeconds(),
            now.getMilliseconds()
          );
        }

        // Đếm số ratings tạo trong khoảng thời gian này
        const count = await this.ratingRepository.count({
          where: {
            delFlag: false,
            createdAt: Between(startDate, endDate),
          },
        });

        // Định dạng ngày (YYYY-MM-DD) để hiển thị trên biểu đồ
        const dateKey = `${startDate.getFullYear()}-${(startDate.getMonth() + 1).toString().padStart(2, "0")}-${startDate.getDate().toString().padStart(2, "0")}`;

        dailyData.push({
          date: dateKey,
          count: count,
        });
      }

      result.message =
        "Get new ratings count for the last 30 days successfully";
      result.data = dailyData;
      return result;
    } catch (error) {
      console.error("Error fetching daily rating data:", error);
      result.code = HttpStatus.INTERNAL_SERVER_ERROR;
      result.message = "Failed to get daily rating data";
      return result;
    }
  }
}
