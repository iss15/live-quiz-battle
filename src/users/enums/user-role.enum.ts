import { registerEnumType } from "@nestjs/graphql";

export enum UserRole {
  ADMIN = 'creator',
  PLAYER = 'player'
}

registerEnumType(UserRole, {
  name: 'UserRole',
  description: 'The role of a user',
});