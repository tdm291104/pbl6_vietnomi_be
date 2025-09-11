import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreateTagDto } from "./dto/create-tag.dto";
import { UpdateTagDto } from "./dto/update-tag.dto";
import { DeepPartial, ILike, Repository } from "typeorm";
import { hashSync } from "bcryptjs";
import { InjectRepository } from "@nestjs/typeorm";
import { Tags } from "src/entities/tag.entity";
@Injectable()
export class TagService {
  constructor(
    @InjectRepository(Tags)
    private readonly tagRepository: Repository<Tags>
  ) {}

  async create(createTagDto: CreateTagDto) {
    const tag = this.tagRepository.create(createTagDto);
    await this.tagRepository.save(tag);
    return tag;
  }

  async findAll(keyWord?: string, page = 1, limit = 10) {
    page = Number(page);
    limit = Number(limit);
    const skip = (page - 1) * limit;

    const where = keyWord ? [{ name: ILike(`%${keyWord}%`) }] : {};

    const [tags, totalItems] = await this.tagRepository.findAndCount({
      where,
      skip,
      take: limit,
      order: { id: "DESC" }, // có thể thay đổi theo yêu cầu
    });

    const totalPages = Math.ceil(totalItems / limit);

    return {
      data: tags,
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        pageSize: limit,
      },
    };
  }

  async findOne(id: number) {
    const tag = await Tags.findOneBy({ id });
    if (!tag) {
      throw new NotFoundException(`user with id ${id} not found`);
    }
    return tag;
  }

  async update(id: number, updateTagDto: UpdateTagDto) {
    const tag = await this.findOne(id);
    if (!tag) {
      throw new Error(`user with id ${id} not found`);
    }
    Object.assign(tag, updateTagDto);
    await tag.save();
    return tag;
  }

  async remove(id: number) {
    const tag = await this.tagRepository.findOne({
      where: { id },
    });
    if (!tag) {
      throw new NotFoundException(`Tag with ID ${id} not found`);
    }

    tag.deletedAt = new Date();
    await this.tagRepository.save(tag);

    return { message: `Tag with ID ${id} has been soft deleted` };
  }
}
