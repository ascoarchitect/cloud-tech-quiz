// frontend/src/services/auth.ts
import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserPool,
  CognitoUserSession,
  CognitoUserAttribute,
} from "amazon-cognito-identity-js";

// Configure with your Cognito User Pool details
const userPoolConfig = {
  UserPoolId: import.meta.env.VITE_USER_POOL_ID || "",
  ClientId: import.meta.env.VITE_USER_POOL_CLIENT_ID || "",
  // The OAuth configuration for handling authorization code flow
  oauth: {
    domain: import.meta.env.VITE_COGNITO_DOMAIN || "",
    scope: ["email", "openid", "profile"],
    redirectSignIn: window.location.origin,
    redirectSignOut: window.location.origin,
    responseType: "code", // Use authorization code grant
  },
};

const userPool = new CognitoUserPool(userPoolConfig);

/**
 * Get the current authenticated user
 */
export function getCurrentUser(): CognitoUser | null {
  return userPool.getCurrentUser();
}

/**
 * Get current user's session
 */
export function getCurrentSession(): Promise<CognitoUserSession | null> {
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
      resolve(session);
    });
  });
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
export function signIn(
  username: string,
  password: string,
): Promise<CognitoUserSession> {
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
  name: string,
): Promise<any> {
  return new Promise((resolve, reject) => {
    const attributeList = [
      new CognitoUserAttribute({ Name: "email", Value: email }),
      new CognitoUserAttribute({ Name: "name", Value: name }),
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

      if (payload["cognito:groups"]) {
        const groups = payload["cognito:groups"];
        resolve(
          Array.isArray(groups)
            ? groups.includes(groupName)
            : groups === groupName,
        );
      } else {
        resolve(false);
      }
    });
  });
}

/**
 * Redirect to Cognito hosted login page
 */
export function redirectToLogin(): void {
  const cognitoDomain = import.meta.env.VITE_COGNITO_DOMAIN;
  const clientId = import.meta.env.VITE_USER_POOL_CLIENT_ID;
  const region = import.meta.env.VITE_AWS_REGION || "us-east-1";
  const redirectUri = encodeURIComponent(window.location.origin);

  if (cognitoDomain && clientId) {
    window.location.href = `https://${cognitoDomain}.auth.${region}.amazoncognito.com/login?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}`;
  } else {
    console.error("Cognito configuration missing");
    alert(
      "Login configuration is incomplete. Please contact the administrator.",
    );
  }
}

/**
 * Parse and validate JWT token
 */
export function parseJwt(token: string): any {
  try {
    // Split the token and get the payload part
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Error parsing JWT", e);
    return null;
  }
}

/**
 * Debug the current authentication state
 */
export function debugAuthState(): void {
  const user = getCurrentUser();
  console.log("Current user from Cognito:", user);

  if (user) {
    user.getSession((err: Error | null, session: CognitoUserSession | null) => {
      if (err) {
        console.error("Error getting session:", err);
        return;
      }

      console.log("Session valid:", session?.isValid());
      console.log("ID Token payload:", session?.getIdToken().decodePayload());
    });
  }

  // Check local storage
  console.log("Local storage tokens:", {
    accessToken: !!localStorage.getItem("accessToken"),
    idToken: !!localStorage.getItem("idToken"),
    refreshToken: !!localStorage.getItem("refreshToken"),
  });
}

/**
 * Force refresh the current session
 */
export function refreshSession(): Promise<boolean> {
  return new Promise((resolve) => {
    const user = getCurrentUser();

    if (!user) {
      console.log("No user found to refresh session");
      resolve(false);
      return;
    }

    user.getSession((err: Error | null, session: CognitoUserSession | null) => {
      if (err) {
        console.error("Error refreshing session:", err);
        resolve(false);
        return;
      }

      if (session && session.isValid()) {
        console.log("Session refreshed successfully");

        // Store the tokens in localStorage as backup
        const idToken = session.getIdToken().getJwtToken();
        const accessToken = session.getAccessToken().getJwtToken();
        const refreshToken = session.getRefreshToken().getToken();

        localStorage.setItem("idToken", idToken);
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);

        resolve(true);
      } else {
        console.log("Refreshed session is not valid");
        resolve(false);
      }
    });
  });
}

/**
 * Parse URL parameters after redirect from Cognito hosted UI
 * This is crucial for handling the authorization code from the redirect
 */
export function handleAuthRedirect(): Promise<boolean> {
  return new Promise((resolve) => {
    const urlParams = new URLSearchParams(window.location.search);
    const authCode = urlParams.get("code");

    if (!authCode) {
      console.log("No authorization code found in URL");
      resolve(false);
      return;
    }

    console.log("Authorization code found, handling redirect...");

    // Remove the code from the URL to avoid issues on refresh
    const newUrl = window.location.origin + window.location.pathname;
    window.history.replaceState({}, document.title, newUrl);

    // Force a session refresh to ensure the SDK picks up the authentication
    setTimeout(() => {
      refreshSession()
        .then((success) => {
          console.log("Session refresh after redirect:", success);
          resolve(success);
        })
        .catch((err) => {
          console.error("Error during session refresh:", err);
          resolve(false);
        });
    }, 500); // Small delay to ensure browser has time to process any cookies
  });
}

export async function processAuthCode(code: string): Promise<boolean> {
  try {
    // Build the token endpoint URL
    const cognitoDomain = import.meta.env.VITE_COGNITO_DOMAIN;
    const region = import.meta.env.VITE_AWS_REGION || "us-east-1";
    const tokenEndpoint = `https://${cognitoDomain}.auth.${region}.amazoncognito.com/oauth2/token`;

    console.log("Token endpoint:", tokenEndpoint);

    // Prepare the form data
    const params = new URLSearchParams();
    params.append("grant_type", "authorization_code");
    params.append("client_id", import.meta.env.VITE_USER_POOL_CLIENT_ID);
    params.append("code", code);
    params.append("redirect_uri", window.location.origin);

    console.log("Exchanging code for tokens...");

    // Make the request
    const response = await fetch(tokenEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Token exchange failed:", response.status, errorData);
      return false;
    }

    const tokens = await response.json();
    console.log("Token exchange successful");

    // Store tokens in localStorage
    localStorage.setItem("idToken", tokens.id_token);
    localStorage.setItem("accessToken", tokens.access_token);
    localStorage.setItem("refreshToken", tokens.refresh_token);

    // Parse and store user info
    const userInfo = parseJwt(tokens.id_token);
    if (userInfo) {
      console.log("User info from token:", userInfo);
    }

    return true;
  } catch (error) {
    console.error("Error processing auth code:", error);
    return false;
  }
}
