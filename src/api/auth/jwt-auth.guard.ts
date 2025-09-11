import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { TokenExpiredError } from "jsonwebtoken";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    if (err || !user) {
      // Nếu token hết hạn
      if (info instanceof TokenExpiredError) {
        throw new UnauthorizedException("TOKEN_EXPIRED");
      }
      throw err || new UnauthorizedException("UNAUTHORIZED");
    }
    return user;
  }
}
