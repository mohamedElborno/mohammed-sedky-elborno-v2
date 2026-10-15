import { LogoLoader } from "@/components/LogoLoader";

export default function Loading() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <LogoLoader loop className="w-40" />
    </div>
  );
}
