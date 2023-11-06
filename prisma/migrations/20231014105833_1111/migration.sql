-- CreateEnum
CREATE TYPE "AdminChatState" AS ENUM ('NONE', 'REGISTER_USER_IN_WEB_TG', 'REGISTER_USER_IN_WEB_TG_VERIFY_CODE', 'ADD_CHANEL', 'ADD_CHANEL_CONFIG');

-- CreateEnum
CREATE TYPE "ParserTaskState" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED');

-- CreateTable
CREATE TABLE "ParserBot" (
    "id" SERIAL NOT NULL,

    CONSTRAINT "ParserBot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Admin" (
    "tg_user_id" INTEGER NOT NULL,
    "tg_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "disabled" BOOLEAN NOT NULL,
    "tg_data" JSONB NOT NULL,
    "phoneNumber" TEXT,
    "parserBotId" INTEGER,
    "chatState" "AdminChatState" NOT NULL DEFAULT 'NONE',

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("tg_user_id")
);

-- CreateTable
CREATE TABLE "Channel" (
    "channel_url" TEXT NOT NULL,
    "lastMessageId" INTEGER,
    "is_private" BOOLEAN,
    "is_avalible_to_read" BOOLEAN,

    CONSTRAINT "Channel_pkey" PRIMARY KEY ("channel_url")
);

-- CreateTable
CREATE TABLE "ChannelConfig" (
    "id" SERIAL NOT NULL,
    "keywords" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL,
    "adminId" INTEGER NOT NULL,
    "channelId" TEXT NOT NULL,
    "activeChannelId" INTEGER,

    CONSTRAINT "ChannelConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvitationalUUID" (
    "id" TEXT NOT NULL,
    "admin_tg_user_id" INTEGER NOT NULL,

    CONSTRAINT "InvitationalUUID_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TelegramPost" (
    "id" SERIAL NOT NULL,
    "tg_post_id" TEXT NOT NULL,
    "post_data" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "adminId" INTEGER NOT NULL,

    CONSTRAINT "TelegramPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParserTask" (
    "id" SERIAL NOT NULL,
    "channelId" TEXT NOT NULL,
    "state" "ParserTaskState" NOT NULL DEFAULT 'SCHEDULED',

    CONSTRAINT "ParserTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActiveChannel" (
    "id" INTEGER NOT NULL,
    "adminId" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_AdminToChannel" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Channel_channel_url_key" ON "Channel"("channel_url");

-- CreateIndex
CREATE UNIQUE INDEX "ChannelConfig_channelId_key" ON "ChannelConfig"("channelId");

-- CreateIndex
CREATE UNIQUE INDEX "InvitationalUUID_admin_tg_user_id_key" ON "InvitationalUUID"("admin_tg_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "ParserTask_channelId_key" ON "ParserTask"("channelId");

-- CreateIndex
CREATE UNIQUE INDEX "ActiveChannel_id_key" ON "ActiveChannel"("id");

-- CreateIndex
CREATE UNIQUE INDEX "_AdminToChannel_AB_unique" ON "_AdminToChannel"("A", "B");

-- CreateIndex
CREATE INDEX "_AdminToChannel_B_index" ON "_AdminToChannel"("B");

-- AddForeignKey
ALTER TABLE "Admin" ADD CONSTRAINT "Admin_parserBotId_fkey" FOREIGN KEY ("parserBotId") REFERENCES "ParserBot"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChannelConfig" ADD CONSTRAINT "ChannelConfig_activeChannelId_fkey" FOREIGN KEY ("activeChannelId") REFERENCES "ActiveChannel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChannelConfig" ADD CONSTRAINT "ChannelConfig_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("tg_user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChannelConfig" ADD CONSTRAINT "ChannelConfig_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("channel_url") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvitationalUUID" ADD CONSTRAINT "InvitationalUUID_admin_tg_user_id_fkey" FOREIGN KEY ("admin_tg_user_id") REFERENCES "Admin"("tg_user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TelegramPost" ADD CONSTRAINT "TelegramPost_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("tg_user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TelegramPost" ADD CONSTRAINT "TelegramPost_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("channel_url") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParserTask" ADD CONSTRAINT "ParserTask_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("channel_url") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActiveChannel" ADD CONSTRAINT "ActiveChannel_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("tg_user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AdminToChannel" ADD CONSTRAINT "_AdminToChannel_A_fkey" FOREIGN KEY ("A") REFERENCES "Admin"("tg_user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AdminToChannel" ADD CONSTRAINT "_AdminToChannel_B_fkey" FOREIGN KEY ("B") REFERENCES "Channel"("channel_url") ON DELETE CASCADE ON UPDATE CASCADE;
