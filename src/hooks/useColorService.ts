import { useCallback } from 'react';

export const SENDER_IP = '0.0.0.0';

export const useColorService = (receiverIps: Set<string>) => {
  const getColorForIp = useCallback((ip: string): string => {
    if (ip === SENDER_IP) return '#00E676'; // Sender - Green

    // Keep track of unique IPs and their assigned colors
    const uniqueIps = Array.from(receiverIps);
    const ipIndex = uniqueIps.indexOf(ip);

    if (ipIndex === -1) return '#808080'; // Fallback color

    // Generate evenly distributed colors around the color wheel
    const goldenRatio = 0.618033988749895;
    const hue = (ipIndex * goldenRatio * 360) % 360;

    // Use fixed saturation and lightness for consistent visibility
    return `hsl(${hue}, 80%, 60%)`;
  }, [receiverIps]);

  return { getColorForIp };
};