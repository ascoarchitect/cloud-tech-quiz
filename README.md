# AWS Cloud Skills Assessment Platform

A comprehensive assessment platform designed for evaluating AWS cloud knowledge and preparing for certification exams.

## 📋 Overview

This application provides a platform for creating, managing, and taking AWS certification practice tests. It allows administrators to create customized tests with various question types, while users can test their knowledge in a simulated exam environment.

## ✨ Features

### For Users
- Take practice tests with timed assessments
- Receive immediate feedback and detailed explanations
- Review performance analytics and weak areas
- Track progress over time with multiple attempts

### For Administrators
- Create and manage question banks
- Design custom tests with specific categories and difficulty levels
- Import questions in bulk via JSON
- View detailed analytics on test performance
- Monitor user progress and identify common knowledge gaps

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

The application follows a serverless architecture pattern:

1. **Frontend**: Single-page React application hosted on S3 and distributed via CloudFront
2. **Backend**: Serverless REST API built with API Gateway and Lambda functions
3. **Database**: DynamoDB tables for questions, tests, and user responses
4. **Authentication**: Amazon Cognito for secure user management
5. **Deployment**: AWS SAM for infrastructure as code

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
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

2. Deploy using SAM
   ```bash
   sam build
   sam deploy --guided
   ```

3. Follow the prompts to configure the deployment

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