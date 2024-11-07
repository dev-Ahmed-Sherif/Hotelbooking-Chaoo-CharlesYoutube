import { getHotelsByUserId } from "@/actions/getHotelByUserId";
import { HotelWithRooms } from "@/components/hotel/AddHotelForm";
import HotelList from "@/components/hotel/HotelList";

const MyHotels = async () => {
  const hotels = (await getHotelsByUserId()) as HotelWithRooms[];

  return (
    <div>
      <h2 className="text-2xl font-semibold"> Here are your properties </h2>
      {/* Render your hotels here */}
      <HotelList hotels={hotels} />
    </div>
  );
};

export default MyHotels;
