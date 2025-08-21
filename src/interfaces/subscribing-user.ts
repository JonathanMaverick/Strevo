export interface SubscribingUser {
  principal_id: string;
  username: string;
  profile_picture: string;
  streaming_key: string;
  created_at: number;
  bio?: string | null;
}
