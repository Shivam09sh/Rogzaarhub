import { getLocationFromIP } from './ipGeolocation';
import { reverseGeocodeGoogle } from './googleMaps';

export interface LocationResult {
  latitude?: number;
  longitude?: number;
  city: string;
  state: string;
  street?: string;
  area?: string;
  district?: string;
  pincode?: string;
  formattedAddress: string;
  source: 'gps-high-accuracy' | 'gps-low-accuracy' | 'ip-fallback';
  error?: string;
}

const getPosition = (options?: PositionOptions): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, options);
  });
};

export const getPreciseLocation = async (): Promise<LocationResult> => {
  // 1. Try High Accuracy GPS
  try {
    const position = await getPosition({ enableHighAccuracy: true, timeout: 5000, maximumAge: 0 });
    const { latitude, longitude } = position.coords;
    const addressData = await reverseGeocodeGoogle(latitude, longitude);

    return {
      ...addressData,
      latitude,
      longitude,
      source: 'gps-high-accuracy'
    };
  } catch (highAccuracyError: any) {
    console.warn('High accuracy GPS failed:', highAccuracyError);

    // 2. Try Low Accuracy GPS (better for desktops/laptops with Wi-Fi)
    try {
      // Only retry if it wasn't a permission denied error
      if (highAccuracyError.code !== 1) { // 1 is PERMISSION_DENIED
        const position = await getPosition({ enableHighAccuracy: false, timeout: 10000, maximumAge: 0 });
        const { latitude, longitude } = position.coords;
        const addressData = await reverseGeocodeGoogle(latitude, longitude);

        return {
          ...addressData,
          latitude,
          longitude,
          source: 'gps-low-accuracy'
        };
      } else {
        throw highAccuracyError; // Re-throw permission denied
      }
    } catch (lowAccuracyError: any) {
      console.warn('Low accuracy GPS failed:', lowAccuracyError);

      // 3. Fallback to IP Geolocation
      try {
        const ipData = await getLocationFromIP();
        return {
          ...ipData,
          source: 'ip-fallback',
          error: lowAccuracyError.message || 'GPS unavailable'
        };
      } catch (ipError) {
        throw new Error('All location detection methods failed');
      }
    }
  }
};

export const constructDetailedAddress = (location: LocationResult): string => {
  const addressParts = [];

  if (location.street) addressParts.push(location.street);
  if (location.area) addressParts.push(location.area);
  if (location.district) addressParts.push(location.district);
  if (location.city) addressParts.push(location.city);
  if (location.state) addressParts.push(location.state);
  if (location.pincode) addressParts.push(`Pincode: ${location.pincode}`);

  // If we have very few parts (e.g. just city/state from IP), try to use formatted address
  if (addressParts.length < 3 && location.formattedAddress) {
    // If formatted address doesn't have pincode but we have it, append it
    if (location.pincode && !location.formattedAddress.includes(location.pincode)) {
      return `${location.formattedAddress}, Pincode: ${location.pincode}`;
    }
    return location.formattedAddress;
  }

  return addressParts.join(', ');
};
