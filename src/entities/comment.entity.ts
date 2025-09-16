import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  ForeignKey,
} from "typeorm";
import { Foods } from "./food.entity";
import { Users } from "./user.entity";

@Entity("comments")
export class Comments extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ForeignKey(() => Users)
  @Column({ type: "int", nullable: false })
  user_id: number;

  @ForeignKey(() => Foods)
  @Column({ type: "int", nullable: false })
  food_id: number;

  @Column({ type: "boolean", default: false, nullable: false })
  delFlag: boolean;

  @Column({ type: "text", nullable: false })
  content: string;

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
