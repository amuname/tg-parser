import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ParserTask, PrismaClient } from '@prisma/client';
// const prisma = new PrismaClient()

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  onModuleInit() {
    this.$connect();
  }

  setScheduleTaskByChannelUrl(channelUrl: string) {
    return this.parserTask.create({
      data: {
        channel: {
          connect: {
            channel_url: channelUrl,
          },
        },
        state: 'SCHEDULED',
      },
    });
  }

  createTransactionManyScheduleTasksByChannelUrl(channelUrls: string[]) {
    // return this.$transaction(
    return channelUrls.map((chnlUrl) =>
      this.parserTask.create({
        data: {
          channel: {
            connect: {
              channel_url: chnlUrl,
            },
          },
          state: 'SCHEDULED',
        },
      }),
    );
    // );
    // return this.parserTask.createMany
  }

  getScheduledTasks() {
    return this.parserTask.findMany({
      take: 5,
      where: {
        state: 'SCHEDULED',
      },
      include: {
        channel: {
          include: {
            ChannelConfig: {
              include: {
                ActiveChannel: true,
              },
            },
          },
        },
      },
    });
  }

  updateParserTaskStatusByChannelId(
    ids: string[],
    status: ParserTask['state'],
  ) {
    return this.parserTask.updateMany({
      where: {
        channelId: {
          in: ids,
        },
      },
      data: {
        state: status,
      },
    });
  }

  createParserBot(botId: number, adminId: number) {
    return this.parserBot.create({
      data: {
        id: botId,
        admin: {
          connect: {
            tg_user_id: adminId,
          },
        },
      },
    });
  }

  updateManyChannelsLastMessageId(channelToMessageId: Record<string, number>) {
    const channelToMessageIdArray = Object.entries(channelToMessageId);
    const channelUrls = channelToMessageIdArray.map(([chnlUrl]) => chnlUrl);

    const transaction = channelToMessageIdArray.map(
      ([channel_url, lastMessageId]) =>
        this.channel.update({
          where: {
            channel_url,
          },
          data: {
            lastMessageId,
          },
        }),
    );

    // return this.$transaction([
    //   ...transaction,
    //   this.updateParserTaskStatusByChannelId(channelUrls, 'COMPLETED'),
    //   this.createTransactionManyScheduleTasksByChannelUrl(channelUrls),
    // ]);
    this.$transaction([
      ...transaction,
      this.updateParserTaskStatusByChannelId(channelUrls, 'COMPLETED'),
      ...this.createTransactionManyScheduleTasksByChannelUrl(channelUrls),
    ]);
  }

  onModuleDestroy() {
    this.$disconnect();
  }
}
