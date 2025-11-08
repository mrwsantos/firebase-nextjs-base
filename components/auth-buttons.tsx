"use client";

import { useAuth } from "@/context/auth";
import Link from "next/link";
import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useRouter } from "next/navigation";
import {  SquareUserRound } from "lucide-react";
import { useMenu } from "@/hooks/useMenu";

export default function AuthButtons() {
  const router = useRouter();
  const auth = useAuth();
  const {shrinkMenu} = useMenu()

   const handleLogout = async () => {
    try {
      await auth.logout();
      router.push('/login');
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <div className="w-full">
      {!!auth?.currentUser && (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger className="w-full">
              <div className={`flex items-center  flex-row gap-2 w-full justify-start`}>
                <div className="w-12 h-12 min-w-12 bg-secondary-2 text-dark-grey font-bold rounded-full flex items-center justify-center">
                  {auth.currentUser.displayName?.slice(0, 2).toUpperCase() ||
                    auth.currentUser.email?.slice(0, 2).toUpperCase()}
                </div>
                {!shrinkMenu && (
                  <span className={`font-semibold text-left text-dark-grey w-full ${(auth.currentUser.displayName?.length ?? 0) > 22 ? 'text-xs' : 'text-md'}`}>
                    {auth.currentUser.displayName}
                  </span>
                )}
              </div>

              <DropdownMenuContent
                className="mr-7 mt-5 dropmenu rounded-md p-4  gap-2 flex flex-col z-[9999]"
                side="top"
                align="start"
              >
                <DropdownMenuLabel className="text-right">
                  <div>Logged as:</div>
                  <div className="font-normal text-xs">
                    {auth.currentUser.email}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="justify-center rounded-full" asChild>
                  <Link href={"/account"}>
                    <SquareUserRound />
                    My account
                  </Link>
                </DropdownMenuItem>
              
                <DropdownMenuItem
                  className="w-full mt-1 text-center justify-center bg-primary text-white cursor-pointer transition-all font-bold rounded-full hover:bg-secondary hover:text-primary"
                  onClick={()=> handleLogout()}
                >
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenuTrigger>
          </DropdownMenu>
        </>
      )}

      {!auth?.currentUser && (
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="uppercase tracking-widest hover:underline"
          >
            Login
          </Link>
          <span className="text-3xl font-extralight opacity-25">|</span>
          <Link
            href="/register"
            className="uppercase tracking-widest hover:underline"
          >
            Singup
          </Link>
        </div>
      )}
    </div>
  );
}
