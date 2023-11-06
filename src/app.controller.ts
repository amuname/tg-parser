import { Controller, Get, Header, ParseIntPipe, Query } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('tgBot')
export class AppController {
  constructor(private appService: AppService) {}
  // @Get('getHello')
  // getHello() {
  //   this.appService.getHello();
  // }

  // @Get('startBot')
  // startBot() {
  //   this.appService.startBot();
  // }

  @Get('loginByPhone')
  async pickCountryCodeAndTypeNumber(
    @Query('countryCode') countryCode: string,
    @Query('phoneNumber') phoneNumber: string,
  ) {
    console.log('user data: ', '|' + countryCode + '|', phoneNumber);
    await this.appService.pickCountryCodeAndTypeNumber(
      countryCode,
      phoneNumber,
    );
  }

  @Get('loginByQrCode')
  @Header('Content-Type', 'multipart/form-data')
  async loginByQrCode() {
    return await this.appService.loginByQrCode();
  }

  @Get('verify')
  async typeVerifyCode(@Query('verifyCode') verifyCode: string) {
    return await this.appService.typeVerifyCode(verifyCode);
  }

  @Get('isBotLogged')
  async isBotLogged(@Query('adminId', ParseIntPipe) adminId: number) {
    return await this.appService.isBotLogged(adminId);
  }

  @Get('joinChannelOrRequest')
  async joinChannelOrRequest(@Query('channelUrl') channelUrl: string) {
    console.log('joinChannelOrRequest', channelUrl);
    return await this.appService.joinChannelOrRequest(channelUrl);
  }
}
