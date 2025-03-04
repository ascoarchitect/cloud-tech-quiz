// frontend/src/services/auth.ts
import { 
    AuthenticationDetails,
    CognitoUser,
    CognitoUserPool,
    CognitoUserSession,
    CognitoUserAttribute,
    CognitoIdToken,
  } from 'amazon-cognito-identity-js';
  
  // Configure with your Cognito User Pool details
  const userPoolConfig = {
    UserPoolId: import.meta.env.VITE_USER_POOL_ID || '',
    ClientId: import.meta.env.VITE_USER_POOL_CLIENT_ID || '',
  };
  
  const userPool = new CognitoUserPool(userPoolConfig);
  
  /**
   * Get the current authenticated user
   */
  export function getCurrentUser(): CognitoUser | null {
    return userPool.getCurrentUser();
  }
  
  /**
   * Get current user's ID token
   */
  export function getIdToken(): Promise<string | null> {
    return new Promise((resolve, reject) => {
      const user = getCurrentUser();
      
      if (!user) {
        resolve(null);
        return;
      }
      
      user.getSession((err: Error | null, session: CognitoUserSession | null) => {
        if (err) {
          reject(err);
          return;
        }
        
        if (session && session.isValid()) {
          const idToken = session.getIdToken().getJwtToken();
          resolve(idToken);
        } else {
          resolve(null);
        }
      });
    });
  }
  
  /**
   * Sign in with username and password
   */
  export function signIn(username: string, password: string): Promise<CognitoUserSession> {
    return new Promise((resolve, reject) => {
      const authDetails = new AuthenticationDetails({
        Username: username,
        Password: password,
      });
      
      const cognitoUser = new CognitoUser({
        Username: username,
        Pool: userPool,
      });
      
      cognitoUser.authenticateUser(authDetails, {
        onSuccess: (session) => {
          resolve(session);
        },
        onFailure: (err) => {
          reject(err);
        },
      });
    });
  }
  
  /**
   * Sign out the current user
   */
  export function signOut(): void {
    const user = getCurrentUser();
    if (user) {
      user.signOut();
    }
  }
  
  /**
   * Register a new user
   */
  export function signUp(
    username: string,
    password: string,
    email: string,
    name: string
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const attributeList = [
        new CognitoUserAttribute({ Name: 'email', Value: email }),
        new CognitoUserAttribute({ Name: 'name', Value: name }),
      ];
      
      userPool.signUp(username, password, attributeList, [], (err, result) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(result);
      });
    });
  }
  
  /**
   * Confirm registration with verification code
   */
  export function confirmSignUp(username: string, code: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const cognitoUser = new CognitoUser({
        Username: username,
        Pool: userPool,
      });
      
      cognitoUser.confirmRegistration(code, true, (err, result) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(result);
      });
    });
  }
  
  /**
   * Check if user is in a specific group
   */
  export async function isUserInGroup(groupName: string): Promise<boolean> {
    return new Promise((resolve) => {
      const user = getCurrentUser();
      
      if (!user) {
        resolve(false);
        return;
      }
      
      user.getSession((err: Error | null, session: CognitoUserSession | null) => {
        if (err || !session) {
          resolve(false);
          return;
        }
        
        const idToken = session.getIdToken();
        const payload = idToken.decodePayload();
        
        if (payload['cognito:groups']) {
          const groups = payload['cognito:groups'];
          resolve(Array.isArray(groups) ? groups.includes(groupName) : groups === groupName);
        } else {
          resolve(false);
        }
      });
    });
  }