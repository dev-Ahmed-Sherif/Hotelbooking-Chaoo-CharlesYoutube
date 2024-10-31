"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Pencil,
  PencilLine,
  Trash,
  XCircle,
  Eye,
  Terminal,
  Plus,
} from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import axios from "axios";
import { ICity, IState } from "country-state-city";

import { Hotel, Room } from "@prisma/client";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

import AddRoomForm from "@/components/room/AddRoomForm";
import RoomCard from "@/components/room/RoomCard";

import { UploadButton } from "@/utils/uploadthing";
import { useToast } from "@/hooks/use-toast";
import useLocation from "@/hooks/useLocation";

type AddHotelFormProps = {
  hotel: HotelWithRooms | null;
};

export type HotelWithRooms = Hotel & {
  rooms: Room[];
};

const formSchema = z.object({
  title: z.string().min(3, {
    message: "Title must be at least 3 characters long",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters long",
  }),
  image: z.string().min(1, {
    message: "Image is required",
  }),
  country: z.string().min(1, {
    message: "Country is required",
  }),
  state: z.string().optional(),
  city: z.string().optional(),
  locationDescription: z.string().min(10, {
    message: "Description must be at least 10 characters long",
  }),
  gym: z.boolean().optional(),
  spa: z.boolean().optional(),
  bar: z.boolean().optional(),
  restaurant: z.boolean().optional(),
  shopping: z.boolean().optional(),
  freeParking: z.boolean().optional(),
  bikeRental: z.boolean().optional(),
  freeWifi: z.boolean().optional(),
  movieNights: z.boolean().optional(),
  swimmingPool: z.boolean().optional(),
  coffeeShop: z.boolean().optional(),
});

const AddHotelForm = ({ hotel }: AddHotelFormProps) => {
  const [image, setImage] = useState<string | undefined>(hotel?.image);
  const [imageIsDeleting, setImageIsDeleting] = useState(false);
  const [states, setStates] = useState<IState[]>([]);
  const [cities, setCities] = useState<ICity[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isHotelDeleting, setIsHotelDeleting] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);

  const router = useRouter();

  const { toast } = useToast();

  const { getAllCountries, getCountryStates, getStateCities } = useLocation();

  const countries = getAllCountries();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: hotel || {
      title: "",
      description: "",
      image: "",
      country: "",
      state: "",
      city: "",
      locationDescription: "",
      gym: false,
      spa: false,
      bar: false,
      restaurant: false,
      shopping: false,
      freeParking: false,
      bikeRental: false,
      freeWifi: false,
      movieNights: false,
      swimmingPool: false,
      coffeeShop: false,
    },
  });

  // Detect Image Selections
  useEffect(() => {
    if (typeof image === "string") {
      form.setValue("image", image, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      });
    }
  }, [image]);

  // Detect Country Selections
  useEffect(() => {
    const selectedCountry = form.watch("country");
    const countryStates = getCountryStates(selectedCountry);
    if (countryStates) {
      setStates(countryStates);
    }
  }, [form.watch("country")]);

  // Detect State Selections
  useEffect(() => {
    const selectedCountry = form.watch("country");
    const selectedState = form.watch("state");
    const stateCities = getStateCities(
      selectedCountry,
      selectedState as string
    );
    if (stateCities) {
      setCities(stateCities);
    }
  }, [form.watch("country"), form.watch("state")]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    // console.log(values);
    setIsLoading(true);
    // Update or Create the hotel in your database
    if (hotel) {
      // update
      axios
        .patch(`/api/hotel/${hotel.id}`, values)
        .then((res) => {
          toast({
            variant: "success",
            description: "🎉 Hotel Updated successfully",
          });
          router.push(`/hotel/${res.data.id}`);
          setIsLoading(false);
        })
        .catch((error) => {
          console.log(error);
          toast({
            variant: "destructive",
            description: "Something went wrong",
          });
          setIsLoading(false);
        });
    } else {
      // create
      axios
        .post("/api/hotel", values)
        .then((res) => {
          toast({
            variant: "success",
            description: "🎉 Hotel created successfully",
          });
          // console.log(res.data.id);
          router.push(`/hotel/${res.data.id}`);
          setIsLoading(false);
        })
        .catch((error) => {
          console.log(error);
          toast({
            variant: "destructive",
            description: "Something went wrong",
          });
          setIsLoading(false);
        });
    }
  }

  const handleDeleteHotel = async (hotel: HotelWithRooms) => {
    setIsHotelDeleting(true);
    const getImageKey = (src: string) =>
      src.substring(src.lastIndexOf("/") + 1);
    try {
      const imageKey = getImageKey(hotel.image);
      await axios.post("/api/uploadthing/delete", { imageKey });
      await axios.delete(`/api/hotel/${hotel.id}`);
      setIsHotelDeleting(false);
      toast({
        variant: "success",
        description: "Hotel deleted successfully",
      });
      router.push("/hotel/new");
    } catch (error: any) {
      toast({
        variant: "destructive",
        description: `Hotel deletion could not be completed ${error.message}`,
      });
    }
  };

  const HandleImageDelete = (image: string) => {
    setImageIsDeleting(true);
    // Delete the image from your server or cloud storage
    const imageKey = image.substring(image.lastIndexOf("/") + 1);

    axios
      .post("/api/uploadthing/delete", { imageKey })
      .then((response) => {
        if (response.data.success) {
          setImage("");
          toast({
            variant: "success",
            description: "🎉 Image deleted successfully",
          });
        }
      })
      .catch(() => {
        toast({
          variant: "destructive",
          description: "Something went wrong",
        });
      })
      .finally(() => {
        // After deleting, set the image state to undefined and set the imageIsDeleting to false
        setImageIsDeleting(false);
      });
  };

  const handleDialogOpen = () => {
    setOpen((prev) => !prev);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <h3 className="text-lg font-semibold">
          {hotel ? "Update Your Hotel!" : "Descripe your Hotel!"}
        </h3>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 flex flex-col gap-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hotel Title *</FormLabel>
                  <FormDescription>Provide your Hotel name</FormDescription>
                  <FormControl>
                    <Input placeholder="Beach Hotel" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hotel Description *</FormLabel>
                  <FormDescription>
                    Provide a detailed description of your Hotel name
                  </FormDescription>
                  <FormControl>
                    <Textarea
                      placeholder="Beach Hotel is parked with many awesome amenitie!"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div>
              <FormLabel>Choose Amenities</FormLabel>
              <FormDescription>
                Choose Amenities popular in your hotel
              </FormDescription>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <FormField
                  control={form.control}
                  name="gym"
                  render={({ field }) => (
                    <FormItem
                      className="flex flex-row items-end space-x-3 
                    rounded-md border p-4"
                    >
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel> Gym </FormLabel>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="spa"
                  render={({ field }) => (
                    <FormItem
                      className="flex flex-row items-end space-x-3 
                    rounded-md border p-4"
                    >
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel> Spa </FormLabel>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bar"
                  render={({ field }) => (
                    <FormItem
                      className="flex flex-row items-end space-x-3 
                    rounded-md border p-4"
                    >
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel> Bar </FormLabel>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="restaurant"
                  render={({ field }) => (
                    <FormItem
                      className="flex flex-row items-end space-x-3 
                    rounded-md border p-4"
                    >
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel> Restaurant </FormLabel>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="shopping"
                  render={({ field }) => (
                    <FormItem
                      className="flex flex-row items-end space-x-3 
                    rounded-md border p-4"
                    >
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel> Shopping </FormLabel>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="freeParking"
                  render={({ field }) => (
                    <FormItem
                      className="flex flex-row items-end space-x-3 
                    rounded-md border p-4"
                    >
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel> Free Parking </FormLabel>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bikeRental"
                  render={({ field }) => (
                    <FormItem
                      className="flex flex-row items-end space-x-3 
                    rounded-md border p-4"
                    >
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel> Bike Rental </FormLabel>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="freeWifi"
                  render={({ field }) => (
                    <FormItem
                      className="flex flex-row items-end space-x-3 
                    rounded-md border p-4"
                    >
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel> Free Wifi </FormLabel>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="movieNights"
                  render={({ field }) => (
                    <FormItem
                      className="flex flex-row items-end space-x-3 
                    rounded-md border p-4"
                    >
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel> Movie Nights </FormLabel>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="swimmingPool"
                  render={({ field }) => (
                    <FormItem
                      className="flex flex-row items-end space-x-3 
                    rounded-md border p-4"
                    >
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel> Swimming Pool </FormLabel>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="coffeeShop"
                  render={({ field }) => (
                    <FormItem
                      className="flex flex-row items-end space-x-3 
                    rounded-md border p-4"
                    >
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel> Coffee Shop </FormLabel>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem className="flex flex-col space-y-3">
                  <FormLabel> Upload Image *</FormLabel>
                  <FormDescription>
                    Choose an Image that will show-case your hotel nicely
                  </FormDescription>
                  <FormControl>
                    {image ? (
                      <div className="relative max-w-[400px] min-w-[200px] max-h-[400px] min-h-[200px] mt-4">
                        <Image
                          fill
                          className="object-contain"
                          src={image}
                          alt="Hotel Image"
                        />
                        <Button
                          onClick={() => HandleImageDelete(image)}
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="absolute right-[-12px] top-0"
                        >
                          {imageIsDeleting ? <Loader2 /> : <XCircle />}
                        </Button>
                      </div>
                    ) : (
                      <div
                        className="flex flex-col items-center max-w-[400px] p-12 border-2 
                       border-dashed border-primary/50 mt-4"
                      >
                        <UploadButton
                          endpoint="imageUploader"
                          onClientUploadComplete={(res) => {
                            // Do something with the response
                            console.log("Files: ", res);
                            setImage(res[0].url);
                            toast({
                              variant: "success",
                              description: "🎉 Upload Completed",
                            });
                          }}
                          onUploadError={(error: Error) => {
                            // Do something with the error.
                            toast({
                              variant: "destructive",
                              description: `ERROR! ${error.message}`,
                            });
                          }}
                        />
                      </div>
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex-1 flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Country *</FormLabel>
                    <FormDescription>In which Country</FormDescription>
                    <Select
                      disabled={isLoading}
                      onValueChange={field.onChange}
                      value={field.value}
                      defaultValue={field.value}
                    >
                      <SelectTrigger className="bg-background">
                        <SelectValue
                          placeholder="Select a Country"
                          defaultValue={field.value}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((country) => {
                          return (
                            <SelectItem
                              key={country.isoCode}
                              value={country.isoCode}
                            >
                              {country.name}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select State *</FormLabel>
                    <FormDescription>In which State</FormDescription>
                    <Select
                      disabled={isLoading || states.length < 1}
                      onValueChange={field.onChange}
                      value={field.value}
                      defaultValue={field.value}
                    >
                      <SelectTrigger className="bg-background">
                        <SelectValue
                          placeholder="Select a State"
                          defaultValue={field.value}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {states.map((state) => {
                          return (
                            <SelectItem
                              key={state.isoCode}
                              value={state.isoCode}
                            >
                              {state.name}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select City *</FormLabel>
                  <FormDescription>In which City</FormDescription>
                  <Select
                    disabled={isLoading || cities.length < 1}
                    onValueChange={field.onChange}
                    value={field.value}
                    defaultValue={field.value}
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue
                        placeholder="Select a City"
                        defaultValue={field.value}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map((city) => {
                        return (
                          <SelectItem key={city.name} value={city.name}>
                            {city.name}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="locationDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location Description *</FormLabel>
                  <FormDescription>
                    Provide a detailed location description of your Hotel
                  </FormDescription>
                  <FormControl>
                    <Textarea
                      placeholder="Located at the very top of the mountain"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {hotel && !hotel.rooms.length && (
              <Alert className="bg-indigo-600 text-white">
                <Terminal className="h-4 w-4 stroke-white" />
                <AlertTitle>One last step!</AlertTitle>
                <AlertDescription>
                  Your Hotel was created successfully 🔥
                  <div>Please add some rooms to complete your hotel setup!</div>
                </AlertDescription>
              </Alert>
            )}
            <div className="flex justify-between gap-2 flex-wrap">
              {hotel ? (
                <Button className="max-w-[150px]" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4" />
                      Updating
                    </>
                  ) : (
                    <>
                      <PencilLine className="mr-2 h-4 w-4" />
                      Update
                    </>
                  )}
                </Button>
              ) : (
                <Button className="max-w-[150px]" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4" />
                      Creating
                    </>
                  ) : (
                    <>
                      <Pencil className="mr-2 h-4 w-4" />
                      Create Hotel
                    </>
                  )}
                </Button>
              )}
              {hotel && (
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => router.push(`/hotel-details/${hotel.id}`)}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View
                </Button>
              )}
              {hotel && (
                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="max-w-[150px]"
                    >
                      <Plus className="mr-2 h-4 w-4" /> Add Room
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-[64rem]">
                    <DialogHeader className="max-w-[900px] w-[90%]">
                      <DialogTitle>Add Room</DialogTitle>
                      <DialogDescription className="px-2">
                        Add details about a room in your hotel.
                      </DialogDescription>
                    </DialogHeader>
                    <AddRoomForm
                      hotel={hotel}
                      handleDialogOpen={handleDialogOpen}
                    />
                  </DialogContent>
                </Dialog>
              )}
              {hotel && (
                <Button
                  className="max-w-[150px]"
                  onClick={() => handleDeleteHotel(hotel)}
                  variant="ghost"
                  type="button"
                  disabled={isHotelDeleting || isLoading}
                >
                  {isHotelDeleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4" />
                      Deleting
                    </>
                  ) : (
                    <>
                      <Trash className="mr-2 h-4 w-4" />
                      Delete
                    </>
                  )}
                </Button>
              )}
            </div>
            {hotel && !!hotel.rooms.length && (
              <div>
                <Separator />
                <h3 className="text-lg font-semibold my-4">Hotel Rooms</h3>
                <div className="grid grid-cols-2 gap-4 2xl:grid-cols-2">
                  {hotel.rooms.map((room) => (
                    <RoomCard key={room.id} hotel={hotel} room={room} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </form>
      {/* <button type="submit" disabled={!form.formState.isValid}>
        {hotel ? "Update Hotel" : "Add Hotel"}
      </button> */}
    </Form>
  );
};

export default AddHotelForm;
