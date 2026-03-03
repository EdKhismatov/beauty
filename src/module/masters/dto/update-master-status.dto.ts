import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';
import { StatusMaster } from '../../../guards/role.guard';

export class UpdateMasterStatusDto {
  @ApiProperty({ description: 'Выберите статус' })
  @IsString()
  @IsEnum([StatusMaster.active, StatusMaster.paused, StatusMaster.banned])
  status: StatusMaster;
}
