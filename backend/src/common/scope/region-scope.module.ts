import { Module } from '@nestjs/common';
import { UsersModule } from '../../users/users.module';
import { RegionScopeService } from './region-scope.service';

@Module({
  imports: [UsersModule],
  providers: [RegionScopeService],
  exports: [RegionScopeService],
})
export class RegionScopeModule {}
