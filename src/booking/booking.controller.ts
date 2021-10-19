import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { BookingService } from './booking.service';
import { Request,Response } from 'express';
import { createBookingDto } from './dto/createBooking.dto';
import { closeBookingDto } from './dto/closeBooking.dto';
import { statisticsByOneCarDto, statisticsForAllCarDto } from './dto/statistics.dto';

@Controller('booking')
export class BookingController {

    constructor(private bookingservice:BookingService){

    }
    @Post('/createBooking')
    async createBooking(@Req() req:Request,@Body() dto:createBookingDto,@Res() res:Response)
    {
       
        const data = await this.bookingservice.createBooking(dto);
         
        res.json({
            message:"succes",
            data

        })
        
    }

    @Post('/closeBooking')
    async closeBooking(@Req() req:Request,@Body() dto:closeBookingDto,@Res() res:Response)
    {
        const data = await this.bookingservice.closeBooking(dto);

        res.json({
            data
        })
    }
    

    @Post('/statisticsByOneCar')
    async statisticsByOneCar(@Body() dto:statisticsByOneCarDto,@Res() res:Response)
    {
        const data = await this.bookingservice.statisticsByOneCar(dto);
        res.json({
            data
        });
    }

    @Post('/statisticsForAllCar')
    async statisticsForAllCar(@Body() dto:statisticsForAllCarDto,@Res() res:Response)
    {
        
      const data = await this.bookingservice.statisticsForAllCar(dto);         
        res.json({data});
    }


}
