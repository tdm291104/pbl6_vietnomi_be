import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNewEntity1755790784751 implements MigrationInterface {
  name = "AddNewEntity1755790784751";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "email" character varying(255) Not Null`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "email"`);
  }
}
