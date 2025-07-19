'use client';

import { useEffect, useState } from 'react';
import { getAboutConfig } from "@/lib/about-api"
import type { AboutConfig } from "@/types/about"
import AboutClient from './about-client'

export default function AboutPage() {
  const [aboutData, setAboutData] = useState<AboutConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const data = await getAboutConfig();
        setAboutData(data);
      } catch (error) {
        console.error("Failed to load about data:", error);
        setError(error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">加载失败，请稍后重试</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            重新加载
          </button>
        </div>
      </div>
    );
  }

  return <AboutClient aboutData={aboutData} />
}
