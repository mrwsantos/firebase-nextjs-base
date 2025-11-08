import React from "react";

const LayoutAuth = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="flex items-center justify-center min-h-screen w-full">
      <div className="left bg-primary min-h-screen flex-1">{children}</div>
      <div className="left bg-secondary min-h-screen flex-1 " style={{
        background: 'url(https://cdn.pixabay.com/photo/2024/03/10/16/13/flower-8625039_1280.png)'
      }}>
      </div>
    </main>
  );
};

export default LayoutAuth;
