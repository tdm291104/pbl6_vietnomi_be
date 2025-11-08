import { HttpStatus, Injectable } from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import {
  Between,
  DeepPartial,
  ILike,
  MoreThanOrEqual,
  Repository,
} from "typeorm";
import { Users } from "../../entities";
import { hashSync } from "bcryptjs";
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
      pagination: undefined,
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

  async getTotalUsers() {
    const result: ResponseInfo = new Object({
      code: HttpStatus.OK,
      message: "",
      data: null,
    }) as ResponseInfo;

    try {
      const now = new Date();

      const startOfCurrentMonth = new Date(
        now.getFullYear(),
        now.getMonth(),
        1
      );

      const startOfLastMonth = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        1
      );

      const startOfTwoMonthsAgo = new Date(
        now.getFullYear(),
        now.getMonth() - 2,
        1
      );

      const totalUsers = await this.userRepository.count({
        where: { delFlag: false },
      });

      const currentMonthUsers = await this.userRepository.count({
        where: {
          delFlag: false,
          createdAt: MoreThanOrEqual(startOfCurrentMonth),
        },
      });

      const lastMonthUsers = await this.userRepository.count({
        where: {
          delFlag: false,
          createdAt: Between(startOfLastMonth, startOfCurrentMonth),
        },
      });

      let percentageChange = 0;

      if (lastMonthUsers > 0) {
        percentageChange =
          ((currentMonthUsers - lastMonthUsers) / lastMonthUsers) * 100;
      } else if (currentMonthUsers > 0) {
        percentageChange = 100;
      } else {
        percentageChange = 0;
      }

      const data = {
        totalUsers: totalUsers,
        currentMonthNewUsers: currentMonthUsers,
        lastMonthNewUsers: lastMonthUsers,
        percentageChange: parseFloat(percentageChange.toFixed(2)),
        changeDirection: percentageChange >= 0 ? "increase" : "decrease",
      };

      result.message = "Get total users and monthly change successfully";
      result.data = data;

      return result;
    } catch (error) {
      console.error("Error fetching total users:", error);
      result.code = HttpStatus.INTERNAL_SERVER_ERROR;
      result.message = "Get total users failed";
      return result;
    }
  }

  async getCustomerVelocity() {
    const result: ResponseInfo = new Object({
      code: HttpStatus.OK,
      message: "",
      data: [],
    }) as ResponseInfo;

    try {
      const now = new Date();
      const dailyData: { date: string; count: number }[] = [];

      for (let i = 6; i >= 0; i--) {
        // Tính toán mốc thời gian cho ngày thứ i (i=0 là hôm nay, i=6 là 6 ngày trước)
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

        // Đếm số user tạo trong khoảng thời gian này
        const count = await this.userRepository.count({
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

      result.message = "Get new users count for the last 7 days successfully";
      result.data = dailyData;
      return result;
    } catch (error) {
      console.error("Error fetching daily user data:", error);
      result.code = HttpStatus.INTERNAL_SERVER_ERROR;
      result.message = "Failed to get daily user data";
      return result;
    }
  }
}
