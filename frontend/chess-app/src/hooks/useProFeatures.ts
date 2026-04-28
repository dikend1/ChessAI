import { useEffect, useState } from "react";

const PRO_KEY = "chess-pro";

export function useProFeatures() {
  const [isPro, setIsPro] = useState(() => window.localStorage.getItem(PRO_KEY) === "true");

  useEffect(() => {
    window.localStorage.setItem(PRO_KEY, String(isPro));
  }, [isPro]);

  const upgradeToPro = () => {
    setIsPro(true);
  };

  return { isPro, upgradeToPro };
}
