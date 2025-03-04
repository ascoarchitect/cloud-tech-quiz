// backend/functions/createAdmin/index.js
const AWS = require('aws-sdk');
const cognito = new AWS.CognitoIdentityServiceProvider();
const crypto = require('crypto');

// Initial admin user details - CHANGE THESE FOR PRODUCTION
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_NAME = 'CloudQuizAdmin';
const TEMP_PASSWORD = generateSecurePassword(); // Will be printed in logs; user will need to change on first login

/**
 * Generate a secure random password
 */
function generateSecurePassword(length = 12) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
  let password = '';
  const randomBytes = crypto.randomBytes(length);
  
  for (let i = 0; i < length; i++) {
    password += chars[randomBytes[i] % chars.length];
  }
  
  // Ensure password meets Cognito requirements
  password += 'Az1!'; // Guarantee at least one uppercase, lowercase, number, and special char
  
  return password;
}

/**
 * Create admin user in Cognito and add to Admin group
 */
exports.handler = async (event, context) => {
  const userPoolId = process.env.USER_POOL_ID;
  
  if (!userPoolId) {
    console.error('USER_POOL_ID environment variable is not set');
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal server error' }) };
  }
  
  try {
    // Check if user already exists
    try {
      await cognito.adminGetUser({
        UserPoolId: userPoolId,
        Username: ADMIN_EMAIL
      }).promise();
      
      console.log(`Admin user ${ADMIN_EMAIL} already exists`);
      return { statusCode: 200, body: JSON.stringify({ message: 'Admin user already exists' }) };
    } catch (error) {
      if (error.code !== 'UserNotFoundException') {
        throw error;
      }
    }
    
    // Create the admin user
    await cognito.adminCreateUser({
      UserPoolId: userPoolId,
      Username: ADMIN_EMAIL,
      TemporaryPassword: TEMP_PASSWORD,
      UserAttributes: [
        { Name: 'email', Value: ADMIN_EMAIL },
        { Name: 'email_verified', Value: 'true' },
        { Name: 'name', Value: ADMIN_NAME }
      ],
      MessageAction: 'SUPPRESS' // Don't send welcome email
    }).promise();
    
    console.log(`Created admin user: ${ADMIN_EMAIL}`);
    console.log(`Temporary password: ${TEMP_PASSWORD}`);
    
    // Add user to Admin group
    await cognito.adminAddUserToGroup({
      UserPoolId: userPoolId,
      Username: ADMIN_EMAIL,
      GroupName: 'Admin'
    }).promise();
    
    console.log(`Added ${ADMIN_EMAIL} to Admin group`);
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Admin user created successfully',
        username: ADMIN_EMAIL,
        password: TEMP_PASSWORD
      })
    };
  } catch (error) {
    console.error('Error creating admin user:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to create admin user' })
    };
  }
};