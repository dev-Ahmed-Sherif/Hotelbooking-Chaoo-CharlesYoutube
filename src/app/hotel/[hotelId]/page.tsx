import { getHotelById } from "@/actions/getHotelById";
import AddHotelForm from "@/components/hotel/AddHotelForm";
import { auth } from "@clerk/nextjs/server";

type HotelPageProps = {
  params: {
    hotelId: string;
  };
};

const Hotel = async ({ params }: HotelPageProps) => {
  //   console.log(params.hotelId);
  const hotel = await getHotelById(params.hotelId);
  const { userId }: { userId: string | null } = auth();

  if (!userId) return <div>Not authenticated....</div>;

  if (hotel && hotel.userId !== userId) return <div>Access Denied....</div>;

  return (
    <div>
      <AddHotelForm hotel={hotel} />
    </div>
  );
};

export default Hotel;
