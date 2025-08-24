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
    const isEmailExist = await this.checkExistEmail(createUserDto.email);
    if (isEmailExist) {
      throw new HttpException(
        `Email already exists`,
        HttpStatus.CONFLICT // 409
      );
    }
    const isUsernameExist = await this.checkExistUsername(
      createUserDto.username
    );
    if (isUsernameExist) {
      throw new HttpException(`Username already exists`, HttpStatus.CONFLICT);
    }

    let password = createUserDto.password;
    if (password) {
      password = hashSync(password, 10);
    }

    const user = await Users.create({
      ...createUserDto,
      password_hash: password,
    } as DeepPartial<Users>).save();
    return user;
  }

  async findAll(keyWord?: string, page = 1, limit = 10) {
    page = Number(page);
    limit = Number(limit);
    const skip = (page - 1) * limit;

    const where = keyWord
      ? [
          { first_name: ILike(`%${keyWord}%`) },
          { last_name: ILike(`%${keyWord}%`) },
          { username: ILike(`%${keyWord}%`) },
          { email: ILike(`%${keyWord}%`) },
        ]
      : {};

    const [users, totalItems] = await this.userRepository.findAndCount({
      where,
      skip,
      take: limit,
      order: { id: "ASC" }, // có thể thay đổi theo yêu cầu
    });

    const totalPages = Math.ceil(totalItems / limit);

    return {
      data: users,
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        pageSize: limit,
      },
    };
  }

  async findOne(id: number) {
    const user = await Users.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`user with id ${id} not found`);
    }
    return user;
  }

  async update(id: number, updateuserDto: UpdateUserDto) {
    console.log("updateuserDto", updateuserDto);
    let password = updateuserDto.password;
    if (password) {
      password = hashSync(password, 10);
    }
    const user = await this.findOne(id);
    if (!user) {
      throw new Error(`user with id ${id} not found`);
    }
    Object.assign(user, { ...updateuserDto, password_hash: password });
    await user.save();
    return user;
  }

  async remove(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    user.delFlag = true;
    await this.userRepository.save(user);

    return { message: `User with ID ${id} has been soft deleted` };
  }
}
