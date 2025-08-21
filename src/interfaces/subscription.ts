import { SubscribingUser } from './subscribing-user';

export interface Subscription {
  end_date: number;
  start_date: number;
  subscribing: SubscribingUser;
  streaming_key?: string;
  created_at: number;
  principal_id: string;
}
