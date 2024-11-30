import { ModerationType, PrismaClient } from "@prisma/client";
import { ChannelType } from "discord.js";

export const ModerationTypeNamesPast = {
  [ModerationType.BAN]: "Banned",
  [ModerationType.KICK]: "Kicked",
  [ModerationType.MUTE]: "Muted",
  [ModerationType.WARN]: "Warned",
};

export const ModerationTypeNamesPresent = {
  [ModerationType.BAN]: "Ban",
  [ModerationType.KICK]: "Kick",
  [ModerationType.MUTE]: "Mute",
  [ModerationType.WARN]: "Warn",
};

export const ChannelTypeNames = {
  [ChannelType.GuildCategory]: "Category",
  [ChannelType.GuildStageVoice]: "Stage Voice",
  [ChannelType.GuildText]: "Text",
  [ChannelType.GuildVoice]: "Voice",
  [ChannelType.GuildForum]: "Forum",
  [ChannelType.GuildAnnouncement]: "Announcement",
  [ChannelType.AnnouncementThread]: "Announcement Thread",
  [ChannelType.PublicThread]: "Public Thread",
  [ChannelType.PrivateThread]: "Private Thread",
  [ChannelType.GuildDirectory]: "Directory",
  [ChannelType.GuildMedia]: "Media",
};

export enum LoggingTypes {
  AUDITLOG = "auditlog",
  WELCOME = "welcome",
  MODLOG = "modlog",
}

declare module "@sapphire/pieces" {
  interface Container {
    prisma: PrismaClient;
  }
}
