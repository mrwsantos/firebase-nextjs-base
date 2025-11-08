"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/auth";
import { useState } from "react";
import { UpdatePassForm, UpdateUserForm } from "./udpate-user-form";

const Account = () => {
  const {  userData, loading, userDataLoading } = useAuth();
  const [_, setActiveTab] = useState("Profile details");

  const handleTabChange = async (newTab: string) => {
    setActiveTab(newTab);
  };

  // Loading state while auth is being determined
  if (loading || userDataLoading) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-lg">Loading account information...</span>
        </div>
      </div>
    );
  }

  // If no user data after loading
  if (!userData) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-lg">Failed to load account information</p>
          <p className="text-gray-500">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  return (
    <Tabs
      onValueChange={handleTabChange}
      className="space-0 flex-row gap-4 relative"
      defaultValue="Profile details"
    >
      <TabsList className="h-15 p-0 flex flex-col justify-start rounded-md w-74">
        <TabsTrigger
          style={{ boxShadow: "none" }}
          className="rounded-none rounded-tl-md rounded-tr-md shadow-none border-none text-dark-grey text-left justify-start text-lg font-semibold py-5 px-6 w-full bg-white hover:bg-muted data-[state=active]:bg-primary data-[state=active]:text-white"  
          value="Profile details"
        >
          Profile details
        </TabsTrigger>
        <TabsTrigger
          style={{ boxShadow: "none" }}
          className="rounded-none rounded-bl-md rounded-br-md shadow-none border-none text-dark-grey text-left justify-start text-lg font-semibold py-5 px-6 w-full bg-white hover:bg-muted data-[state=active]:bg-primary data-[state=active]:text-white"  
          value="Password"
        >
          Password
        </TabsTrigger>
      </TabsList>

      <TabsContent value="Profile details" className="  max-w-[700px]">
        <Card className="rounded-md border-none p-10 justify-start flex flex-col w-full shadow-none">
          <CardContent className="p-0 flex gap-5 w-full items-start">
            {/* <span className="bg-gray-50 w-[100px] h-[100px] rounded-full border-5 border-primary flex items-center justify-center flex-shrink-0">
              <User size={60} className="text-primary" />
            </span> */}
            
            <div className="flex-1">
              <div className="mb-4 flex flex-col gap-3">
                <h3 className="text-xl font-semibold text-dark-grey">
                  {userData.name || "User"}
                </h3>
                <p className="text-dark-grey">{userData.email}</p>
                <p className="text-dark-grey">
                  Your role: <span className="font-bold">{userData.role}</span>
                </p>
              </div>
              <UpdateUserForm />
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="Password" className="  max-w-[700px]">
        <Card className="rounded-md border-none p-10 justify-start flex flex-col w-full shadow-none">
          <CardContent className="grid gap-6 p-0">
            <div className="mb-4">
              <h3 className="text-xl font-semibold text-dark-grey mb-2">
                Change Password
              </h3>
              <p className="text-gray-600 text-sm">
                Update your password to keep your account secure
              </p>
            </div>
            <UpdatePassForm />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default Account;