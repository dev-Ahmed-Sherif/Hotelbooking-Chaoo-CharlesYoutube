"use client";

import { useState, ChangeEventHandler, useEffect } from "react";
import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import qs from "query-string";

import { Input } from "@/components/ui/input";
import { useDebounceValue } from "@/hooks/useDebounceValue";

function Searchinput() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const title = searchParams.get("title");

  const [value, setValue] = useState(title || "");

  const debounceValue = useDebounceValue<string>(value);

  useEffect(() => {
    const query = {
      title: debounceValue,
    };

    const url = qs.stringifyUrl(
      {
        url: window.location.href,
        query,
      },
      { skipNull: true, skipEmptyString: true }
    );

    router.push(url);
  }, [value, router]);

  const onChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setValue(e.target.value);
  };

  if (pathname !== "/") return null;

  return (
    <div className="relative sm:block hidden">
      <Search className="absolute h-5 w-4 top-2 left-4 text-muted-foreground" />
      <Input
        value={value}
        onChange={onChange}
        placeholder="Search"
        className="pl-10 bg-primary/10"
      />
    </div>
  );
}

export default Searchinput;
