import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { Button } from "./ui/button";
import { getInitialDark, setDarkMode } from "@/lib/theme";

const ThemeToggle = () => {
  const [dark, setDark] = useState(getInitialDark);

  useEffect(() => {
    setDarkMode(dark);
  }, [dark]);

  return (
    <Button variant="ghost" size="icon" onClick={() => setDark((d) => !d)} aria-label="Toggle theme">
      {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
};

export default ThemeToggle;
