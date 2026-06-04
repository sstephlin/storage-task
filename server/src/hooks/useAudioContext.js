/**
 * audio context setup/cleanup.
 */
import { useEffect, useRef } from "react";

export const useAudioContext = () => {
  const audioContextRef = useRef(null);

  useEffect(() => {
    audioContextRef.current = new (
      window.AudioContext || window.webkitAudioContext
    )();

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return audioContextRef;
};
