import { ReactNode } from "react";

export default function BaseCard({ className = "", children }: { className?: string; children: ReactNode }) {
  return <div className={`card-base ${className}`}>{children}</div>;
}