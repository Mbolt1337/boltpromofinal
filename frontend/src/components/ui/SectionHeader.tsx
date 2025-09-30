type Props = { title: string; subtitle?: string; align?: "left" | "center" };

export default function SectionHeader({ title, subtitle, align = "center" }: Props) {
  const alignCls = align === "center" ? "text-center" : "text-left";
  return (
    <div className={`section-gap ${alignCls}`}>
      <h2 className="heading-lg">{title}</h2>
      {subtitle ? <p className="subheading mt-2">{subtitle}</p> : null}
    </div>
  );
}