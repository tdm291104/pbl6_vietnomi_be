import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateCommentDto } from "./dto/create-comment.dto";
import { UpdateCommentDto } from "./dto/update-comment.dto";
import { ILike, IsNull, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { Comments } from "src/entities/comment.entity";

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comments)
    private readonly commentRepository: Repository<Comments>
  ) {}

  async create(createCommentDto: CreateCommentDto, user_id: number) {
    const comment = this.commentRepository.create(createCommentDto);
    comment.user_id = user_id;
    await this.commentRepository.save(comment);
    return comment;
  }

  async findAll(keyWord?: string, page = 1, limit = 10) {
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
      order: { id: "DESC" }, // có thể thay đổi theo yêu cầu
    });

    const totalPages = Math.ceil(totalItems / limit);

    return {
      data: comments,
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        pageSize: limit,
      },
    };
  }

  async findOne(id: number) {
    const comment = await Comments.findOneBy({
      id,
      delFlag: false,
    });
    if (!comment) {
      throw new NotFoundException(`Comment with id ${id} not found`);
    }
    return comment;
  }

  async update(id: number, updateCommentDto: UpdateCommentDto) {
    const comment = await this.findOne(id);
    if (!comment) {
      throw new Error(`Comment with id ${id} not found`);
    }
    Object.assign(comment, updateCommentDto);
    await comment.save();
    return comment;
  }

  async remove(id: number) {
    const comment = await this.commentRepository.findOne({
      where: { id },
    });
    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }

    comment.deletedAt = new Date();
    comment.delFlag = true;
    await this.commentRepository.save(comment);

    return { message: `Comment with ID ${id} has been soft deleted` };
  }
}
