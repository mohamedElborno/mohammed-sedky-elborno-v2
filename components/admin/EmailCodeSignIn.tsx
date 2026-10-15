"use client";

import { FormEvent, useState } from "react";
// The signals-based useSignIn in Clerk v7 has a different API; this form
// keeps the classic create / prepareFirstFactor / attemptFirstFactor flow.
import { useSignIn } from "@clerk/nextjs/legacy";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function clerkError(error: unknown): string {
  if (
    error &&
    typeof error === "object" &&
    "errors" in error &&
    Array.isArray((error as { errors: { longMessage?: string; message?: string }[] }).errors)
  ) {
    const first = (error as { errors: { longMessage?: string; message?: string }[] })
      .errors[0];
    return first?.longMessage || first?.message || "تعذّر تسجيل الدخول";
  }
  if (error instanceof Error && error.message) return error.message;
  return "تعذّر تسجيل الدخول";
}

export function EmailCodeSignIn() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!isLoaded || !signIn) {
    return <p className="text-muted-foreground text-center">تحميل...</p>;
  }

  const requestCode = async () => {
    const created = await signIn.create({ identifier: email.trim() });
    const factor = created.supportedFirstFactors?.find(
      (item) => item.strategy === "email_code",
    );
    if (!factor || factor.strategy !== "email_code") {
      throw new Error(
        "فعّل Email verification code من Clerk Dashboard (User & authentication → Email) وأوقف Email verification link.",
      );
    }
    await signIn.prepareFirstFactor({
      strategy: "email_code",
      emailAddressId: factor.emailAddressId,
    });
    setCode("");
    setStep("code");
  };

  const onSend = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await requestCode();
    } catch (caught) {
      setError(clerkError(caught));
    } finally {
      setBusy(false);
    }
  };

  const onVerify = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "email_code",
        code: code.trim(),
      });
      if (result.status !== "complete" || !result.createdSessionId) {
        throw new Error("لم يكتمل التحقق. أعد إدخال الرمز.");
      }
      await setActive({ session: result.createdSessionId });
      router.push("/admin");
      router.refresh();
    } catch (caught) {
      setError(clerkError(caught));
    } finally {
      setBusy(false);
    }
  };

  if (step === "code") {
    return (
      <form
        onSubmit={onVerify}
        className="w-full max-w-sm space-y-4 rounded-xl border bg-background p-6 text-right shadow-sm"
      >
        <div className="space-y-1">
          <h1 className="text-xl font-semibold">أدخل رمز التحقق</h1>
          <p className="text-muted-foreground text-sm">
            أرسلنا رمزاً من 6 أرقام إلى {email}
          </p>
        </div>
        <Input
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          value={code}
          onChange={(event) =>
            setCode(event.target.value.replace(/\D/g, "").slice(0, 6))
          }
          placeholder="000000"
          className="text-center text-lg tracking-[0.4em]"
          dir="ltr"
          required
        />
        {error && <p className="text-destructive text-sm">{error}</p>}
        <Button type="submit" className="w-full" disabled={busy || code.length < 6}>
          {busy ? "جارٍ التحقق..." : "دخول"}
        </Button>
        <div className="flex flex-col gap-2">
          <Button
            type="button"
            variant="ghost"
            disabled={busy}
            onClick={() => {
              setError(null);
              setBusy(true);
              void requestCode()
                .catch((caught) => setError(clerkError(caught)))
                .finally(() => setBusy(false));
            }}
          >
            إعادة إرسال الرمز
          </Button>
          <Button
            type="button"
            variant="ghost"
            disabled={busy}
            onClick={() => {
              setStep("email");
              setCode("");
              setError(null);
            }}
          >
            تغيير البريد
          </Button>
        </div>
      </form>
    );
  }

  return (
    <form
      onSubmit={onSend}
      className="w-full max-w-sm space-y-4 rounded-xl border bg-background p-6 text-right shadow-sm"
    >
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">تسجيل الدخول</h1>
        <p className="text-muted-foreground text-sm">
          أدخل بريد المشرف وسنرسل رمزاً من 6 أرقام.
        </p>
      </div>
      <Input
        type="email"
        autoComplete="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="you@example.com"
        dir="ltr"
        className="text-left"
        required
      />
      {error && <p className="text-destructive text-sm">{error}</p>}
      <Button type="submit" className="w-full" disabled={busy || !email.trim()}>
        {busy ? "جارٍ الإرسال..." : "إرسال الرمز"}
      </Button>
    </form>
  );
}
