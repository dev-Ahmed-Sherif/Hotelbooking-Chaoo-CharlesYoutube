"use server";

import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";

export const getHotelsByUserId = async () => {
  const { userId } = auth();

  if (!userId) throw new Error("Unauthorized");

  try {
    // Fetch hotel data By Id from your database
    const hotels = await prismadb.hotel.findMany({
      where: {
        userId: userId as string,
      },
      include: { rooms: true },
    });
    if (!hotels) return null;
    return hotels;
  } catch (error: any) {
    throw new Error(error.message);
  }
};
