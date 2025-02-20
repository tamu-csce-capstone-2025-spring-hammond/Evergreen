export type JWTResponseType = {
    access_token: string;
    expires_in: number;
  };
  
  export type UserInfoType = {
    id: number,
    email: string,
    firstName: string,
    lastName: string
  }
//     "access_token": "their_jwt_token_here",
//   "expires_in": "Seconds until access token expires"