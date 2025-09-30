import { ReactNode } from "react";

export default function SectionContainer({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`section-y ${className}`}><div className="container-main">{children}</div></section>;
}