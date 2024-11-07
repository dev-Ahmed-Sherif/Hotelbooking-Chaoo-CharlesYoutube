"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { differenceInCalendarDays } from "date-fns";
import { useAuth } from "@clerk/nextjs";
import moment from "moment";
import axios from "axios";
import { Booking, Hotel, Room } from "@prisma/client";
import {
  AirVent,
  Bath,
  Bed,
  BedDouble,
  Castle,
  Home,
  MountainSnow,
  Ship,
  Trees,
  Tv,
  Users,
  UtensilsCrossed,
  VolumeX,
  Wifi,
  MapPin,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

import AmenityItem from "@/components/AmenityItem";

import { useToast } from "@/hooks/use-toast";
import useBookRoom from "@/hooks/useBookRooms";
import useLocation from "@/hooks/useLocation";

export type MyBookingCardProps = {
  booking: Booking & { Room: Room | null } & { Hotel: Hotel | null };
};

const MyBookingCard = ({ booking }: MyBookingCardProps) => {
  const { Hotel, Room } = booking;

  const [bookingIsLoading, setBookingIsLoading] = useState<boolean>(false);

  const { getCountryByCode, getStateByCode } = useLocation();
  const { setRoomData, paymentIntentId, setClientSecret, setPaymentIntentId } =
    useBookRoom();

  const router = useRouter();
  const { userId } = useAuth();
  const { toast } = useToast();

  if (!Hotel || !Room) return <div> Missing Data </div>;

  const country = getCountryByCode(Hotel.country);
  const state = getStateByCode(Hotel.country, Hotel.state);

  const startDate = moment(booking.startDate).format("MMMM Do YYYY");
  const endDate = moment(booking.endDate).format("MMMM Do YYYY");
  const dayCount = differenceInCalendarDays(booking.startDate, booking.endDate);

  const handleBookRoom = () => {
    if (!userId) {
      return toast({
        variant: "destructive",
        description: "Oops! Make sure you are logged in",
      });
    }
    if (!Hotel?.userId) {
      return toast({
        variant: "destructive",
        description: "Something went wrong! refresh and try again!",
      });
    }
    setBookingIsLoading(true);
    const bookingRoomData = {
      Room,
      totalPrice: booking.totalPrice,
      breakFastIncluded: booking.breakFastIncluded,
      startDate: booking.startDate,
      endDate: booking.endDate,
    };
    setRoomData(bookingRoomData as any);
    fetch("/api/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        booking: {
          hotelOwnerId: Hotel.userId,
          hotelId: Hotel.id,
          roomId: Room.id,
          startDate: bookingRoomData.startDate,
          endDate: bookingRoomData.endDate,
          breakFastIncluded: bookingRoomData.breakFastIncluded,
          totalPrice: bookingRoomData.totalPrice,
        },
        payment_intent_id: paymentIntentId,
      }),
    })
      .then((res) => {
        setBookingIsLoading(false);
        if (res.status === 401) {
          return router.push("/login");
        }

        return res.json();
      })
      .then((data) => {
        setClientSecret(data.paymentIntent.client_secret);
        setPaymentIntentId(data.paymentIntent.id);
        router.push("/book-room");
      })
      .catch((error: any) => {
        console.log("Error:", error);
        toast({
          variant: "destructive",
          description: `Error! ${error.message}`,
        });
      });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{Hotel.title}</CardTitle>
        <CardDescription>
          <AmenityItem>
            <MapPin className="w-4 h-4" /> {country?.name} , {state?.name} ,
            {Hotel.city}
          </AmenityItem>
        </CardDescription>
        <CardTitle>{Room.title}</CardTitle>
        <CardDescription>{Room.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="aspect-square overflow-hidden relative h-[200px] rounded-lg">
          <Image
            className="object-cover"
            fill
            src={Room.image as string}
            alt={Room.title as string}
          />
        </div>
        <div className="grid grid-cols-2 gap-4 content-start text-sm">
          <AmenityItem>
            <Bed className="h-4 w-4" /> {Room.bedCount} Bed {"(s)"}
          </AmenityItem>
          <AmenityItem>
            <Users className="h-4 w-4" /> {Room.guestCount} Guest {"(s)"}
          </AmenityItem>
          <AmenityItem>
            <Bath className="h-4 w-4" /> {Room.bathroomCount} Bathroom {"(s)"}
          </AmenityItem>
          {!!Room.kingBed && (
            <AmenityItem>
              <BedDouble className="h-4 w-4" /> {Room.kingBed} King Bed {"(s)"}
            </AmenityItem>
          )}
          {!!Room.queenBed && (
            <AmenityItem>
              <BedDouble className="h-4 w-4" /> {Room.queenBed} Queen Bed
              {"(s)"}
            </AmenityItem>
          )}
          {Room.roomService && (
            <AmenityItem>
              <UtensilsCrossed className="h-4 w-4" /> Room Service
            </AmenityItem>
          )}
          {Room.Tv && (
            <AmenityItem>
              <Tv className="h-4 w-4" /> TV
            </AmenityItem>
          )}
          {Room.balcony && (
            <AmenityItem>
              <Home className="h-4 w-4" /> Balcony
            </AmenityItem>
          )}
          {Room.freeWifi && (
            <AmenityItem>
              <Wifi className="h-4 w-4" /> Free Wifi
            </AmenityItem>
          )}
          {Room.cityView && (
            <AmenityItem>
              <Castle className="h-4 w-4" /> City View
            </AmenityItem>
          )}
          {Room.oceanView && (
            <AmenityItem>
              <Ship className="h-4 w-4" /> Ocean View
            </AmenityItem>
          )}
          {Room.forestView && (
            <AmenityItem>
              <Trees className="h-4 w-4" /> Forest View
            </AmenityItem>
          )}
          {Room.mountainView && (
            <AmenityItem>
              <MountainSnow className="h-4 w-4" /> Mountain View
            </AmenityItem>
          )}
          {Room.airCondition && (
            <AmenityItem>
              <AirVent className="h-4 w-4" /> Air Condition
            </AmenityItem>
          )}
          {Room.soundProofed && (
            <AmenityItem>
              <VolumeX className="h-4 w-4" /> Sound Proofed
            </AmenityItem>
          )}
        </div>
        <Separator />
        <div className="flex flex-col gap-4 justify-between">
          <div>
            Room Price:
            <span className="font-bold text-lg">${Room.roomPrice}</span>
            <span className="text-base"> /24hrs </span>
          </div>
          <div>
            BreakFast Price:
            <span className="font-bold text-lg">${Room.breakFastPrice}</span>
          </div>
        </div>
        <Separator />
        <div className="flex flex-col gap-2">
          <CardTitle> Booking Details </CardTitle>
          <div className="text-primary/90">
            <div>
              {" "}
              Room booked by {booking.userName} for {dayCount} days at{" "}
              {moment(booking.bookedAt).fromNow()}{" "}
            </div>
            <div>Check-in: {startDate} at 5PM</div>
            <div>Check-out: {endDate} at 5PM</div>
            {booking.breakFastIncluded && <div>Breakfast will be served</div>}
            {booking.paymentStatus ? (
              <div className="text-teal-500">
                Paid ${booking.totalPrice} - Room Reserved
              </div>
            ) : (
              <div className="text-rose-500">
                Not Paid ${booking.totalPrice} - Room Not Reserved
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <Button
          disabled={bookingIsLoading}
          variant="outline"
          onClick={() => router.push(`/hotel-details/${Hotel.id}`)}
        >
          View Hotel
        </Button>
        {!booking.paymentStatus && booking.userId === userId && (
          <Button
            disabled={bookingIsLoading}
            variant="outline"
            onClick={() => handleBookRoom()}
          >
            Pay Now
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default MyBookingCard;
