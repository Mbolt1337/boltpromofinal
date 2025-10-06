"use client";
import Image, { ImageProps } from "next/image";

type Props = Omit<ImageProps, "fill"> & { className?: string; aspect?: "16/9" | "4/3" | "16/9-mobile" };
export default function CardImage({ className = "", aspect = "16/9", ...img }: Props) {
  const aspectCls = aspect === "16/9"
    ? "aspect-[16/9]"
    : aspect === "4/3"
    ? "aspect-[4/3]"
    : "aspect-[4/3] md:aspect-[16/9]";
  return (
    <div className={`relative w-full ${aspectCls} overflow-hidden rounded-2xl`}>
      <Image {...img} fill className={`object-cover ${className}`} sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw" />
    </div>
  );
}