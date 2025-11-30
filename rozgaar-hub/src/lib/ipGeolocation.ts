// IP-based geolocation fallback for desktop devices without GPS
// Uses ipapi.co free API (1000 requests/day, no API key needed)

export async function getLocationFromIP() {
  try {
    console.log('Attempting IP-based geolocation...');
    const response = await fetch('https://ipapi.co/json/');

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('IP geolocation response:', data);

    if (data.error) {
      throw new Error(data.reason || 'IP geolocation API error');
    }

    if (data.city && data.region) {
      console.log(`Location detected: ${data.city}, ${data.region}`);
      const formattedAddress = [data.city, data.region, data.postal, data.country_name]
        .filter(Boolean)
        .join(', ');

      return {
        city: data.city,
        state: data.region,
        country: data.country_name,
        pincode: data.postal,
        formattedAddress
      };
    }

    throw new Error('Unable to determine location from IP');
  } catch (error) {
    console.error('IP geolocation error:', error);
    throw error;
  }
}
