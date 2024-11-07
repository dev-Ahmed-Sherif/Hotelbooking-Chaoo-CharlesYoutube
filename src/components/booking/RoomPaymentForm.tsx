"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import axios from "axios";

import { toast } from "@/hooks/use-toast";

import {
  AddressElement,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import moment from "moment";
import { Terminal } from "lucide-react";

import useBookRoom from "@/hooks/useBookRooms";

import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Booking } from "@prisma/client";
import { start } from "repl";
import { endOfDay, isWithinInterval, startOfDay } from "date-fns";

type RoomPaymentFormProps = {
  clientSecret: string;
  handleSetPaymentSuccess: (value: boolean) => void;
};

type DateRangesType = {
  startDate: Date;
  endDate: Date;
};

const RoomPaymentForm = ({
  clientSecret,
  handleSetPaymentSuccess,
}: RoomPaymentFormProps) => {
  const [isLoading, setIsLoading] = useState<Boolean>(false);
  const { bookingRoomData, resetBookRoom } = useBookRoom();

  const { theme } = useTheme();
  const router = useRouter();

  const stripe = useStripe();
  const elements = useElements();

  const startDate = moment(bookingRoomData?.startDate).format("MMMM Do YYYY");
  const endDate = moment(bookingRoomData?.endDate).format("MMMM Do YYYY");

  useEffect(() => {
    if (!stripe) return;
    if (!clientSecret) return;
    handleSetPaymentSuccess(false);
    setIsLoading(false);
  }, [stripe, clientSecret, handleSetPaymentSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!stripe || !elements || !bookingRoomData) return;

    try {
      // TODO date overlaps move to Room Card Function handleBookRoom
      const bookings = await axios.get(
        `/api/booking/${bookingRoomData.room.id}`
      );
      const roomBookingDates = bookings.data.map((booking: Booking) => {
        return {
          startDate: booking.startDate,
          endDate: booking.endDate,
        };
      });

      const overLapFound = hasOverlap(
        bookingRoomData.startDate,
        bookingRoomData.endDate,
        roomBookingDates
      );

      if (overLapFound) {
        setIsLoading(false);
        return toast({
          variant: "destructive",
          description:
            "Oops! Some of the days you are trying to book have already been reserved. Please go back and select different dates or rooms",
        });
      }
      ///////// End of Change
      stripe
        .confirmPayment({ elements, redirect: "if_required" })
        .then((result) => {
          if (!result.error) {
            axios
              .patch(`/api/booking/${result.paymentIntent.id}`)
              .then(() => {
                toast({
                  variant: "success",
                  description: "🎉 Room Reserved Successfully!",
                });
                router.refresh();
                resetBookRoom();
                handleSetPaymentSuccess(true);
                setIsLoading(false);
              })
              .catch((error) => {
                console.log(error);
                toast({
                  variant: "destructive",
                  description: "Something went wrong",
                });
                setIsLoading(false);
              });
          } else {
            setIsLoading(false);
          }
        });
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };

  const hasOverlap = (
    startDate: Date,
    endDate: Date,
    dateRanges: DateRangesType[]
  ) => {
    const targetInterval = {
      start: startOfDay(new Date(startDate)),
      end: endOfDay(new Date(endDate)),
    };

    for (const range of dateRanges) {
      const rangeStart = startOfDay(new Date(range.startDate));
      const rangeEnd = endOfDay(new Date(range.endDate));

      if (
        isWithinInterval(targetInterval.start, {
          start: rangeStart,
          end: rangeEnd,
        }) ||
        isWithinInterval(targetInterval.end, {
          start: rangeEnd,
          end: rangeEnd,
        }) ||
        (targetInterval.start < rangeStart && targetInterval.end > rangeEnd)
      ) {
        return true;
      }
    }

    return false;
  };

  if (!bookingRoomData?.startDate || !bookingRoomData?.endDate)
    return <div> Error: Missing reservation dates..... </div>;

  return (
    <form onSubmit={handleSubmit} id="payment-form">
      <h2 className="font-semibold mb-2 text-lg"> Billing Address </h2>
      <AddressElement
        options={{
          mode: "billing",
          //   allowedCountries: ["US", "KE"],
        }}
      />
      <h2 className="font-semibold mb-2 text-lg"> Payment Information </h2>
      <PaymentElement id="payment-element" options={{ layout: "tabs" }} />
      <div className="flex flex-col gap-1">
        <Separator />
        <div className="flex flex-col gap-1">
          <h2 className="font-semibold mb-1 text-lg"> Your Booking Summery </h2>
          <div>You will check-in on {startDate} at 5PM</div>
          <div>You will check-in on {endDate} at 5PM</div>
          {bookingRoomData?.breakFastIncluded && (
            <div>You will be served breakfast each day at 8 AM</div>
          )}
        </div>
        <Separator />
        <div className="font-bold text-lg mb-4">
          {bookingRoomData?.breakFastIncluded && (
            <div>Breakfast Price :${bookingRoomData?.breakFastIncluded}</div>
          )}
          Total Price: ${bookingRoomData?.totalPrice}
        </div>
      </div>

      {isLoading && (
        <Alert className="bg-indigo-600 text-white">
          <Terminal className="h-4 w-4 stroke-white" />
          <AlertTitle>One last step!</AlertTitle>
          <AlertDescription>
            Your Hotel was created successfully 🔥
            <div>Please add some rooms to complete your hotel setup!</div>
          </AlertDescription>
        </Alert>
      )}
      <Button disabled={isLoading as boolean}>
        {isLoading ? "Processing Payment........" : "Pay Now"}
      </Button>
    </form>
  );
};

export default RoomPaymentForm;
