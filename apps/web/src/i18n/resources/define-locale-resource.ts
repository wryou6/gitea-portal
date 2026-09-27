type LocaleDictionary = Record<string, string>;

export function defineLocaleResource<
  const Z extends LocaleDictionary,
  const EN extends Record<keyof Z, string>,
  const JA extends Record<keyof Z, string>,
>(resources: {
  "zh-TW": Z;
  en: EN & Record<Exclude<keyof EN, keyof Z>, never>;
  ja: JA & Record<Exclude<keyof JA, keyof Z>, never>;
}) {
  return resources;
}
