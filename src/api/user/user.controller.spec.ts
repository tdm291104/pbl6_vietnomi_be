import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { UserModule } from "./user.module";
import {
  clearDB,
  getSynchronizeConnection,
  IMPORT_MODULES,
  initAppFromModule,
} from "../../../test/utils/utils";
import { DataSource } from "typeorm/data-source/DataSource";

describe("SampleController", () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    dataSource = await getSynchronizeConnection();
    const module: TestingModule = await Test.createTestingModule({
      imports: [...IMPORT_MODULES, UserModule],
    }).compile();

    app = await initAppFromModule(module);
  });

  afterAll(async () => {
    await clearDB(dataSource);
    await dataSource.destroy();
    await app.close();
  });

  describe("GET /sample (findAll)", () => {
    it("should return all samples", async () => {
      const result = await request(app.getHttpServer()).get("/sample");

      expect(result.body.message).toEqual("This action returns all sample");
    });
  });
});
