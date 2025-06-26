export interface Note {
  id: string
  title: string
  content: string
  date: string
  time: string
  weather: "sunny" | "cloudy" | "rainy" | "snowy" | "partly-cloudy"
  excerpt: string
  images?: string[]
}

export type WeatherType = Note["weather"]
