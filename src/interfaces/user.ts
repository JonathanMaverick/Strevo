export interface User {
  principal_id: string;
  username: string;
  profile_picture: string;
}

export interface UserRegistrationData {
  principal_id?: string;
  username: string;
  profile_picture: string;
}
