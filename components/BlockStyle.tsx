import Markdown, { type Components } from "react-markdown";

// How text written in the admin's visual editor is drawn on the site.
export const markdownComponents: Components = {
  h1: ({ children }) => (
    <h1 className="mt-12 mb-5 text-4xl font-bold leading-snug first:mt-0">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="mt-12 mb-4 text-2xl font-bold leading-snug first:mt-0 md:text-3xl">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-8 mb-3 text-xl font-bold leading-snug first:mt-0 md:text-2xl">
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="mb-6 text-lg leading-[2] break-words text-foreground/90 md:text-xl md:leading-[2.05]">
      {children}
    </p>
  ),
  strong: ({ children }) => (
    <strong className="font-bold text-foreground">{children}</strong>
  ),
  ul: ({ children }) => (
    <ul className="mb-6 list-disc space-y-2 ps-6 text-lg leading-[1.95] text-foreground/90 md:text-xl">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-6 list-decimal space-y-2 ps-6 text-lg leading-[1.95] text-foreground/90 md:text-xl">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="ps-1">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="my-8 border-s-4 border-foreground/25 ps-5 text-muted-foreground italic [&>p]:mb-0">
      {children}
    </blockquote>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="underline underline-offset-4 hover:text-primary"
    >
      {children}
    </a>
  ),
};

export const RichText = ({ value }: { value?: string }) => {
  if (!value) return null;
  return <Markdown components={markdownComponents}>{value}</Markdown>;
};
