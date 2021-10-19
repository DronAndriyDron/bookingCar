

create table Car (
    id SERIAL PRIMARY KEY,
    brand VARCHAR(255),
    vin VARCHAR (255),
    model VARCHAR(255),
    stateNumber VARCHAR(255)
)


create table Booking(
   id SERIAL PRIMARY KEY,
   start_booking_car TIMESTAMP NOT NULL,
   end_booking_car TIMESTAMP NOT NULL,
   full_client_name VARCHAR(255) NOT NULL,
   client_phone_number VARCHAR(13) NOT NULL,
   discount INTEGER,
   kilometers INTEGER,
   total_price INTEGER,
   IPN_client VARCHAR (10),
   car_id INTEGER NOT NULL,
   FOREIGN KEY (car_id) REFERENCES Car(id) ON DELETE CASCADE

)