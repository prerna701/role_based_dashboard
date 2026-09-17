import { FileType } from '../../../../domain/file';
import { FileSchemaClass } from '../entities/file.schema';

export class FileMapper {
  static toDomain(raw: FileSchemaClass): FileType {
    const domainEntity = new FileType();
    domainEntity.id = raw._id;
    domainEntity.path = raw.path;

    return domainEntity;
  }

  static toPersistence(domainEntity: FileType): FileSchemaClass {
    const persistenceEntity = new FileSchemaClass();
    persistenceEntity._id = domainEntity.id;
    persistenceEntity.path = domainEntity.path;

    return persistenceEntity;
  }
}
