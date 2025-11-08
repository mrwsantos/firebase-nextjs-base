"use client";

import React from "react";

import MainLayout from "@/components/Layout/MainLayout";

const AccountLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <MainLayout title="My account">
      {children}
    </MainLayout>
  );
};

export default AccountLayout;
