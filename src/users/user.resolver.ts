import { Args, Mutation, Query, Resolver, ID, Context, ResolveField } from '@nestjs/graphql';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from 'src/shared/guards/graphql-auth.guard';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  // Query: Get all users (protected)
  @Query(() => [User], { name: 'users', description: 'Get all users (Admin only)' })
  @UseGuards(GqlAuthGuard)
  async findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  // Query: Get user by ID (protected)
  @Query(() => User, { name: 'user', description: 'Get a user by ID' })
  @UseGuards(GqlAuthGuard)
  async findOne(@Args('id', { type: () => ID }) id: string): Promise<User> {
    return this.usersService.findOne(id);
  }

  // Query: Get user by username
  @Query(() => User, { name: 'userByUsername', description: 'Get a user by username' })
  async findOneByUsername(@Args('username') username: string): Promise<User> {
    return this.usersService.findOneByUsername(username);
  }

  // Query: Get user by email
  @Query(() => User, { name: 'userByEmail', description: 'Get a user by email' })
  async findOneByEmail(@Args('email') email: string): Promise<User> {
    return this.usersService.findOneBymail(email);
  }

  // Mutation: Create new user (public)
  @Mutation(() => User, { description: 'Create a new user account' })
  async createUser(@Args('input') createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto);
  }

  // Mutation: Update user (protected)
  @Mutation(() => User, { description: 'Update user profile' })
  @UseGuards(GqlAuthGuard)
  async updateUser(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') updateUserDto: UpdateUserDto,
    @Context() context: any
  ): Promise<User> {
    // Get the current user from the context
    const currentUser = context.req.user;
    // Ensure users can only update their own profile unless admin
    if (currentUser.id !== id && !currentUser.isAdmin) {
      throw new Error('You can only update your own profile');
    }
    return this.usersService.update(id, updateUserDto);
  }

  // Mutation: Delete user (protected)
  @Mutation(() => Boolean, { description: 'Delete user account' })
  @UseGuards(GqlAuthGuard)
  async removeUser(
    @Args('id', { type: () => ID }) id: string,
    @Context() context: any
  ): Promise<boolean> {
    const currentUser = context.req.user;
    // Ensure users can only delete their own account unless admin
    if (currentUser.id !== id && !currentUser.isAdmin) {
      throw new Error('You can only delete your own account');
    }
    await this.usersService.remove(id);
    return true;
  }


  // Field resolver: Never expose password hash
  @ResolveField('password', () => String, { nullable: true })
  resolvePassword() {
    return null;
  }
}