import { ModeToggle } from "@/components/mode-toggle";
import Image from "next/image";
import { Navbar } from "@/components/Navbar";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen pt-8 gap-16 font-[family-name:var(--font-geist-sans)]">
      <Navbar /> 
    </div>
  );
}
