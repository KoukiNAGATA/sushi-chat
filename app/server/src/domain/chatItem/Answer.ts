import Question from "./Question"
import ChatItem from "./ChatItem"
import IconId from "../user/IconId"

class Answer extends ChatItem {
  constructor(
    id: string,
    topicId: string,
    roomId: string,
    userIconId: IconId,
    createdAt: Date,
    public readonly content: string,
    public readonly target: Question,
    timestamp?: number,
  ) {
    super(id, topicId, roomId, userIconId, createdAt, timestamp)
  }
}

export default Answer
