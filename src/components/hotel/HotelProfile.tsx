"use client";

import { HotelWithRooms } from "@/components/hotel/AddHotelForm";
import useLocation from "@/hooks/useLocation";
import { Booking } from "@prisma/client";
import Image from "next/image";
import AmenityItem from "../AmenityItem";
import { MapPin, Waves } from "lucide-react";
import RoomCard from "../room/RoomCard";

const HotelProfile = ({
  hotel,
  bookings,
}: {
  hotel: HotelWithRooms;
  bookings?: Booking[];
}) => {
  const { getCountryByCode, getStateByCode } = useLocation();
  const country = getCountryByCode(hotel.country);
  const state = getStateByCode(hotel.country, hotel.state);

  return (
    <div className="flex flex-col gap-6 pb-2">
      <div className="aspect-square overflow-hidden relative w-full bg-red-200 h-[200px] md:h-[400px] rounded-lg">
        <Image
          fill
          className="object-cover"
          src={hotel.image}
          alt={hotel.title}
        />
      </div>
      <div>
        <h3 className="font-semibold text-xl md:text-3xl"> {hotel.title} </h3>
        <div className="font-semibold mt-4">
          <AmenityItem>
            <MapPin className="h-4 w-4" /> {country?.name} , {state?.name} ,{" "}
            {hotel.city}
          </AmenityItem>
        </div>
        <h3 className="font-semibold text-lg mt-4 mb-2">Location Details</h3>
        <p className="text-primary/90 mb-2">{hotel.locationDescription}</p>
        <h3 className="font-semibold text-lg mt-4 mb-2">About this hotel</h3>
        <p className="text-primary/90 mb-2">{hotel.description}</p>
        <h3 className="font-semibold text-lg mt-4 mb-2">Popular Amenities</h3>
        <div className="grid grid-cols-2 gap-4 content-start text-sm md:grid-cols-3">
          {hotel.swimmingPool && (
            <AmenityItem>
              <Waves className="w-4 h-4" /> Pool
            </AmenityItem>
          )}
          {hotel.gym && (
            <AmenityItem>
              <Waves className="w-4 h-4" /> Pool
            </AmenityItem>
          )}
          {hotel.spa && (
            <AmenityItem>
              <Waves className="w-4 h-4" /> Pool
            </AmenityItem>
          )}
          {hotel.restaurant && (
            <AmenityItem>
              <Waves className="w-4 h-4" /> Pool
            </AmenityItem>
          )}
          {hotel.shopping && (
            <AmenityItem>
              <Waves className="w-4 h-4" /> Pool
            </AmenityItem>
          )}
          {hotel.freeParking && (
            <AmenityItem>
              <Waves className="w-4 h-4" /> Pool
            </AmenityItem>
          )}
        </div>
      </div>
      <div>
        {!!hotel.rooms.length && (
          <div>
            <h3 className="font-semibold text-lg my-4">Rooms</h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {hotel.rooms.map((room) => {
                return (
                  <RoomCard
                    key={room.id}
                    hotel={hotel}
                    room={room}
                    bookings={bookings}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HotelProfile;
