import { createContext, useContext } from "react";

export const ColorModeContext = createContext({ mode: "light", toggleMode: () => {} });

export const useColorMode = () => useContext(ColorModeContext);
