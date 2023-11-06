import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { SchedulerService } from './scheduler/scheduler.service';
import { PuppeteerService } from './puppeteer/puppeteer.service';

@Module({
  controllers: [AppController],
  providers: [AppService, PrismaService, SchedulerService, PuppeteerService],
})
export class AppModule {}
