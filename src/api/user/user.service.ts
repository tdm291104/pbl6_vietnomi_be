import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { DeepPartial, ILike, Repository } from "typeorm";
import { Users } from "src/entities";
import { hashSync } from "bcryptjs";
import { log } from "console";
import { InjectRepository } from "@nestjs/typeorm";
import { GetUserDto } from "./dto/get-user.dto";
import { plainToInstance } from "class-transformer";
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>
  ) {}

  async checkExistEmail(email: string): Promise<boolean> {
    const user = await Users.findOneBy({ email });
    if (user) {
      return true;
    }
    return false;
  }

  async checkExistUsername(username: string): Promise<boolean> {
    const user = await Users.findOneBy({ username });
    if (user) {
      return true;
    }
    return false;
  }

  async create(createUserDto: CreateUserDto) {
    const result: ResponseInfo = new Object({
      code: HttpStatus.OK,
      message: "",
      data: null,
    }) as ResponseInfo;

    try {
      const isEmailExist = await this.checkExistEmail(createUserDto.email);
      if (isEmailExist) {
        result.code = HttpStatus.CONFLICT;
        result.message = `Email already exists`;
        return result;
      }
      const isUsernameExist = await this.checkExistUsername(
        createUserDto.username
      );
      if (isUsernameExist) {
        result.code = HttpStatus.CONFLICT;
        result.message = `Username already exists`;
        return result;
      }

      let password = createUserDto.password;
      if (password) {
        password = hashSync(password, 10);
      }

      const user = await Users.create({
        ...createUserDto,
        password_hash: password,
      } as DeepPartial<Users>).save();

      result.data = user;
      result.message = "Create user successfully";
      return result;
    } catch (error) {
      result.code = HttpStatus.INTERNAL_SERVER_ERROR;
      result.message = "Create user failed";
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
        ? [
            { first_name: ILike(`%${keyWord}%`), delFlag: false },
            { last_name: ILike(`%${keyWord}%`), delFlag: false },
            { username: ILike(`%${keyWord}%`), delFlag: false },
            { email: ILike(`%${keyWord}%`), delFlag: false },
          ]
        : { delFlag: false };

      const [users, totalItems] = await this.userRepository.findAndCount({
        where,
        skip,
        take: limit,
        order: { id: "DESC" },
      });

      const totalPages = Math.ceil(totalItems / limit);

      const userDtos = plainToInstance(GetUserDto, users, {
        excludeExtraneousValues: true,
      });

      result.message = "Get users successfully";
      result.data = userDtos;
      result.pagination = {
        totalItems,
        totalPages,
        currentPage: page,
        pageSize: limit,
      };
      return result;
    } catch (error) {
      result.code = HttpStatus.INTERNAL_SERVER_ERROR;
      result.message = "Get users failed";
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
      const user = await Users.findOneBy({ id });
      if (!user) {
        result.code = HttpStatus.NOT_FOUND;
        result.message = `User with id ${id} not found`;
        return result;
      }

      result.data = user;
      result.message = "Get user successfully";
      return result;
    } catch (error) {
      result.code = HttpStatus.INTERNAL_SERVER_ERROR;
      result.message = "Get user failed";
      return result;
    }
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const result: ResponseInfo = new Object({
      code: HttpStatus.OK,
      message: "",
      data: null,
      pagination: null,
    }) as ResponseInfo;

    try {
      const user = await this.userRepository.findOneBy({ id, delFlag: false });
      if (!user) {
        result.code = HttpStatus.NOT_FOUND;
        result.message = `User with id ${id} not found`;
        return result;
      }

      if (updateUserDto.password) {
        const hashedPassword = await hashSync(updateUserDto.password, 10);
        user.password_hash = hashedPassword;
      }

      // Lọc các field được phép update
      const { password, ...rest } = updateUserDto;
      Object.assign(user, rest);

      user.updatedAt = new Date();

      await this.userRepository.save(user);
      result.data = user;
      result.message = "Update user successful";
      return result;
    } catch (error) {
      result.code = HttpStatus.INTERNAL_SERVER_ERROR;
      result.message = "Update user failed";
      return result;
    }
  }

  async remove(id: number) {
    const result: ResponseInfo = {
      message: "",
      code: HttpStatus.OK,
      data: null,
    };

    try {
      const user = await this.userRepository.findOne({
        where: { id, delFlag: false },
      });
      if (!user) {
        result.code = HttpStatus.NOT_FOUND;
        result.message = `User with id ${id} not found`;
        return result;
      }

      user.delFlag = true;
      user.deletedAt = new Date();
      await this.userRepository.save(user);

      result.message = `User with ID ${id} has been soft deleted`;
      return result;
    } catch (error) {
      result.code = HttpStatus.INTERNAL_SERVER_ERROR;
      result.message = "Delete user failed";
      return result;
    }
  }
}
