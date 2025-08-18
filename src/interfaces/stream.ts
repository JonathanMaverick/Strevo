import { StreamMessage } from "./stream-message"

export interface Stream {
    streamId: string
    hostPrincipalID: string
    title: string
    thumbnail: string
    categoryName: string
    isActive: string
    createdAt: string
    messages: StreamMessage[]
    viewerCount: number
}