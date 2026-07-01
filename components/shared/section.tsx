import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type SectionProps = {
  id?: string;
  eyebrow?: string;
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
};

export function Section({
  id,
  eyebrow,
  title,
  description,
  children,
  className,
  contentClassName,
}: SectionProps) {
  return (
    <section id={id} className={cn("w-full px-4 py-16 sm:px-6 lg:px-8", className)}>
      <div className={cn("mx-auto flex max-w-6xl flex-col gap-8", contentClassName)}>
        {(eyebrow || title || description) && (
          <div className="max-w-3xl space-y-3">
            {eyebrow ? (
              <p className="text-sm font-semibold uppercase tracking-[0.32em] text-amber-700">
                {eyebrow}
              </p>
            ) : null}
            <h2 className="text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
              {title}
            </h2>
            {description ? (
              <p className="text-lg leading-8 text-stone-600">{description}</p>
            ) : null}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
