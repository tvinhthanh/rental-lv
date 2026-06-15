import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserQueryDto } from './dto/user-query.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('users')
export class UserController {
  constructor(private readonly service: UserService) { }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  getAll(@Query() query: UserQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  getOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  create(@Body() dto: CreateUserDto, @CurrentUser() user: any) {
    return this.service.create(dto, user?.id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto, @CurrentUser() user: any) {
    return this.service.update(id, dto, user?.id);
  }

  @Patch(':id/change-password')
  @UseGuards(JwtAuthGuard)
  changePassword(
    @Param('id') id: string,
    @Body() dto: ChangePasswordDto,
    @CurrentUser() user: any
  ) {
    if (user?.role !== 'ADMIN' && user?.id !== id) {
      throw new ForbiddenException('You can only change your own password');
    }
    return this.service.changePassword(id, dto, user?.id);
  }

  @Patch(':id/reset-password')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  resetPassword(
    @Param('id') id: string,
    @Body() dto: ResetPasswordDto,
    @CurrentUser() user: any
  ) {
    return this.service.resetPassword(id, dto, user?.id);
  }

  @Patch(':id/role')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  updateRole(
    @Param('id') id: string,
    @Body() dto: UpdateRoleDto,
    @CurrentUser() user: any
  ) {
    return this.service.updateRole(id, dto, user?.id);
  }

  @Patch(':id/disable')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  disable(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.softDelete(id, user?.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  hardDelete(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.hardDelete(id, user?.id);
  }
}
