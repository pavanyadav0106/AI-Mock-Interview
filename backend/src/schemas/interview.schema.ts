import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Interview extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  role: string;

  @Prop({ required: true, enum: ['Easy', 'Medium', 'Hard'] })
  difficulty: string;

  @Prop({ required: true })
  totalQuestions: number;

  @Prop()
  jobDescription: string;

  @Prop({ type: [String], default: [] })
  questions: string[]; // Store generated questions

  @Prop({ default: 0 })
  totalScore: number;

  @Prop()
  completedAt: Date;
}

export const InterviewSchema = SchemaFactory.createForClass(Interview);
