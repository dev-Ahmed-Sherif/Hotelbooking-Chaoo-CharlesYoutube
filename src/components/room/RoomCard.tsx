"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import axios from "axios";
import { DateRange } from "react-day-picker";
import { Booking, Hotel, Room } from "@prisma/client";
import {
  AirVent,
  Bath,
  Bed,
  BedDouble,
  Castle,
  Home,
  Loader2,
  MountainSnow,
  Pencil,
  Ship,
  Trash,
  Trees,
  Tv,
  Users,
  UtensilsCrossed,
  VolumeX,
  Wand2,
  Wifi,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import AmenityItem from "@/components/AmenityItem";
import AddRoomForm from "@/components/room/AddRoomForm";
import DatePickerWithRange from "@/components/room/DateRangePicker";

import { useToast } from "@/hooks/use-toast";
import { differenceInCalendarDays, eachDayOfInterval } from "date-fns";
import { Checkbox } from "../ui/checkbox";
import { useAuth } from "@clerk/nextjs";
import useBookRoom from "@/hooks/useBookRooms";

type RoomCardProps = {
  hotel?: Hotel & {
    rooms: Room[];
  };
  room?: Room;
  bookings?: Booking[];
};

const RoomCard = ({ hotel, room, bookings = [] }: RoomCardProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [bookingIsLoading, setBookingIsLoading] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const [date, setDate] = useState<DateRange | undefined>();
  const [totalPrice, setTotalPrice] = useState<number | undefined>(
    room?.roomPrice
  );
  const [includeBreakFast, setIncludeBreakFast] = useState<boolean>(false);
  const [days, setDays] = useState<number>(1);

  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const { userId } = useAuth();

  const isHotelDetailsPage = pathname.includes("hotel-details");
  const isBookRoom = pathname.includes("book-room");

  const { setRoomData, paymentIntentId, setClientSecret, setPaymentIntentId } =
    useBookRoom();

  useEffect(() => {
    if (date && date.from && date.to) {
      const dayCount = differenceInCalendarDays(date.to, date.from);
      setDays(dayCount);
      if (dayCount && room?.roomPrice) {
        if (includeBreakFast && room?.breakFastPrice) {
          setTotalPrice(
            dayCount * room?.roomPrice + dayCount * room?.breakFastPrice
          );
        } else {
          setTotalPrice(dayCount * room?.roomPrice);
        }
      } else {
        setTotalPrice(room?.roomPrice);
      }
    }
  }, [date, room?.roomPrice, includeBreakFast, room?.breakFastPrice]);

  // Prevent Booked dates to be selected when making new bookings
  const disabledDates = useMemo(() => {
    let dates: Date[] = [];

    const roomBookings = bookings.filter(
      (booking) => booking.roomId === room?.id && booking.paymentStatus
    );

    roomBookings.forEach((booking) => {
      const range = eachDayOfInterval({
        start: new Date(booking.startDate),
        end: new Date(booking.endDate),
      });

      dates = [...dates, ...range];
    });
    return dates;
  }, [bookings, room]);

  const handleDialogOpen = () => {
    setOpen((prev) => !prev);
  };

  const handleRoomDelete = (room: Room) => {
    setIsLoading(true);
    // Delete the room from the database
    const imageKey = room.image.substring(room.image.lastIndexOf("/") + 1);

    axios
      .post("/api/uploadthing/delete", { imageKey })
      .then(() => {
        axios
          .delete(`/api/room/${room.id}`)
          .then(() => {
            router.refresh();
            toast({
              variant: "success",
              description: "Room Deleted!",
            });
            setIsLoading(false);
          })
          .catch(() => {
            setIsLoading(false);
            toast({
              variant: "destructive",
              description: "Something went wrong!",
            });
          });
      })
      .catch(() => {
        setIsLoading(false);
        toast({
          variant: "destructive",
          description: "Something went wrong!",
        });
      });
  };

  const handleBookRoom = () => {
    if (!userId) {
      return toast({
        variant: "destructive",
        description: "Oops! Make sure you are logged in",
      });
    }
    if (!hotel?.userId) {
      return toast({
        variant: "destructive",
        description: "Something went wrong! refresh and try again!",
      });
    }
    if (date?.from && date?.to) {
      setBookingIsLoading(true);
      const bookingRoomData = {
        room,
        totalPrice,
        breakFastIncluded: includeBreakFast,
        startDate: date.from,
        endDate: date.to,
      };
      setRoomData(bookingRoomData as any);
      fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          booking: {
            hotelOwnerId: hotel.userId,
            hotelId: hotel.id,
            roomId: room?.id,
            startDate: date.from,
            endDate: date.to,
            breakFastIncluded: includeBreakFast,
            totalPrice: totalPrice,
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
    } else {
      toast({
        variant: "destructive",
        description: "Please select a date to book",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{room?.title}</CardTitle>
        <CardDescription>{room?.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="aspect-square overflow-hidden relative h-[200px] rounded-lg">
          <Image
            className="object-cover"
            fill
            src={room?.image as string}
            alt={room?.title as string}
          />
        </div>
        <div className="grid grid-cols-2 gap-4 content-start text-sm">
          <AmenityItem>
            <Bed className="h-4 w-4" /> {room?.bedCount} Bed {"(s)"}
          </AmenityItem>
          <AmenityItem>
            <Users className="h-4 w-4" /> {room?.guestCount} Guest {"(s)"}
          </AmenityItem>
          <AmenityItem>
            <Bath className="h-4 w-4" /> {room?.bathroomCount} Bathroom {"(s)"}
          </AmenityItem>
          {!!room?.kingBed && (
            <AmenityItem>
              <BedDouble className="h-4 w-4" /> {room?.kingBed} King Bed {"(s)"}
            </AmenityItem>
          )}
          {!!room?.queenBed && (
            <AmenityItem>
              <BedDouble className="h-4 w-4" /> {room?.queenBed} Queen Bed
              {"(s)"}
            </AmenityItem>
          )}
          {room?.roomService && (
            <AmenityItem>
              <UtensilsCrossed className="h-4 w-4" /> Room Service
            </AmenityItem>
          )}
          {room?.Tv && (
            <AmenityItem>
              <Tv className="h-4 w-4" /> TV
            </AmenityItem>
          )}
          {room?.balcony && (
            <AmenityItem>
              <Home className="h-4 w-4" /> Balcony
            </AmenityItem>
          )}
          {room?.freeWifi && (
            <AmenityItem>
              <Wifi className="h-4 w-4" /> Free Wifi
            </AmenityItem>
          )}
          {room?.cityView && (
            <AmenityItem>
              <Castle className="h-4 w-4" /> City View
            </AmenityItem>
          )}
          {room?.oceanView && (
            <AmenityItem>
              <Ship className="h-4 w-4" /> Ocean View
            </AmenityItem>
          )}
          {room?.forestView && (
            <AmenityItem>
              <Trees className="h-4 w-4" /> Forest View
            </AmenityItem>
          )}
          {room?.mountainView && (
            <AmenityItem>
              <MountainSnow className="h-4 w-4" /> Mountain View
            </AmenityItem>
          )}
          {room?.airCondition && (
            <AmenityItem>
              <AirVent className="h-4 w-4" /> Air Condition
            </AmenityItem>
          )}
          {room?.soundProofed && (
            <AmenityItem>
              <VolumeX className="h-4 w-4" /> Sound Proofed
            </AmenityItem>
          )}
        </div>
        <Separator />
        <div className="flex flex-col gap-4 justify-between">
          <div>
            Room Price:
            <span className="font-bold text-lg">${room?.roomPrice}</span>
            <span className="text-base"> /24hrs </span>
          </div>
          <div>
            BreakFast Price:
            <span className="font-bold text-lg">${room?.breakFastPrice}</span>
          </div>
        </div>
      </CardContent>
      {!isBookRoom && (
        <CardFooter>
          {isHotelDetailsPage ? (
            <div className="flex flex-col gap-6">
              <div>
                <div className="mb-2">
                  Select days that you will spend in this room
                </div>
                <DatePickerWithRange
                  date={date}
                  setDate={setDate}
                  disabledDates={disabledDates}
                />
              </div>
              {room?.breakFastPrice != undefined && room?.breakFastPrice > 0 ? (
                <>
                  <p className="mb-2">
                    Do you want to served breakfast each day
                  </p>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="breakfast"
                      onCheckedChange={(value) => setIncludeBreakFast(!!value)}
                    />
                    <label htmlFor="breakfast"> Include BreakFast </label>
                  </div>
                </>
              ) : (
                <></>
              )}
              <div>
                Total Price:<span className="font-bold">${totalPrice}</span>for
                <span className="font-bold"> {days} </span>
              </div>
              <Button
                onClick={() => handleBookRoom()}
                disabled={bookingIsLoading}
                type="button"
              >
                {bookingIsLoading ? (
                  <Loader2 className="mr-2 h-4 w-4" />
                ) : (
                  <Wand2 className="mr-2 h-4 w-4" />
                )}
                {bookingIsLoading ? "Loading ....." : "Book Room"}
              </Button>
            </div>
          ) : (
            <div className="flex w-full justify-between">
              <Button
                onClick={() => handleRoomDelete(room as Room)}
                disabled={isLoading}
                type="button"
                variant="ghost"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4" /> Deleting .....
                  </>
                ) : (
                  <>
                    <Trash className="mr-2 h-4 w-4" /> Delete
                  </>
                )}
              </Button>
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="max-w-[150px]"
                  >
                    <Pencil className="mr-2 h-4 w-4" /> Update Room
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-[64rem]">
                  <DialogHeader className="max-w-[900px] w-[90%]">
                    <DialogTitle>Update Room</DialogTitle>
                    <DialogDescription className="px-2">
                      Make changes to this room
                    </DialogDescription>
                  </DialogHeader>
                  <AddRoomForm
                    hotel={hotel}
                    room={room}
                    handleDialogOpen={handleDialogOpen}
                  />
                </DialogContent>
              </Dialog>
            </div>
          )}
        </CardFooter>
      )}
    </Card>
  );
};

export default RoomCard;
