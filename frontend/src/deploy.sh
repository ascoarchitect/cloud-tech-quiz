#!/bin/bash
# frontend/deploy.sh

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

# Get the S3 bucket name from CloudFormation outputs
STACK_NAME="cloud-assessment-$ENVIRONMENT"
BUCKET=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --query "Stacks[0].Outputs[?OutputKey=='WebsiteBucket'].OutputValue" --output text)
CLOUDFRONT_DISTRIBUTION=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --query "Stacks[0].Outputs[?OutputKey=='CloudFrontURL'].OutputValue" --output text)
API_URL=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --query "Stacks[0].Outputs[?OutputKey=='ApiUrl'].OutputValue" --output text)

if [ -z "$BUCKET" ]; then
  echo "Error: Could not determine S3 bucket name from CloudFormation outputs"
  exit 1
fi

# Inject environment variables
echo "VITE_API_URL=$API_URL" > .env.$ENVIRONMENT
echo "VITE_ENVIRONMENT=$ENVIRONMENT" >> .env.$ENVIRONMENT

# Fetch Cognito configuration from outputs
USER_POOL_ID=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --query "Stacks[0].Outputs[?OutputKey=='UserPoolId'].OutputValue" --output text)
USER_POOL_CLIENT_ID=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --query "Stacks[0].Outputs[?OutputKey=='UserPoolClientId'].OutputValue" --output text)
echo "VITE_USER_POOL_ID=$USER_POOL_ID" >> .env.$ENVIRONMENT
echo "VITE_USER_POOL_CLIENT_ID=$USER_POOL_CLIENT_ID" >> .env.$ENVIRONMENT

# Build the React app
echo "Building React app for $ENVIRONMENT environment..."
npm run build

# Sync to S3
echo "Deploying to S3 bucket: $BUCKET"
aws s3 sync dist/ s3://$BUCKET --delete

# Invalidate CloudFront cache if CloudFront is used
if [ -n "$CLOUDFRONT_DISTRIBUTION" ]; then
  DISTRIBUTION_ID=$(echo $CLOUDFRONT_DISTRIBUTION | sed -e 's|https://||' -e 's|\..*||')
  echo "Invalidating CloudFront distribution: $DISTRIBUTION_ID"
  aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths "/*"
fi

echo "Frontend deployment complete!"
echo "Website URL: $CLOUDFRONT_DISTRIBUTION"