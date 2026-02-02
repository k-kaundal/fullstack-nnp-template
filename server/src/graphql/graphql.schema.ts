/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */

export class CreateUserInput {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}

export class UpdateUserInput {
  email?: Nullable<string>;
  firstName?: Nullable<string>;
  isActive?: Nullable<boolean>;
  lastName?: Nullable<string>;
  password?: Nullable<string>;
}

export abstract class IMutation {
  __typename?: 'IMutation';

  abstract createUser(input: CreateUserInput): User | Promise<User>;

  abstract deleteUser(id: string): boolean | Promise<boolean>;

  abstract toggleUserStatus(id: string): User | Promise<User>;

  abstract updateUser(id: string, input: UpdateUserInput): User | Promise<User>;
}

export abstract class IQuery {
  __typename?: 'IQuery';

  abstract searchUsers(email: string): User[] | Promise<User[]>;

  abstract user(id: string): Nullable<User> | Promise<Nullable<User>>;

  abstract users(
    limit?: Nullable<number>,
    page?: Nullable<number>,
  ): UsersConnection | Promise<UsersConnection>;
}

export abstract class ISubscription {
  __typename?: 'ISubscription';

  abstract userCreated(): User | Promise<User>;

  abstract userDeleted(): string | Promise<string>;

  abstract userUpdated(): User | Promise<User>;
}

export class User {
  __typename?: 'User';
  createdAt: string;
  email: string;
  firstName: string;
  id: string;
  isActive: boolean;
  lastName: string;
  updatedAt: string;
}

export class UsersConnection {
  __typename?: 'UsersConnection';
  hasNext: boolean;
  hasPrevious: boolean;
  limit: number;
  page: number;
  total: number;
  totalPages: number;
  users: User[];
}

type Nullable<T> = T | null;
