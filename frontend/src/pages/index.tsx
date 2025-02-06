import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken"); // 👈 poprawione
    if (!token) {
      router.push("/login");
    } else {
      setIsAuth(true);
    }
  }, [router]);
   // Teraz router jest w zależnościach, więc efekt może się odświeżać

  if (!isAuth) return <p>Ładowanie...</p>; // Zabezpieczenie przed chwilowym wyświetlaniem pustej strony

  return <h1>Witaj na stronie głównej!</h1>;
}
