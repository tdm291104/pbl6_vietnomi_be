import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  OneToMany,
} from "typeorm";
import { Comments } from "./comment.entity";

export const enum UserRole {
  ADMIN = "ADMIN",
  USER = "USER",
}

@Entity("users")
export class Users extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 255, nullable: true })
  first_name: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  last_name: string;

  @Column({ type: "varchar", length: 50, nullable: false })
  username: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  email: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  password_hash: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  avatar_url: string;

  @Column({ type: "varchar", length: 50, nullable: false })
  role: UserRole;

  @Column({ type: "boolean", default: false, nullable: false })
  delFlag: boolean;

  @Column({ type: "varchar", length: 10, nullable: true })
  otp: string | null;

  @Column({ type: "timestamp", nullable: true })
  otp_expiry_time: Date | null;

  @Column({ type: "varchar", length: 255, nullable: true })
  refreshToken: string;

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

  @OneToMany(() => Comments, (comment) => comment.user)
  comments: Comments[];
}
