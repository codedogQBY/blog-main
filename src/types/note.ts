export interface Note {
  id: string
  title: string
  content: string
  excerpt?: string
  images?: string[]
  weather: "sunny" | "cloudy" | "rainy" | "snowy" | "partly-cloudy"
  mood?: number
  status?: "public" | "private"
  date: string
  time: string
  createdAt?: string
  updatedAt?: string
}

export type WeatherType = Note["weather"]
