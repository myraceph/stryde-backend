# Stryde Backend

A serverless backend application built with AWS CDK, TypeScript, and AWS Lambda. This project provides user authentication and management functionality for the Stryde platform, supporting both runners and organizers.

## 🏗️ Architecture

The application follows a **serverless architecture** with the following components:

### Infrastructure (CDK Stacks)

#### Stateful Stack (`StatefulStack`)

- **DynamoDB Table**: Main data store with GSI1 and GSI5 indexes
- **Cognito User Pool**: User authentication and management
- **Cognito User Pool Client**: Application client for authentication
- **Lambda Triggers**: Pre-signup trigger for user creation

#### Stateless Stack (`StatelessStack`)

- **Lambda Functions**: Serverless compute for business logic
- **API Gateway**: REST API endpoints
- **Nested Stacks**: Organized API structure (Auth API Stack)

### Lambda Functions

#### Authentication Functions

- **`signup.ts`**: Handles user registration via Cognito
- **`preSignUpTrigger.ts`**: Automatically confirms users and creates user records

### Data Layer

#### Entities

- **`User`**: Core user entity with role-based access (runner/organizer)

#### Repositories

- **`UserRepository`**: CRUD operations for user management
  - Create, read, update, delete users
  - List users with pagination
  - Query users by role
  - DynamoDB integration with DynamoDB Toolbox

## 🚀 Getting Started

### Prerequisites

- Node.js 22.x (see `.nvmrc`)
- AWS CLI configured with appropriate credentials
- AWS CDK CLI installed globally

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Build Lambda functions**
   ```bash
   npm run esbuild -w lambdas
   ```

## 🧪 Remocal Testing (Individual Developer Environments)

### What is Remocal Testing?

Remocal testing allows each developer to deploy their own isolated environment in AWS for testing and development. Since we use serverless architecture, there are **no cost implications** when resources are not in use - you only pay for actual usage.

### Setting Up Your Remocal Environment

1. **Set your developer stage**

   Create a `.env` file in the root of the project with the following content:

   ```bash
   STAGE=yourname
   ```

2. **Build Lambda functions**

   ```bash
   npm run esbuild -w lambdas
   ```

3. **Deploy your environment**

   ```bash
   # Deploy both stateful and stateless stacks
   npx cdk deploy "<STAGE>StatefulStack" "<STAGE>StatelessStack"
   ```

4. **Get your environment details**

   ```bash
   # View stack outputs
   npx cdk list

   # Get specific stack outputs
   npx cdk list --outputs
   ```

### Remocal Environment Management

#### Deploying Changes

```bash
# Build and deploy changes
npm run esbuild -w lambdas
npx cdk deploy "<STAGE>StatefulStack" "<STAGE>StatelessStack"
```

#### Checking Differences

```bash
# See what will change before deploying
npx cdk diff "<STAGE>StatefulStack" "<STAGE>StatelessStack"
```

#### Destroying Your Environment

```bash
# Clean up your environment when done
npx cdk destroy "<STAGE>StatefulStack" "<STAGE>StatelessStack"
```

### Best Practices

1. **Use descriptive stage names**: `Iggy`, `John`
2. **Destroy environments regularly**: Clean up when not actively developing
3. **Monitor usage**: Check AWS billing dashboard occasionally
4. **Share configurations**: Document any custom configurations with the team

### Development

#### Available Scripts

```bash
# Build TypeScript
npm run build

# Watch for changes and compile
npm run watch

# Run tests
npm run test

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Pre-commit hook (runs build, test, lint, format)
npm run precommit

# Pre-push hook (runs lint)
npm run prepush
```

#### CDK Commands

```bash
# Synthesize CloudFormation template
npx cdk synth

# Deploy to AWS
npx cdk deploy

# Compare with deployed stack
npx cdk diff

# Destroy stack
npx cdk destroy
```

## 📁 Project Structure

```
backend/
├── bin/                    # CDK app entry point
│   └── index.ts           # Main CDK application
├── config/                 # Environment configurations
│   ├── dev.ts             # Development environment
│   └── remocal.ts         # Remocal testing environment
├── lib/                    # CDK infrastructure code
│   ├── backend-stack.ts   # Legacy stack (unused)
│   ├── stateful/          # Stateful resources
│   │   └── stateful-stack.ts
│   └── stateless/         # Stateless resources
│       ├── stateless-stack.ts
│       ├── constructs/     # Reusable CDK constructs
│       │   ├── apigateway.ts
│       │   └── lambdas.ts
│       └── stacks/         # Nested stacks
│           └── auth-api-stack.ts
├── lambdas/               # Lambda function workspace
│   ├── src/
│   │   ├── entities/      # Data models
│   │   │   └── user.ts
│   │   ├── functions/     # Lambda handlers
│   │   │   ├── signup.ts
│   │   │   └── preSignUpTrigger.ts
│   │   └── repositories/  # Data access layer
│   │       └── user.ts
│   ├── dist/              # Built Lambda functions
│   ├── esbuild.config.mjs # Build configuration
│   └── package.json       # Lambda dependencies
├── test/                  # Test files
├── package.json           # Root dependencies
├── cdk.json              # CDK configuration
├── tsconfig.json         # TypeScript configuration
└── README.md             # This file
```

## ⚙️ Configuration

### Environment Variables

The application uses the following environment variables:

- `AWS_REGION`: AWS region for deployment
- `TABLE_NAME`: DynamoDB table name
- `COGNITO_USER_POOL_ID`: Cognito User Pool ID
- `COGNITO_USER_POOL_CLIENT_ID`: Cognito User Pool Client ID

### AWS Resources

#### DynamoDB Table

- **Table Name**: `DataTable`
- **Partition Key**: `PK` (String)
- **Sort Key**: `SK` (String)
- **GSI1**: `GSI1PK` (String), `GSI1SK` (String)
- **GSI5**: `GSI5PK` (String), `GSI5SK` (String)
- **Billing**: Pay-per-request

#### Cognito User Pool

- **Self-signup**: Enabled
- **Sign-in aliases**: Email
- **Password policy**: 8+ chars, digits, lowercase, uppercase
- **Custom attributes**: role, firstName, lastName, email

## 🔌 API Endpoints

### Authentication

#### POST `/signup`

Creates a new user account.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePassword123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "runner"
}
```

**Response:**

```json
{
  "message": "User signed up successfully"
}
```

## 🗄️ Data Models

### User Entity

```typescript
interface User {
  id: string;
  role: 'runner' | 'organizer';
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  updatedAt: string;
  GSI1PK: string;
  GSI1SK: string;
  GSI5PK: string;
  GSI5SK: string;
}
```

### DynamoDB Schema

- **Primary Key**: `USER#{id}` / `PROFILE`
- **GSI1**: `ROLE#{role}` / `{id}` (for role-based queries)
- **GSI5**: `USER#COLLECTION` / `{timestamp}` (for listing users)

## 🧪 Testing

The project includes Jest for testing. Currently, tests are minimal and need to be expanded.

```bash
npm run test
```

## 🔍 Code Quality

### Linting

- **ESLint**: Code linting with TypeScript support
- **Prettier**: Code formatting
- **Husky**: Git hooks for pre-commit and pre-push

### Build Process

- **esbuild**: Fast bundling for Lambda functions
- **TypeScript**: Type safety and compilation
- **CDK**: Infrastructure as Code

## 🚀 Deployment

### Remocal Development Deployment

For individual developer environments:

```bash
# Set your developer stage in .env

# Build Lambda functions
npm run esbuild -w lambdas

# Deploy your isolated environment
npx cdk deploy "<STAGE>StatefulStack" "<STAGE>StatelessStack"
```

### Shared Development Deployment

For the shared development environment:

```bash
# Build Lambda functions
npm run esbuild -w lambdas

# Deploy to shared dev environment
npx cdk deploy DevStatefulStack DevStatelessStack
```

### Production Deployment

1. Update the stage parameter in `bin/index.ts`
2. Configure AWS credentials
3. Run deployment commands

### Environment-Specific Commands

```bash
# Deploy only stateful resources (DynamoDB, Cognito)
npx cdk deploy "*StatefulStack"

# Deploy only stateless resources (Lambda, API Gateway)
npx cdk deploy "*StatelessStack"

# Deploy specific stacks by name
npx cdk deploy JohnStatefulStack JohnStatelessStack

# View all available stacks
npx cdk list
```

## 🔒 Security

- **Cognito**: Secure user authentication
- **IAM**: Least privilege access policies
- **DynamoDB**: Encrypted at rest
- **API Gateway**: HTTPS endpoints

## 📝 Development Guidelines

### Adding New Lambda Functions

1. Create function in `lambdas/src/functions/`
2. Add to `lambdas/esbuild.config.mjs`
3. Create CDK construct in `lib/stateless/constructs/lambdas.ts`
4. Add API Gateway integration if needed

### Adding New API Endpoints

1. Create Lambda function
2. Add to `Lambdas` construct
3. Create integration in `ApiGateway` construct
4. Add route in appropriate nested stack

### Database Operations

- Use `UserRepository` for data access
- Follow DynamoDB best practices
- Use GSI for efficient queries

## 🤝 Contributing

1. Follow the existing code structure
2. Run linting and tests before committing
3. Use conventional commit messages
4. Update documentation as needed

## 📄 License

[Add your license information here]

## 🆘 Support

For questions or issues, please [create an issue](link-to-issues) or contact the development team.
