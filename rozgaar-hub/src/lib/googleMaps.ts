import { setOptions, importLibrary } from '@googlemaps/js-api-loader';

// Initialize Google Maps API options
setOptions({
  apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  version: 'weekly',
} as any);

let googleMapsLoaded = false;

// Load Google Maps API
async function loadGoogleMaps(): Promise<typeof google> {
  if (googleMapsLoaded && window.google) {
    return window.google;
  }

  try {
    await importLibrary('places');
    await importLibrary('geocoding');
    googleMapsLoaded = true;
    return window.google;
  } catch (error) {
    console.error('Error loading Google Maps API:', error);
    throw new Error('Failed to load Google Maps API. Please check your API key.');
  }
}

/**
 * Reverse geocode coordinates to get city and state
 * @param latitude - Latitude coordinate
 * @param longitude - Longitude coordinate
 * @returns Object containing city, state, and country
 */
export async function reverseGeocodeGoogle(latitude: number, longitude: number) {
  try {
    const google = await loadGoogleMaps();
    const geocoder = new google.maps.Geocoder();

    const response = await geocoder.geocode({
      location: { lat: latitude, lng: longitude }
    });

    if (!response.results || response.results.length === 0) {
      throw new Error('No results found for the given coordinates');
    }

    const result = response.results[0];
    let city = '';
    let state = '';
    let country = '';

    let street = '';
    let district = '';
    let pincode = '';
    let area = '';

    // Parse address components
    for (const component of result.address_components) {
      const types = component.types;

      if (types.includes('locality')) {
        city = component.long_name;
      } else if (types.includes('administrative_area_level_3') && !city) {
        city = component.long_name;
      } else if (types.includes('administrative_area_level_1')) {
        state = component.long_name;
      } else if (types.includes('country')) {
        country = component.long_name;
      } else if (types.includes('route')) {
        street = component.long_name;
      } else if (types.includes('administrative_area_level_2')) {
        district = component.long_name;
      } else if (types.includes('postal_code')) {
        pincode = component.long_name;
      } else if (types.includes('sublocality') || types.includes('neighborhood')) {
        // Prefer sublocality over neighborhood if both exist, or concatenate? 
        // Usually sublocality is better for "Village/Area"
        if (!area) area = component.long_name;
      }
    }

    console.log('Google Maps reverse geocoding result:', { city, state, country, street, district, pincode, area });

    if (!city || !state) {
      throw new Error('Could not determine city or state from coordinates');
    }

    return {
      city,
      state,
      country,
      street,
      district,
      pincode,
      area,
      formattedAddress: result.formatted_address
    };
  } catch (error) {
    console.error('Google Maps reverse geocoding error:', error);
    throw error;
  }
}

/**
 * Geocode an address string to get coordinates
 * @param address - Address string to geocode
 * @returns Object containing latitude and longitude
 */
export async function geocodeAddress(address: string) {
  try {
    const google = await loadGoogleMaps();
    const geocoder = new google.maps.Geocoder();

    const response = await geocoder.geocode({ address });

    if (!response.results || response.results.length === 0) {
      throw new Error('No results found for the given address');
    }

    const location = response.results[0].geometry.location;
    return {
      latitude: location.lat(),
      longitude: location.lng()
    };
  } catch (error) {
    console.error('Google Maps geocoding error:', error);
    throw error;
  }
}

/**
 * Get autocomplete predictions for a search query
 * @param input - Search query string
 * @param options - Optional autocomplete options
 * @returns Array of place predictions
 */
export async function getPlacePredictions(
  input: string,
  options?: {
    componentRestrictions?: { country: string | string[] };
    types?: string[];
  }
) {
  try {
    const google = await loadGoogleMaps();
    const autocompleteService = new google.maps.places.AutocompleteService();

    const request: google.maps.places.AutocompletionRequest = {
      input,
      componentRestrictions: options?.componentRestrictions || { country: 'in' },
      types: options?.types || ['(cities)']
    };

    const response = await autocompleteService.getPlacePredictions(request);

    return response.predictions.map(prediction => ({
      placeId: prediction.place_id,
      description: prediction.description,
      mainText: prediction.structured_formatting.main_text,
      secondaryText: prediction.structured_formatting.secondary_text
    }));
  } catch (error) {
    console.error('Google Maps autocomplete error:', error);
    throw error;
  }
}

/**
 * Get place details from a place ID
 * @param placeId - Google Maps Place ID
 * @returns Place details including address components and coordinates
 */
export async function getPlaceDetails(placeId: string) {
  try {
    const google = await loadGoogleMaps();
    const placesService = new google.maps.places.PlacesService(
      document.createElement('div')
    );

    return new Promise<{
      city: string;
      state: string;
      country: string;
      latitude: number;
      longitude: number;
    }>((resolve, reject) => {
      placesService.getDetails(
        {
          placeId,
          fields: ['address_components', 'geometry']
        },
        (place, status) => {
          if (status !== google.maps.places.PlacesServiceStatus.OK || !place) {
            reject(new Error(`Place details request failed: ${status}`));
            return;
          }

          let city = '';
          let state = '';
          let country = '';

          // Parse address components
          if (place.address_components) {
            for (const component of place.address_components) {
              const types = component.types;

              if (types.includes('locality')) {
                city = component.long_name;
              } else if (types.includes('administrative_area_level_3') && !city) {
                city = component.long_name;
              } else if (types.includes('administrative_area_level_1')) {
                state = component.long_name;
              } else if (types.includes('country')) {
                country = component.long_name;
              }
            }
          }

          const location = place.geometry?.location;
          if (!location) {
            reject(new Error('No location data available'));
            return;
          }

          resolve({
            city,
            state,
            country,
            latitude: location.lat(),
            longitude: location.lng()
          });
        }
      );
    });
  } catch (error) {
    console.error('Google Maps place details error:', error);
    throw error;
  }
}

/**
 * Check if Google Maps API is available
 * @returns Boolean indicating if API key is configured
 */
export function isGoogleMapsAvailable(): boolean {
  return !!import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
}

export interface StructuredLocation {
  latitude: string;
  longitude: string;
  formatted_address: string;
  house_number: string;
  street: string;
  village: string;
  district: string;
  state: string;
  country: string;
  pincode: string;
  accuracy_score: number;
}

export interface StructuredLocationResponse {
  status: "success" | "error";
  location: StructuredLocation | null;
  alternatives: StructuredLocation[];
  message?: string;
}

/**
 * Advanced structured address search
 * @param query - Address query string
 * @returns Structured JSON response
 */
export async function searchLocationStructured(query: string): Promise<StructuredLocationResponse> {
  try {
    const google = await loadGoogleMaps();
    const geocoder = new google.maps.Geocoder();

    const response = await geocoder.geocode({ address: query });

    if (!response.results || response.results.length === 0) {
      return {
        status: "error",
        location: null,
        alternatives: [],
        message: "No results found"
      };
    }

    const parseResult = (result: google.maps.GeocoderResult): StructuredLocation => {
      const components = result.address_components;
      const getComponent = (type: string) => components.find(c => c.types.includes(type))?.long_name || "";

      const getAccuracy = (type: google.maps.GeocoderLocationType): number => {
        switch (type) {
          case 'ROOFTOP': return 1.0;
          case 'RANGE_INTERPOLATED': return 0.8;
          case 'GEOMETRIC_CENTER': return 0.5;
          case 'APPROXIMATE': return 0.2;
          default: return 0.0;
        }
      };

      return {
        latitude: result.geometry.location.lat().toString(),
        longitude: result.geometry.location.lng().toString(),
        formatted_address: result.formatted_address,
        house_number: getComponent("street_number"),
        street: getComponent("route"),
        village: getComponent("sublocality") || getComponent("neighborhood") || getComponent("locality"),
        district: getComponent("administrative_area_level_2"),
        state: getComponent("administrative_area_level_1"),
        country: getComponent("country"),
        pincode: getComponent("postal_code"),
        accuracy_score: getAccuracy(result.geometry.location_type)
      };
    };

    const results = response.results.map(parseResult);

    return {
      status: "success",
      location: results[0],
      alternatives: results.slice(1, 4) // Top 3 alternatives (excluding the first one which is main location)
    };

  } catch (error) {
    console.error("Structured search error:", error);
    return {
      status: "error",
      location: null,
      alternatives: [],
      message: error instanceof Error ? error.message : "Unknown error"
    };
  }
}
