import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";

export const getBookingsByUserId = async () => {
  try {
    const { userId } = auth();

    if (!userId) return new Error("Unauthorized");

    const bookings = await prismadb.booking.findMany({
      where: {
        userId,
      },
      include: {
        Hotel: true,
        Room: true,
      },
      orderBy: {
        bookedAt: "desc",
      },
    });

    if (!bookings) return null;

    return bookings;
  } catch (error: any) {
    console.log(error);
    throw new Error("Failed to fetch bookings", error.message);
  }
};
