// Nominatim API utility for OpenStreetMap reverse geocoding
// No API key required - Free and open source!

/**
 * Reverse geocode coordinates to address using OpenStreetMap Nominatim
 * @param lat Latitude
 * @param lng Longitude
 * @returns Object with city and state
 */
export async function reverseGeocode(lat: number, lng: number) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'RozgaarHub/1.0' // Required by Nominatim usage policy
      }
    });

    if (!response.ok) {
      throw new Error('Nominatim API request failed');
    }

    const data = await response.json();

    if (!data.address) {
      throw new Error('No address found for coordinates');
    }

    // Extract city and state from response
    const address = data.address;
    const city = address.city || address.town || address.village || address.suburb || '';
    const state = address.state || '';

    return { city, state };
  } catch (error) {
    console.error('Nominatim reverse geocoding error:', error);
    throw error;
  }
}
