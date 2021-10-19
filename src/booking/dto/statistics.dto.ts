import { IsDateString, IsNotEmpty } from "class-validator";




export class statisticsForAllCarDto
{
    
    
    @IsNotEmpty()
    @IsDateString()
    BeginOfTheRange:Date;
    
    @IsNotEmpty()
    @IsDateString()
    EndOfTheRange:Date;


}
export class statisticsByOneCarDto{
 
    @IsNotEmpty()
    @IsDateString()
    BeginOfTheRange:Date;
    
    @IsNotEmpty()
    @IsDateString()
    EndOfTheRange:Date;

    @IsNotEmpty()
    car_id:number|string;

}

