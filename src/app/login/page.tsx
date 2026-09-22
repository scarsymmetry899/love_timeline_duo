"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Landing from "@/components/landing/landing";

function LandingWithParams() {
  const params = useSearchParams();
  const next = params.get("next") ?? "/";
  return (
    <Landing
      next={next}
      joining={next.startsWith("/invite/")}
      oldLinkFailed={params.get("error") === "link"}
    />
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LandingWithParams />
    </Suspense>
  );
}
