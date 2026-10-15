import { ReactNode } from "react";

export function PageHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="space-y-1.5 pb-2">
      <h1 className="text-2xl font-bold md:text-3xl">{title}</h1>
      {description && (
        <p className="max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  );
}

export function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
      <header className="space-y-1 border-b bg-muted/50 px-5 py-4 md:px-6">
        <h2 className="text-lg font-bold">{title}</h2>
        {description && (
          <p className="text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
      </header>
      <div className="space-y-6 p-5 md:p-6">{children}</div>
    </section>
  );
}
