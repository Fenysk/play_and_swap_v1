import { SetMetadata } from "@nestjs/common";
import { Role } from "../entities";

export const Roles = (...roles: Role[]) => SetMetadata('roles', roles);
