#!/bin/bash
# This script creates package.json files for all functions

# Set up base directory
BASE_DIR="backend/functions"

# Create basic package.json with UUID dependency
uuid_package='
{
  "name": "function-name",
  "version": "1.0.0",
  "private": true,
  "main": "index.js",
  "dependencies": {
    "aws-sdk": "^2.1135.0",
    "uuid": "^8.3.2"
  }
}
'

# Create basic package.json without UUID dependency
basic_package='
{
  "name": "function-name",
  "version": "1.0.0",
  "private": true,
  "main": "index.js",
  "dependencies": {
    "aws-sdk": "^2.1135.0"
  }
}
'

# Functions that need UUID
uuid_functions=(
  "createQuestion"
  "createTest"
  "createResponse"
  "importQuestions"
)

# Create package.json for each function
for dir in $BASE_DIR/*/; do
  # Extract function name from directory path
  function_name=$(basename "$dir")
  
  # Check if this function needs UUID
  needs_uuid=false
  for uuid_func in "${uuid_functions[@]}"; do
    if [ "$function_name" = "$uuid_func" ]; then
      needs_uuid=true
      break
    fi
  done
  
  # Create appropriate package.json
  if [ "$needs_uuid" = true ]; then
    echo "${uuid_package/function-name/$function_name}" > "$dir/package.json"
    echo "Created package.json with UUID for $function_name"
  else
    echo "${basic_package/function-name/$function_name}" > "$dir/package.json"
    echo "Created basic package.json for $function_name"
  fi
done

# Special case for createAdmin
echo '{
  "name": "createAdmin",
  "version": "1.0.0",
  "private": true,
  "main": "index.js",
  "dependencies": {
    "aws-sdk": "^2.1135.0",
    "crypto": "^1.0.1"
  }
}' > "$BASE_DIR/createAdmin/package.json"
echo "Created package.json with crypto for createAdmin"

echo "All package.json files created successfully!"