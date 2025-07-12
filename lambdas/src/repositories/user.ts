import { UserEntity } from '../entities/user';
import { EntityRepository } from 'dynamodb-toolbox';

export interface CreateUserInput {
  id: string;
  role: 'runner' | 'organizer';
  email: string;
  firstName: string;
  lastName: string;
}

export interface UpdateUserInput {
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: 'runner' | 'organizer';
}

export interface User {
  id: string;
  role: 'runner' | 'organizer';
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  updatedAt: string;
  GSI1PK: string;
  GSI1SK: string;
  GSI5PK: string;
  GSI5SK: string;
}

const userRepository = new EntityRepository(UserEntity);

export class UserRepository {
  /**
   * Create a new user
   */
  async createUser(input: CreateUserInput): Promise<User> {
    const now = new Date().toISOString();

    const { ToolboxItem: user } = await userRepository.put({
      PK: `USER#${input.id}`,
      SK: `PROFILE`,
      id: input.id,
      role: input.role,
      email: input.email,
      firstName: input.firstName,
      lastName: input.lastName,
      GSI1PK: `ROLE#${input.role}`,
      GSI1SK: `${input.id}`,
      GSI5PK: `USER#COLLECTION`,
      GSI5SK: now,
    });

    return user;
  }

  /**
   * Get a user by ID
   */
  async getUserById(id: string): Promise<User | null> {
    try {
      const result = await userRepository.get({
        PK: `USER#${id}`,
        SK: `PROFILE`,
      });

      return result.Item || null;
    } catch (error) {
      console.error('Error getting user by ID:', error);
      return null;
    }
  }

  /**
   * TODO: Add GSI2
   * Get a user by email
   */
  async getUserByEmail(email: string): Promise<User | null> {
    return null;
  }

  /**
   * Update a user
   */
  async updateUser(id: string, input: UpdateUserInput): Promise<User | null> {
    try {
      const updateData: any = {
        PK: `USER#${id}`,
        SK: `PROFILE`,
        updatedAt: new Date().toISOString(),
      };

      // Only include fields that are being updated
      if (input.email !== undefined) updateData.email = input.email;
      if (input.firstName !== undefined) updateData.firstName = input.firstName;
      if (input.lastName !== undefined) updateData.lastName = input.lastName;
      if (input.role !== undefined) updateData.role = input.role;

      const { ToolboxItem: user } = await userRepository.update(updateData);

      return user as User;
    } catch (error) {
      console.error('Error updating user:', error);
      return null;
    }
  }

  /**
   * Delete a user
   */
  async deleteUser(id: string): Promise<boolean> {
    try {
      await userRepository.delete({
        PK: `USER#${id}`,
        SK: `PROFILE`,
      });
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  }

  /**
   * List all users (with pagination)
   */
  async listUsers(
    limit = 50,
    startKey?: any
  ): Promise<{ users: User[]; lastEvaluatedKey?: Record<string, any> }> {
    try {
      const result = await userRepository.query(
        {
          partition: 'GSI5',
          range: { beginsWith: 'USER#COLLECTION' },
        },
        {
          limit,
          startKey,
        }
      );

      return {
        users: result.Items as User[],
        ...(result.LastEvaluatedKey && {
          lastEvaluatedKey: result.LastEvaluatedKey,
        }),
      };
    } catch (error) {
      console.error('Error listing users:', error);
      return { users: [] };
    }
  }

  /**
   * List users by role
   */
  async listUsersByRole(
    role: 'runner' | 'organizer',
    limit = 50,
    startKey?: any
  ): Promise<{ users: User[]; lastEvaluatedKey?: Record<string, any> }> {
    try {
      const result = await userRepository.query(
        {
          partition: 'GSI1',
          range: { beginsWith: `ROLE#${role}` },
        },
        {
          limit,
          startKey,
          where: { role: { eq: role } },
        }
      );

      return {
        users: result.Items as User[],
        ...(result.LastEvaluatedKey && {
          lastEvaluatedKey: result.LastEvaluatedKey,
        }),
      };
    } catch (error) {
      console.error('Error listing users by role:', error);
      return { users: [] };
    }
  }
}
