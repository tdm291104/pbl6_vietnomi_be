import { Test, TestingModule } from "@nestjs/testing";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UserRole } from "../../entities";
import { HttpStatus } from "@nestjs/common";

function logTestCase(testName: string, input: any, expected: any, actual: any) {
  const fs = require('fs');
  const path = require('path');
  
  const testData = {
    testName,
    input,
    expected,
    actual,
    timestamp: new Date().toISOString(),
  };
  
  const filePath = path.join(process.cwd(), 'test-details-user-controller.json');
  
  // Read existing data
  let existingData: any[] = [];
  try {
    if (fs.existsSync(filePath)) {
      existingData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
  } catch (err) {
    existingData = [];
  }
  
  existingData.push(testData);
  
  fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2));
  console.log(`✅ Logged test case: "${testName}" (Total: ${existingData.length})`);
}

describe("UserController", () => {
  let controller: UserController;
  let service: UserService;

  const mockUserService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeAll(() => {
    // Clear test details file before running tests
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(process.cwd(), 'test-details.json');
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("Tạo người dùng mới thành công", async () => {
      const createUserDto: CreateUserDto = {
        first_name: "Từ Đức",
        last_name: "Mạnh",
        username: "tuducmanh",
        email: "tuducmanh@gmail.com",
        password: "123456789",
        avatar_url: "avatar.jpg",
        role: UserRole.USER,
      };

      const expectedResult = {
        code: HttpStatus.CREATED,
        message: "Create user successfully",
        data: {
          id: 1,
          ...createUserDto,
        },
      };

      mockUserService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createUserDto);

      logTestCase(
        "Tạo người dùng mới thành công",
        createUserDto,
        expectedResult,
        result
      );

      expect(service.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(expectedResult);
    });

    it("Tạo người dùng mới với email đã tồn tại", async () => {
      const createUserDto: CreateUserDto = {
        first_name: "Trần Quốc",
        last_name: "Tuấn",
        username: "tranquoctuan",
        email: "tuducmanh@gmail.com",
        password: "123456789",
        avatar_url: "avatar.jpg",
        role: UserRole.USER,
      };

      const expectedResult = {
        code: HttpStatus.CONFLICT,
        message: "Email already exists",
        data: null,
      };

      mockUserService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createUserDto);

      logTestCase(
        "Tạo người dùng mới với email đã tồn tại",
        createUserDto,
        expectedResult,
        result
      );

      expect(service.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(expectedResult);
    });

    it("Tạo người dùng mới với username đã tồn tại", async () => {
      const createUserDto: CreateUserDto = {
        first_name: "Trần Quốc",
        last_name: "Tuấn",
        username: "tuducmanh",
        email: "tranquoctuan@gmail.com",
        password: "123456789",
        avatar_url: "avatar.jpg",
        role: UserRole.USER,
      };

      const expectedResult = {
        code: HttpStatus.CONFLICT,
        message: "Username already exists",
        data: null,
      };

      mockUserService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createUserDto);

      logTestCase(
        "Tạo người dùng mới với username đã tồn tại",
        createUserDto,
        expectedResult,
        result
      );

      expect(service.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe("findAll", () => {
    it("Lấy tất cả người dùng với phân trang", async () => {
      const expectedResult = {
        code: HttpStatus.OK,
        message: "Get users successfully",
        data: [
          {
            id: 1,
            username: "tuducmanh",
            email: "tuducmanh@gmail.com",
          },
          {
            id: 2,
            username: "tranquoctuan",
            email: "tranquoctuan@gmail.com",
          },
        ],
        pagination: {
          total: 2,
          page: 1,
          limit: 10,
        },
      };

      mockUserService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(undefined, 1, 10);

      logTestCase(
        "Lấy tất cả người dùng với phân trang",
        { keyword: undefined, page: 1, limit: 10 },
        expectedResult,
        result
      );

      expect(service.findAll).toHaveBeenCalledWith(undefined, 1, 10);
      expect(result).toEqual(expectedResult);
    });

    it("Lấy người dùng được lọc theo từ khóa", async () => {
      const keyword = "manh";
      const expectedResult = {
        code: HttpStatus.OK,
        message: "Get users successfully",
        data: [
          {
            id: 1,
            username: "tuducmanh",
            email: "tuducmanh@gmail.com",
          },
        ],
        pagination: {
          total: 1,
          page: 1,
          limit: 10,
        },
      };

      mockUserService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(keyword, 1, 10);

      logTestCase(
        "Lấy người dùng được lọc theo từ khóa",
        { keyword: keyword, page: 1, limit: 10 },
        expectedResult,
        result
      );

      expect(service.findAll).toHaveBeenCalledWith(keyword, 1, 10);
      expect(result).toEqual(expectedResult);
    });

    it("Lấy người dùng với phân trang mặc định", async () => {
      const expectedResult = {
        code: HttpStatus.OK,
        message: "Get users successfully",
        data: [],
        pagination: {
          total: 0,
          page: 1,
          limit: 10,
        },
      };

      mockUserService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(undefined, undefined, undefined);

      logTestCase(
        "Lấy người dùng với phân trang mặc định",
        { keyword: undefined, page: undefined, limit: undefined },
        expectedResult,
        result
      );

      expect(service.findAll).toHaveBeenCalledWith(undefined, 1, 10);
    });
  });

  describe("findOne", () => {
    it("Lấy người dùng theo id", async () => {
      const userId = "1";
      const expectedResult = {
        code: HttpStatus.OK,
        message: "Get user successfully",
        data: {
          id: 1,
          username: "tuducmanh",
          email: "tuducmanh@gmail.com",
        },
      };

      mockUserService.findOne.mockResolvedValue(expectedResult);

      const result = await controller.findOne(userId);

      logTestCase(
        "Lấy người dùng theo id",
        { userId: userId },
        expectedResult,
        result
      );

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(expectedResult);
    });

    it("Không tìm thấy người dùng khi user không tồn tại", async () => {
      const userId = "999";
      const expectedResult = {
        code: HttpStatus.NOT_FOUND,
        message: "User not found",
        data: null,
      };

      mockUserService.findOne.mockResolvedValue(expectedResult);

      const result = await controller.findOne(userId);

      logTestCase(
        "Không tìm thấy người dùng khi user không tồn tại",
        { userId: userId },
        expectedResult,
        result
      );

      expect(service.findOne).toHaveBeenCalledWith(999);
      expect(result).toEqual(expectedResult);
    });
  });

  describe("update", () => {
    it("Cập nhật người dùng thành công", async () => {
      const userId = "1";
      const updateUserDto: UpdateUserDto = {
        first_name: "Từ",
        last_name: "Đức",
      };

      const expectedResult = {
        code: HttpStatus.OK,
        message: "Update user successfully",
        data: {
          id: 1,
          ...updateUserDto,
        },
      };

      mockUserService.update.mockResolvedValue(expectedResult);

      const result = await controller.update(userId, updateUserDto);

      logTestCase(
        "Cập nhật người dùng thành công",
        { userId: userId, updateData: updateUserDto },
        expectedResult,
        result
      );

      expect(service.update).toHaveBeenCalledWith(1, updateUserDto);
      expect(result).toEqual(expectedResult);
    });

    it("Không tìm thấy người dùng khi cập nhật người dùng không tồn tại", async () => {
      const userId = "999";
      const updateUserDto: UpdateUserDto = {
        first_name: "Từ",
      };

      const expectedResult = {
        code: HttpStatus.NOT_FOUND,
        message: "User not found",
        data: null,
      };

      mockUserService.update.mockResolvedValue(expectedResult);

      const result = await controller.update(userId, updateUserDto);

      logTestCase(
        "Không tìm thấy người dùng khi cập nhật người dùng không tồn tại",
        { userId: userId, updateData: updateUserDto },
        expectedResult,
        result
      );

      expect(service.update).toHaveBeenCalledWith(999, updateUserDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe("remove", () => {
    it("Xóa người dùng thành công", async () => {
      const userId = "1";
      const expectedResult = {
        code: HttpStatus.OK,
        message: "Delete user successfully",
        data: null,
      };

      mockUserService.remove.mockResolvedValue(expectedResult);

      const result = await controller.remove(userId);

      logTestCase(
        "Xóa người dùng thành công",
        { userId: userId },
        expectedResult,
        result
      );

      expect(service.remove).toHaveBeenCalledWith(1);
      expect(result).toEqual(expectedResult);
    });

    it("Không tìm thấy người dùng khi xóa người dùng không tồn tại", async () => {
      const userId = "999";
      const expectedResult = {
        code: HttpStatus.NOT_FOUND,
        message: "User not found",
        data: null,
      };

      mockUserService.remove.mockResolvedValue(expectedResult);

      const result = await controller.remove(userId);

      logTestCase(
        "Không tìm thấy người dùng khi xóa người dùng không tồn tại",
        { userId: userId },
        expectedResult,
        result
      );

      expect(service.remove).toHaveBeenCalledWith(999);
      expect(result).toEqual(expectedResult);
    });
  });
});
