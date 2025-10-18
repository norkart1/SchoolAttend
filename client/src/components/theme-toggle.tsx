import { DarkMode, LightMode } from "@mui/icons-material";
import { useTheme } from "./theme-provider";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      data-testid="button-theme-toggle"
    >
      {theme === "light" ? (
        <DarkMode sx={{ fontSize: 20 }} />
      ) : (
        <LightMode sx={{ fontSize: 20 }} />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
