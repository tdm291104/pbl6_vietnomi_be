import { UserRole } from "src/entities";

export interface PayloadTokenDto {
  id: number;
  username: string;
  role: UserRole;
}
