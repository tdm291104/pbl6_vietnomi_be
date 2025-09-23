import { UserRole } from "../../../entities";

export interface PayloadTokenDto {
  id: number;
  username: string;
  role: UserRole;
}
