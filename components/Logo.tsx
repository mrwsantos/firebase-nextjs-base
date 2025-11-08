import React from "react";
import Link from "next/link";

interface LogoProps {
  simple?: boolean;
  link?: boolean;
  small?: boolean;
  size?: string;
  className?: string;
  white?: boolean;
}

const Logo = ({
  link = true,
  small = false,
  size = "w-full",
  className = "",
  white = false,
}: LogoProps) => {
  const logoContent = (
    <div
      className={`flex items-center justify-center flex-col gap-4.5
        ${size} transition-all duration-500 ${className}`}
    >
      <h1 className="text-3xl font-bold text-primary">
      LOGO
      </h1>
    </div>
  );

  return (
    <>
      {link ? (
        <Link className="w-50 flex justify-center" href="/">
          {logoContent}
        </Link>
      ) : (
        logoContent
      )}
    </>
  );
};

export default Logo;
