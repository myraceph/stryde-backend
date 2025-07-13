import { NestedStack, NestedStackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { Function, Runtime, Code } from 'aws-cdk-lib/aws-lambda';
import { PolicyStatement, Effect } from 'aws-cdk-lib/aws-iam';
import { UserPool, UserPoolClient } from 'aws-cdk-lib/aws-cognito';
import * as path from 'path';

interface AuthApiStackProps extends NestedStackProps {
  api: RestApi;
  cognitoUserPool: UserPool;
  cognitoUserPoolClient: UserPoolClient;
}

export class AuthApiStack extends NestedStack {
  private signupFunction: Function;
  private loginFunction: Function;
  private refreshFunction: Function;
  private signUpIntegration: LambdaIntegration;
  private loginIntegration: LambdaIntegration;
  private refreshIntegration: LambdaIntegration;

  constructor(scope: Construct, id: string, props: AuthApiStackProps) {
    super(scope, id);

    this.createLambdaFunctions(props);
    this.createLambdaIntegrations();
    this.assignPermissions(props);
    this.createResources(props);
  }

  private createLambdaFunctions(props: AuthApiStackProps) {
    this.signupFunction = this.createLambdaFunction('signup');
    this.signupFunction.addEnvironment(
      'COGNITO_USER_POOL_CLIENT_ID',
      props.cognitoUserPoolClient.userPoolClientId
    );

    this.loginFunction = this.createLambdaFunction('login');
    this.loginFunction.addEnvironment(
      'COGNITO_USER_POOL_CLIENT_ID',
      props.cognitoUserPoolClient.userPoolClientId
    );

    this.refreshFunction = this.createLambdaFunction('refresh');
    this.refreshFunction.addEnvironment(
      'COGNITO_USER_POOL_CLIENT_ID',
      props.cognitoUserPoolClient.userPoolClientId
    );
  }

  private createLambdaIntegrations() {
    this.signUpIntegration = new LambdaIntegration(this.signupFunction);
    this.loginIntegration = new LambdaIntegration(this.loginFunction);
    this.refreshIntegration = new LambdaIntegration(this.refreshFunction);
  }

  private assignPermissions(props: AuthApiStackProps) {
    this.signupFunction.addToRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ['cognito-idp:SignUp'],
        resources: [props.cognitoUserPool.userPoolArn],
      })
    );

    this.loginFunction.addToRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ['cognito-idp:InitiateAuth'],
        resources: [props.cognitoUserPool.userPoolArn],
      })
    );

    this.refreshFunction.addToRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ['cognito-idp:GetTokensFromRefreshToken'],
        resources: [props.cognitoUserPool.userPoolArn],
      })
    );
  }

  private createResources(props: AuthApiStackProps): void {
    const signupResource = props.api.root.addResource('signup');
    signupResource.addMethod('POST', this.signUpIntegration);

    const loginResource = props.api.root.addResource('login');
    loginResource.addMethod('POST', this.loginIntegration);

    const refreshResource = props.api.root.addResource('refresh');
    refreshResource.addMethod('POST', this.refreshIntegration);
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
