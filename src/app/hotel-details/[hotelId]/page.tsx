import { getHotelById } from "@/actions/getHotelById";
import HotelProfile from "@/components/hotel/HotelProfile";

type HotelDetailsProps = {
  params: {
    hotelId: string;
  };
};

const HotelDetails = async ({ params }: HotelDetailsProps) => {
  const hotel = await getHotelById(params.hotelId);

  if (!hotel) return <div> Oop! Hotel with this Details Not Found</div>;

  return (
    <div>
      <HotelProfile hotel={hotel} />
    </div>
  );
};

export default HotelDetails;
