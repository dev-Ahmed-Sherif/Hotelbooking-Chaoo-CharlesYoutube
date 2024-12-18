"use client";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { loadStripe, StripeElementsOptions } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

import useBookRoom from "@/hooks/useBookRooms";

import { Button } from "@/components/ui/button";
import RoomCard from "@/components/room/RoomCard";
import RoomPaymentForm from "@/components/booking/RoomPaymentForm";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string
);

const BookRoomForm = () => {
  const { bookingRoomData, clientSecret } = useBookRoom();

  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);
  const [pageLoaded, setPageLoaded] = useState<boolean>(false);
  const { theme } = useTheme();
  const router = useRouter();

  // useEffect(() => {
  //   setPageLoaded(true);
  // }, []);

  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: theme === "dark" ? "night" : "stripe",
      labels: "floating",
    },
  };

  const handleSetPaymentSuccess = (value: boolean) => {
    setPaymentSuccess(value);
  };

  if (pageLoaded && !paymentSuccess && (!bookingRoomData || !clientSecret))
    return (
      <div className="flex items-center flex-col gap-4">
        <div className="text-rose-500 text-center">
          Oops! This page could not be propery loaded ....
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.push("/")}>
            Back to Home
          </Button>
          <Button onClick={() => router.push("/my-bookings")}>
            View My Bookings
          </Button>
        </div>
      </div>
    );

  if (paymentSuccess)
    return (
      <div className="flex items-center flex-col gap-4">
        <div className="text-teal-500 text-center">Payment Success</div>
        <Button onClick={() => router.push("/my-bookings")}>
          View Bookings
        </Button>
      </div>
    );

  return (
    <div className="max-w-[700px] mx-auto">
      {clientSecret && bookingRoomData && (
        <>
          <h3 className="text-2xl font-semibold mb-6">
            Complete payment to reserve this room!
          </h3>
          <div className="mb-6">
            <RoomCard room={bookingRoomData.room} />
          </div>
          <Elements options={options} stripe={stripePromise}>
            <RoomPaymentForm
              clientSecret={clientSecret}
              handleSetPaymentSuccess={handleSetPaymentSuccess}
            />
          </Elements>
        </>
      )}
    </div>
  );
};

export default BookRoomForm;
