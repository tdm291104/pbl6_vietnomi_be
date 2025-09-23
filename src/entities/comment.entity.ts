import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  ForeignKey,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Foods } from "./food.entity";
import { Users } from "./user.entity";

@Entity("comments")
export class Comments extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Users, (user) => user.comments)
  @JoinColumn({ name: "user_id" })
  user: Users;

  @ManyToOne(() => Foods, (food) => food.comments)
  @JoinColumn({ name: "food_id" })
  food: Foods;

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
