import { HttpStatus, Injectable } from "@nestjs/common";
import { CreateTagDto } from "./dto/create-tag.dto";
import { UpdateTagDto } from "./dto/update-tag.dto";
import { ILike, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { Tags } from "../../entities/tag.entity";
@Injectable()
export class TagService {
  constructor(
    @InjectRepository(Tags)
    private readonly tagRepository: Repository<Tags>
  ) {}

  async create(createTagDto: CreateTagDto) {
    const result: ResponseInfo = new Object({
      code: HttpStatus.OK,
      message: "",
      data: null,
    }) as ResponseInfo;

    try {
      const tag = this.tagRepository.create(createTagDto);
      await this.tagRepository.save(tag);

      result.data = tag;
      result.message = "Create tag successfully";
      return result;
    } catch (error) {
      result.code = HttpStatus.INTERNAL_SERVER_ERROR;
      result.message = "Create tag failed";
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

      result.message = "Get tags successfully";
      result.data = tags;
      result.pagination = {
        totalItems,
        totalPages,
        currentPage: page,
        pageSize: limit,
      };
      return result;
    } catch (error) {
      result.code = HttpStatus.INTERNAL_SERVER_ERROR;
      result.message = "Get tags failed";
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
      const tag = await Tags.findOneBy({ id, delFlag: false });
      if (!tag) {
        result.code = HttpStatus.NOT_FOUND;
        result.message = `Tag with id ${id} not found`;
        return result;
      }

      result.data = tag;
      result.message = "Get tag successfully";
      return result;
    } catch (error) {
      result.code = HttpStatus.INTERNAL_SERVER_ERROR;
      result.message = "Get tag failed";
      return result;
    }
  }

  async update(id: number, updateTagDto: UpdateTagDto) {
    const result: ResponseInfo = new Object({
      code: HttpStatus.OK,
      message: "",
      data: null,
      pagination: null,
    }) as ResponseInfo;

    try {
      const tag = await this.tagRepository.findOneBy({ id, delFlag: false });
      if (!tag) {
        result.code = HttpStatus.NOT_FOUND;
        result.message = `Tag with id ${id} not found`;
        return result;
      }

      tag.updatedAt = new Date();
      Object.assign(tag, updateTagDto);
      await this.tagRepository.save(tag);
      result.message = `Tag with ID ${id} updated successfully`;
      result.data = tag;

      return result;
    } catch (error) {
      result.code = HttpStatus.INTERNAL_SERVER_ERROR;
      result.message = "Update tag failed";
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
      const tag = await this.tagRepository.findOne({
        where: { id },
      });
      if (!tag) {
        result.code = HttpStatus.NOT_FOUND;
        result.message = `Tag with id ${id} not found`;
        return result;
      }

      tag.deletedAt = new Date();
      tag.delFlag = true;
      await this.tagRepository.save(tag);
      result.message = `Tag with ID ${id} has been soft deleted`;
      result.data = tag;
      return result;
    } catch (error) {
      result.code = HttpStatus.INTERNAL_SERVER_ERROR;
      result.message = "Delete tag failed";
      return result;
    }
  }
}
