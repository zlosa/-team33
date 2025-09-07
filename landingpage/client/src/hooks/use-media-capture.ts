import { useState, useCallback } from "react";

export function useMediaCapture() {
  const [error, setError] = useState<string | null>(null);

  const isSupported = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);

  const requestMicrophone = useCallback(async (): Promise<MediaStream | null> => {
    if (!isSupported) {
      setError("Media capture is not supported in this browser");
      return null;
    }

    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      });
      return stream;
    } catch (err) {
      let errorMessage = "Failed to access microphone";
      
      if (err instanceof DOMException) {
        switch (err.name) {
          case "NotAllowedError":
            errorMessage = "Microphone access denied. Please allow microphone access and try again.";
            break;
          case "NotFoundError":
            errorMessage = "No microphone found. Please connect a microphone and try again.";
            break;
          case "NotReadableError":
            errorMessage = "Microphone is already in use by another application.";
            break;
          case "OverconstrainedError":
            errorMessage = "Microphone doesn't meet the required specifications.";
            break;
          case "SecurityError":
            errorMessage = "Microphone access blocked due to security restrictions.";
            break;
          default:
            errorMessage = `Microphone error: ${err.message}`;
        }
      }
      
      setError(errorMessage);
      console.error("Microphone access error:", err);
      return null;
    }
  }, [isSupported]);

  const requestCamera = useCallback(async (): Promise<MediaStream | null> => {
    if (!isSupported) {
      setError("Media capture is not supported in this browser");
      return null;
    }

    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
      });
      return stream;
    } catch (err) {
      let errorMessage = "Failed to access camera";
      
      if (err instanceof DOMException) {
        switch (err.name) {
          case "NotAllowedError":
            errorMessage = "Camera access denied. Please allow camera access and try again.";
            break;
          case "NotFoundError":
            errorMessage = "No camera found. Please connect a camera and try again.";
            break;
          case "NotReadableError":
            errorMessage = "Camera is already in use by another application.";
            break;
          case "OverconstrainedError":
            errorMessage = "Camera doesn't meet the required specifications.";
            break;
          case "SecurityError":
            errorMessage = "Camera access blocked due to security restrictions.";
            break;
          default:
            errorMessage = `Camera error: ${err.message}`;
        }
      }
      
      setError(errorMessage);
      console.error("Camera access error:", err);
      return null;
    }
  }, [isSupported]);

  return {
    requestMicrophone,
    requestCamera,
    isSupported,
    error,
  };
}
