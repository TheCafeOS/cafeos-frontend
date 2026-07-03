"use client";

import { Suspense } from "react";
import { MenuPageContent } from "@/components/menu/menu-page-content";

export default function QRMenuPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MenuPageContent />
    </Suspense>
  );
}

