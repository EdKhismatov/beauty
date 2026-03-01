import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CacheTime } from '../../cache/cache.constants';
import { cacheAllCities, cacheCitiesId, cacheCitiesSlug } from '../../cache/cache.keys';
import { RedisService } from '../../cache/redis.service';
import { CitiesEntity } from '../../database/entities';
import { CreateCityDto, UpdateCityDto } from './dto';

@Injectable()
export class CitiesService {
  private readonly logger = new Logger(CitiesService.name);

  constructor(
    @InjectModel(CitiesEntity)
    private citiesModel: typeof CitiesEntity,
    private readonly redisService: RedisService,
  ) {}

  // все активные города
  async getCitiesAll() {
    const key = cacheAllCities();
    const cashCities = await this.redisService.get(key);
    if (cashCities) {
      this.logger.log(`Достали из Redis`);
      return cashCities;
    }
    const cities = await this.citiesModel.findAll({ where: { isActive: true } });
    if (cities.length === 0) {
      throw new NotFoundException(`Активных городов не найдено`);
    }
    this.logger.log(`Активные города найдены`);
    await this.redisService.set(key, cities, { EX: CacheTime.min5 });
    return cities;
  }

  // активный город по id
  async getCityById(id: string) {
    const key = cacheCitiesId(id);
    const cashCities = await this.redisService.get(key);
    if (cashCities) {
      this.logger.log(`Достали из Redis`);
      return cashCities;
    }
    const cities = await this.citiesModel.findByPk(id);
    if (!cities) {
      throw new NotFoundException(`Город не найден`);
    }
    this.logger.log(`Город найден`);
    await this.redisService.set(key, cities, { EX: CacheTime.min5 });
    return cities;
  }

  // город по slug
  async getCityBySlug(slug: string) {
    const key = cacheCitiesSlug(slug);
    const cashCities = await this.redisService.get(key);
    if (cashCities) {
      this.logger.log(`Достали из Redis`);
      return cashCities;
    }
    const cities = await this.citiesModel.findOne({ where: { slug } });
    if (!cities) {
      throw new NotFoundException(`Город не найден`);
    }
    this.logger.log(`Город найден`);
    await this.redisService.set(key, cities, { EX: CacheTime.min5 });
    return cities;
  }

  // создание нового города
  async createCity(body: CreateCityDto) {
    const cities = await this.citiesModel.findOne({ where: { slug: body.slug } });
    if (cities) {
      throw new ConflictException(`Город уже существует`);
    }

    const newCity = await this.citiesModel.create({ ...body });
    this.logger.log(`Создан новый город`);

    await this.redisService.delete(cacheAllCities());
    return newCity;
  }

  // изменение данных о городе
  async updateCity(body: UpdateCityDto, id: string) {
    const cities = await this.citiesModel.findByPk(id);
    if (!cities) {
      throw new NotFoundException(`Город не найден`);
    }

    await cities.update({ ...body });
    this.logger.log(`Город с ID:${id} обновлен`);

    await Promise.all([
      this.redisService.delete(cacheAllCities()),
      this.redisService.delete(cacheCitiesId(id)),
      this.redisService.delete(cacheCitiesSlug(cities.slug)),
    ]);

    return cities;
  }

  // активация/деактивация города
  async toggleCity(id: string) {
    const cities = await this.citiesModel.findByPk(id);
    if (!cities) {
      throw new NotFoundException(`Город не найден`);
    }

    cities.isActive = !cities.isActive;
    await cities.save();

    this.logger.log(`Город с ID:${id} обновлен`);

    await Promise.all([
      this.redisService.delete(cacheAllCities()),
      this.redisService.delete(cacheCitiesId(id)),
      this.redisService.delete(cacheCitiesSlug(cities.slug)),
    ]);

    return cities;
  }
}
