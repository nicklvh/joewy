export type APIPetResponse = Array<APIPetInterface>;

export interface APIPetInterface {
  url: string;
  message?: string;
}

export enum LoggingTypes {
  AUDITLOG = "auditlog",
  WELCOME = "welcome",
  MODLOG = "modlog",
}
