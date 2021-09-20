import {
  AdminEnterCommand,
  CreateUserCommand,
  UserEnterCommand,
  UserLeaveCommand,
} from "./commands"
import IUserRepository from "../../domain/user/IUserRepository"
import User from "../../domain/user/User"
import IRoomRepository from "../../domain/room/IRoomRepository"
import RoomClass from "../../domain/room/Room"
import IUserDelivery from "../../domain/user/IUserDelivery"
import ChatItemResponseBuilder from "../chatItem/ChatItemResponseBuilder"
import { ChatItem } from "../../chatItem"
import Topic from "../../domain/room/Topic"
import IconId, { NewIconId } from "../../domain/user/IconId"

class UserService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly roomRepository: IRoomRepository,
    private readonly userDelivery: IUserDelivery,
  ) {}

  public createUser(command: CreateUserCommand): void {
    const newUser = new User(command.userId)
    this.userRepository.create(newUser)
  }

  public async adminEnterRoom(command: AdminEnterCommand): Promise<{
    chatItems: ChatItem[]
    topics: Topic[]
    activeUserCount: number
  }> {
    const room = await this.findRoomOrThrow(command.roomId)
    const user = this.userRepository.find(command.userId)

    // roomが始まっていない/adminでないとここでエラー
    const activeUserCount = room.joinAdminUser(command.userId, command.adminId)

    // roomにjoinできたらuserにもroomIdとiconIdを覚えさせる
    user.enterRoomAsAdmin(command.roomId, User.ADMIN_ICON_ID)

    this.userDelivery.enterRoom(user, activeUserCount)
    this.userRepository.update(user)
    await this.roomRepository.update(room)

    return {
      chatItems: ChatItemResponseBuilder.buildChatItems(room.chatItems),
      topics: room.topics,
      activeUserCount,
    }
  }

  public async enterRoom(command: UserEnterCommand): Promise<{
    chatItems: ChatItem[]
    topics: Topic[]
    activeUserCount: number
  }> {
    const room = await this.findRoomOrThrow(command.roomId)
    const user = this.userRepository.find(command.userId)

    // roomが始まっていないとここでエラー
    const activeUserCount = room.joinUser(command.userId)

    // roomにjoinできたらuserにもroomIdとiconIdを覚えさせる
    const iconId: IconId = NewIconId(command.iconId)
    user.enterRoom(command.roomId, iconId)

    this.userDelivery.enterRoom(user, activeUserCount)
    this.userRepository.update(user)
    await this.roomRepository.update(room)

    return {
      chatItems: ChatItemResponseBuilder.buildChatItems(room.chatItems),
      topics: room.topics,
      activeUserCount,
    }
  }

  public async leaveRoom(command: UserLeaveCommand) {
    const user = this.userRepository.find(command.userId)
    // まだRoomに参加していないユーザーなら何もしない
    if (user.roomId === null) return

    const room = await this.findRoomOrThrow(user.roomId)
    const activeUserCount = room.leaveUser(user.id)

    this.userDelivery.leaveRoom(user, activeUserCount)
    user.leaveRoom()

    this.userRepository.update(user)
    this.roomRepository.update(room)
  }

  private async findRoomOrThrow(roomId: string): Promise<RoomClass> {
    const room = await this.roomRepository.find(roomId)
    if (!room) {
      throw new Error(`[sushi-chat-server] Room(${roomId}) does not exists.`)
    }
    return room
  }
}

export default UserService
