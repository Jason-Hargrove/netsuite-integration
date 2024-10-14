import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import OAuth from 'oauth-1.0a';
import crypto from 'crypto-js';

// Create an instance of OAuth 1.0a
const oauth = new OAuth({
  consumer: {
    key: process.env.NEXT_PUBLIC_NETSUITE_CONSUMER_KEY!,
    secret: process.env.NEXT_PUBLIC_NETSUITE_CONSUMER_SECRET!,
  },
  signature_method: 'HMAC-SHA256',
  hash_function(base_string: string, key: string) {
    return crypto.HmacSHA256(base_string, key).toString(crypto.enc.Base64);
  },
});

// Define the token
const token = {
  key: process.env.NEXT_PUBLIC_NETSUITE_ACCESS_TOKEN!,
  secret: process.env.NEXT_PUBLIC_NETSUITE_TOKEN_SECRET!,
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  
  try {
    const request_data = {
      url: process.env.NEXT_PUBLIC_NETSUITE_BASE_URL!,
      method: 'GET',
    };

    // Generate OAuth headers
    const oauthData = oauth.authorize(request_data, token);
    console.log('OAuth Data (App):', oauthData); // Log OAuth data for debugging

    // Add realm to the authorization header
    const oauthHeaders = {
      Authorization: `OAuth realm="${process.env.NEXT_PUBLIC_NETSUITE_RELM}", ${oauth.toHeader(oauthData).Authorization.substring(6)}`,
      'Content-Type': 'application/json',
      'Accept-Encoding': 'gzip, deflate, br',
      'User-Agent': 'PostmanRuntime/7.42.0', // Matching Postman
    };

    console.log('Generated OAuth Headers (App):', oauthHeaders); // Log headers for debugging

    // Make the API request to NetSuite
    const response = await axios.get(request_data.url, {
      headers: oauthHeaders, // Pass the OAuth headers
    });

    // Send the response back to the client
    res.status(200).json(response.data);
  } catch (error: any) {
    console.error('Error in NetSuite API request (App):', error); // Log error details
    res.status(error.response?.status || 500).json({ error: error.message });
  }
}
