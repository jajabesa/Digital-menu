
import { NextResponse } from "next/server"
import { requireBusinessAdmin } from "@/lib/session"
import { randomUUID } from "node:crypto"
import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"

export async function POST(request: Request) {
  try {
    // Authenticate business administrator
    const { businessId } = await requireBusinessAdmin()

    if (!businessId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get uploaded image
    const formData = await request.formData()

    const file = formData.get("file")
    const kind = formData.get("kind")

    // Validate upload request
    if (
      !(file instanceof File) ||
      (kind !== "logo" && kind !== "cover")
    ) {
      return NextResponse.json(
        { error: "Invalid upload request" },
        { status: 400 }
      )
    }

    // Allowed image formats
    const allowedTypes: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
    }

    const extension = allowedTypes[file.type]

    // Validate image size and format
    if (
      !extension ||
      file.size === 0 ||
      file.size > 5 * 1024 * 1024
    ) {
      return NextResponse.json(
        {
          error:
            "Only JPG, PNG and WebP images up to 5 MB are allowed.",
        },
        { status: 400 }
      )
    }

    // Convert image into buffer
    const bytes = Buffer.from(await file.arrayBuffer())

    // Verify actual image content
    const validJpeg =
      bytes.length >= 3 &&
      bytes.subarray(0, 3).equals(
        Buffer.from([0xff, 0xd8, 0xff])
      )

    const validPng =
      bytes.length >= 8 &&
      bytes.subarray(0, 8).equals(
        Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
      )

    const validWebp =
      bytes.length >= 12 &&
      bytes.toString("ascii", 0, 4) === "RIFF" &&
      bytes.toString("ascii", 8, 12) === "WEBP"

    if (
      !(
        (extension === "jpg" && validJpeg) ||
        (extension === "png" && validPng) ||
        (extension === "webp" && validWebp)
      )
    ) {
      return NextResponse.json(
        { error: "Invalid image file content." },
        { status: 400 }
      )
    }

    // Create business-specific upload folder
    const uploadDir = path.join(
      process.cwd(),
      "public",
      "uploads",
      "branding",
      businessId
    )

    await mkdir(uploadDir, { recursive: true })

    // Generate unique filename
    const filename = `${kind}-${randomUUID()}.${extension}`

    // Save uploaded image
    await writeFile(
      path.join(uploadDir, filename),
      bytes,
      { flag: "wx" }
    )

    // Generate public image URL
    const imageUrl =
      `/uploads/branding/${businessId}/${filename}`

    return NextResponse.json({
      success: true,
      url: imageUrl,
    })
  } catch (error) {
    console.error("Branding upload error:", error)

    return NextResponse.json(
      { error: "Failed to upload image." },
      { status: 500 }
    )
  }
}
