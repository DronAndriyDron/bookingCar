import { IsDate, IsDateString, IsNotEmpty, IsNumber, IsPhoneNumber, Length, MaxLength, MinLength } from "class-validator";


export class createBookingDto{
   
   @IsDateString()
   @IsNotEmpty()
   start_booking_car:string;

   @IsDateString()
   @IsNotEmpty()
   end_booking_car:string;
   
   @IsNotEmpty()
   full_client_name:string;

   @IsPhoneNumber()
   @IsNotEmpty()
   client_phone_number:string;

   
   @IsNotEmpty()
   @Length(10)
   
   IPN_client:string;

   
   car_id:number;
}