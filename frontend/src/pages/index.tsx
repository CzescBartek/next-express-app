import { useEffect, useState } from "react";

export default function Home() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/`)
      .then((res) => res.text())
      .then(setMessage);
  }, []);

  return <h1>{message || "Ładowanie..."}</h1>;
}