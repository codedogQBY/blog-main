import { Button } from "@/components/ui/button";
export default function Home() {
  return (
    <div className="pt-20 min-h-screen">
        <h1 className="text-4xl font-bold text-center mt-10">Welcome to My Blog</h1>
        <p className="text-center mt-4">This is a simple blog built with Next.js.</p>
        <div className="flex justify-center mt-6">
            <Button className="bg-blue-500 text-white hover:bg-blue-600">
            Get Started
            </Button>
        </div>
    </div>
  );
}
