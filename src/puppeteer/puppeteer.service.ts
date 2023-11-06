import { Injectable, OnModuleInit } from '@nestjs/common';
import puppeteer, { Browser, Page } from 'puppeteer';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PuppeteerService implements OnModuleInit {
  private bot_occupied: boolean;
  private bot_registred = false;
  private self_id: string;
  private browser?: Browser;
  private page?: Page;

  constructor(private prismaService: PrismaService) {}

  async onModuleInit() {
    this.bot_occupied = true;
    console.log('ON MODULE INIT');
    await this.startBot();
    this.bot_occupied = false;
  }

  isBotOccupied() {
    return this.bot_occupied;
  }

  async startBot() {
    if (this.bot_registred) return;
    if (this.browser && this.page) return;
    await this.goToLoginPage();
    console.log('BROWSER STARTED');
  }

  private async goToLoginPage() {
    this.bot_occupied = true;
    this.browser =
      this.browser ||
      (await puppeteer.launch({
        headless: false,
        product: 'chrome',
        userDataDir: '.tmp/dataDir',
      }));
    const page = (this.page = this.page || (await this.browser.newPage()));

    page.on('dialog', async (dialog) => {
      await new Promise((r) => setTimeout(r, 2000));
      await dialog.dismiss();
    });

    await page.setViewport({ width: 980, height: 720 });

    await page.goto('https://web.telegram.org/a/');

    try {
      const self_id = await this.getSelfId();
      if (self_id) this.bot_registred = true;
    } catch (e) {
      console.log(e);
    } finally {
      this.bot_occupied = false;
    }
    // if (isQrCode) return this.loginByQrCode();

    // this.selectLoginByNumber();

    // await page.waitFor
  }

  async selectLoginByNumber() {
    const page = this.page;
    console.log('WOWOWOWOWO');
    const loginButton = '#auth-qr-form > div > button:nth-child(4)';
    console.log('beforeSelector');
    await page.waitForSelector(loginButton);

    console.log('afterSelector');
    await new Promise((r) => setTimeout(r, 2000));
    console.log('beforeClick');
    await page.click(loginButton);
    console.log('afterClick');
  }

  async loginByQrCode() {
    // setTimeout(() => this.checkIsLoginAfterQrCodeSend.call(this, ), 30_000);
    return await this.page.screenshot({
      encoding: 'base64',
      type: 'jpeg',
    });
  }

  async pickCountryCodeAndTypeNumber(countryCode: string, phoneNumber: string) {
    if (this.bot_registred) return;
    const page = this.page as Page;

    await this.selectLoginByNumber();

    const pickButton = '#sign-in-phone-code';
    await page.waitForSelector(pickButton);
    await new Promise((r) => setTimeout(r, 2000));
    await page.click(pickButton);
    const selectCountry =
      '#auth-phone-number-form > div > form > div.DropdownMenu.CountryCodeInput > div.Menu.compact.CountryCodeInput > div.bubble.menu-container.custom-scroll.top.left.opacity-transition.fast.open.shown';
    await page.waitForSelector(selectCountry);
    // тут я ищу кнопку чтобы кликнуть потому что я крутой (вроде можно было просто ввести номер но чото я не смог)
    const countrySelector = await page.evaluate<
      string[],
      (arg0: string, arg1: string) => string
    >(
      function (dropdown_selector: string, country_code: string) {
        let node_with_code_selector = '';
        let counter = 1;
        const regexpString = country_code.includes('+')
          ? new RegExp('\\' + country_code + '$')
          : new RegExp('\\' + '+' + country_code + '$');

        const nodes = document.querySelectorAll(dropdown_selector + ' > div');
        console.log('nodes.length', nodes.length);
        for (const node of nodes) {
          // node.innerHTML;
          if (node && node.textContent.match(regexpString)) {
            // if (node && String(node.textContent).includes(includes_string)) {
            node_with_code_selector = `${dropdown_selector} > div:nth-child(${counter})`;
            document
              .querySelector(node_with_code_selector)
              ?.scrollIntoView({ behavior: 'smooth' });
            break;
          }
          counter += 1;
        }
        return node_with_code_selector;
      },
      selectCountry,
      countryCode,
    );
    // жду прокрутку в браузере и выбираю страну (просто чтобы круто)
    await new Promise((r) => setTimeout(r, 2000));
    await page.waitForSelector(countrySelector);
    await new Promise((r) => setTimeout(r, 2000));
    await page.click(countrySelector);

    const inputNumberField = '#sign-in-phone-number';
    await page.waitForSelector(inputNumberField);
    await new Promise((r) => setTimeout(r, 2000));
    // пишу номер
    await page.type(inputNumberField, phoneNumber, { delay: 500 });
    const confirmNumberButton =
      '#auth-phone-number-form > div > form > button:nth-child(4)';
    await page.waitForSelector(inputNumberField);
    await new Promise((r) => setTimeout(r, 2000));
    await page.click(confirmNumberButton);
  }

  async typeVerifyCode(verifyCode: string) {
    if (this.bot_registred) throw new Error('Bot registred');
    const page = this.page as Page;
    const signInCode = '#sign-in-code';
    await page.waitForSelector(signInCode);
    await new Promise((r) => setTimeout(r, 2000));
    await page.type(signInCode, verifyCode, { delay: 500 });
    await new Promise((r) => setTimeout(r, 2000));
  }

  async createParserBot(adminId: number) {
    if (this.bot_registred) throw new Error('Bot registred');
    try {
      // await this.page.waitForSelector(
      //   '#auth-code-form > div > div.input-group.touched.error.with-label > label',
      // );
      await this.page.waitForSelector('#LeftColumn-main');
      const selfId = await this.getSelfId();
      await this.prismaService.createParserBot(Number(selfId), adminId);
      this.bot_registred = true;
    } catch (e) {
      console.log(e);
      this.goToLoginPage();
      // this.switchProxy();
    }
  }

  async getSelfId() {
    const page = this.page as Page;
    const dropdownMenuButton =
      '#LeftMainHeader > div.DropdownMenu.main-menu > button > div.ripple-container';
    await page.waitForSelector(dropdownMenuButton);
    await new Promise((r) => setTimeout(r, 2000));
    await page.click(dropdownMenuButton);
    const savedMessagesButton =
      '#LeftMainHeader > div.DropdownMenu.main-menu > div > div.bubble.menu-container.custom-scroll.top.left.with-footer.opacity-transition.fast.open.shown i.icon.icon-saved-messages';
    await page.waitForSelector(savedMessagesButton);
    await new Promise((r) => setTimeout(r, 2000));
    await page.click(savedMessagesButton);
    await new Promise((r) => setTimeout(r, 2000));
    const dataPeerId =
      '#MiddleColumn > div.messages-layout > div.MiddleHeader > div.Transition div.chat-info-wrapper > div.ChatInfo > div.saved-messages';
    await page.waitForSelector(dataPeerId);
    const dataPeerIdVal = await page.evaluate(function (data_peer_id: string) {
      return document.querySelector(data_peer_id).attributes['data-peer-id']
        .nodeValue;
    }, dataPeerId);
    const userId = page.url().replace(/.*#/, '');
    if (dataPeerIdVal === userId) {
      this.self_id = userId;
      return userId;
    }
    // return this.getSelfId();
  }

  async goToChannelByUrl(channelUrl: string) {
    // if (!this.bot_registred) return;
    const page = this.page as Page;
    await page.goto(channelUrl);
    await new Promise((r) => setTimeout(r, 2000));
    const goToWebButtonSelector =
      'body > div.tgme_page_wrap > div.tgme_body_wrap > div > div.tgme_page_action.tgme_page_web_action > a';
    await page.waitForSelector(goToWebButtonSelector);
    const aTag = await page.$(goToWebButtonSelector);
    const href = await aTag.getProperty('href');
    console.log('HREF: ', href);
    // await page.click(goToWebButtonSelector);
    const tgAhref = href
      .toString()
      .replace('JSHandle:', '')
      .replace(/\/\w\//, '/a/');
    console.log('tgAhref: ', tgAhref);

    await page.goto(tgAhref);
  }

  async joinChannelOrRequest(channelUrl: string) {
    this.bot_occupied = true;
    // if (!this.bot_registred) return;
    const page = this.page as Page;
    console.log('joinChannelOrRequest(channelUrl: string)', channelUrl);
    await this.goToChannelByUrl(channelUrl);
    await new Promise((r) => setTimeout(r, 2000));
    // await page.waitForNavigation();
    const joinChannelButtonSelector =
      '#MiddleColumn > div.messages-layout > div.MiddleHeader.tools-stacked > div.header-tools > div > button.Button.tiny.primary.fluid.has-ripple';
    try {
      await page.waitForSelector(joinChannelButtonSelector);
      await page.click(joinChannelButtonSelector);
    } catch (e) {
      const joinByPrivateUrlOrRequestChannel =
        '#portals > div:nth-child(1) > div > div > div.modal-dialog > div.modal-content.custom-scroll > div > button:nth-child(1)';
      await page.waitForSelector(joinByPrivateUrlOrRequestChannel);
      const isJoinRequest = await page.evaluate<
        string[],
        (arg0: string) => boolean
      >(function (selector_url: string) {
        const join_button = document.querySelector(selector_url);
        function testNodeText(node_text: string) {
          return (
            node_text.includes('Private') ||
            node_text.includes('private') ||
            node_text.includes('Приватный') ||
            node_text.includes('приватный')
          );
        }
        return join_button && testNodeText(join_button.textContent);
      }, joinByPrivateUrlOrRequestChannel);

      await page.click(joinByPrivateUrlOrRequestChannel);

      if (isJoinRequest) {
        // await prismaSetChannelPrivate(channelUrl)
        return this.self_id;
      }
      // throw new Error();
    } finally {
      this.bot_occupied = false;
    }
    // aw
  }

  async parseChannelByUrlAndMessageId(
    channelUrl: string,
    previousMessageId: number,
    activeChannels: string[],
  ) {
    if (!this.bot_registred) return;
    const page = this.page as Page;
    await this.goToChannelByUrl(channelUrl);
    await new Promise((r) => setTimeout(r, 2000));
    // const messageSelector = `"[data-message-id='${previousMessageId}']`
    // await page.waitForSelector()
    const closestMessageId =
      await this.getClosestMessageIdFromPage(previousMessageId);
    const channelMessageId = await this.pickExistedMessageId(
      previousMessageId,
      closestMessageId,
    );

    const messageSelector = `[data-message-id='${channelMessageId}']`;
    const el = await page.$(messageSelector);
    const { x, y } = await el.clickablePoint();
    await page.mouse.move(x, y);
    // await el.hover()

    this.sendMessageToChannelsRecursive(channelMessageId, activeChannels);
    // TO DO надо написать пересылку для всех каналов
    // await this.forvardByMessageIdAndChannel(
    //   channelMessageId,
    //   activeChannels[0],
    // );

    return channelMessageId;
  }

  private async sendMessageToChannelsRecursive(
    channelMessageId: number,
    activeChannels: string[],
    index = 0,
  ) {
    if (!activeChannels[index]) return;

    await this.forvardByMessageIdAndChannel(
      channelMessageId,
      activeChannels[index],
    );

    return this.sendMessageToChannelsRecursive(
      channelMessageId,
      activeChannels,
      index,
    );
  }

  async forvardByMessageIdAndChannel(messageId: number, channelId: string) {
    if (!this.bot_registred) return;
    const page = this.page as Page;
    await page.click(
      `#message${messageId} > div.message-content-wrapper.can-select-text > div > button`,
    );
    const channelSelector = `.ChatInfo:has([data-peer-id="${channelId}"])`;
    await page.waitForSelector(channelSelector);
    await page.click(channelSelector);
    const senderParametersSelector =
      '#MiddleColumn > div.messages-layout > div.Transition > div.Transition_slide.Transition_slide-active > div.middle-column-footer > div.Composer.shown.mounted > div.composer-wrapper > div.ComposerEmbeddedMessage.opacity-transition.fast.open.shown > div > div.EmbeddedMessage.inside-input.color-1 > i';
    await page.waitForSelector(senderParametersSelector);
    await page.click(senderParametersSelector);
    const hideSenderNameOptionSelector =
      '#MiddleColumn > div.messages-layout > div.Transition > div.Transition_slide.Transition_slide-active > div.middle-column-footer > div.Composer.shown.mounted > div.composer-wrapper > div.ComposerEmbeddedMessage.opacity-transition.fast.open.shown > div > div.Menu.compact.forward-context-menu > div.bubble.menu-container.custom-scroll.bottom.right.opacity-transition.fast.open.shown > div:nth-child(2)';
    await page.waitForSelector(hideSenderNameOptionSelector);
    await page.click(hideSenderNameOptionSelector);
    const sendMessageButtonSelector =
      '#MiddleColumn > div.messages-layout > div.Transition > div.Transition_slide.Transition_slide-active > div.middle-column-footer > div.Composer.shown.mounted > button';
    await page.waitForSelector(sendMessageButtonSelector);
    await page.click(sendMessageButtonSelector);
    const backButtonSelector =
      '#MiddleColumn > div.messages-layout > div.MiddleHeader > div.Transition > div.Transition_slide.Transition_slide-active > div.back-button > button';
    await page.waitForSelector(backButtonSelector);
    await page.click(backButtonSelector);
  }

  async goToClosestMessageId(messageId: number) {
    const page = this.page as Page;
    const messageSelector = `[data-message-id='${messageId}']`;
    const el = await page.$(messageSelector);
    el.scrollIntoView();
  }

  async pickExistedMessageId(
    expectedMessageId: number,
    closestMessageId: number,
  ): Promise<number> {
    if (expectedMessageId === closestMessageId) return closestMessageId;
    await this.goToClosestMessageId(closestMessageId);
    const newClosestMessageId =
      await this.getClosestMessageIdFromPage(expectedMessageId);
    const newExpectedMessageId =
      newClosestMessageId === closestMessageId
        ? newClosestMessageId
        : expectedMessageId;
    return await this.pickExistedMessageId(
      newExpectedMessageId,
      newClosestMessageId,
    );
  }

  async getClosestMessageIdFromPage(messageId: number): Promise<number> {
    const page = this.page as Page;
    console.log('getClosestMessageIdFromPage');
    const allMessageIDS = (await page.evaluate(function () {
      return Array.from(
        new Set(
          [...document.querySelectorAll('div[data-message-id]')].map((e) =>
            Number(e.attributes['data-message-id'].nodeValue),
          ),
        ),
      );
    })) as number[];

    function closestBiggerValOrClosestLower(
      numbers: number[],
      arrayLength: number,
      message_id: number,
    ) {
      const half = Math.floor(arrayLength / 2);

      if (numbers[half] > message_id)
        return closestBiggerValOrClosestLower(numbers, half, message_id);
      if (numbers[half] === message_id) return message_id;
      if (numbers[half] < message_id && numbers[half + 1])
        return numbers[half + 1];
      return numbers[half];
    }
    // const valls = allMessageIDS.map(e => e - messageId)
    const closestValue = closestBiggerValOrClosestLower(
      allMessageIDS,
      allMessageIDS.length,
      messageId,
    );
    // const minId = allMessageIDS[valls.indexOf(closestValue)]
    // if (minId >= messageId) return minId
    return closestValue;
    // return valls.indexOf(0) !== -1 ? allMessageIDS[valls.indexOf(0)] : allMessageIDS[valls.indexOf(Math.max(...valls))]
  }
}
