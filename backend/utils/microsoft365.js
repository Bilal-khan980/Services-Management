const axios = require('axios');

/**
 * Microsoft 365 integration utility
 * This utility provides functions for integrating with Microsoft 365 services
 * including Azure AD for user management and authentication
 */

// Azure AD endpoints
const AZURE_AD_ENDPOINT = 'https://graph.microsoft.com/v1.0';
const AZURE_LOGIN_ENDPOINT = 'https://login.microsoftonline.com';

/**
 * Get an access token for Microsoft Graph API
 * @returns {Promise<string>} Access token
 */
const getAccessToken = async () => {
  try {
    const tenantId = process.env.AZURE_TENANT_ID;
    const clientId = process.env.AZURE_CLIENT_ID;
    const clientSecret = process.env.AZURE_CLIENT_SECRET;
    
    const url = `${AZURE_LOGIN_ENDPOINT}/${tenantId}/oauth2/v2.0/token`;
    
    const params = new URLSearchParams();
    params.append('client_id', clientId);
    params.append('scope', 'https://graph.microsoft.com/.default');
    params.append('client_secret', clientSecret);
    params.append('grant_type', 'client_credentials');
    
    const response = await axios.post(url, params);
    
    return response.data.access_token;
  } catch (error) {
    console.error('Error getting Microsoft access token:', error);
    throw error;
  }
};

/**
 * Get user information from Azure AD
 * @param {string} email User email
 * @returns {Promise<Object>} User information
 */
const getUserInfo = async (email) => {
  try {
    const token = await getAccessToken();
    
    const response = await axios.get(
      `${AZURE_AD_ENDPOINT}/users/${email}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error getting user info from Microsoft 365:', error);
    throw error;
  }
};

/**
 * Get all users from Azure AD
 * @returns {Promise<Array>} List of users
 */
const getAllUsers = async () => {
  try {
    const token = await getAccessToken();
    
    const response = await axios.get(
      `${AZURE_AD_ENDPOINT}/users`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    
    return response.data.value;
  } catch (error) {
    console.error('Error getting users from Microsoft 365:', error);
    throw error;
  }
};

/**
 * Sync a user from Azure AD to the local database
 * @param {string} email User email
 * @param {Function} findUserFn Function to find user in local database
 * @param {Function} createUserFn Function to create user in local database
 * @param {Function} updateUserFn Function to update user in local database
 * @returns {Promise<Object>} Synced user
 */
const syncUser = async (email, findUserFn, createUserFn, updateUserFn) => {
  try {
    // Check if Microsoft 365 integration is enabled
    if (!process.env.ENABLE_MICROSOFT_365 || process.env.ENABLE_MICROSOFT_365 !== 'true') {
      throw new Error('Microsoft 365 integration is not enabled');
    }
    
    // Get user info from Azure AD
    const msUserInfo = await getUserInfo(email);
    
    // Find user in local database
    const localUser = await findUserFn(email);
    
    if (localUser) {
      // Update user in local database
      const updatedUser = await updateUserFn(localUser.id, {
        name: msUserInfo.displayName,
        email: msUserInfo.mail || msUserInfo.userPrincipalName,
        // Map Azure AD roles to local roles if needed
      });
      
      return updatedUser;
    } else {
      // Create user in local database
      const newUser = await createUserFn({
        name: msUserInfo.displayName,
        email: msUserInfo.mail || msUserInfo.userPrincipalName,
        // Generate a random password or use a default one
        password: Math.random().toString(36).slice(-8),
        // Map Azure AD roles to local roles if needed
        role: 'user'
      });
      
      return newUser;
    }
  } catch (error) {
    console.error('Error syncing user from Microsoft 365:', error);
    throw error;
  }
};

module.exports = {
  getAccessToken,
  getUserInfo,
  getAllUsers,
  syncUser
};
