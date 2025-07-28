export interface Activity {
  id: string;
  user_id: string;
  time: number; // duration in seconds
  distance: number; // distance in kilometers
  reviewed: boolean;
  review: string | null;
  created_at: string;
  updated_at: string;
}

// Helper functions for Activity
export const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export const formatDistance = (km: number): string => {
  return `${km.toFixed(1)} km`;
};

export const calculatePace = (timeInSeconds: number, distanceInKm: number): string => {
  const pacePerKm = timeInSeconds / distanceInKm;
  const minutes = Math.floor(pacePerKm / 60);
  const seconds = Math.floor(pacePerKm % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}/km`;
};