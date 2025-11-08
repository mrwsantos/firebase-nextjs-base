"use client";

import { useAuth } from "@/context/auth";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent} from "@/components/ui/card";
import Logo from "@/components/Logo";
import Loading from "@/components/ui/loading";

const LogoutPage = () => {
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    const handleLogout = async () => {
      if (auth) {
        try {
          await auth.logout(); // Use a função logout do contexto
          // Redireciona para a página inicial após logout
          router.push("/");
        } catch (error) {
          console.error("Erro ao fazer logout:", error);
        }
      }
    };

    handleLogout();
  }, [auth, router]);

  return (
    <div className="flex flex-col gap-10 items-center justify-center">
      <Logo/>
      <Card>
        <CardContent className="flex flex-col gap-5 items-center  justify-center">
          <Loading text="Logging out..." className="mb-5" size={30}/>
          <p className="text-dark-grey font-bold text-center">{"You'll be redirected soon."}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default LogoutPage;