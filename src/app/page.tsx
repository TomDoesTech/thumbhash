import Image from "next/image";
import { Suspense } from "react";
import * as thumbhash from "thumbhash";

async function getImages() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/images`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch images");
  }

  const data = await res.json();
  return data.images;
}

export default async function Home() {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Image Gallery</h1>
          <a
            href="/upload"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Upload New Image
          </a>
        </div>

        <Suspense fallback={<div>Loading...</div>}>
          <ImageGrid />
        </Suspense>
      </div>
    </div>
  );
}

async function ImageGrid() {
  const images = await getImages();

  return images.length === 0 ? (
    <div className="text-center py-20">
      <p className="text-gray-500">No images uploaded yet.</p>
      <a
        href="/upload"
        className="text-blue-500 hover:underline mt-2 inline-block"
      >
        Upload your first image
      </a>
    </div>
  ) : (
    <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4">
      {images.map((imageUrl: string, index: number) => {
        const url = new URL(imageUrl);

        const hash = url.searchParams.get("thumhash");
        const width = url.searchParams.get("width");
        const height = url.searchParams.get("height");

        const placeholderURL = thumbhash.thumbHashToDataURL(
          Buffer.from(hash, "base64")
        );

        return (
          <div key={index} className="break-inside-avoid mb-4">
            <div
              className="image-container"
              style={{
                backgroundColor: "#f0f0f0",
                backgroundImage: `url(${placeholderURL})`,
                backgroundSize: "cover",
                width: `${width * 3}px`,
                height: `${height * 3}px`,
                borderRadius: "10px",
              }}
            >
              <Image
                src={imageUrl}
                alt={`Uploaded image ${index + 1}`}
                width={width * 3}
                height={height * 3}
                className="w-full rounded-lg shadow-md hover:shadow-xl transition-shadow"
                loading="lazy"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
