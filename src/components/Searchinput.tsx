"use client";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

function Searchinput() {
  return (
    <div className="relative sm:block hidden">
      <Search className="absolute h-5 w-4 top-2 left-4 text-muted-foreground" />
      <Input placeholder="Search" className="pl-10 bg-primary/10" />
    </div>
  );
}

export default Searchinput;
