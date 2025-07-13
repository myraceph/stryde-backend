import { FunrunEntity, toResponseDto } from '../entities/funrun';
import { EntityRepository, ValidItem } from 'dynamodb-toolbox';

export interface CreateFunrunInput {
  id: string;
  name: string;
  location: string;
  description: string;
  distance: number;
  organizerId: string;
  status?: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  date?: string;
}

export interface UpdateFunrunInput {
  name?: string;
  location?: string;
  description?: string;
  distance?: number;
  status?: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  date?: string;
}

export interface Funrun {
  id: string;
  name: string;
  location: string;
  description: string;
  distance: number;
  organizerId: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  date: string;
  createdAt: string;
  updatedAt: string;
  GSI1PK: string;
  GSI1SK: string;
  GSI2PK: string;
  GSI2SK: string;
  GSI5PK: string;
  GSI5SK: string;
}

const funrunRepository = new EntityRepository(FunrunEntity);

export class FunrunRepository {
  /**
   * Create a new funrun
   */
  async createFunrun(input: CreateFunrunInput): Promise<Funrun> {
    const now = new Date().toISOString();

    const { ToolboxItem: funrun } = await funrunRepository.put({
      PK: `FUNRUN#${input.id}`,
      SK: `DETAILS`,
      id: input.id,
      name: input.name,
      location: input.location,
      description: input.description,
      distance: input.distance,
      organizerId: input.organizerId,
      status: input.status || 'upcoming',
      date: input.date || now,
      createdAt: now,
      updatedAt: now,
      GSI1PK: `FUNRUN#${input.status || 'upcoming'}`,
      GSI1SK: `${input.date || now}`,
      GSI2PK: `ORGANIZER#${input.organizerId}`,
      GSI2SK: `${now}`,
      GSI5PK: `FUNRUN#COLLECTION`,
      GSI5SK: now,
    });

    return funrun as Funrun;
  }

  /**
   * Get a funrun by ID
   */
  async getFunrunById(id: string): Promise<Funrun | null> {
    try {
      const result = await funrunRepository.get({
        PK: `FUNRUN#${id}`,
        SK: `DETAILS`,
      });

      return (result.Item as Funrun) || null;
    } catch (error) {
      console.error('Error getting funrun by ID:', error);
      return null;
    }
  }

  /**
   * Update a funrun
   */
  async updateFunrun(
    id: string,
    input: UpdateFunrunInput
  ): Promise<Funrun | null> {
    try {
      const updateData = {
        PK: `FUNRUN#${id}`,
        SK: `DETAILS`,
        updatedAt: new Date().toISOString(),
      } as ValidItem<typeof FunrunEntity>;

      // Only include fields that are being updated
      if (input.name !== undefined) updateData.name = input.name;
      if (input.location !== undefined) updateData.location = input.location;
      if (input.description !== undefined)
        updateData.description = input.description;
      if (input.distance !== undefined) updateData.distance = input.distance;

      const { ToolboxItem: funrun } = await funrunRepository.update(updateData);

      return funrun as Funrun;
    } catch (error) {
      console.error('Error updating funrun:', error);
      return null;
    }
  }

  /**
   * Delete a funrun
   */
  async deleteFunrun(id: string): Promise<boolean> {
    try {
      await funrunRepository.delete({
        PK: `FUNRUN#${id}`,
        SK: `DETAILS`,
      });
      return true;
    } catch (error) {
      console.error('Error deleting funrun:', error);
      return false;
    }
  }

  /**
   * List all funruns (with pagination)
   */
  async listFunruns(
    limit = 50,
    startKey?: string
  ): Promise<{ funruns: Funrun[]; lastEvaluatedKey?: Record<string, string> }> {
    try {
      const result = await funrunRepository.query(
        {
          partition: 'GSI5',
          range: { beginsWith: 'FUNRUN#COLLECTION' },
        },
        {
          limit,
          startKey,
        }
      );

      return {
        funruns: result.Items as Funrun[],
        ...(result.LastEvaluatedKey && {
          lastEvaluatedKey: result.LastEvaluatedKey,
        }),
      };
    } catch (error) {
      console.error('Error listing funruns:', error);
      return { funruns: [] };
    }
  }

  /**
   * List funruns by organizer
   */
  async listFunrunsByOrganizer(
    organizerId: string,
    limit = 50,
    startKey?: string
  ): Promise<{ funruns: Funrun[]; lastEvaluatedKey?: Record<string, string> }> {
    try {
      const result = await funrunRepository.query(
        {
          partition: 'GSI2',
          range: { beginsWith: `ORGANIZER#${organizerId}` },
        },
        {
          limit,
          startKey,
          where: { organizerId: { eq: organizerId } },
        }
      );

      return {
        funruns: result.Items as Funrun[],
        ...(result.LastEvaluatedKey && {
          lastEvaluatedKey: result.LastEvaluatedKey,
        }),
      };
    } catch (error) {
      console.error('Error listing funruns by organizer:', error);
      return { funruns: [] };
    }
  }

  /**
   * List funruns by status and date
   */
  async listFunrunsByStatus(
    status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled',
    limit = 50,
    startKey?: string
  ): Promise<{ funruns: Funrun[]; lastEvaluatedKey?: Record<string, string> }> {
    try {
      const result = await funrunRepository.query(
        {
          partition: 'GSI1',
          range: { beginsWith: `FUNRUN#${status}` },
        },
        {
          limit,
          startKey,
          where: { status: { eq: status } },
        }
      );

      return {
        funruns: result.Items as Funrun[],
        ...(result.LastEvaluatedKey && {
          lastEvaluatedKey: result.LastEvaluatedKey,
        }),
      };
    } catch (error) {
      console.error('Error listing funruns by status:', error);
      return { funruns: [] };
    }
  }
}
