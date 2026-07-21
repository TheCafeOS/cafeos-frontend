"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { getSettings } from "@/services/settings.service";
import type { SettingsResponse } from "@/types/settings";

type RestaurantBrandingContextValue = {
  settings: SettingsResponse | null;
  loading: boolean;
  refreshBranding: () => Promise<void>;
  setBranding: (settings: SettingsResponse) => void;

  restaurant: SettingsResponse["restaurant"] | null;
  account: SettingsResponse["account"] | null;
};

const RestaurantBrandingContext =
  createContext<RestaurantBrandingContextValue | null>(null);

export function RestaurantBrandingProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [settings, setSettings] = useState<SettingsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshBranding = useCallback(async () => {
    try {
      setLoading(true);

      const data = await getSettings();

      setSettings(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshBranding();
  }, [refreshBranding]);

  const value = useMemo(
    () => ({
      settings,
      loading,
      refreshBranding,
      setBranding: setSettings,
      restaurant: settings?.restaurant ?? null,
      account: settings?.account ?? null,
    }),
    [settings, loading, refreshBranding],
  );

  return (
    <RestaurantBrandingContext.Provider value={value}>
      {children}
    </RestaurantBrandingContext.Provider>
  );
}

export function useRestaurantBranding() {
  const context = useContext(RestaurantBrandingContext);

  if (!context) {
    throw new Error(
      "useRestaurantBranding must be used inside RestaurantBrandingProvider",
    );
  }

  return context;
}