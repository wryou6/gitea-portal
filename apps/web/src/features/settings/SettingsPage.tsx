import type { ThemeMode } from "./theme-preference";

const themeLabels: Record<ThemeMode, string> = {
  light: "Light",
  dark: "Dark",
  system: "System",
};

const themeOptions: Array<{
  mode: ThemeMode;
  label: string;
  description: string;
}> = [
  { mode: "light", label: "Light", description: "淺色外觀" },
  { mode: "dark", label: "Dark", description: "深色外觀" },
  { mode: "system", label: "System", description: "依作業系統設定" },
];

export function SettingsPage({
  login,
  mode,
  onThemeChange,
}: {
  login?: string;
  mode: ThemeMode;
  onThemeChange: (mode: ThemeMode) => void;
}) {
  return (
    <section className="settings-page">
      <header className="page-heading">
        <h1>設定</h1>
      </header>
      <section className="settings-card" aria-labelledby="settings-appearance">
        <h2 id="settings-appearance">外觀</h2>
        {login && <p className="muted">目前帳號：{login}</p>}
        <fieldset className="theme-options">
          <legend>外觀模式</legend>
          {themeOptions.map((option) => (
            <label
              className={`theme-option ${mode === option.mode ? "theme-option--selected" : ""}`}
              key={option.mode}
            >
              <input
                type="radio"
                name="theme-mode"
                value={option.mode}
                checked={mode === option.mode}
                onChange={() => onThemeChange(option.mode)}
              />
              <span>
                <strong>{option.label}</strong>
                <small>{option.description}</small>
              </span>
            </label>
          ))}
        </fieldset>
        <p className="settings-current-mode" aria-live="polite">
          目前模式：<strong>{themeLabels[mode]}</strong>
        </p>
      </section>
    </section>
  );
}
