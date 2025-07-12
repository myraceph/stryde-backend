import { NestedStack, NestedStackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';

interface AuthApiStackProps extends NestedStackProps {
  api: RestApi;
  signupIntegration: LambdaIntegration;
}

export class AuthApiStack extends NestedStack {
  constructor(scope: Construct, id: string, props: AuthApiStackProps) {
    super(scope, id);

    this.createResources(props);
  }

  private createResources(props: AuthApiStackProps): void {
    const signupResource = props.api.root.addResource('signup');
    signupResource.addMethod('POST', props.signupIntegration);
  }
}
