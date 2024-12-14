"use client";

/*
* Called with an image
*/
import { UploadDropzone } from "@/utils/uploadthing";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [uploadedUrl, setUploadedUrl] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmitImage = async (imageUrl: string) => {
    try {
      setIsSubmitting(true);
      const response = await fetch("/api/images", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: imageUrl }),
      });

      if (!response.ok) {
        throw new Error("Failed to save image");
      }

      // Redirect to home page
      router.push("/");
    } catch (error) {
      console.error("Error saving image:", error);
      alert("Failed to save image");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      {!uploadedUrl ? (
        <UploadDropzone
          endpoint="imageUploader"
          onClientUploadComplete={(res) => {
            if (res && res[0]) {
              console.log("Files: ", res);
              setUploadedUrl(res[0].url);
              // Automatically submit the image once uploaded
              handleSubmitImage(res[0].url);
            }
          }}
          onUploadError={(error: Error) => {
            alert(`ERROR! ${error.message}`);
          }}
        />
      ) : (
        <div className="mt-4 flex flex-col items-center">
          <p>Upload completed! Saving image...</p>
          <img
            src={uploadedUrl}
            alt="Uploaded file"
            className="mt-2 max-w-md"
          />
          {isSubmitting && (
            <div className="mt-4">
              <p>Redirecting to home page...</p>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
