import { User } from "./user";

export interface Following {
  following: User;
  principal_id: string;
}
