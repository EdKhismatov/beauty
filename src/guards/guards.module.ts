import { Module } from '@nestjs/common';
import { AuthModule } from '../module/auth/auth.module';
import { UserModule } from '../module/users/user.module';
import { AuthGuard } from './jwt.guard';
import { RolesGuard } from './roles.guard';

@Module({
  imports: [AuthModule, UserModule],
  providers: [AuthGuard, RolesGuard],
  exports: [AuthGuard, RolesGuard],
})
export class GuardsModule {}
