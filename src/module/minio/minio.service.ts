import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as Minio from 'minio';
import { appConfig } from '../../config';

@Injectable()
export class MinioService implements OnModuleInit {
  private minioClient: Minio.Client;
  private readonly logger = new Logger(MinioService.name); // Используем встроенный логгер (он подхватит твой Pino)

  constructor() {
    this.minioClient = new Minio.Client({
      endPoint: 'localhost',
      port: appConfig.minio.minioPort,
      useSSL: false,
      accessKey: appConfig.minio.minioUser,
      secretKey: appConfig.minio.minioPassword,
    });
  }

  // Выполнится при запуске приложения
  async onModuleInit() {
    const bucketName = 'oko-photos';
    const exists = await this.minioClient.bucketExists(bucketName);
    if (!exists) {
      await this.minioClient.makeBucket(bucketName, 'us-east-1');
      this.logger.log(`Bucket "${bucketName}" создан успешно`);
    }
  }

  async uploadFile(bucket: string, fileName: string, buffer: Buffer, mimetype: string) {
    const metaData = {
      'Content-Type': mimetype,
    };

    return await this.minioClient.putObject(bucket, fileName, buffer, buffer.length, metaData);
  }

  // Метод для получения временной ссылки (например, на 1 час)
  async getFileUrl(bucket: string, fileName: string): Promise<string> {
    return await this.minioClient.presignedUrl('GET', bucket, fileName, 3600);
  }

  async deleteFile(bucket: string, fileName: string): Promise<void> {
    try {
      await this.minioClient.removeObject(bucket, fileName);
    } catch (err) {
      this.logger.error(`Ошибка при удалении файла ${fileName}: ${err.message}`);
    }
  }
}
