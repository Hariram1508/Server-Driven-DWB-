"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { useAuth } from "@/lib/context/AuthContext";
import { getSiteSettings } from "@/lib/api/settings.api";

export const GoogleAnalyticsLoader = () => {
  const { user } = useAuth();
  const [gaId, setGaId] = useState("");

  useEffect(() => {
    if (!user?.institutionId) {
      setGaId("");
      return;
    }

    const loadSettings = async () => {
      try {
        const response = await getSiteSettings();
        const id =
          response.settings?.analytics?.googleAnalyticsId?.trim() || "";
        setGaId(id);
      } catch {
        setGaId("");
      }
    };

    void loadSettings();
  }, [user?.institutionId]);

  if (!gaId) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}');
        `}
      </Script>
    </>
  );
};
