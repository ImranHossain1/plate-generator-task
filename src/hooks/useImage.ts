import { useEffect, useState } from "react";

export default function useImage(url: string | null) {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!url) {
      setImg(null);
      setError("");
      return;
    }

    const im = new Image();
    im.crossOrigin = "anonymous";

    im.onload = () => {
      setError("");
      setImg(im);
    };

    im.onerror = () => {
      setImg(null);
      setError("Image failed to load. Check the URL.");
    };

    im.src = url;
  }, [url]);

  return { img, error };
}
