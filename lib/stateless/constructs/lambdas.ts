import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { Code, Function, Runtime } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import { LambdaIntegration } from 'aws-cdk-lib/aws-apigateway';
import * as path from 'path';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { UserPool, UserPoolClient } from 'aws-cdk-lib/aws-cognito';

interface LambdaConstructProps {
  dataTable: Table;
  cognitoUserPool: UserPool;
  cognitoUserPoolClient: UserPoolClient;
}

export class Lambdas extends Construct {
  private signupFunction: Function;
  public signUpIntegration: LambdaIntegration;

  constructor(scope: Construct, id: string, props: LambdaConstructProps) {
    super(scope, id);

    this.createLambdaFunctions(props);
    this.createLambdaIntegrations();
    this.assignPermissions(props);
  }

  private createLambdaFunctions(props: LambdaConstructProps) {
    this.signupFunction = this.createLambdaFunction('signup');
    this.signupFunction.addEnvironment(
      'COGNITO_USER_POOL_ID',
      props.cognitoUserPool.userPoolId
    );
    this.signupFunction.addEnvironment(
      'COGNITO_USER_POOL_CLIENT_ID',
      props.cognitoUserPoolClient.userPoolClientId
    );
  }

  private createLambdaIntegrations() {
    this.signUpIntegration = new LambdaIntegration(this.signupFunction);
  }

  private assignPermissions(props: LambdaConstructProps) {
    new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ['cognito-idp:SignUp'],
      resources: [props.cognitoUserPool.userPoolArn],
    });
  }

  private createLambdaFunction(id: string) {
    return new Function(this, id, {
      runtime: Runtime.NODEJS_22_X,
      handler: 'index.handler',
      code: Code.fromAsset(
        path.resolve(__dirname, '../../../lambdas/dist', id)
      ),
    });
  }
}
