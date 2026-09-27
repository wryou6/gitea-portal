import type { Locale } from "../locales";

export const settings: Record<
  Locale,
  {
    title: string;
    appearance: string;
    currentAccount: string;
    appearanceMode: string;
    light: string;
    dark: string;
    system: string;
    lightDescription: string;
    darkDescription: string;
    systemDescription: string;
    currentMode: string;
    language: string;
    languageDescription: string;
  }
> = {
  "zh-TW": {
    title: "設定",
    appearance: "外觀",
    currentAccount: "目前帳號：{{login}}",
    appearanceMode: "外觀模式",
    light: "淺色",
    dark: "深色",
    system: "系統",
    lightDescription: "使用淺色外觀",
    darkDescription: "使用深色外觀",
    systemDescription: "依作業系統設定",
    currentMode: "目前模式：{{mode}}",
    language: "介面語言",
    languageDescription: "選擇 Portal 的顯示語言",
  },
  en: {
    title: "Settings",
    appearance: "Appearance",
    currentAccount: "Signed in as {{login}}",
    appearanceMode: "Appearance mode",
    light: "Light",
    dark: "Dark",
    system: "System",
    lightDescription: "Use the light appearance",
    darkDescription: "Use the dark appearance",
    systemDescription: "Follow your operating system",
    currentMode: "Current mode: {{mode}}",
    language: "Interface language",
    languageDescription: "Choose the display language for Portal",
  },
  ja: {
    title: "設定",
    appearance: "外観",
    currentAccount: "現在のアカウント：{{login}}",
    appearanceMode: "外観モード",
    light: "ライト",
    dark: "ダーク",
    system: "システム",
    lightDescription: "ライトテーマを使用",
    darkDescription: "ダークテーマを使用",
    systemDescription: "OS の設定に従う",
    currentMode: "現在のモード：{{mode}}",
    language: "表示言語",
    languageDescription: "Portal の表示言語を選択",
  },
};
