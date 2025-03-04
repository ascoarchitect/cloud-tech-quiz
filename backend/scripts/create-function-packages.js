// backend/scripts/create-function-packages.js
const fs = require("fs");
const path = require("path");

// Base directory for functions
const BASE_DIR = path.resolve(__dirname, "../functions");

// Functions that need UUID
const UUID_FUNCTIONS = [
  "createQuestion",
  "createTest",
  "createResponse",
  "importQuestions",
];

// Basic package.json templates
const BASIC_PACKAGE = {
  name: "", // Will be filled in
  version: "1.0.0",
  private: true,
  main: "index.js",
  dependencies: {
    "@aws-sdk/client-dynamodb": "^3.511.0",
    "@aws-sdk/lib-dynamodb": "^3.511.0",
  },
};

const UUID_PACKAGE = {
  name: "", // Will be filled in
  version: "1.0.0",
  private: true,
  main: "index.js",
  dependencies: {
    "@aws-sdk/client-dynamodb": "^3.511.0",
    "@aws-sdk/lib-dynamodb": "^3.511.0",
    uuid: "^9.0.1",
  },
};

const CREATE_ADMIN_PACKAGE = {
  name: "createAdmin",
  version: "1.0.0",
  private: true,
  main: "index.js",
  dependencies: {
    "@aws-sdk/client-cognito-identity-provider": "^3.511.0",
  },
};

// Get all function directories
const functionDirs = fs
  .readdirSync(BASE_DIR)
  .filter((file) => fs.statSync(path.join(BASE_DIR, file)).isDirectory());

// Create package.json for each function
functionDirs.forEach((functionName) => {
  const functionDir = path.join(BASE_DIR, functionName);
  let packageJson;

  if (functionName === "createAdmin") {
    packageJson = CREATE_ADMIN_PACKAGE;
  } else if (UUID_FUNCTIONS.includes(functionName)) {
    packageJson = { ...UUID_PACKAGE, name: functionName };
  } else {
    packageJson = { ...BASIC_PACKAGE, name: functionName };
  }

  // Write the package.json file
  fs.writeFileSync(
    path.join(functionDir, "package.json"),
    JSON.stringify(packageJson, null, 2),
  );

  console.log(`Created package.json for ${functionName}`);
});

console.log("All package.json files created successfully!");
