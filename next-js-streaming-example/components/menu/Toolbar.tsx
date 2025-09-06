import { AuthContext } from "./Auth";
import { Button } from "../inputs/Button";
import { useContext, useEffect, useState } from "react";

export function Toolbar() {
  const authContext = useContext(AuthContext);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const pref = window.localStorage.getItem("theme-dark");
    const isDark = pref === "true";
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    window.localStorage.setItem("theme-dark", String(next));
    document.documentElement.classList.toggle("dark", next);
  }

  return (
    <div className="fixed bottom-0 z-10 flex h-16 w-full bg-neutral-100 dark:bg-neutral-900">
      <div className="w-full border-t-2 border-neutral-200 dark:border-neutral-800"></div>

      <div className="pb-3 pt-4">
        <Button
          className="absolute right-36 w-28 text-center text-sm"
          text={dark ? "Light mode" : "Dark mode"}
          onClick={toggleTheme}
          tooltip="Toggle theme"
        />
        <Button
          className="absolute right-8 w-24 text-center text-sm"
          text="Log out"
          onClick={authContext.unauthenticate}
          tooltip="Log out"
        />
      </div>
    </div>
  );
}
