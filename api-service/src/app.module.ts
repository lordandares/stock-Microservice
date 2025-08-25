import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { StockModule } from './stock/stock.module';
import { ConfigModule } from '@nestjs/config';
import { RabbitmqClientModule } from './rabbitmq-client/rabbitmq-client.module';
import { Stock } from './stock/stock.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      synchronize: true,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
    }),
    TypeOrmModule.forFeature([Stock]),
    AuthModule,
    StockModule,
    UsersModule,
    StockModule,
    RabbitmqClientModule,
  ],
})
export class AppModule {}
