# My-TS-App

This project is an AWS Lambda-based Node.js application that handles webhook events, processes transactions, and manages digital wallets. It uses TypeScript for type safety, SST (Serverless Stack) for serverless deployment, and Docker for local development.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Setup](#setup)
  - [1. Clone the Repository](#1-clone-the-repository)
  - [2. Environment Variables](#2-environment-variables)
  - [3. AWS Credentials Setup](#3-aws-credentials-setup)
  - [4. Docker Compose Setup](#4-docker-compose-setup)
- [Running the Application](#running-the-application)
- [Running Tests](#running-tests)
- [SST Setup](#sst-setup)
- [Deployment](#deployment)

## Prerequisites

- Docker and Docker Compose
- Node.js (v14.x or above) and npm
- AWS CLI configured with your credentials
- SST (Serverless Stack) CLI

## Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-repo/my-ts-app.git
cd my-ts-app
```

### 2. Environment Variables

Create a `.env` file in the root directory and add your environment variables:

```bash
DATABASE_HOST=localhost
DATABASE_USER=root
DATABASE_PASSWORD=your_password
DATABASE_NAME=mydb
AWS_REGION=us-east-1
HMAC_SECRET=your_hmac_secret
```

### 3. AWS Credentials Setup

Ensure your AWS credentials are set up properly. You can configure your credentials using AWS CLI:

```bash
aws configure
```

Provide your access key, secret key, and default region when prompted.

### 4. Docker Compose Setup

To build and run the application using Docker Compose, use the following commands:

```bash
docker-compose up --build
```

This will start the services defined in the `docker-compose.yml` file, including the Node.js application and any other dependencies like databases.

## Running the Application

To start the application locally:

1. **Install Dependencies:**

   ```bash
   npm install
   ```

2. **Start the Application:**

   ```bash
   npm start
   ```

This will run the application using Node.js.

## Running Tests

To run tests with Jest, execute the following command:

```bash
npm test
```

For more detailed test output:

```bash
jest --verbose --coverage --detectOpenHandles
```

## SST Setup

SST (Serverless Stack) is used for deploying and managing serverless applications. To set up SST:

1. **Install SST CLI:**

   ```bash
   npm install -g sst
   ```

2. **Initialize SST Project:**

   If you haven't set up SST, you can initialize it using:

   ```bash
   sst init --typescript
   ```

3. **Start SST Console:**

   Run the following command to start the SST console:

   ```bash
   sst start
   ```

4. **Deploy to AWS:**

   Deploy your stack to AWS using:

   ```bash
   sst deploy
   ```

## Deployment

To deploy the application to AWS:

1. Make sure AWS credentials are set up properly.
2. Deploy the SST stack:

   ```bash
   sst deploy
   ```

This will deploy the Lambda functions and other resources defined in your SST stack to AWS.

## Conclusion

This project uses Docker for containerized development, Jest for testing, and SST for serverless deployments. Follow the steps above to set up your environment and start contributing!
