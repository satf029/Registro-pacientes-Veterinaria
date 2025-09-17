import axios from "axios";

// Interfaces para tipar las respuestas de las APIs
interface GeocodeResult {
  latitude: number;
  longitude: number;
  name: string;
  country: string;
}

interface GeocodeResponse {
  results?: GeocodeResult[];
}

interface WeatherDailyData {
  time: string[];
  weathercode: number[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  precipitation_sum: number[];
}

interface WeatherResponse {
  daily?: WeatherDailyData;
}

type Geo = { latitude: number; longitude: number; name: string; country: string } | null;

async function geocodeCity(city: string): Promise<Geo> {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    city
  )}&count=1&language=es&format=json`;

  try {
    const { data } = await axios.get<GeocodeResponse>(url);

    if (!data.results || data.results.length === 0) return null;

    const { latitude, longitude, name, country } = data.results[0];
    return { latitude, longitude, name, country };
  } catch (error) {
    console.error('Error en geocodeCity:', error);
    return null;
  }
}

function formatDateUTC(dateStr: string): string {
  const d = new Date(dateStr);
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export async function getWeatherFor(city: string, dateIso: string) {
  try {
    const geo = await geocodeCity(city);
    if (!geo) return { found: false, message: "Ubicación no encontrada" };

    const date = formatDateUTC(dateIso);
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${geo.latitude}&longitude=${geo.longitude}&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto&start_date=${date}&end_date=${date}`;

    const { data } = await axios.get<WeatherResponse>(url);

    if (!data.daily || !data.daily.time || data.daily.time.length === 0) {
      return { found: false, message: "Sin datos de clima" };
    }

    return {
      found: true,
      location: `${geo.name}, ${geo.country}`,
      date: data.daily.time[0],
      weathercode: data.daily.weathercode[0],
      tmax: data.daily.temperature_2m_max[0],
      tmin: data.daily.temperature_2m_min[0],
      precipitation: data.daily.precipitation_sum[0],
    };
  } catch (error) {
    console.error('Error en getWeatherFor:', error);
    return { 
      found: false, 
      message: "Error al obtener datos del clima" 
    };
  }
}
export function getWeatherDescription(weathercode: number): string {
  const weatherCodes: { [key: number]: string } = {
    0: "Cielo despejado",
    1: "Principalmente despejado",
    2: "Parcialmente nublado",
    3: "Nublado",
    45: "Niebla",
    48: "Niebla con escarcha",
    51: "Llovizna ligera",
    53: "Llovizna moderada",
    55: "Llovizna intensa",
    61: "Lluvia ligera",
    63: "Lluvia moderada",
    65: "Lluvia intensa",
    71: "Nieve ligera",
    73: "Nieve moderada",
    75: "Nieve intensa",
    77: "Granizo",
    80: "Chubascos ligeros",
    81: "Chubascos moderados",
    82: "Chubascos intensos",
    95: "Tormenta",
    96: "Tormenta con granizo ligero",
    99: "Tormenta con granizo intenso"
  };

  return weatherCodes[weathercode] || "Desconocido";
}
