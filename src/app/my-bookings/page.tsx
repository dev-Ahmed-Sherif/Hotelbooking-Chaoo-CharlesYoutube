import { getBookingsByHotelOwnerId } from "@/actions/getBookingsByHotelOwnerId";
import { getBookingsByUserId } from "@/actions/getBookingsByUserId";
import MyBookingCard from "@/components/booking/MyBooking";

const MyBookings = async () => {
  const bookingsFromVisitors = await getBookingsByHotelOwnerId();
  const bookingsIHaveMade: any = await getBookingsByUserId();

  if (!bookingsFromVisitors && !bookingsIHaveMade)
    return <div> No Bookings Found </div>;

  return (
    <div className="flex flex-col gap-10">
      {!!bookingsIHaveMade && (
        <div>
          <h2 className="text-xl md:text-2xl font-semibold mb-6 mt-2">
            Here are bookings you have made
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {bookingsIHaveMade.map((booking: any) => (
              <MyBookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        </div>
      )}
      {!!bookingsFromVisitors && (
        <div>
          <h2 className="text-xl md:text-2xl font-semibold mb-6 mt-2">
            Here are bookings visitors have made on your properties
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {bookingsIHaveMade.map((booking: any) => (
              <MyBookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
