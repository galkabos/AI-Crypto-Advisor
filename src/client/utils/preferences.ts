import type { OptionsPayload, Preferences } from "../types";

export const defaultOptions: OptionsPayload = {
  assets: [],
  investorTypes: [],
  contentTypes: []
};

export function toggleListValue(values: string[], value: string) {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

export function buildPreferenceLabels(options: OptionsPayload, preferences: Preferences) {
  const assetLabels = preferences.assets.map(
    (assetId) => options.assets.find((asset) => asset.id === assetId)?.symbol ?? assetId
  );
  const investorType =
    options.investorTypes.find((type) => type.id === preferences.investorType)?.label ??
    preferences.investorType;
  const contentTypes = preferences.contentTypes.map(
    (contentType) => options.contentTypes.find((type) => type.id === contentType)?.label ?? contentType
  );

  return {
    assets: assetLabels.join(" / "),
    investorType,
    contentTypes: contentTypes.join(" / ")
  };
}
