import { HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { CreateCommentDto } from "./dto/create-comment.dto";
import { UpdateCommentDto } from "./dto/update-comment.dto";
import { Between, ILike, IsNull, MoreThanOrEqual, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { Comments } from "../../entities/comment.entity";

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comments)
    private readonly commentRepository: Repository<Comments>
  ) {}

  async create(createCommentDto: CreateCommentDto, user_id: number) {
    const result: ResponseInfo = new Object({
      code: HttpStatus.OK,
      message: "",
      data: null,
    }) as ResponseInfo;

    try {
      const comment = this.commentRepository.create(createCommentDto);
      comment.user = { id: user_id } as any;
      comment.food = { id: createCommentDto.food_id } as any;
      await this.commentRepository.save(comment);
      result.data = comment;
      result.message = "Create comment successfully";
      return result;
    } catch (error) {
      result.code = HttpStatus.INTERNAL_SERVER_ERROR;
      result.message = "Create comment failed";
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
            content: ILike(`%${keyWord}%`),
            delFlag: false,
          }
        : { delFlag: false };
      const [comments, totalItems] = await this.commentRepository.findAndCount({
        where,
        skip,
        take: limit,
        order: { id: "DESC" },
      });

      const totalPages = Math.ceil(totalItems / limit);

      result.message = "Get comments successfully";
      result.data = comments;
      result.pagination = {
        totalItems,
        totalPages,
        currentPage: page,
        pageSize: limit,
      };
      return result;
    } catch (error) {
      result.code = HttpStatus.INTERNAL_SERVER_ERROR;
      result.message = "Get comments failed";
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

      const where = keyWord
        ? {
            content: ILike(`%${keyWord}%`),
            food: { id: foodID },
            delFlag: false,
          }
        : { food: { id: foodID }, delFlag: false };

      const [comments, totalItems] = await this.commentRepository.findAndCount({
        where,
        skip,
        take: limit,
        order: { id: "DESC" },
        relations: ["user"],
        select: {
          id: true,
          content: true,
          user: {
            id: true,
            username: true,
          },
        },
      });

      const totalPages = Math.ceil(totalItems / limit);

      result.message = "Get comments successfully";
      result.data = comments;
      result.pagination = {
        totalItems,
        totalPages,
        currentPage: page,
        pageSize: limit,
      };
      return result;
    } catch (error) {
      result.code = HttpStatus.INTERNAL_SERVER_ERROR;
      result.message = "Get comments failed";
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
      const comment = await Comments.findOneBy({
        id,
        delFlag: false,
      });

      if (!comment) {
        result.code = HttpStatus.NOT_FOUND;
        result.message = `Comment with id ${id} not found`;
        return result;
      }
      result.data = comment;
      result.message = "Get comment successfully";
      return result;
    } catch (error) {
      result.code = HttpStatus.INTERNAL_SERVER_ERROR;
      result.message = "Get comment failed";
      return result;
    }
  }

  async update(id: number, updateCommentDto: UpdateCommentDto) {
    const result: ResponseInfo = new Object({
      code: HttpStatus.OK,
      message: "",
      data: null,
      pagination: null,
    }) as ResponseInfo;

    try {
      const comment = await this.commentRepository.findOne({
        where: { id, delFlag: false },
      });
      if (!comment) {
        result.code = HttpStatus.NOT_FOUND;
        result.message = `Comment with id ${id} not found`;
        return result;
      }
      Object.assign(comment, updateCommentDto);
      await this.commentRepository.save(comment);
      result.data = comment;
      result.message = "Update comment successful";
      return result;
    } catch (error) {
      result.code = HttpStatus.INTERNAL_SERVER_ERROR;
      result.message = "Update comment failed";
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
      const comment = await this.commentRepository.findOne({
        where: { id },
      });
      if (!comment) {
        result.code = HttpStatus.NOT_FOUND;
        result.message = `Comment with id ${id} not found`;
        return result;
      }

      comment.deletedAt = new Date();
      comment.delFlag = true;
      await this.commentRepository.save(comment);

      result.message = `Comment with ID ${id} has been soft deleted`;
      return result;
    } catch (error) {
      result.code = HttpStatus.INTERNAL_SERVER_ERROR;
      result.message = "Delete comment failed";
      return result;
    }
  }

  async getTotalComments() {
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

      const totalRatings = await this.commentRepository.count({
        where: { delFlag: false },
      });

      const todayNewRatings = await this.commentRepository.count({
        where: {
          delFlag: false,
          createdAt: MoreThanOrEqual(startOfToday),
        },
      });

      const yesterdayNewRatings = await this.commentRepository.count({
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

      result.message = "Get total comments and daily change successfully";
      result.data = data;

      return result;
    } catch (error) {
      console.error("Error fetching total comments:", error);
      result.code = HttpStatus.INTERNAL_SERVER_ERROR;
      result.message = "Get total comments failed";
      return result;
    }
  }
}
