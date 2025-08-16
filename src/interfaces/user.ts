export interface User {
  principal_id: string;
  username: string;
  profile_picture: string;
  streaming_key: string;
}

export interface UserRegistrationData {
  principal_id?: string | undefined;
  username: string;
  profile_picture: string;
}
