import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { Api } from './constructs/apigateway';
import { UserPool, UserPoolClient } from 'aws-cdk-lib/aws-cognito';

interface StatelessStackProps extends StackProps {
  dataTable: Table;
  cognitoUserPool: UserPool;
  cognitoUserPoolClient: UserPoolClient;
  stage: string;
}

export class StatelessStack extends Stack {
  constructor(scope: Construct, id: string, props: StatelessStackProps) {
    super(scope, id, props);

    new Api(this, 'Api', {
      cognitoUserPool: props.cognitoUserPool,
      cognitoUserPoolClient: props.cognitoUserPoolClient,
      stage: props.stage,
    });
  }
}
