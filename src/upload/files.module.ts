import { Module } from '@nestjs/common';
import { MinioModule } from '../module/minio/minio.module';
import { FilesService } from './files.service';

@Module({
  imports: [MinioModule],
  providers: [FilesService],
  exports: [FilesService],
})
export class FilesModule {}
