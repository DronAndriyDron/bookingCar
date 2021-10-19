import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BookingModule } from './booking/booking.module';


@Module({
  imports: [ConfigModule.forRoot({
    envFilePath:'.env'
  }), BookingModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
