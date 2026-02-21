import { MultipartFile } from '@fastify/multipart';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import sharp from 'sharp';
import { PassThrough } from 'stream';
import * as uuid from 'uuid';
import { appConfig } from '../config';
import { MinioService } from '../module/minio/minio.service';

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);
  private readonly ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
  private readonly MAX_SIZE = 5 * 1024 * 1024; // 5 МБ
  constructor(private readonly minioService: MinioService) {}

  async createFile(file: MultipartFile): Promise<string> {
    if (!this.ALLOWED_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(`Недопустимый формат: ${file.mimetype}`);
    }

    const fileName = uuid.v4() + '.webp';
    const sizeValidator = new PassThrough();
    let downloadedBytes = 0;

    // 1. Считаем байты
    sizeValidator.on('data', (chunk) => {
      downloadedBytes += chunk.length;
      if (downloadedBytes > this.MAX_SIZE) {
        // Если перевес - ломаем поток с ошибкой
        sizeValidator.destroy(new Error('Файл слишком большой (max 5MB)'));
      }
    });

    // 2. Настраиваем sharp
    const transformer = sharp().resize(800).webp({ quality: 80 });

    // 3. Запускаем конвейер
    file.file.pipe(sizeValidator).pipe(transformer);

    try {
      // просим sharp собрать финальный легкий webp в Buffer
      const finalBuffer = await transformer.toBuffer();
      // Теперь у нас есть нормальный Buffer, у которого есть свойство .length!
      // Обрати внимание: мы передаем 'image/webp', так как sharp изменил формат
      await this.minioService.uploadFile(appConfig.minio.minioBucket, fileName, finalBuffer, 'image/webp');

      return fileName;
    } catch (error) {
      this.logger.error(`Ошибка обработки файла: ${error.message}`);
      throw new BadRequestException(error.message);
    }
  }

  // Новый метод для массива файлов
  async createFiles(files: MultipartFile[]): Promise<string[]> {
    return await Promise.all(files.map((file) => this.createFile(file)));
  }

  // удаление
  async removeImage(fileName: string) {
    return await this.minioService.deleteFile(appConfig.minio.minioBucket, fileName);
  }

  async onApplicationShutdown() {
    this.logger.log('--- Завершение работы FileService ---');
  }
}
