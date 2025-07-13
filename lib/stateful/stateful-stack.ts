import { Duration, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';
import {
  StringAttribute,
  UserPool,
  UserPoolClient,
  UserPoolOperation,
} from 'aws-cdk-lib/aws-cognito';
import { Code, Runtime } from 'aws-cdk-lib/aws-lambda';
import { Function } from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';

interface StatefulStackProps extends StackProps {
  stage: string;
}

export class StatefulStack extends Stack {
  public readonly dataTable: Table;
  public readonly strydeUserPool: UserPool;
  public readonly strydeUserPoolClient: UserPoolClient;

  constructor(scope: Construct, id: string, props: StatefulStackProps) {
    super(scope, id, props);

    this.dataTable = this.createDataTable();
    this.strydeUserPool = this.createCognitoUserPool();
    this.strydeUserPoolClient = this.createCognitoUserPoolClient();
    this.createLambdaTriggers();
  }

  private createDataTable(): Table {
    const table = new Table(this, 'DataTable', {
      partitionKey: { name: 'PK', type: AttributeType.STRING },
      sortKey: { name: 'SK', type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
    });

    table.addGlobalSecondaryIndex({
      indexName: 'GSI1',
      partitionKey: { name: 'GSI1PK', type: AttributeType.STRING },
      sortKey: { name: 'GSI1SK', type: AttributeType.STRING },
    });

    table.addGlobalSecondaryIndex({
      indexName: 'GSI5',
      partitionKey: { name: 'GSI5PK', type: AttributeType.STRING },
      sortKey: { name: 'GSI5SK', type: AttributeType.STRING },
    });

    return table;
  }

  private createCognitoUserPool(): UserPool {
    const userPool = new UserPool(this, 'StrydeUserPool', {
      selfSignUpEnabled: true,
      signInAliases: {
        email: true,
      },
      passwordPolicy: {
        minLength: 8,
        requireDigits: true,
        requireLowercase: true,
        requireSymbols: false,
        requireUppercase: true,
      },
      customAttributes: {
        role: new StringAttribute({}),
        firstName: new StringAttribute({}),
        lastName: new StringAttribute({}),
        email: new StringAttribute({}),
      },
    });

    return userPool;
  }

  private createCognitoUserPoolClient(): UserPoolClient {
    return new UserPoolClient(this, 'StrydeClient', {
      userPool: this.strydeUserPool,
      authFlows: {
        userPassword: true,
      },
      idTokenValidity: Duration.hours(4),
      accessTokenValidity: Duration.hours(4),
      refreshTokenValidity: Duration.days(30),
    });
  }

  private createLambdaTriggers(): void {
    const preSignUpTrigger = new Function(this, 'PreSignUpTrigger', {
      runtime: Runtime.NODEJS_22_X,
      handler: 'index.handler',
      code: Code.fromAsset(
        path.resolve(__dirname, '../../lambdas/dist', 'preSignUpTrigger')
      ),
      environment: {
        TABLE_NAME: this.dataTable.tableName,
      },
    });

    preSignUpTrigger.addToRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ['dynamodb:PutItem'],
        resources: [this.dataTable.tableArn],
      })
    );

    this.strydeUserPool.addTrigger(
      UserPoolOperation.PRE_SIGN_UP,
      preSignUpTrigger
    );
  }
}
