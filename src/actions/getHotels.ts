"use server";

import prismadb from "@/lib/prismadb";

export const getHotels = async (searchParams: {
  title: string;
  country: string;
  state: string;
  city: string;
}) => {
  // Fetch all hotels from your database
  try {
    const { title, country, state, city } = searchParams;
    const hotels = await prismadb.hotel.findMany({
      where: {
        title: { contains: title },
        country,
        state,
        city,
      },
      include: { rooms: true },
      orderBy: {
        addedAt: "desc",
      },
    });
    return hotels;
  } catch (error: any) {
    console.log(error);
    throw new Error("Failed to fetch hotels", error.message);
  }
};
