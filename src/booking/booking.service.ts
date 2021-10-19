import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { closeBookingDto } from './dto/closeBooking.dto';
import { createBookingDto } from './dto/createBooking.dto';
import { Discounts, MaximumTermOfTheOrder, Tariff } from './dto/list.types';
import { ResponseCloseBookings } from './dto/responseCLB';
import { ResponseCreateBooking } from './dto/responseCRB';
import { statisticsByOneCarDto, statisticsForAllCarDto } from './dto/statistics.dto';
const db = require('./database/db')
@Injectable()
export class BookingService {
    
    async createBooking(dto:createBookingDto):Promise<ResponseCreateBooking>{
        
        let data:any;
        let check3days:any;
        const StartBooking:Date = new Date (dto.start_booking_car);
        const EndBooking:Date = new Date (dto.end_booking_car);
        const trivialityOfRent:number = Math.floor((EndBooking.getTime() - StartBooking.getTime())/(1000*60*60*24));
        let discount:number=0;

        try{
            check3days = await db.query(`SELECT * FROM Booking WHERE client_phone_number = $1 AND ipn_client = $2`,

            [dto.client_phone_number,dto.IPN_client]);
        }
        catch(err)
         {
             
            throw new HttpException(`Error from DB , error code ${err.code} `,HttpStatus.INTERNAL_SERVER_ERROR); 
         }
         
         
         if(check3days.rows.length>0)
         {
             const lastBookingDate:Date =new Date(check3days.rows[check3days.rows.length-1].end_booking_car);

             const daysHavePassed:number = Math.floor((StartBooking.getTime() - lastBookingDate.getTime())/(1000*60*60*24));
            
             if(daysHavePassed<=3){
                throw new HttpException('пауза между бронированием должна составлять не менее 3 дней',HttpStatus.NOT_ACCEPTABLE);
             }

                  
         }

        if(trivialityOfRent>=3&&trivialityOfRent<=5)
        {
             discount=Discounts.FIVE_PERCENT;
        }
        else if(trivialityOfRent>=6&&trivialityOfRent<=14)
        {
            discount=Discounts.TEN_PERCENT;
        }
        else if(trivialityOfRent>=15&&trivialityOfRent<=30)
        {
           discount=Discounts.FIFTEEN_PERCENT;
        }
            
        
          
        
        if(StartBooking.getDay()===6||StartBooking.getDay()===0){
             throw new HttpException('начало аренды не может приходиться на выходной день ',HttpStatus.NOT_ACCEPTABLE);
        }
        if(EndBooking.getDay()===6|| EndBooking.getDay()===0){
            throw new HttpException('конец аренды не может приходиться на выходной день ',HttpStatus.NOT_ACCEPTABLE);
        }
        if(trivialityOfRent>MaximumTermOfTheOrder.MAXTERM){
            throw new HttpException('максимальный срок аренды не должен превышать 30 дней ',HttpStatus.NOT_ACCEPTABLE);
        }

       
        

      try{
         data = await db.query('INSERT INTO Booking (start_booking_car,end_booking_car,full_client_name,client_phone_number,discount,kilometers,total_price,'+

         'IPN_client,car_id) values($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *',

        [dto.start_booking_car,dto.end_booking_car,dto.full_client_name,dto.client_phone_number,discount,0,0,dto.IPN_client,dto.car_id]);
      }
      catch(err)
         {
             
            throw new HttpException(`Error from DB , error code ${err.code} `,HttpStatus.INTERNAL_SERVER_ERROR); 
         }
     
     
      
      return data.rows[0];
    
      
        
    }
    async closeBooking(dto:closeBookingDto):Promise<ResponseCloseBookings>
    {

         let tariff:Tariff;
         let getBooking:any;

         try{
            
            getBooking = await db.query(`SELECT * FROM Booking WHERE id = $1`,[false]);
         }
         catch(err)
         {
            throw new HttpException(`Error from DB , error code ${err.code} `,HttpStatus.INTERNAL_SERVER_ERROR); 
            
         }
         
         const countBookingDays:number = Math.floor((new Date(getBooking.rows[0].end_booking_car).getTime() -

         new Date(getBooking.rows[0].start_booking_car).getTime())/(1000*60*60*24));

         const average:number = Math.round(dto.totalKilomiters/countBookingDays);

         if(average<=200){
             tariff=Tariff.FIRST;
         }
         if(average>200 && average<=350)
         {
             tariff=Tariff.SECOND;
         }
         if(average>=350)
         {
             tariff=Tariff.THIRD;

         }
        console.log(" tariff ",tariff);

        console.log(" countBookingDays ",countBookingDays);
                       
        const Price= tariff*countBookingDays;
        const discount=Math.round(Price/100)*getBooking.rows[0].discount;
        const totalPrice = Price-discount;
        
        
         return{
             price:totalPrice,
             message:`срок действия аренды закончился , сумма к оплате ${totalPrice} рублей`
         }

    }
    async statisticsByOneCar(dto:statisticsByOneCarDto)
    {

          let car;
          let averageForCAr;

          try{
          averageForCAr = await db.query(`SELECT * FROM Booking WHERE (car_id = $1 AND start_booking_car >= $2 AND start_booking_car <= $3) or `+

          `(car_id = $1 AND end_booking_car >= $2 AND end_booking_car <= $3)`,[dto.car_id,dto.BeginOfTheRange,dto.EndOfTheRange]);

           car = await db.query('Select * FROM Car WHERE id = $1',[dto.car_id]);
          }catch(err)
          {

          }

          car=car.rows[0].brand +" "+ car.rows[0].model;

          const daysBetweenRange:number = Math.floor((new Date(dto.EndOfTheRange).getTime() - new Date(dto.BeginOfTheRange).getTime())/(1000*60*60*24));
          
          let numberOfDaysInvolved:number=0;
          
          averageForCAr.rows.forEach(element => {
                
             
              if((new Date(element.start_booking_car).getTime() > new Date(dto.BeginOfTheRange).getTime() && 

              new Date(element.start_booking_car).getTime() < new Date(dto.EndOfTheRange).getTime())

              &&(new Date(element.end_booking_car).getTime() > new Date(dto.BeginOfTheRange).getTime() && new Date(element.end_booking_car).getTime() < 

              new Date(dto.EndOfTheRange).getTime()))
              {
                const daysBetweenRangeOneBooking:number = Math.floor((new Date(element.end_booking_car).getTime() - 

                new Date(element.start_booking_car).getTime())/(1000*60*60*24));

                numberOfDaysInvolved+=daysBetweenRangeOneBooking;
               
              }

              if((new Date(element.start_booking_car).getTime() > new Date(dto.BeginOfTheRange).getTime() && new Date(element.start_booking_car).getTime() < 

              new Date(dto.EndOfTheRange).getTime())&&

                 (new Date(element.end_booking_car).getTime() > new Date(dto.EndOfTheRange).getTime()))
              { 
                  const daysBetweenEndRangeAndEndBooking=Math.floor((new Date(element.end_booking_car).getTime() - 

                  new Date(dto.EndOfTheRange).getTime())/(1000*60*60*24))
                  const daysBetweenRangeOneBooking:number = Math.floor((new Date(element.end_booking_car).getTime() - 

                  new Date(element.start_booking_car).getTime())/(1000*60*60*24));

                  const countDays=daysBetweenRangeOneBooking-daysBetweenEndRangeAndEndBooking;

                  numberOfDaysInvolved+=countDays;
                 
              }

              if((new Date(element.start_booking_car).getTime() < new Date(dto.BeginOfTheRange).getTime())&&

                 (new Date(element.end_booking_car).getTime() > new Date(dto.BeginOfTheRange).getTime()))
              { 
                  const daysBetweenStartRangeAndStartBooking=Math.floor((new Date(dto.BeginOfTheRange).getTime() -

                   new Date(element.start_booking_car).getTime())/(1000*60*60*24))

                  const daysBetweenRangeOneBooking:number = Math.floor((new Date(element.end_booking_car).getTime() -

                   new Date(element.start_booking_car).getTime())/(1000*60*60*24));

                  const countDays=daysBetweenRangeOneBooking-daysBetweenStartRangeAndStartBooking;

                  numberOfDaysInvolved+=countDays;
                 
              }
          });
            
          return `В заданном диапазоне  продолжительностью ${Math.floor((new Date(dto.EndOfTheRange).getTime() -

             new Date(dto.BeginOfTheRange).getTime())/(1000*60*60*24))} дней ${car} отработала ${numberOfDaysInvolved} дней(дня)`
         
    }
    async statisticsForAllCar(dto:statisticsForAllCarDto)
    {

            let averageForCAr;
            let car;
            let Cars_id = await db.query('Select id FROM Car');

            const arrayResult:string[] = [];
            
            Cars_id=Cars_id.rows;

            for(var value in Cars_id)
            {   
                try{
                 averageForCAr = await db.query(`SELECT * FROM Booking WHERE (car_id = $1 AND start_booking_car >= $2 AND start_booking_car <= $3) or `+

                `(car_id = $1 AND end_booking_car >= $2 AND end_booking_car <= $3)`,[Cars_id[value].id,dto.BeginOfTheRange,dto.EndOfTheRange]);

                 car = await db.query('Select * FROM Car WHERE id = $1',[Cars_id[value].id]);
                }catch(err)
                {
                    throw new HttpException(`Error from DB , error code ${err.code} `,HttpStatus.INTERNAL_SERVER_ERROR); 
                }
                

                car=car.rows[0].brand +" "+ car.rows[0].model;

                const daysBetweenRange:number = Math.floor((new Date(dto.EndOfTheRange).getTime() - new Date(dto.BeginOfTheRange).getTime())/(1000*60*60*24));
                
                let numberOfDaysInvolved:number=0;
                
                averageForCAr.rows.forEach(element => {
                      
                   
                    if((new Date(element.start_booking_car).getTime() > new Date(dto.BeginOfTheRange).getTime() && new Date(element.start_booking_car).getTime()

                     < new Date(dto.EndOfTheRange).getTime())

                    &&(new Date(element.end_booking_car).getTime() > new Date(dto.BeginOfTheRange).getTime() && new Date(element.end_booking_car).getTime()

                     < new Date(dto.EndOfTheRange).getTime()))
                    {
                      const daysBetweenRangeOneBooking:number = Math.floor((new Date(element.end_booking_car).getTime() - 
                      
                      new Date(element.start_booking_car).getTime())/(1000*60*60*24));

                      numberOfDaysInvolved+=daysBetweenRangeOneBooking;
                     
                    }
      
                    if((new Date(element.start_booking_car).getTime() > new Date(dto.BeginOfTheRange).getTime() && new Date(element.start_booking_car).getTime()

                     < new Date(dto.EndOfTheRange).getTime())&&

                       (new Date(element.end_booking_car).getTime() > new Date(dto.EndOfTheRange).getTime()))

                    { 
                        const daysBetweenEndRangeAndEndBooking=Math.floor((new Date(element.end_booking_car).getTime() - 

                        new Date(dto.EndOfTheRange).getTime())/(1000*60*60*24))

                        const daysBetweenRangeOneBooking:number = Math.floor((new Date(element.end_booking_car).getTime() - 

                        new Date(element.start_booking_car).getTime())/(1000*60*60*24));

                        const countDays=daysBetweenRangeOneBooking-daysBetweenEndRangeAndEndBooking;

                        numberOfDaysInvolved+=countDays;
                       
                    }
      
                    if((new Date(element.start_booking_car).getTime() < new Date(dto.BeginOfTheRange).getTime())&&

                       (new Date(element.end_booking_car).getTime() > new Date(dto.BeginOfTheRange).getTime()))
                    { 
                        const daysBetweenStartRangeAndStartBooking=Math.floor((new Date(dto.BeginOfTheRange).getTime() - 

                        new Date(element.start_booking_car).getTime())/(1000*60*60*24))

                        const daysBetweenRangeOneBooking:number = Math.floor((new Date(element.end_booking_car).getTime() - 

                        new Date(element.start_booking_car).getTime())/(1000*60*60*24));

                        const countDays=daysBetweenRangeOneBooking-daysBetweenStartRangeAndStartBooking;

                        numberOfDaysInvolved+=countDays;
                       
                    }
                });
                  
                arrayResult.push(`В заданном диапазоне  продолжительностью ${Math.floor((new Date(dto.EndOfTheRange).getTime() -
                    
                     new Date(dto.BeginOfTheRange).getTime())/(1000*60*60*24))} дней ${car} отработала ${numberOfDaysInvolved} дней(дня)`);
            }
           
           
             return arrayResult;
        

    }

}
