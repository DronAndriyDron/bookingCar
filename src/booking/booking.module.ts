import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';

@Module({
  imports:[ConfigModule.forRoot({
    envFilePath:".env"
  })],
  controllers: [BookingController],
  providers: [BookingService]
})
export class BookingModule {}
