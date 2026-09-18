import { useEffect, useState } from "react";
import { fetchSongs } from "../services/songService.js";

function useSongs() {
  const [songs, setSongs] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    fetchSongs()
      .then((loadedSongs) => {
        if (!isMounted) return;
        setSongs(loadedSongs);
        setStatus("success");
      })
      .catch(() => {
        if (!isMounted) return;
        setStatus("error");
        setError("Unable to load your music library.");
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return { songs, status, error };
}

export default useSongs;
