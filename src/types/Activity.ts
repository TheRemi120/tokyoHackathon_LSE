export interface Activity {
  id: string;
  user_id: string;
  time: number | null; // duration in seconds, can be null if skipped
  distance: number | null; // distance in kilometers, can be null if skipped
  reviewed: boolean;
  review: string | null;
  score?: number | null; // performance score from 1 to 10, calculated by LLM (optional for backward compatibility)
  created_at: string;
  updated_at: string;
}

// Helper functions for Activity
export const formatDuration = (seconds: number | null): string => {
  if (seconds === null || seconds === -1) return "N/A";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export const formatDistance = (km: number | null): string => {
  if (km === null || km === -1) return "N/A";
  return `${km.toFixed(1)} km`;
};

export const calculatePace = (timeInSeconds: number | null, distanceInKm: number | null): string => {
  if (timeInSeconds === null || distanceInKm === null || distanceInKm === 0 || timeInSeconds === -1 || distanceInKm === -1) return "N/A";
  const pacePerKm = timeInSeconds / distanceInKm;
  const minutes = Math.floor(pacePerKm / 60);
  const seconds = Math.floor(pacePerKm % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}/km`;
};