import { ReactNode } from "react";

interface SectionContainerProps {
  children: ReactNode;
  className?: string;
  [key: string]: any; // Allow additional props like data-testid
}

export default function SectionContainer({ children, className = "", ...props }: SectionContainerProps) {
  return <section className={`section-y ${className}`} {...props}><div className="container-main">{children}</div></section>;
}