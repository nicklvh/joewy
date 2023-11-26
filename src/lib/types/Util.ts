import { ModerationType } from '@prisma/client';

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
