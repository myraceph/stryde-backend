import { StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {
  Deployment,
  LambdaIntegration,
  RestApi,
} from 'aws-cdk-lib/aws-apigateway';
import { AuthApiStack } from '../stacks/auth-api-stack';
import { Stage } from 'aws-cdk-lib/aws-apigateway';

interface ApiGatewayConstructProps extends StackProps {
  signupIntegration: LambdaIntegration;
  stage: string;
}

export class ApiGateway extends Construct {
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
      signupIntegration: props.signupIntegration,
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
