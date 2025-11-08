"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import LoginForm from "./login-form";
import Link from "next/link";
import Logo from "@/components/Logo";
import ContinueWithGoogleButton from "@/components/continue-with-google-button";

const Login = () => {
  return (
    <div
      className="w-full h-screen flex items-center justify-center"
      style={{
        backgroundColor: "#F5F3F2",
      }}
    >
      <div className="mx-auto p-5 w-[500px] flex flex-col gap-10">
        <div className="logo m-auto flex items-center justify-center w-60">
          <Logo />
        </div>
        <Card
          className="bg-[#ffffff] border-0 shadow-none"
          style={{ backdropFilter: "blur(15px)" }}
        >
          <CardHeader>
            <CardTitle className="text-2xl text-center text-dark-grey font-bold">
              Login
            </CardTitle>
          </CardHeader>

          <CardContent>
            <LoginForm />
            <p className="mx-auto text-center py-3 font-semibold">or</p>
            <ContinueWithGoogleButton/>
          </CardContent>

          <hr />

          <CardFooter className="flex justify-center text-dark-grey text-xs">
            <span className="font-bold">Do not have an account?</span>
            <Link href="/register" className="underline ml-1">
              Register here.
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
