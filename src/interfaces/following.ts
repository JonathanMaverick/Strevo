import { User } from './user';

export interface FollowingInterface {
  following: User;
  principal_id: string;
}

export interface FollowersInterface {
  principal_id: string;
  followers: User;
}
