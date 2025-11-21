import { Test, TestingModule } from "@nestjs/testing";
import { UserService } from "./user.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Users, UserRole } from "../../entities";
import { Repository } from "typeorm";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { HttpStatus } from "@nestjs/common";
import * as bcrypt from "bcryptjs";

function logTestCase(testName: string, input: any, expected: any, actual: any) {
  const fs = require("fs");
  const path = require("path");

  const testData = {
    testName,
    input,
    expected,
    actual,
    timestamp: new Date().toISOString(),
  };

  const filePath = path.join(process.cwd(), "test-details-user-service.json");

  let existingData: any[] = [];
  try {
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, "utf8");
      existingData = fileContent ? JSON.parse(fileContent) : [];
    }
  } catch (err) {
    console.error("Error reading existing test data:", err);
    existingData = [];
  }

  existingData.push(testData);

  try {
    fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2));
    console.log(`✅ Logged test case: "${testName}" (Total: ${existingData.length})`);
  } catch (err) {
    console.error("Error writing test data:", err);
  }
}

describe("UserService", () => {
  let service: UserService;
  let userRepository: Repository<Users>;

  const mockUserRepository = {
    findOneBy: jest.fn(),
    findAndCount: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    create: jest.fn(),
    count: jest.fn(),
  };

  const mockUsersEntity = {
    findOneBy: jest.fn(),
    create: jest.fn().mockReturnValue({
      save: jest.fn(),
    }),
  };

  beforeAll(() => {
    Users.findOneBy = mockUsersEntity.findOneBy;
    Users.create = mockUsersEntity.create;
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(Users),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get<Repository<Users>>(getRepositoryToken(Users));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("checkExistEmail", () => {
    it("Nếu email tồn tại thì trả về true", async () => {
      const email = "tuducmanh@gmail.com";
      const mockUser = { id: 1, email };

      mockUsersEntity.findOneBy.mockResolvedValue(mockUser);

      const result = await service.checkExistEmail(email);

      logTestCase(
        "checkExistEmail - Nếu email tồn tại thì trả về true",
        { email },
        true,
        result
      );

      expect(result).toBe(true);
      expect(Users.findOneBy).toHaveBeenCalledWith({ email });
    });

    it("Nếu email không tồn tại thì trả về false", async () => {
      const email = "tranquoctuan@gmail.com";

      mockUsersEntity.findOneBy.mockResolvedValue(null);

      const result = await service.checkExistEmail(email);

      logTestCase(
        "checkExistEmail - Nếu email không tồn tại thì trả về false",
        { email },
        false,
        result
      );

      expect(result).toBe(false);
      expect(Users.findOneBy).toHaveBeenCalledWith({ email });
    });
  });

  describe("checkExistUsername", () => {
    it("Nếu username tồn tại thì trả về true", async () => {
      const username = "tuducmanh";
      const mockUser = { id: 1, username };

      mockUsersEntity.findOneBy.mockResolvedValue(mockUser);

      const result = await service.checkExistUsername(username);

      logTestCase(
        "checkExistUsername - Nếu username tồn tại thì trả về true",
        { username },
        true,
        result
      );

      expect(result).toBe(true);
      expect(Users.findOneBy).toHaveBeenCalledWith({ username });
    });

    it("Nếu username không tồn tại thì trả về false", async () => {
      const username = "tranquoctuan";

      mockUsersEntity.findOneBy.mockResolvedValue(null);

      const result = await service.checkExistUsername(username);

      logTestCase(
        "checkExistUsername - Nếu username không tồn tại thì trả về false",
        { username },
        false,
        result
      );

      expect(result).toBe(false);
      expect(Users.findOneBy).toHaveBeenCalledWith({ username });
    });
  });

  describe("create", () => {
    it("Nếu tạo người dùng mới thành công", async () => {
      const createUserDto: CreateUserDto = {
        first_name: "Từ Đức",
        last_name: "Mạnh",
        username: "tuducmanh",
        email: "tuducmanh@gmail.com",
        password: "123456789",
        avatar_url: "avatar.jpg",
        role: UserRole.USER,
      };

      const mockCreatedUser = {
        id: 1,
        ...createUserDto,
        password_hash: "@#$$%^&*()",
      };

      mockUsersEntity.findOneBy.mockResolvedValue(null);

      const mockSave = jest.fn().mockResolvedValue(mockCreatedUser);
      mockUsersEntity.create.mockReturnValue({
        save: mockSave,
      });

      const result = await service.create(createUserDto);

      const expectedResult = {
        code: HttpStatus.OK,
        message: "Create user successfully",
        data: mockCreatedUser,
      };

      const wrongExpectedResult = {
        code: HttpStatus.CREATED, // Sai
        message: "User created successfully", // Sai
        data: mockCreatedUser,
      };

      logTestCase(
        "create - Nếu tạo người dùng mới thành công",
        createUserDto,
        expectedResult,
        result
      );

      expect(result.code).toBe(HttpStatus.OK);
      expect(result.message).toBe("Create user successfully");
      expect(result.data).toEqual(mockCreatedUser);
      expect(Users.findOneBy).toHaveBeenCalledTimes(2); // check email và username
    });

    it("Nếu email đã tồn tại thì trả về conflict", async () => {
      const createUserDto: CreateUserDto = {
        first_name: "Từ Đức",
        last_name: "Mạnh",
        username: "tuducmanh",
        email: "existing@example.com",
        password: "123456789",
        avatar_url: "avatar.jpg",
        role: UserRole.USER,
      };

      const mockExistingUser = {
        id: 1,
        email: createUserDto.email,
      };

      // Mock tìm thấy email
      mockUsersEntity.findOneBy.mockResolvedValue(mockExistingUser);

      const result = await service.create(createUserDto);

      const expectedResult = {
        code: HttpStatus.CONFLICT,
        message: "Email already exists",
        data: null,
      };

      logTestCase(
        "create - Nếu email đã tồn tại thì trả về conflict",
        createUserDto,
        expectedResult,
        result
      );

      expect(result.code).toBe(HttpStatus.CONFLICT);
      expect(result.message).toBe("Email already exists");
      expect(result.data).toBeNull();
    });

    it("Nếu username đã tồn tại thì trả về conflict", async () => {
      const createUserDto: CreateUserDto = {
        first_name: "Từ Đức",
        last_name: "Mạnh",
        username: "tuducmanh",
        email: "tuducmanh@gmail.com",
        password: "123456789",
        avatar_url: "avatar.jpg",
        role: UserRole.USER,
      };

      // Mock không tìm thấy email nhưng tìm thấy username
      mockUsersEntity.findOneBy
        .mockResolvedValueOnce(null) // check email
        .mockResolvedValueOnce({ id: 1, username: createUserDto.username }); // check username

      const result = await service.create(createUserDto);

      const expectedResult = {
        code: HttpStatus.CONFLICT,
        message: "Username already exists",
        data: null,
      };

      logTestCase(
        "create - Nếu username đã tồn tại thì trả về conflict",
        createUserDto,
        expectedResult,
        result
      );

      expect(result.code).toBe(HttpStatus.CONFLICT);
      expect(result.message).toBe("Username already exists");
      expect(result.data).toBeNull();
    });

    it("Mã hóa mật khẩu trước khi lưu", async () => {
      const createUserDto: CreateUserDto = {
        first_name: "Từ Đức",
        last_name: "Mạnh",
        username: "tuducmanh",
        email: "tuducmanh@gmail.com",
        password: "123456789",
        avatar_url: "avatar.jpg",
        role: UserRole.USER,
      };

      mockUsersEntity.findOneBy.mockResolvedValue(null);

      const mockSave = jest.fn().mockResolvedValue({
        id: 1,
        ...createUserDto,
        password_hash: "@#$$%^&*()",
      });

      mockUsersEntity.create.mockReturnValue({
        save: mockSave,
      });

      // Spy on bcrypt
      const hashSyncSpy = jest.spyOn(bcrypt, "hashSync");

      await service.create(createUserDto);

      logTestCase(
        "create - Mã hóa mật khẩu trước khi lưu",
        { password: createUserDto.password },
        { hashed: true },
        { hashed: hashSyncSpy.mock.calls.length > 0 }
      );

      // Verify password was hashed
      expect(hashSyncSpy).toHaveBeenCalledWith(createUserDto.password, 10);

      hashSyncSpy.mockRestore();
    });

    it("Xử lý lỗi và trả về lỗi máy chủ nội bộ", async () => {
      const createUserDto: CreateUserDto = {
        first_name: "Từ Đức",
        last_name: "Mạnh",
        username: "tuducmanh",
        email: "tuducmanh@gmail.com",
        password: "123456789",
        avatar_url: "avatar.jpg",
        role: UserRole.USER,
      };

      // Mock lỗi khi check email
      mockUsersEntity.findOneBy.mockRejectedValue(new Error("Database error"));

      const result = await service.create(createUserDto);

      const expectedResult = {
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        message: "Create user failed",
        data: null,
      };

      logTestCase(
        "create - Xử lý lỗi và trả về lỗi máy chủ nội bộ",
        createUserDto,
        expectedResult,
        result
      );

      expect(result.code).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(result.message).toBe("Create user failed");
    });
  });

  describe("findAll", () => {
    it("Lấy tất cả người dùng với phân trang", async () => {
      const mockUsers = [
        { id: 1, username: "tuducmanh", email: "tuducmanh@gmail.com" },
        { id: 2, username: "tranquoctuan", email: "tranquoctuan@gmail.com" },
      ];

      mockUserRepository.findAndCount.mockResolvedValue([mockUsers, 2]);

      const result = await service.findAll();

      const expectedResult = {
        code: HttpStatus.OK,
        message: "Get users successfully",
        data: mockUsers,
        pagination: {
          totalItems: 2,
          totalPages: 1,
          currentPage: 1,
          pageSize: 10,
        },
      };

      logTestCase(
        "findAll - Lấy tất cả người dùng với phân trang",
        { keyword: undefined, page: 1, limit: 10 },
        expectedResult,
        result
      );

      expect(result.code).toBe(HttpStatus.OK);
      expect(result.message).toBe("Get users successfully");
      expect(result.data).toEqual(mockUsers);
    });

    it("Lấy người dùng được lọc theo từ khóa", async () => {
      const keyword = "tuducmanh";
      const mockUsers = [
        { id: 1, username: "tuducmanh", email: "tuducmanh@gmail.com" },
      ];

      mockUserRepository.findAndCount.mockResolvedValue([mockUsers, 1]);

      const result = await service.findAll(keyword);

      logTestCase(
        "findAll - Lấy người dùng được lọc theo từ khóa",
        { keyword, page: 1, limit: 10 },
        { users: mockUsers, count: 1 },
        { users: result.data, count: result.pagination?.totalItems }
      );

      expect(result.code).toBe(HttpStatus.OK);
      expect(result.data).toEqual(mockUsers);
      expect(result.pagination?.totalItems).toBe(1);
    });

    it("Xử lý lỗi trong findAll", async () => {
      mockUserRepository.findAndCount.mockRejectedValue(new Error("Database error"));

      const result = await service.findAll();

      const expectedResult = {
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        message: "Get users failed",
        data: null,
      };

      logTestCase(
        "findAll - Xử lý lỗi trong findAll",
        { keyword: undefined, page: 1, limit: 10 },
        expectedResult,
        result
      );

      expect(result.code).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(result.message).toBe("Get users failed");
    });
  });

  describe("findOne", () => {
    it("Lấy người dùng theo id thành công", async () => {
      const userId = 1;
      const mockUser = {
        id: 1,
        username: "tuducmanh",
        email: "tuducmanh@gmail.com",
      };

      mockUsersEntity.findOneBy.mockResolvedValue(mockUser);

      const result = await service.findOne(userId);

      const expectedResult = {
        code: HttpStatus.OK,
        message: "Get user successfully",
        data: mockUser,
      };

      logTestCase(
        "findOne - Lấy người dùng theo id thành công",
        { userId },
        expectedResult,
        result
      );

      expect(result.code).toBe(HttpStatus.OK);
      expect(result.message).toBe("Get user successfully");
      expect(result.data).toEqual(mockUser);
    });

    it("Không tìm thấy người dùng khi user không tồn tại", async () => {
      const userId = 999;

      mockUsersEntity.findOneBy.mockResolvedValue(null);

      const result = await service.findOne(userId);

      const expectedResult = {
        code: HttpStatus.NOT_FOUND,
        message: `User with id ${userId} not found`,
        data: null,
      };

      logTestCase(
        "findOne - Không tìm thấy người dùng khi user không tồn tại",
        { userId },
        expectedResult,
        result
      );

      expect(result.code).toBe(HttpStatus.NOT_FOUND);
      expect(result.message).toBe(`User with id ${userId} not found`);
      expect(result.data).toBeNull();
    });

    it("Xử lý lỗi trong findOne", async () => {
      const userId = 1;

      mockUsersEntity.findOneBy.mockRejectedValue(new Error("Database error"));

      const result = await service.findOne(userId);

      const expectedResult = {
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        message: "Get user failed",
        data: null,
      };

      logTestCase(
        "findOne - Xử lý lỗi trong findOne",
        { userId },
        expectedResult,
        result
      );

      expect(result.code).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(result.message).toBe("Get user failed");
    });
  });

  describe("update", () => {
    it("Cập nhật người dùng thành công", async () => {
      const userId = 1;
      const updateUserDto: UpdateUserDto = {
        first_name: "Mạnh",
        last_name: "Đức",
      };

      const mockUser = {
        id: 1,
        first_name: "Mạnh",
        last_name: "Đức",
        username: "tuducmanh",
        email: "tuducmanh@gmail.com",
        updatedAt: new Date(),
      };

      const updatedUser = {
        ...mockUser,
        ...updateUserDto,
      };

      mockUserRepository.findOneBy.mockResolvedValue(mockUser);
      mockUserRepository.save.mockResolvedValue(updatedUser);

      const result = await service.update(userId, updateUserDto);

      const expectedResult = {
        code: HttpStatus.OK,
        message: "Update user successful",
        data: updatedUser,
      };

      logTestCase(
        "update - Cập nhật người dùng thành công",
        { userId, updateData: updateUserDto },
        expectedResult,
        result
      );

      expect(result.code).toBe(HttpStatus.OK);
      expect(result.message).toBe("Update user successful");
      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    it("Không tìm thấy người dùng khi cập nhật người dùng không tồn tại", async () => {
      const userId = 999;
      const updateUserDto: UpdateUserDto = {
        first_name: "Mạnh",
      };

      mockUserRepository.findOneBy.mockResolvedValue(null);

      const result = await service.update(userId, updateUserDto);

      const expectedResult = {
        code: HttpStatus.NOT_FOUND,
        message: `User with id ${userId} not found`,
        data: null,
      };

      logTestCase(
        "update - Không tìm thấy người dùng khi cập nhật người dùng không tồn tại",
        { userId, updateData: updateUserDto },
        expectedResult,
        result
      );

      expect(result.code).toBe(HttpStatus.NOT_FOUND);
      expect(result.message).toBe(`User with id ${userId} not found`);
    });

    it("Mã hóa mật khẩu khi cập nhật mật khẩu", async () => {
      const userId = 1;
      const updateUserDto: UpdateUserDto = {
        password: "123456789",
      };

      const mockUser = {
        id: 1,
        username: "tuducmanh",
        email: "tuducmanh@gmail.com",
        password_hash: "oldHash",
      };

      mockUserRepository.findOneBy.mockResolvedValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);

      const hashSyncSpy = jest.spyOn(bcrypt, "hashSync");

      await service.update(userId, updateUserDto);

      logTestCase(
        "update - Mã hóa mật khẩu khi cập nhật mật khẩu",
        { userId, password: updateUserDto.password },
        { passwordHashed: true },
        { passwordHashed: hashSyncSpy.mock.calls.length > 0 }
      );

      expect(hashSyncSpy).toHaveBeenCalledWith(updateUserDto.password, 10);

      hashSyncSpy.mockRestore();
    });

    it("Xử lý lỗi trong cập nhật người dùng", async () => {
      const userId = 1;
      const updateUserDto: UpdateUserDto = {
        first_name: "Mạnh",
      };

      mockUserRepository.findOneBy.mockRejectedValue(new Error("Database error"));

      const result = await service.update(userId, updateUserDto);

      const expectedResult = {
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        message: "Update user failed",
        data: null,
      };

      logTestCase(
        "update - Xử lý lỗi trong cập nhật người dùng",
        { userId, updateData: updateUserDto },
        expectedResult,
        result
      );

      expect(result.code).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(result.message).toBe("Update user failed");
    });
  });

  describe("remove", () => {
    it("Xóa người dùng thành công", async () => {
      const userId = 1;
      const mockUser = {
        id: 1,
        username: "tuducmanh",
        email: "tuducmanh@gmail.com",
        delFlag: false,
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.save.mockResolvedValue({ ...mockUser, delFlag: true });

      const result = await service.remove(userId);

      const expectedResult = {
        code: HttpStatus.OK,
        message: `User with ID ${userId} has been soft deleted`,
        data: null,
      };

      logTestCase(
        "remove - Xóa người dùng thành công",
        { userId },
        expectedResult,
        result
      );

      expect(result.code).toBe(HttpStatus.OK);
      expect(result.message).toBe(`User with ID ${userId} has been soft deleted`);
      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    it("Không tìm thấy người dùng khi xóa người dùng không tồn tại", async () => {
      const userId = 999;

      mockUserRepository.findOne.mockResolvedValue(null);

      const result = await service.remove(userId);

      const expectedResult = {
        code: HttpStatus.NOT_FOUND,
        message: `User with id ${userId} not found`,
        data: null,
      };

      logTestCase(
        "remove - Không tìm thấy người dùng khi xóa người dùng không tồn tại",
        { userId },
        expectedResult,
        result
      );

      expect(result.code).toBe(HttpStatus.NOT_FOUND);
      expect(result.message).toBe(`User with id ${userId} not found`);
    });

    it("Xử lý lỗi trong xóa người dùng", async () => {
      const userId = 1;

      mockUserRepository.findOne.mockRejectedValue(new Error("Database error"));

      const result = await service.remove(userId);

      const expectedResult = {
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        message: "Delete user failed",
        data: null,
      };

      logTestCase(
        "remove - Xử lý lỗi trong xóa người dùng",
        { userId },
        expectedResult,
        result
      );

      expect(result.code).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(result.message).toBe("Delete user failed");
    });
  });
});
