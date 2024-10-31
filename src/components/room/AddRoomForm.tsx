"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import * as z from "zod";
import { Hotel, Room } from "@prisma/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { Loader2, Pencil, PencilLine, XCircle } from "lucide-react";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

import { useToast } from "@/hooks/use-toast";
import { UploadButton } from "@/utils/uploadthing";

type AddRoomFormProps = {
  hotel?: Hotel & {
    rooms: Room[];
  };
  room?: Room;
  handleDialogOpen: ({
    hotel,
    room,
    handleDialogOpen,
  }: AddRoomFormProps) => void;
};

const formSchema = z.object({
  title: z.string().min(3, {
    message: "Title must be at least 3 characters long",
  }),
  description: z.string().min(3, {
    message: "Description must be at least 3 characters long",
  }),
  bedCount: z.coerce.number().min(1, {
    message: "Bed count is required",
  }),
  guestCount: z.coerce.number().min(1, {
    message: "Guest count is required",
  }),
  bathroomCount: z.coerce.number().min(1, {
    message: "Bathroom count is required",
  }),
  kingBed: z.coerce.number().min(0),
  queenBed: z.coerce.number().min(0),
  image: z.string().min(1, {
    message: "image is required",
  }),
  breakFastPrice: z.coerce.number().optional(),
  roomPrice: z.coerce.number().min(1, {
    message: "Room price is required",
  }),
  roomService: z.boolean().optional(),
  Tv: z.boolean().optional(),
  balcony: z.boolean().optional(),
  freeWifi: z.boolean().optional(),
  cityView: z.boolean().optional(),
  oceanView: z.boolean().optional(),
  forestView: z.boolean().optional(),
  mountainView: z.boolean().optional(),
  airCondition: z.boolean().optional(),
  soundProofed: z.boolean().optional(),
});

const AddRoomForm = ({ hotel, room, handleDialogOpen }: AddRoomFormProps) => {
  const [image, setImage] = useState<string | undefined>(room?.image);
  const [imageIsDeleting, setImageIsDeleting] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { toast } = useToast();
  const router = useRouter();

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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: room || {
      title: "",
      description: "",
      bedCount: 0,
      guestCount: 0,
      bathroomCount: 0,
      kingBed: 0,
      queenBed: 0,
      image: "",
      breakFastPrice: 0,
      roomPrice: 0,
      roomService: false,
      Tv: false,
      balcony: false,
      freeWifi: false,
      cityView: false,
      oceanView: false,
      forestView: false,
      mountainView: false,
      airCondition: false,
      soundProofed: false,
    },
  });

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

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    // console.log(values);
    setIsLoading(true);
    // Update or Create the hotel in your database
    if (hotel && room) {
      // update
      axios
        .patch(`/api/room/${room.id}`, values)
        .then((res) => {
          toast({
            variant: "success",
            description: "🎉 Room Updated successfully",
          });
          router.refresh();
          setIsLoading(false);
          handleDialogOpen({ handleDialogOpen });
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
      if (!hotel) return;
      axios
        .post("/api/room", { ...values, hotelId: hotel.id })
        .then((res) => {
          toast({
            variant: "success",
            description: "🎉 Room created successfully",
          });
          // console.log(res.data.id);
          router.refresh();
          setIsLoading(false);
          handleDialogOpen({ handleDialogOpen });
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

  return (
    <div className="max-h-[75vh] overflow-y-auto px-2">
      <Form {...form}>
        <form>
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Room Title *</FormLabel>
                <FormDescription>Provide a room name</FormDescription>
                <FormControl>
                  <Input placeholder="Double Room" {...field} />
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
                <FormLabel>Room Description *</FormLabel>
                <FormDescription>
                  Provide a detailed description of your Hotel room
                </FormDescription>
                <FormControl>
                  <Textarea
                    placeholder="have a beautiful view of the ocean while in this room!"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div>
            <FormLabel> Choose Room Amenities </FormLabel>
            <FormDescription>
              Choose amenities popular in your hotel room
            </FormDescription>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <FormField
                control={form.control}
                name="roomService"
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
                    <FormLabel> 24hrs Room Service </FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="Tv"
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
                    <FormLabel> TV </FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="balcony"
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
                    <FormLabel> Balcony </FormLabel>
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
                name="cityView"
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
                    <FormLabel> City View </FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="oceanView"
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
                    <FormLabel> Ocean View </FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="forestView"
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
                    <FormLabel> Forest View </FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="mountainView"
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
                    <FormLabel> Mountain View </FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="airCondition"
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
                    <FormLabel> Air Conditioned </FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="soundProofed"
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
                    <FormLabel> Sound Proofed </FormLabel>
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
                  Choose an Image that will show-case your room nicely
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
          {/* Min 4:57 */}
          <div className="flex flex-row gap-6">
            <div className="flex-1 flex flex-col gap-6">
              <FormField
                control={form.control}
                name="roomPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Room Price in USD *</FormLabel>
                    <FormDescription>
                      State the price staying in the room for 24hrs
                    </FormDescription>
                    <FormControl>
                      <Input type="number" min={0} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bedCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bed Count *</FormLabel>
                    <FormDescription>
                      How many beds are available in this room.
                    </FormDescription>
                    <FormControl>
                      <Input type="number" min={0} max={8} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="guestCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Guest Count *</FormLabel>
                    <FormDescription>
                      How many guest are allowed in this room.
                    </FormDescription>
                    <FormControl>
                      <Input type="number" min={0} max={20} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bathroomCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bathrooms Count *</FormLabel>
                    <FormDescription>
                      How many bathrooms are available in this room.
                    </FormDescription>
                    <FormControl>
                      <Input type="number" min={0} max={8} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex flex-1 flex-col gap-6">
              <FormField
                control={form.control}
                name="breakFastPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Breakfast Price in USD</FormLabel>
                    <FormDescription>
                      State the price staying in the room for 24hrs
                    </FormDescription>
                    <FormControl>
                      <Input type="number" min={0} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="kingBed"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>King Beds</FormLabel>
                    <FormDescription>
                      How many king beds are available in this room.
                    </FormDescription>
                    <FormControl>
                      <Input type="number" min={0} max={8} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="queenBed"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel> Queen Beds </FormLabel>
                    <FormDescription>
                      How many queen beds are available in this room.
                    </FormDescription>
                    <FormControl>
                      <Input type="number" min={0} max={20} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          <div className="pt-4 pb-2">
            {room ? (
              <Button
                onClick={form.handleSubmit(onSubmit)}
                type="button"
                className="max-w-[150px]"
                disabled={isLoading}
              >
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
              <Button
                onClick={form.handleSubmit(onSubmit)}
                type="button"
                className="max-w-[150px]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4" />
                    Creating
                  </>
                ) : (
                  <>
                    <Pencil className="mr-2 h-4 w-4" />
                    Create Room
                  </>
                )}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
};

export default AddRoomForm;
