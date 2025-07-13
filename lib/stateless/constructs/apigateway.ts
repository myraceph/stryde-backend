import { StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Deployment, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { AuthApiStack } from '../stacks/auth-api-stack';
import { Stage } from 'aws-cdk-lib/aws-apigateway';
import { UserPool, UserPoolClient } from 'aws-cdk-lib/aws-cognito';

interface ApiGatewayConstructProps extends StackProps {
  cognitoUserPool: UserPool;
  cognitoUserPoolClient: UserPoolClient;
  stage: string;
}

export class Api extends Construct {
  public api: RestApi;

  constructor(scope: Construct, id: string, props: ApiGatewayConstructProps) {
    super(scope, id);

    this.createApiGateway();
    this.createNestedStacks(props);
  }

  private createApiGateway(): void {
    this.api = new RestApi(this, 'StrydeApi', {
      deploy: false,
    });
  }

  private createNestedStacks(props: ApiGatewayConstructProps): void {
    const authApiStack = new AuthApiStack(this, 'AuthApiStack', {
      api: this.api,
      cognitoUserPool: props.cognitoUserPool,
      cognitoUserPoolClient: props.cognitoUserPoolClient,
    });

    const deployment = new Deployment(
      this,
      `ApiDeployment${Date.now().toString()}`,
      {
        api: this.api,
      }
    );

    deployment.node.addDependency(authApiStack);

    new Stage(this, 'ApiStage', {
      deployment,
      stageName: props.stage,
    });
  }
}
