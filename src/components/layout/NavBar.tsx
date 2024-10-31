"use client";

import { UserButton, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Image from "next/image";

import Container from "@/components/Container";
import Searchinput from "@/components/Searchinput";
import ModeToggle from "@/components/mode-toggle";

import { Button } from "@/components/ui/button";
import { NavMenu } from "@/components/layout/NavMenu";

function NavBar() {
  const router = useRouter();

  const { userId } = useAuth();

  return (
    <header className="sticky top-0 border border-b-primary/10 bg-secondary">
      <Container>
        <div className="flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => router.push("/")}
          >
            <Image src="/hotel.svg" alt="logo" width="30" height="30" />
            <h1 className="font-semibold text-xl"> Hotely.com </h1>
          </div>
          <Searchinput />
          <div className="flex items-center gap-3">
            <ModeToggle />
            <NavMenu />
            <UserButton afterSwitchSessionUrl="/" />
            {!userId && (
              <>
                <Button
                  onClick={() => router.push("/sign-in")}
                  variant="outline"
                  size="sm"
                >
                  Sign In
                </Button>
                <Button onClick={() => router.push("/sign-up")} size="sm">
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </div>
      </Container>
    </header>
  );
}

export default NavBar;
