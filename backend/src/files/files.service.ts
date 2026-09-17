import { Injectable } from '@nestjs/common';
import { NullableType } from '../utils/types/nullable.type';
import { FileType } from './domain/file';

@Injectable()
export class FilesService {
  async findById(_id: FileType['id']): Promise<NullableType<FileType>> {
    return null;
  }
}
