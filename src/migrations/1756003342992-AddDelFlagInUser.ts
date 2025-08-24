import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDelFlagInUser1756003342992 implements MigrationInterface {
    name = 'AddDelFlagInUser1756003342992'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "delFlag" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "email" SET NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "email" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "delFlag"`);
    }

}
