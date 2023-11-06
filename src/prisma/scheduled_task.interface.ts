export interface ScheduledTask {
  channel: {
    ChannelConfig: {
      ActiveChannel: {
        id: number;
        adminId: number;
      };
      id: number;
      keywords: string;
      is_active: boolean;
      adminId: number;
      channelId: string;
      activeChannelId: number;
    }[];
  } & {
    lastMessageId: number;
    channel_url: string;
    is_private: boolean;
    is_avalible_to_read: boolean;
  };
  channelId: string;
  id: number;
  state: string;
}
