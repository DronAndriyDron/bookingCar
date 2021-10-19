import { IsNotEmpty, IsNumber } from "class-validator";



export class closeBookingDto{
    
    
    @IsNotEmpty()
    booking_id:number;
    
    
    @IsNotEmpty()
    totalKilomiters:number;
}