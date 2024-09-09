import { SSTConfig } from "sst";
import { Api } from "sst/constructs";

export default {
  config(_input) {
    return {
      name: "my-ts-app",
      region: "ap-southeast-1", // Specify the AWS region
      profile: "altev-local", // Specify your AWS profile
    };
  },
  stacks(app) {
    app.stack(function MyStack({ stack }) {
      // Define the API with the routes
      const api = new Api(stack, "MyApi", {
        routes: {
          "POST /webhook": {
            function: {
              handler: "src/handlers/index.webhook", // Use the export from index.ts
            },
          },
          "GET /wallet/{userId}": {
            function: {
              handler: "src/handlers/index.getWallet", // Use the export from index.ts
            },
          },
          "GET /wallet/{userId}/transactions": {
            function: {
              handler: "src/handlers/index.getTransactions", // Use the export from index.ts
            },
          },
          "GET /test-connection": {
            function: {
              handler: "src/handlers/index.testConnection", // Add the test connection handler
            },
          },
        },
      });

      // Output the API endpoint URL after deployment
      stack.addOutputs({
        ApiEndpoint: api.url,
      });
    });
  },
} satisfies SSTConfig;
