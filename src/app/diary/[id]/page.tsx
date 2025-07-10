import DiaryDetailClient from "./diary-detail-client"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function DiaryDetailPage({ params }: PageProps) {
  const { id } = await params
  
  return <DiaryDetailClient id={id} />
} 