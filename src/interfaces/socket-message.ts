import { SocketMessageType } from '../enums/socket-message-type';

export interface SocketMessage<T> {
  type: SocketMessageType;
  data: T;
}
