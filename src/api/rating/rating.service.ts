import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateRatingDto } from "./dto/create-rating.dto";
import { UpdateRatingDto } from "./dto/update-rating.dto";
import { ILike, IsNull, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { Ratings } from "src/entities/rating.entity";

@Injectable()
export class RatingService {
  constructor(
    @InjectRepository(Ratings)
    private readonly ratingRepository: Repository<Ratings>
  ) {}

  async create(createRatingDto: CreateRatingDto, user_id: number) {
    const rating = this.ratingRepository.create(createRatingDto);
    rating.user_id = user_id;
    await this.ratingRepository.save(rating);
    return rating;
  }

  async findAll(keyWord?: string, page = 1, limit = 10) {
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

    return {
      data: ratings,
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        pageSize: limit,
      },
    };
  }

  async findOne(id: number) {
    const rating = await Ratings.findOneBy({
      id,
      delFlag: false,
    });
    if (!rating) {
      throw new NotFoundException(`Rating with id ${id} not found`);
    }
    return rating;
  }

  async update(id: number, updateRatingDto: UpdateRatingDto) {
    const rating = await this.findOne(id);
    if (!rating) {
      throw new Error(`Rating with id ${id} not found`);
    }
    Object.assign(rating, updateRatingDto);
    await rating.save();
    return rating;
  }

  async remove(id: number) {
    const rating = await this.ratingRepository.findOne({
      where: { id },
    });
    if (!rating) {
      throw new NotFoundException(`Rating with ID ${id} not found`);
    }

    rating.deletedAt = new Date();
    rating.delFlag = true;
    await this.ratingRepository.save(rating);

    return { message: `Rating with ID ${id} has been soft deleted` };
  }
}
