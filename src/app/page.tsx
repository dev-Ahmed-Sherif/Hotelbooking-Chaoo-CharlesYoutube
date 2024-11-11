import { getHotels } from "@/actions/getHotels";
import HotelList from "@/components/hotel/HotelList";

type HomeProps = {
  searchParams: {
    title: string;
    country: string;
    state: string;
    city: string;
  };
};

export default async function Home({ searchParams }: HomeProps) {
  const hotels = await getHotels(searchParams);

  if (!hotels) return <div> No Hotels Found ......</div>;

  return (
    <div className="flex min-h-screen flex-col items-center justify-between p-24">
      <HotelList hotels={hotels} />
    </div>
  );
}
