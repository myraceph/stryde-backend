import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Lambdas } from './constructs/lambdas';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { ApiGateway } from './constructs/apigateway';
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

    const lambdas = new Lambdas(this, 'Lambdas', {
      dataTable: props.dataTable,
      cognitoUserPool: props.cognitoUserPool,
      cognitoUserPoolClient: props.cognitoUserPoolClient,
    });

    new ApiGateway(this, 'ApiGateway', {
      signupIntegration: lambdas.signUpIntegration,
      stage: props.stage,
    });
  }
}
