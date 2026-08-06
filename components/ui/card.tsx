import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type CardProps = {
  title?: string;
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
};

export const Card = ({ title, footer, children, className }: CardProps) => {
  return (
    <div className={cn("bg-card text-card-foreground rounded-xl border border-border shadow-sm p-4", className)}>
      {title && <h3 className="font-luxury text-gold-primary text-lg mb-4">{title}</h3>}
      {children}
      {footer && <div className="mt-4 pt-4 border-t border-border">{footer}</div>}
    </div>
  );
};
