#!/bin/bash
# backend/deploy.sh

# Exit on error
set -e

# Default environment
ENVIRONMENT="dev"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --env)
      ENVIRONMENT="$2"
      shift 2
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

# Stack name based on environment
STACK_NAME="cloud-assessment-$ENVIRONMENT"

# Build the SAM application
echo "Building SAM application..."
sam build

# Deploy the SAM application
echo "Deploying to $ENVIRONMENT environment..."
sam deploy \
  --stack-name $STACK_NAME \
  --parameter-overrides Environment=$ENVIRONMENT \
  --capabilities CAPABILITY_IAM CAPABILITY_AUTO_EXPAND CAPABILITY_NAMED_IAM \
  --no-confirm-changeset

echo "Backend deployment complete!"

# Get output values for frontend configuration
API_URL=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --query "Stacks[0].Outputs[?OutputKey=='ApiUrl'].OutputValue" --output text)
echo "API URL: $API_URL"

echo "Use this API URL in your frontend .env file as REACT_APP_API_URL=$API_URL"