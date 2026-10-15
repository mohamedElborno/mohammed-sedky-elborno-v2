import Markdown, { type Components } from "react-markdown";

export const markdownComponents: Components = {
  h1: ({ children }) => <h1 className="text-4xl font-bold mb-4">{children}</h1>,
  h2: ({ children }) => (
    <h2 className="text-3xl font-semibold mb-3">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-2xl font-semibold mb-3">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="mb-4 text-xl lg:text-justify break-words leading-relaxed dark:text-gray-200 text-gray-950 max-w-[900px]">
      {children}
    </p>
  ),
  ul: ({ children }) => (
    <ul className="list-disc text-lg leading-relaxed pl-6 max-w-[900px] dark:text-zinc-300 text-zinc-700">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal text-lg leading-relaxed pl-6 max-w-[900px]">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="mb-2">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="border-s-4 ps-4 py-2 italic">{children}</blockquote>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="underline hover:text-primary"
    >
      {children}
    </a>
  ),
};

export const RichText = ({ value }: { value?: string }) => {
  if (!value) return null;
  return <Markdown components={markdownComponents}>{value}</Markdown>;
};
