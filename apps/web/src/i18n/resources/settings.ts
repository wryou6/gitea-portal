import type { Locale } from "../locales";

export const settings: Record<
  Locale,
  {
    title: string;
    pageDescription: string;
    appearance: string;
    appearanceDescription: string;
    currentAccount: string;
    appearanceMode: string;
    light: string;
    dark: string;
    system: string;
    lightDescription: string;
    darkDescription: string;
    systemDescription: string;
    currentMode: string;
    colorPalette: string;
    colorPaletteDescription: string;
    palettePreviewTitle: string;
    cobalt: string;
    cobaltDescription: string;
    juniper: string;
    juniperDescription: string;
    iris: string;
    irisDescription: string;
    carbon: string;
    carbonDescription: string;
    ember: string;
    emberDescription: string;
    glacier: string;
    glacierDescription: string;
    language: string;
    languageDescription: string;
  }
> = {
  "zh-TW": {
    title: "設定",
    pageDescription: "個人化 Portal 的外觀與介面語言，變更會立即套用。",
    appearance: "外觀",
    appearanceDescription: "選擇符合閱讀環境的顯示模式。",
    currentAccount: "目前帳號：{{login}}",
    appearanceMode: "外觀模式",
    light: "淺色",
    dark: "深色",
    system: "系統",
    lightDescription: "使用淺色外觀",
    darkDescription: "使用深色外觀",
    systemDescription: "依作業系統設定",
    currentMode: "目前模式：{{mode}}",
    colorPalette: "配色",
    colorPaletteDescription: "預覽並選擇 Portal 的強調色與狀態色。",
    palettePreviewTitle: "範例 Issue",
    cobalt: "霧藍・Cobalt",
    cobaltDescription: "藍灰底色，清晰俐落",
    juniper: "鼠尾草・Juniper",
    juniperDescription: "暖白與礦物綠，柔和沉穩",
    iris: "鳶尾・Iris",
    irisDescription: "薰衣草灰與靛藍，鮮明聚焦",
    carbon: "炭墨・Carbon",
    carbonDescription: "石墨深色表面與明亮黃綠",
    ember: "餘燼・Ember",
    emberDescription: "墨梅底色與溫暖銅橘",
    glacier: "冰川・Glacier",
    glacierDescription: "藍黑層次與清透冰青",
    language: "介面語言",
    languageDescription: "選擇 Portal 的顯示語言",
  },
  en: {
    title: "Settings",
    pageDescription:
      "Personalize the Portal's appearance and language. Changes apply immediately.",
    appearance: "Appearance",
    appearanceDescription:
      "Choose the display mode that suits your environment.",
    currentAccount: "Signed in as {{login}}",
    appearanceMode: "Appearance mode",
    light: "Light",
    dark: "Dark",
    system: "System",
    lightDescription: "Use the light appearance",
    darkDescription: "Use the dark appearance",
    systemDescription: "Follow your operating system",
    currentMode: "Current mode: {{mode}}",
    colorPalette: "Color palette",
    colorPaletteDescription:
      "Preview and choose the Portal's accent and status colors.",
    palettePreviewTitle: "Sample issue",
    cobalt: "Cobalt",
    cobaltDescription: "Blue gray surfaces, crisp contrast",
    juniper: "Juniper",
    juniperDescription: "Warm neutrals with mineral greens",
    iris: "Iris",
    irisDescription: "Lavender gray with focused indigo",
    carbon: "Carbon",
    carbonDescription: "Graphite surfaces with vivid citron accents",
    ember: "Ember",
    emberDescription: "Ink plum with warm copper accents",
    glacier: "Glacier",
    glacierDescription: "Blue-black layers with glacial cyan",
    language: "Interface language",
    languageDescription: "Choose the display language for Portal",
  },
  ja: {
    title: "設定",
    pageDescription:
      "Portal の外観と言語をカスタマイズします。変更はすぐに反映されます。",
    appearance: "外観",
    appearanceDescription: "利用環境に合わせて表示モードを選択します。",
    currentAccount: "現在のアカウント：{{login}}",
    appearanceMode: "外観モード",
    light: "ライト",
    dark: "ダーク",
    system: "システム",
    lightDescription: "ライトテーマを使用",
    darkDescription: "ダークテーマを使用",
    systemDescription: "OS の設定に従う",
    currentMode: "現在のモード：{{mode}}",
    colorPalette: "カラーパレット",
    colorPaletteDescription:
      "Portal のアクセントカラーとステータスカラーをプレビューして選択します。",
    palettePreviewTitle: "Issue の例",
    cobalt: "コバルト",
    cobaltDescription: "青みのグレーで明快な配色",
    juniper: "ジュニパー",
    juniperDescription: "温かいニュートラルと鉱物系グリーン",
    iris: "アイリス",
    irisDescription: "ラベンダーグレーと印象的なインディゴ",
    carbon: "カーボン",
    carbonDescription: "グラファイトの深い面と鮮やかなシトロン",
    ember: "エンバー",
    emberDescription: "インクプラムに温かなカッパー",
    glacier: "グレイシャー",
    glacierDescription: "ブルーブラックと澄んだ氷河色のシアン",
    language: "表示言語",
    languageDescription: "Portal の表示言語を選択",
  },
};
