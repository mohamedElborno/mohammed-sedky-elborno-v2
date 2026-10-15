import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { EmailCodeSignIn } from "@/components/admin/EmailCodeSignIn";

export default async function SignInPage() {
  const { userId } = await auth();
  if (userId) redirect("/admin");

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <EmailCodeSignIn />
    </div>
  );
}
