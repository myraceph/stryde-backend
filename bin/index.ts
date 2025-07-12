#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { StatefulStack } from '../lib/stateful/stateful-stack';
import { StatelessStack } from '../lib/stateless/stateless-stack';

const app = new cdk.App();

const devStatefulStack = new StatefulStack(app, 'DevStatefulStack', {
  env: {
    account: '442867850698',
    region: 'ap-southeast-1',
  },
  stage: 'dev',
});

new StatelessStack(app, 'DevStatelessStack', {
  env: {
    account: '442867850698',
    region: 'ap-southeast-1',
  },
  dataTable: devStatefulStack.dataTable,
  cognitoUserPool: devStatefulStack.strydeUserPool,
  cognitoUserPoolClient: devStatefulStack.strydeUserPoolClient,
  stage: 'dev',
});
