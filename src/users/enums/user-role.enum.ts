import { registerEnumType } from "@nestjs/graphql";

export enum UserRole {
  ADMIN = 'admin',
  PLAYER = 'player'
}

registerEnumType(UserRole, {
  name: 'UserRole',
  description: 'The role of a user',
});