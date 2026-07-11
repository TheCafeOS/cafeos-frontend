import type { SettingsResponse } from "@/types/settings";

export async function getSettings(): Promise<SettingsResponse> {
  throw new Error("Settings API is not implemented yet.");
}

export async function updateSettings(
  _data: SettingsResponse,
): Promise<SettingsResponse> {
  throw new Error("Settings API is not implemented yet.");
}