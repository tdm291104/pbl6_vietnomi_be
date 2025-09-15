import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  Res,
} from "@nestjs/common";
import { CreateTagDto } from "./dto/create-tag.dto";
import { UpdateTagDto } from "./dto/update-tag.dto";
import { DeepPartial, ILike, IsNull, Repository } from "typeorm";
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

    const where = keyWord
      ? {
          name: ILike(`%${keyWord}%`),
          delFlag: false,
        }
      : { delFlag: false };

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
    const tag = await Tags.findOneBy({ id, delFlag: false });
    if (!tag) {
      throw new NotFoundException(`Tag with id ${id} not found`);
    }
    return tag;
  }

  async update(id: number, updateTagDto: UpdateTagDto) {
    const tag = await this.findOne(id);
    if (!tag) {
      throw new Error(`Tag with id ${id} not found`);
    }
    const result: ResponseInfo = { message: "", code: 200, data: null };

    tag.updatedAt = new Date();
    Object.assign(tag, updateTagDto);
    await this.tagRepository.save(tag);
    result.message = `Tag with ID ${id} updated successfully`;
    result.data = tag;

    return result;
  }

  async remove(id: number) {
    const tag = await this.tagRepository.findOne({
      where: { id },
    });
    if (!tag) {
      throw new NotFoundException(`Tag with ID ${id} not found`);
    }

    const result: ResponseInfo = { message: "", code: 200, data: null };

    tag.deletedAt = new Date();
    tag.delFlag = true;
    await this.tagRepository.save(tag);
    result.message = `Tag with ID ${id} has been soft deleted`;
    result.data = tag;
    return result;
  }
}
