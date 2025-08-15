import { User } from './user';

export interface Following {
  following: User;
  principal_id: string;
}

export interface Followers {
  principal_id: string;
  followers: User;
}
