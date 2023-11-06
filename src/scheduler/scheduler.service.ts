import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PuppeteerService } from '../puppeteer/puppeteer.service';
import { ScheduledTask } from '../prisma/scheduled_task.interface';

@Injectable()
export class SchedulerService implements OnApplicationBootstrap {
  constructor(
    private prismaService: PrismaService,
    private puppeteerService: PuppeteerService,
  ) {}

  private NEXT_JOB_DELAY = 5000;

  onApplicationBootstrap() {
    this.scheduleNextCall(this.parseTgChannels);
  }

  async runTask(task: ScheduledTask) {
    const channelUrl = task.channel.channel_url;
    const lastMessageId = task.channel.lastMessageId;
    const activeChannels = task.channel.ChannelConfig.map((config) =>
      String(config.ActiveChannel.id),
    );
    return await this.puppeteerService.parseChannelByUrlAndMessageId(
      channelUrl,
      lastMessageId,
      activeChannels,
    );
  }

  async runTasksRecursive(
    tasks: any[],
    taskIndex = 0,
    result = {},
  ): Promise<Record<string, number>> {
    if (!tasks[taskIndex]) return result;

    result[tasks[taskIndex].channel.lastMessageId] = await this.runTask(
      tasks[taskIndex],
    );

    return await this.runTasksRecursive(tasks, taskIndex + 1, result);
  }

  async parseTgChannels() {
    const tasks = await this.prismaService.getScheduledTasks();
    this.prismaService.updateParserTaskStatusByChannelId(
      tasks.map((t) => t.channelId),
      'IN_PROGRESS',
    );
    try {
      const messageRecord = await this.runTasksRecursive(tasks);
      this.prismaService.updateManyChannelsLastMessageId(messageRecord);
    } catch (e) {
      this.prismaService.updateParserTaskStatusByChannelId(
        tasks.map((t) => t.channelId),
        'SCHEDULED',
      );
    } finally {
      this.scheduleNextCall(this.parseTgChannels);
    }
  }

  scheduleNextCall(cb: () => void) {
    setTimeout(() => cb.call(this), this.NEXT_JOB_DELAY);
  }
}
