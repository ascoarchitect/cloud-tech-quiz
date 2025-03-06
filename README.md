# Cloud Skills Assessment Platform

A comprehensive assessment platform designed for evaluating cloud skills knowledge and preparing for certification exams.

## 📋 Overview

This application provides a platform for creating, managing, and taking skills practice tests to allow organisations to get a reflection of areas of strength and improvement across your engineers. It allows administrators to create customised tests with various question types, while users can test their knowledge in a simulated exam environment.

Whilst there are many exam simulation tools (paid and free) available, this provides the ability to host your own serverless solution with centralised reporting across a number of skills tracks. The tool can also be used for non-technical assessments based on your own organisational requirements with the ability to create bespoke categories and questions.

## ✨ Key Features

### Assessment Engine
- **Multiple Question Types**: Support for single-choice questions with explanations
- **Categorization**: Questions organized by service and certification path
- **Difficulty Levels**: Support for different certification levels (CP, SAA, DVA, SOA, Terraform, FinOps)
- **Custom Test Creation**: Create targeted assessments for specific skill areas
- **Randomization**: Option to randomize question and answer order
- **Time Limitations**: Configurable time limits to simulate exam conditions

### Anti-Cheating System
- **Tab/Window Monitoring**: Detects when users navigate away from the test
- **Copy/Paste Prevention**: Blocks attempts to copy question content
- **Time Analysis**: Identifies suspicious answering patterns
- **Alert System**: Warns users about potential violations
- **Progressive Enforcement**: Escalating responses from warnings to test termination

### Analytics Dashboard
- **Performance Metrics**: Score distribution and comparison
- **Category Analysis**: Strength/weakness identification by topic
- **Time Analysis**: Time spent per question and section
- **Progress Tracking**: Improvement monitoring over multiple attempts
- **Test Statistics**: Overview of completion rates and average scores

## 🛠️ Technology Stack

### Frontend
- **React**: UI library
- **TypeScript**: Type-safe JavaScript
- **Material UI**: Component library for consistent design
- **React Router**: Navigation and routing
- **Chart.js**: Data visualization
- **Amazon Cognito**: Authentication

### Backend
- **AWS Serverless Architecture**:
  - **Lambda**: Serverless computing
  - **API Gateway**: RESTful API endpoints
  - **DynamoDB**: NoSQL database
  - **S3**: Static website hosting
  - **CloudFront**: Content delivery network
  - **Cognito**: User authentication and authorization
  - **SAM (Serverless Application Model)**: Infrastructure as code

## 🏗️ Architecture

The application follows a modern serverless architecture pattern built entirely on AWS services:

### Frontend Architecture
- **Single-Page Application**: React-based SPA hosted on S3 and distributed via CloudFront
- **Authentication Flow**: Integrates with Amazon Cognito using JWT tokens for secure authentication
- **State Management**: React context API for global state (AuthContext)
- **Routing**: React Router with protected routes based on authentication status and user roles
- **UI Framework**: Material UI components with responsive design

### Backend Architecture
- **API Layer**: REST API built with Amazon API Gateway with Cognito authorizers
- **Business Logic**: Lambda functions handling CRUD operations for questions, tests, and responses
- **Database Layer**:
  - DynamoDB tables with GSIs for efficient querying
  - `QuestionTable`: Stores questions with category/difficulty indexes
  - `TestTable`: Manages test configurations and settings
  - `ResponseTable`: Tracks user test attempts and results
- **Authentication & Authorization**:
  - Cognito User Pools for identity management
  - User groups (Admin, User) for role-based permissions
  - JWT token validation for API access

### Security Features
- **Anti-Cheating System**: Detects tab switching, copy/paste operations, and suspicious behavior
- **API Authorization**: API Gateway with Cognito authorizers to validate JWT tokens
- **CORS Configuration**: Strict origin policies to prevent unauthorized access
- **Content Delivery**: CloudFront with origin access identities for secure S3 access

### Deployment Architecture
- **Infrastructure as Code**: AWS SAM templates for consistent deployments
- **Resource Naming**: Environment-based naming conventions for multi-environment support
- **CORS Configuration**: Properly configured for secure cross-origin requests
- **CloudFront Distribution**: Efficient global content delivery with proper cache settings

## 🔄 Data Flow

### Test Creation Flow
1. Administrator creates questions in the question bank through the admin interface
2. Questions are categorized and tagged for organization
3. Administrator creates a test by specifying parameters (difficulty, categories, time limit)
4. Test configuration is stored in DynamoDB with reference to selected questions

### Test-Taking Flow
1. User logs in via Cognito authentication
2. User enters a test ID to access a specific assessment
3. System validates test availability and eligibility
4. Anti-cheating module initializes to monitor user behavior
5. Questions are presented according to test configuration (random or sequential)
6. User responses are periodically saved to prevent data loss
7. System tracks time spent on each question and overall test
8. User submits test or time expires
9. System calculates score and generates detailed results
10. Results are stored for historical analysis and improvement tracking

## Database Structure

## 📊 Database Structure

### Question Table
- **Primary Key**: `id` (UUID)
- **GSIs**:
  - `byCategory`: For querying questions by category
  - `byDifficulty`: For querying questions by difficulty level
- **Attributes**:
  - `text`: The question text
  - `options`: Answer options (array of objects with id and text)
  - `correctAnswer`: ID of the correct option
  - `explanation`: Explanation for the correct answer
  - `category`: Question category (e.g., Compute, Storage)
  - `difficulty`: Question difficulty (e.g., CP, SAA)
  - `tags`: Array of tags for additional categorization

### Test Table
- **Primary Key**: `id` (UUID)
- **GSIs**:
  - `byActive`: For querying active/inactive tests
- **Attributes**:
  - `name`: Test name
  - `description`: Test description
  - `timeLimit`: Time limit in minutes
  - `numQuestions`: Number of questions
  - `difficulty`: Array of difficulty levels
  - `categories`: Array of categories
  - `active`: Whether the test is active
  - `closureDate`: Optional date when the test becomes unavailable
  - `questions`: Array of question IDs
  - `settings`: Test settings (randomization, retakes, etc.)

### Response Table
- **Primary Key**: `id` (UUID)
- **GSIs**:
  - `byTest`: For querying responses by test ID
  - `byUser`: For querying responses by user ID
- **Attributes**:
  - `testId`: Associated test ID
  - `userId`: User who took the test
  - `userName`: User's display name
  - `startTime`: When the test started
  - `endTime`: When the test ended
  - `answers`: Array of user answers with correctness
  - `score`: Calculated score percentage
  - `completed`: Whether the test was completed
  - `cheatingAttempts`: Number of detected cheating attempts
  - `cheatingDetails`: Details about cheating incidents

## 🚀 Getting Started

### Prerequisites

- Node.js (v20 or higher)
- npm or yarn
- AWS CLI configured with appropriate credentials
- AWS SAM CLI

### Local Development Setup

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/aws-cloud-skills-assessment.git
   cd aws-cloud-skills-assessment
   ```

2. Install frontend dependencies
   ```bash
   cd frontend
   npm install
   ```

3. Create .env file with required environment variables
   ```bash
   cp .env.example .env
   ```

4. Update the .env file with your configuration
   ```
   VITE_USER_POOL_ID=your-cognito-user-pool-id
   VITE_USER_POOL_CLIENT_ID=your-cognito-client-id
   VITE_USER_POOL_CLIENT_SECRET=your-client-secret-if-applicable
   VITE_COGNITO_DOMAIN=your-cognito-domain
   VITE_AWS_REGION=your-aws-region
   VITE_API_URL=your-api-gateway-url
   ```

5. Start the development server
   ```bash
   npm run dev
   ```

### Backend Deployment

1. Navigate to the backend directory
   ```bash
   cd ../backend
   ```

2. Update the SAM template parameters in template.yaml if needed
   ```yaml
   Parameters:
  Environment:
    Type: String
    Default: dev
  Author:
    Type: String
    Default: yourusername
   ```

2. Deploy using SAM
   ```bash
   sam build
   sam deploy --guided
   ```

3. During guided deployment, you'll need to:

Specify a unique S3 bucket name for deployment artifacts
Confirm IAM role creation permissions
Set the appropriate environment parameter
Configure CloudFormation stack name

4. Upon successful deployment, note the outputs:

ApiUrl: The API Gateway endpoint URL
UserPoolId and UserPoolClientId: Required for frontend configuration
CloudFrontURL: The distribution URL for your frontend

### Frontend Deployment

1. Build the frontend
   ```bash
   cd ../frontend
   npm run build
   ```

2. Deploy to S3
   ```bash
   aws s3 sync dist/ s3://your-bucket-name/ --delete
   ```

3. Create CloudFront invalidation (if using CloudFront)
   ```bash
   aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
   ```

## ⚙️ Environment Variables

| Variable | Description |
|----------|-------------|
| VITE_USER_POOL_ID | Cognito User Pool ID |
| VITE_USER_POOL_CLIENT_ID | Cognito App Client ID |
| VITE_USER_POOL_CLIENT_SECRET | Cognito App Client Secret (if applicable) |
| VITE_COGNITO_DOMAIN | Cognito Domain Name |
| VITE_AWS_REGION | AWS Region |
| VITE_API_URL | API Gateway URL |

## 📖 Usage Guide

### Administrator Guide

1. **Login**: Access the admin dashboard using admin credentials
2. **Question Management**: Create, edit, and import questions
3. **Test Creation**: Design tests with specific parameters:
   - Difficulty levels
   - Categories
   - Time limits
   - Randomization options
4. **Analytics**: View test statistics and participant results

### User Guide

1. **Login/Register**: Create an account or sign in
2. **Take Test**: Enter the test ID provided by your administrator
3. **Complete Test**: Answer questions within the time limit
4. **Review Results**: Analyze performance and review explanations
5. **Track Progress**: Monitor improvement over multiple attempts

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👏 Acknowledgements

- AWS Documentation and Sample Code
- React and Material UI Teams
- All contributors who have helped improve this project