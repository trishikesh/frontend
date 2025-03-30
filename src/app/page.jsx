"use client";

import Home from "../components/home";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px", alignItems: "center", marginTop: "50px" }}>
      <Home />
    </div>
  );
}
