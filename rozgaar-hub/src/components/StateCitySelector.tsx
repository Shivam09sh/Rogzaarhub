import React, { useState, useEffect, useRef } from 'react';
import { getPlacePredictions, getPlaceDetails, isGoogleMapsAvailable } from '@/lib/googleMaps';
import { Search, MapPin, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface StateCitySelectorProps {
  onStateChange?: (stateName: string) => void;
  onCityChange?: (cityName: string) => void;
  defaultState?: string;
  defaultCity?: string;
  showAutocomplete?: boolean; // Option to show/hide autocomplete feature
}

interface StateData {
  [key: string]: string[];
}

interface PlacePrediction {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
}

const STATE_CITY_DATA: StateData = {
  "Andhra Pradesh": [
    "Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool",
    "Rajahmundry", "Tirupati", "Kakinada", "Kadapa", "Anantapur",
    "Vizianagaram", "Eluru"
  ],
  "Arunachal Pradesh": [
    "Itanagar", "Naharlagun", "Pasighat", "Tawang", "Ziro",
    "Bomdila", "Tezu", "Seppa", "Changlang", "Roing"
  ],
  "Assam": [
    "Guwahati", "Silchar", "Dibrugarh", "Jorhat", "Nagaon",
    "Tinsukia", "Tezpur", "Bongaigaon", "Karimganj", "Dhubri",
    "Goalpara", "Sivasagar"
  ],
  "Bihar": [
    "Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Purnia",
    "Darbhanga", "Bihar Sharif", "Arrah", "Begusarai", "Katihar",
    "Munger", "Chhapra"
  ],
  "Chhattisgarh": [
    "Raipur", "Bhilai", "Bilaspur", "Korba", "Durg",
    "Rajnandgaon", "Jagdalpur", "Raigarh", "Ambikapur", "Dhamtari",
    "Mahasamund", "Chirmiri"
  ],
  "Goa": [
    "Panaji", "Margao", "Vasco da Gama", "Mapusa", "Ponda",
    "Bicholim", "Curchorem", "Sanquelim", "Cuncolim", "Quepem"
  ],
  "Gujarat": [
    "Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar",
    "Jamnagar", "Junagadh", "Gandhinagar", "Anand", "Nadiad",
    "Morbi", "Gandhidham"
  ],
  "Haryana": [
    "Faridabad", "Gurgaon", "Hisar", "Rohtak", "Panipat",
    "Karnal", "Sonipat", "Yamunanagar", "Panchkula", "Bhiwani",
    "Ambala", "Sirsa"
  ],
  "Himachal Pradesh": [
    "Shimla", "Dharamshala", "Solan", "Mandi", "Kullu",
    "Hamirpur", "Bilaspur", "Una", "Kangra", "Chamba",
    "Palampur", "Nahan"
  ],
  "Jharkhand": [
    "Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Deoghar",
    "Hazaribagh", "Giridih", "Ramgarh", "Medininagar", "Chirkunda",
    "Phusro", "Adityapur"
  ],
  "Karnataka": [
    "Bengaluru", "Mysuru", "Mangaluru", "Hubballi", "Belagavi",
    "Davanagere", "Ballari", "Vijayapura", "Shivamogga", "Tumakuru",
    "Raichur", "Bidar"
  ],
  "Kerala": [
    "Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam",
    "Palakkad", "Alappuzha", "Malappuram", "Kannur", "Kottayam",
    "Kasaragod", "Pathanamthitta"
  ],
  "Madhya Pradesh": [
    "Indore", "Bhopal", "Jabalpur", "Gwalior", "Ujjain",
    "Sagar", "Dewas", "Satna", "Ratlam", "Rewa",
    "Katni", "Singrauli"
  ],
  "Maharashtra": [
    "Mumbai", "Pune", "Nagpur", "Thane", "Nashik",
    "Aurangabad", "Solapur", "Kolhapur", "Amravati", "Navi Mumbai",
    "Sangli", "Jalgaon"
  ],
  "Manipur": [
    "Imphal", "Thoubal", "Bishnupur", "Churachandpur", "Kakching",
    "Ukhrul", "Senapati", "Tamenglong", "Jiribam", "Moirang"
  ],
  "Meghalaya": [
    "Shillong", "Tura", "Nongstoin", "Jowai", "Baghmara",
    "Williamnagar", "Nongpoh", "Mairang", "Resubelpara", "Cherrapunji"
  ],
  "Mizoram": [
    "Aizawl", "Lunglei", "Champhai", "Serchhip", "Kolasib",
    "Saiha", "Lawngtlai", "Mamit", "Hnahthial", "Khawzawl"
  ],
  "Nagaland": [
    "Kohima", "Dimapur", "Mokokchung", "Tuensang", "Wokha",
    "Zunheboto", "Phek", "Mon", "Kiphire", "Longleng"
  ],
  "Odisha": [
    "Bhubaneswar", "Cuttack", "Rourkela", "Berhampur", "Sambalpur",
    "Puri", "Balasore", "Bhadrak", "Baripada", "Jharsuguda",
    "Jeypore", "Bargarh"
  ],
  "Punjab": [
    "Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda",
    "Mohali", "Hoshiarpur", "Pathankot", "Moga", "Abohar",
    "Batala", "Khanna"
  ],
  "Rajasthan": [
    "Jaipur", "Jodhpur", "Kota", "Bikaner", "Ajmer",
    "Udaipur", "Bhilwara", "Alwar", "Bharatpur", "Sikar",
    "Pali", "Tonk"
  ],
  "Sikkim": [
    "Gangtok", "Namchi", "Gyalshing", "Mangan", "Rangpo",
    "Jorethang", "Singtam", "Ravangla", "Pelling", "Yuksom"
  ],
  "Tamil Nadu": [
    "Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem",
    "Tirunelveli", "Tiruppur", "Erode", "Vellore", "Thoothukudi",
    "Thanjavur", "Dindigul"
  ],
  "Telangana": [
    "Hyderabad", "Warangal", "Nizamabad", "Khammam", "Karimnagar",
    "Ramagundam", "Mahbubnagar", "Nalgonda", "Adilabad", "Suryapet",
    "Siddipet", "Miryalaguda"
  ],
  "Tripura": [
    "Agartala", "Udaipur", "Dharmanagar", "Kailashahar", "Belonia",
    "Khowai", "Ambassa", "Sabroom", "Amarpur", "Teliamura"
  ],
  "Uttar Pradesh": [
    "Lucknow", "Kanpur", "Ghaziabad", "Agra", "Varanasi",
    "Meerut", "Prayagraj", "Bareilly", "Aligarh", "Moradabad",
    "Saharanpur", "Gorakhpur"
  ],
  "Uttarakhand": [
    "Dehradun", "Haridwar", "Roorkee", "Haldwani", "Rudrapur",
    "Kashipur", "Rishikesh", "Pithoragarh", "Nainital", "Almora",
    "Tehri", "Pauri"
  ],
  "West Bengal": [
    "Kolkata", "Howrah", "Durgapur", "Asansol", "Siliguri",
    "Bardhaman", "Malda", "Baharampur", "Habra", "Kharagpur",
    "Shantipur", "Haldia"
  ],
  "Andaman and Nicobar Islands": [
    "Port Blair", "Diglipur", "Rangat", "Mayabunder", "Car Nicobar",
    "Havelock Island", "Neil Island", "Bamboo Flat", "Garacharma", "Ferrargunj"
  ],
  "Chandigarh": [
    "Chandigarh", "Sector 17", "Sector 22", "Sector 35", "Manimajra",
    "Panchkula", "Mohali", "Zirakpur"
  ],
  "Dadra and Nagar Haveli and Daman and Diu": [
    "Daman", "Diu", "Silvassa", "Dadra", "Nani Daman",
    "Moti Daman", "Khanvel", "Samarvarni", "Amli", "Naroli"
  ],
  "Delhi": [
    "New Delhi", "North Delhi", "South Delhi", "East Delhi", "West Delhi",
    "Central Delhi", "Dwarka", "Rohini", "Janakpuri", "Karol Bagh",
    "Connaught Place", "Nehru Place"
  ],
  "Jammu and Kashmir": [
    "Srinagar", "Jammu", "Anantnag", "Baramulla", "Sopore",
    "Kathua", "Udhampur", "Pulwama", "Rajouri", "Poonch",
    "Kupwara", "Budgam"
  ],
  "Ladakh": [
    "Leh", "Kargil", "Nubra", "Zanskar", "Drass",
    "Diskit", "Panamik", "Nyoma", "Khalsi", "Turtuk"
  ],
  "Lakshadweep": [
    "Kavaratti", "Agatti", "Amini", "Andrott", "Minicoy",
    "Kalpeni", "Kadmat", "Kiltan", "Chetlat", "Bitra"
  ],
  "Puducherry": [
    "Puducherry", "Karaikal", "Yanam", "Mahe", "Oulgaret",
    "Villianur", "Ariyankuppam", "Nettapakkam", "Bahour", "Kurumbapet"
  ]
};

const StateCitySelector: React.FC<StateCitySelectorProps> = ({
  onStateChange,
  onCityChange,
  defaultState = "",
  defaultCity = "",
  showAutocomplete = true
}) => {
  const [selectedState, setSelectedState] = useState<string>(defaultState);
  const [selectedCity, setSelectedCity] = useState<string>(defaultCity);
  const [availableCities, setAvailableCities] = useState<string[]>([]);

  // Autocomplete states
  const [searchMode, setSearchMode] = useState<'autocomplete' | 'manual'>('manual');
  const [searchQuery, setSearchQuery] = useState('');
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [showPredictions, setShowPredictions] = useState(false);
  const [loadingPredictions, setLoadingPredictions] = useState(false);
  const [loadingPlaceDetails, setLoadingPlaceDetails] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const predictionsRef = useRef<HTMLDivElement>(null);

  // Get sorted list of states
  const states = Object.keys(STATE_CITY_DATA).sort();

  // Check if Google Maps is available
  const googleMapsEnabled = isGoogleMapsAvailable() && showAutocomplete;

  // Sync with props when they change
  useEffect(() => {
    if (defaultState !== undefined) {
      setSelectedState(defaultState);
    }
  }, [defaultState]);

  useEffect(() => {
    if (defaultCity !== undefined) {
      setSelectedCity(defaultCity);
    }
  }, [defaultCity]);

  // Update available cities when state changes
  useEffect(() => {
    if (selectedState && STATE_CITY_DATA[selectedState]) {
      setAvailableCities(STATE_CITY_DATA[selectedState]);
    } else {
      setAvailableCities([]);
    }
  }, [selectedState]);

  // Handle clicks outside predictions dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        predictionsRef.current &&
        !predictionsRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowPredictions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search for autocomplete
  useEffect(() => {
    if (searchMode !== 'autocomplete' || !searchQuery.trim()) {
      setPredictions([]);
      return;
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      try {
        setLoadingPredictions(true);
        const results = await getPlacePredictions(searchQuery, {
          componentRestrictions: { country: 'in' },
          types: ['(cities)']
        });
        setPredictions(results);
        setShowPredictions(true);
      } catch (error) {
        console.error('Error fetching predictions:', error);
        setPredictions([]);
      } finally {
        setLoadingPredictions(false);
      }
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery, searchMode]);

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newState = e.target.value;
    setSelectedState(newState);
    setSelectedCity(""); // Reset city when state changes

    if (onStateChange) {
      onStateChange(newState);
    }
    if (onCityChange) {
      onCityChange(""); // Notify that city has been reset
    }
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCity = e.target.value;
    setSelectedCity(newCity);

    if (onCityChange) {
      onCityChange(newCity);
    }
  };

  const handlePredictionSelect = async (prediction: PlacePrediction) => {
    try {
      setLoadingPlaceDetails(true);
      setShowPredictions(false);
      setSearchQuery(prediction.description);

      const placeDetails = await getPlaceDetails(prediction.placeId);

      // Try to match state from Google Maps to our state list
      const matchedState = Object.keys(STATE_CITY_DATA).find(
        s => s.toLowerCase() === placeDetails.state.toLowerCase()
      );

      if (matchedState) {
        setSelectedState(matchedState);

        // Try to match city
        const matchedCity = STATE_CITY_DATA[matchedState].find(
          c => c.toLowerCase() === placeDetails.city.toLowerCase()
        );

        if (matchedCity) {
          setSelectedCity(matchedCity);
          if (onStateChange) onStateChange(matchedState);
          if (onCityChange) onCityChange(matchedCity);
          toast.success(`Location selected: ${matchedCity}, ${matchedState}`);
        } else {
          // City not in our list, just set state
          setSelectedCity("");
          if (onStateChange) onStateChange(matchedState);
          if (onCityChange) onCityChange("");
          toast.warning(`State selected: ${matchedState}. Please select city manually.`);
        }
      } else {
        toast.warning('Could not match location to our database. Please select manually.');
      }
    } catch (error) {
      console.error('Error getting place details:', error);
      toast.error('Failed to get location details. Please try manual selection.');
    } finally {
      setLoadingPlaceDetails(false);
    }
  };

  const toggleSearchMode = () => {
    const newMode = searchMode === 'autocomplete' ? 'manual' : 'autocomplete';
    setSearchMode(newMode);
    setSearchQuery('');
    setPredictions([]);
    setShowPredictions(false);
  };

  return (
    <div className="space-y-4">
      {/* Mode Toggle - Only show if Google Maps is available */}
      {googleMapsEnabled && (
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">Location Selection</label>
          <button
            type="button"
            onClick={toggleSearchMode}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
          >
            {searchMode === 'autocomplete' ? (
              <>Select Manually</>
            ) : (
              <>
                <Search className="h-3 w-3" />
                Search Location
              </>
            )}
          </button>
        </div>
      )}

      {/* Autocomplete Search Mode */}
      {searchMode === 'autocomplete' && googleMapsEnabled && (
        <div className="relative">
          <label htmlFor="location-search" className="block text-sm font-medium text-gray-700 mb-2">
            Search for a city
          </label>
          <div className="relative">
            <input
              ref={searchInputRef}
              id="location-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Type city name (e.g., Mumbai, Delhi)"
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white text-gray-900"
              disabled={loadingPlaceDetails}
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              {loadingPredictions || loadingPlaceDetails ? (
                <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
              ) : (
                <Search className="h-4 w-4 text-gray-400" />
              )}
            </div>
          </div>

          {/* Predictions Dropdown */}
          {showPredictions && predictions.length > 0 && (
            <div
              ref={predictionsRef}
              className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
            >
              {predictions.map((prediction) => (
                <button
                  key={prediction.placeId}
                  type="button"
                  onClick={() => handlePredictionSelect(prediction)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors flex items-start gap-2"
                >
                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">{prediction.mainText}</div>
                    <div className="text-xs text-gray-500">{prediction.secondaryText}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Manual Selection Mode */}
      {searchMode === 'manual' && (
        <>
          {/* State Dropdown */}
          <div>
            <label htmlFor="state-select" className="block text-sm font-medium text-gray-700 mb-2">
              State / Union Territory
            </label>
            <select
              id="state-select"
              value={selectedState}
              onChange={handleStateChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white text-gray-900"
            >
              <option value="">Select State</option>
              {states.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>

          {/* City Dropdown */}
          <div>
            <label htmlFor="city-select" className="block text-sm font-medium text-gray-700 mb-2">
              City
            </label>
            <select
              id="city-select"
              value={selectedCity}
              onChange={handleCityChange}
              disabled={!selectedState}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500"
            >
              <option value="">Select City</option>
              {availableCities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
        </>
      )}

      {/* Show selected location when in autocomplete mode */}
      {searchMode === 'autocomplete' && (selectedState || selectedCity) && (
        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
          <span className="font-medium">Selected: </span>
          {selectedCity && selectedState ? `${selectedCity}, ${selectedState}` : selectedState || 'None'}
        </div>
      )}
    </div>
  );
};

export default StateCitySelector;

