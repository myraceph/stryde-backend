import {
  Entity,
  ValidItem,
  Table,
  item,
  string,
  number,
} from 'dynamodb-toolbox';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const table = new Table({
  name: process.env.TABLE_NAME,
  partitionKey: { name: 'PK', type: 'string' },
  sortKey: { name: 'SK', type: 'string' },
  documentClient: DynamoDBDocumentClient.from(
    new DynamoDBClient({
      region: process.env.AWS_REGION,
    })
  ),
});

const funrunSchema = item({
  PK: string().key(),
  SK: string().key(),
  id: string().required(),
  name: string().required(),
  location: string().required(),
  description: string().required(),
  distance: number().required(),
  organizerId: string().required(),
  status: string().default('upcoming').required(),
  date: string().required(),
  createdAt: string().default(new Date().toISOString()).required(),
  updatedAt: string().default(new Date().toISOString()).required(),
  GSI1PK: string(),
  GSI1SK: string(),
  GSI2PK: string(),
  GSI2SK: string(),
  GSI5PK: string(),
  GSI5SK: string(),
});

export const FunrunEntity = new Entity({
  name: 'Funrun',
  table,
  schema: funrunSchema,
});

export const toResponseDto = (funrun: ValidItem<typeof FunrunEntity>) => {
  return {
    id: funrun.id,
    name: funrun.name,
    location: funrun.location,
    description: funrun.description,
    distance: funrun.distance,
    organizerId: funrun.organizerId,
    status: funrun.status,
    date: funrun.date,
    createdAt: funrun.createdAt,
    updatedAt: funrun.updatedAt,
  };
};
