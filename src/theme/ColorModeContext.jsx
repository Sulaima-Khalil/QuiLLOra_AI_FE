import { useEffect, useMemo, useState } from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { createAppTheme } from "./muiTheme";
import { ColorModeContext } from "./useColorMode";

const STORAGE_KEY = "quillora_theme_mode";

export const ColorModeProvider = ({ children }) => {
  const [mode, setMode] = useState(() => localStorage.getItem(STORAGE_KEY) || "dark");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, mode);
  }, [mode]);

  const value = useMemo(
    () => ({ mode, toggleMode: () => setMode((m) => (m === "light" ? "dark" : "light")) }),
    [mode]
  );

  const theme = useMemo(() => createAppTheme(mode), [mode]);

  return (
    <ColorModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};
