import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { PuppeteerService } from './puppeteer/puppeteer.service';

@Injectable()
export class AppService {
  constructor(
    private prisma: PrismaService,
    private puppeteerService: PuppeteerService,
  ) {}

  async pickCountryCodeAndTypeNumber(countryCode: string, phoneNumber: string) {
    return await this.puppeteerService.pickCountryCodeAndTypeNumber(
      countryCode,
      phoneNumber,
    );
  }

  async loginByQrCode() {
    return await this.puppeteerService.loginByQrCode();
  }

  async typeVerifyCode(verifyCode: string) {
    return await this.puppeteerService.typeVerifyCode(verifyCode);
  }

  async isBotLogged(adminId: number) {
    return await this.puppeteerService.createParserBot(adminId);
  }

  async joinChannelOrRequest(channelUrl: string) {
    return await this.puppeteerService.joinChannelOrRequest(channelUrl);
  }
}
