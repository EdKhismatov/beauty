import {
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Logger,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { FastifyRequest } from 'fastify';
import { UserEntity } from '../../database/entities/user.entity';
import { Roles } from '../../decorators/roles.decorator';
import { User } from '../../decorators/user.decorator';
import { AuthGuard } from '../../guards/jwt.guard';
import { RolesUser } from '../../guards/role.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { FilesService } from '../../upload/files.service';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { GetPortfolioQueryDto } from './dto/get-portfolio.query.dto';
import { IdDto } from './dto/id.dto';
import { IdPortfolioDto } from './dto/id-portfolio.dto';
import { UpdatePortfolioDto } from './dto/update-portfolio.dto';
import { PortfolioService } from './portfolio.service';

@ApiTags('v1/portfolio')
@Controller('v1/portfolio')
export class PortfolioController {
  private readonly logger = new Logger(PortfolioController.name);
  constructor(
    private readonly filesService: FilesService,
    private readonly portfolioService: PortfolioService,
  ) {}

  // создаем портфолио с фото
  @UseGuards(AuthGuard, RolesGuard)
  @Roles([RolesUser.master, RolesUser.admin])
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreatePortfolioDto })
  @Post('upload')
  async uploadWork(@Req() req: FastifyRequest, @User() user: UserEntity) {
    const body: Record<string, any> = {};
    const fileNames: string[] = [];
    const parts = req.parts();

    for await (const part of parts) {
      if (part.type === 'file') {
        const fileName = await this.filesService.createFile(part);
        fileNames.push(fileName);
      } else {
        body[part.fieldname] = (part as any).value;
      }
    }

    const productData = {
      description: body.description,
      imageUrl: fileNames,
      userId: user.id,
    };
    try {
      return await this.portfolioService.uploadWork(productData as CreatePortfolioDto, user);
    } catch (error) {
      this.logger.error('Ошибка сохранения в БД, удаляем загруженные файлы...');
      await Promise.all(fileNames.map((el) => this.filesService.removeImage(el)));
      throw new InternalServerErrorException('Не удалось сохранить работу');
    }
  }

  // портфолио мастера
  @UseGuards(AuthGuard, RolesGuard)
  @Roles([RolesUser.master, RolesUser.admin])
  @ApiOkResponse({ description: "Master's portfolio" })
  @ApiOperation({ summary: 'Портфолио мастера' })
  @Get('')
  async getMyProduct(@User() user: UserEntity) {
    return await this.portfolioService.getMyPortfolio(user);
  }

  // удаление определенной картинки
  @UseGuards(AuthGuard, RolesGuard)
  @Roles([RolesUser.master, RolesUser.admin])
  @Delete(':id')
  async removePhoto(@User() user: UserEntity, @Param() params: IdDto) {
    return await this.portfolioService.removePhoto(params, user);
  }

  // удаление полностью портфолио
  @UseGuards(AuthGuard, RolesGuard)
  @Roles([RolesUser.master, RolesUser.admin])
  @Delete('my/:id')
  async removePortfolio(@User() user: UserEntity, @Param() params: IdPortfolioDto) {
    return await this.portfolioService.removePortfolio(params, user);
  }

  // выводим все портфолио (с пагинацией)
  @ApiCreatedResponse({ description: 'All portfolios are loaded' })
  @ApiOperation({ summary: 'Портфолио загружены' })
  @Get('all')
  async getAllProjects(@Query() query: GetPortfolioQueryDto) {
    return await this.portfolioService.getAllProjects(query);
  }

  // редактирование своего товара
  @UseGuards(AuthGuard, RolesGuard)
  @Roles([RolesUser.master, RolesUser.admin])
  @ApiCreatedResponse({ description: 'Portfolio successfully edited' })
  @ApiOperation({ summary: 'Редактирование портфолио' })
  @Patch(':id')
  async updateMyPortfolio(@Param() params: IdDto, @Body() dto: UpdatePortfolioDto, @User() user: UserEntity) {
    return await this.portfolioService.updateMyPortfolio(params, dto, user);
  }
}
