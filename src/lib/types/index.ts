import type { ModerationManager } from '@lib/classes';
import { type PrismaClient, ModerationType } from '@prisma/client';

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

declare module '@sapphire/pieces' {
  interface Container {
    prisma: PrismaClient;
    moderationManager: ModerationManager;
  }
}
