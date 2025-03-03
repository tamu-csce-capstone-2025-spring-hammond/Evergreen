import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { NewsModule } from './news/news.module';

@Module({
  imports: [AuthModule, ConfigModule.forRoot(), NewsModule],
})
export class AppModule {}
