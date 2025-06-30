"use client"

interface CodeBlockProps {
  children: React.ReactNode
  className?: string
}

export default function CodeBlock({ children, className = "" }: CodeBlockProps) {
  return (
    <pre className={`${className} rounded-lg overflow-x-auto bg-gray-900 text-gray-100 p-4 my-4 font-mono text-sm leading-relaxed`}>
      <code className={className}>
        {children}
      </code>
    </pre>
  )
} 