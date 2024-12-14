import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import * as thumbhash from "thumbhash";
import sharp from "sharp";
import path from "path";

const JSON_FILE_PATH = path.join(process.cwd(), "data", "images.json");

async function ensureFileExists() {
  try {
    await fs.mkdir(path.join(process.cwd(), "data"), { recursive: true });

    try {
      await fs.access(JSON_FILE_PATH);
    } catch {
      await fs.writeFile(JSON_FILE_PATH, JSON.stringify([], null, 2));
    }
  } catch (error) {
    console.error("Error ensuring file exists:", error);
  }
}
/*
 * Called with an image url
 */
export async function POST(req: NextRequest) {
  try {
    const { image } = (await req.json()) as { image: string };

    if (!image) {
      return NextResponse.json(
        { error: "Image URL is required" },
        { status: 400 }
      );
    }

    const imgArrayBuffer = await fetch(image).then((res) => res.arrayBuffer());

    const imageFile = await sharp(imgArrayBuffer).resize(100, 100, {
      fit: "inside",
    });

    const { data, info } = await imageFile
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const binaryThumbHash = thumbhash.rgbaToThumbHash(
      info.width,
      info.height,
      data
    );

    const thumbHashToBase64 = Buffer.from(binaryThumbHash).toString("base64");

    await ensureFileExists();

    const fileContent = await fs.readFile(JSON_FILE_PATH, "utf-8");
    const images = JSON.parse(fileContent);

    images.unshift(
      `${image}?thumhash=${thumbHashToBase64}&width=${info.width}&height=${info.height}`
    );

    // Write back to file
    await fs.writeFile(JSON_FILE_PATH, JSON.stringify(images, null, 2));

    return NextResponse.json({ success: true, images });
  } catch (error) {
    console.error("Error saving image:", error);
    return NextResponse.json(
      { error: "Failed to save image" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await ensureFileExists();

    // Read and return the images
    const fileContent = await fs.readFile(JSON_FILE_PATH, "utf-8");
    const images = JSON.parse(fileContent);

    return NextResponse.json({ images });
  } catch (error) {
    console.error("Error reading images:", error);
    return NextResponse.json(
      { error: "Failed to read images" },
      { status: 500 }
    );
  }
}
