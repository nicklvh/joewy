import { ModerationType } from '@prisma/client';
import { ChannelType } from 'discord.js';

export type APIPetResponse = Array<APIPetInterface>;

export interface APIPetInterface {
  url: string;
  message?: string;
}

export const ModerationTypeNames = {
  [ModerationType.BAN]: 'Banned',
  [ModerationType.KICK]: 'Kicked',
  [ModerationType.MUTE]: 'Muted',
  [ModerationType.WARN]: 'Warned',
};

export const ModerationTypeStrings = {
  [ModerationType.BAN]: 'Ban',
  [ModerationType.KICK]: 'Kick',
  [ModerationType.MUTE]: 'Mute',
  [ModerationType.WARN]: 'Warn',
};

export const ChannelTypeNames = {
  [ChannelType.GuildCategory]: 'Category',
  [ChannelType.GuildStageVoice]: 'Stage Voice',
  [ChannelType.GuildText]: 'Text',
  [ChannelType.GuildVoice]: 'Voice',
  [ChannelType.GuildForum]: 'Forum',
  [ChannelType.GuildAnnouncement]: 'Announcement',
  [ChannelType.AnnouncementThread]: 'Announcement Thread',
  [ChannelType.PublicThread]: 'Public Thread',
  [ChannelType.PrivateThread]: 'Private Thread',
  [ChannelType.GuildDirectory]: 'Directory',
  [ChannelType.GuildMedia]: 'Media',
};
