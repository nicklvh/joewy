import { Schema, model, Document } from 'mongoose';

export interface Member extends Document {
  userId: string;
  guildId: string;
}

export const MemberSchema = new Schema({
  userId: String,
  guildId: String,
});

export const MemberModel = model<Member>('members', MemberSchema);
