import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '../../decorators/public.decorator';
import { Roles } from '../../decorators/roles.decorator';
import { User } from '../../decorators/user.decorator';
import { RolesUser } from '../../guards/role.guard';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { ScheduleService } from './schedule.service';

@Controller('schedule')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  // расписание мастера
  @Public()
  @ApiResponse({ description: "Master's schedule" })
  @ApiOperation({ summary: 'Расписание мастера' })
  @Get('master/:masterId')
  async getMasterSchedule(@Param('masterId') masterId: string) {
    return await this.scheduleService.getMasterSchedule(masterId);
  }

  // расписание на конкретный день
  @Public()
  @ApiResponse({ description: "The master's schedule for a specific day" })
  @ApiOperation({ summary: 'Расписание мастера на конкретный день' })
  @Get('master/:masterId/:day')
  async getMasterScheduleDay(@Param('masterId') masterId: string, @Param('day', ParseIntPipe) day: number) {
    return await this.scheduleService.getMasterScheduleDay(masterId, day);
  }

  // создать день в расписании
  @Roles([RolesUser.master])
  @ApiResponse({ description: "The master's schedule for a specific day" })
  @ApiOperation({ summary: 'Расписание мастера на конкретный день' })
  @Post('')
  async createScheduleDay(@Body() body: CreateScheduleDto, @User('id') id: string) {
    return await this.scheduleService.createScheduleDay(body, id);
  }

  // обновить день в расписании
  @Roles([RolesUser.master])
  @ApiResponse({ description: "Update the master's schedule for a specific day" })
  @ApiOperation({ summary: 'Обновить расписание мастера на конкретный день' })
  @Patch(':id')
  async updateScheduleDay(@Body() body: UpdateScheduleDto, @User('id') userId: string, @Param('id') id: string) {
    return await this.scheduleService.updateScheduleDay(body, userId, id);
  }

  // удалить расписание на день
  @Roles([RolesUser.master])
  @ApiResponse({ description: "Delete the master's schedule for a specific day" })
  @ApiOperation({ summary: 'Удалить расписание мастера на конкретный день' })
  @Delete(':id')
  async deleteScheduleDay(@User('id') userId: string, @Param('id') id: string) {
    return await this.scheduleService.deleteScheduleDay(userId, id);
  }
}
