import { Room } from "@prisma/client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type RoomDataType = {
  room: Room;
  totalPrice: number;
  breakFastIncluded: boolean;
  startDate: Date;
  endDate: Date;
};

type BookRoomStore = {
  bookingRoomData: RoomDataType | null;
  paymentIntent: string | null;
  clientSecret: string | undefined;
  setRoomData: (data: RoomDataType) => void;
  setPaymentIntent: (intent: string) => void;
  setClientSecret: (secret: string) => void;
  resetBookRoom: () => void;
};

const useBookRoom = create<BookRoomStore>()(
  persist(
    (set) => ({
      bookingRoomData: null,
      paymentIntent: null,
      clientSecret: undefined,
      setRoomData: (data: RoomDataType) => set({ bookingRoomData: data }),
      setPaymentIntent: (paymentIntent: string) => set({ paymentIntent }),
      setClientSecret: (clientSecret: string) => set({ clientSecret }),
      resetBookRoom: () =>
        set({
          bookingRoomData: null,
          paymentIntent: null,
          clientSecret: undefined,
        }),
    }),
    {
      name: "bookRoomStore",
    }
  )
);

export default useBookRoom;
