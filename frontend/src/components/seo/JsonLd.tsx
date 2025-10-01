// frontend/src/components/seo/JsonLd.tsx
interface JsonLdProps {
  data: Record<string, any> | Record<string, any>[]
}

export default function JsonLd({ data }: JsonLdProps) {
  const jsonLdData = Array.isArray(data) ? data : [data]
  
  return (
    <>
      {jsonLdData.map((item, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(item, null, 0)
          }}
        />
      ))}
    </>
  )
}