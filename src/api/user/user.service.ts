import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { DeepPartial } from "typeorm";
import { Users } from "src/entities";
import { hashSync } from "bcryptjs";
import { log } from "console";
@Injectable()
export class UserService {
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

  async findAll() {
    const users = await Users.find();
    return users;
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
    await Users.delete(id);
    return { message: `This action removes a #${id} user` };
  }
}
