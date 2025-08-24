import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
} from "typeorm";

export const enum UserRole {
  ADMIN = "ADMIN",
  USER = "USER",
}

@Entity("users")
export class Users extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 255, nullable: false })
  first_name: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  last_name: string;

  @Column({ type: "varchar", length: 50, nullable: false })
  username: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  email: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  password_hash: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  avatar_url: string;

  @Column({ type: "varchar", length: 50, nullable: false })
  role: UserRole;

  @Column({ type: "boolean", default: false, nullable: false })
  delFlag: boolean;

  @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @UpdateDateColumn({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP",
  })
  updatedAt: Date;

  @Column({ type: "timestamp", nullable: true })
  deletedAt: Date | null;
}
