import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { EntityDocumentHelper } from '../../../../../utils/document-entity-helper';

export type StatusSchemaDocument = HydratedDocument<StatusSchema>;

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    getters: true,
  },
})
export class StatusSchema extends EntityDocumentHelper {
  @Prop()
  name?: string;
}

export const StatusSchemaFactory = SchemaFactory.createForClass(StatusSchema);
