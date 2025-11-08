import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import React from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import RegisterForm from "./register-form";
// import BackLogin from "@/public/back-login-3-copy.jpg"; // Adjust the path as necessary

const Register = () => {
  return (
    <div
      className="w-full h-screen flex items-center justify-center"
      style={{
        backgroundColor: "#F5F3F2",
        // backgroundRepeat: "no-repeat",
        // backgroundImage: `url(${BackLogin.src})`,
        // backgroundSize: "cover",
        // backgroundPosition: "center",
        // backgroundBlendMode: "soft-light",
      }}
    >
      {/* <div
        className="w-1/2 bg-primary h-[100vh] flex flex-col items-center justify-center gap-4"
        style={{
          backgroundImage: `url(${BackLogin.src})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundBlendMode: "soft-light",
        }}
      >
        <h1 className="text-white text-6xl">Welcome!</h1>
        <p className="text-2xl text-white">Here you can create your account.</p>
      </div> */}

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
              Register
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RegisterForm />
          </CardContent>
          <hr />
          <CardFooter className="flex justify-center text-dark-grey text-xs">
            <span className="font-bold">Already have an account?</span>
            <Link href="/login" className="underline ml-1">
              {" "}
              Login here.
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Register;
