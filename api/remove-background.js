export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const chunks = [];

    for await (const chunk of req) {
      chunks.push(chunk);
    }

    const body = Buffer.concat(chunks);
    const contentType = req.headers["content-type"] || "";

    if (!contentType.includes("multipart/form-data")) {
      return res.status(400).json({
        error: "Image upload required."
      });
    }

    const boundaryMatch = contentType.match(/boundary="?([^";]+)"?/);

    if (!boundaryMatch) {
      return res.status(400).json({
        error: "Invalid upload."
      });
    }

    const boundary = boundaryMatch[1];

    const parts = body.toString("binary").split(`--${boundary}`);

    let imageBuffer = null;
    let imageType = "image/jpeg";
    let filename = "image.jpg";

    for (const part of parts) {
      if (!part.includes('name="image"')) continue;

      const headerEnd = part.indexOf("\r\n\r\n");

      if (headerEnd === -1) continue;

      const headers = part.substring(0, headerEnd);
      let imageData = part.substring(headerEnd + 4);

      imageData = imageData.replace(/\r\n--$/, "");
      imageData = imageData.replace(/\r\n$/, "");

      const filenameMatch = headers.match(
        /filename="([^"]+)"/
      );

      if (filenameMatch) {
        filename = filenameMatch[1];
      }

      if (headers.includes("image/png")) {
        imageType = "image/png";
      } else if (headers.includes("image/webp")) {
        imageType = "image/webp";
      } else if (headers.includes("image/jpeg")) {
        imageType = "image/jpeg";
      }

      imageBuffer = Buffer.from(imageData, "binary");
      break;
    }

    if (!imageBuffer) {
      return res.status(400).json({
        error: "No image found."
      });
    }

    const formData = new FormData();

    const blob = new Blob([imageBuffer], {
      type: imageType
    });

    formData.append(
      "image",
      blob,
      filename
    );

    const response = await fetch(
      "https://clearbackdrop.com/api/v1/remove-background",
      {
        method: "POST",
        body: formData
      }
    );

    if (!response.ok) {
      const errorText = await response.text();

      return res.status(response.status).json({
        error: errorText || "Background removal failed."
      });
    }

    const result = Buffer.from(
      await response.arrayBuffer()
    );

    res.setHeader(
      "Content-Type",
      "image/png"
    );

    res.setHeader(
      "Cache-Control",
      "no-store"
    );

    return res.status(200).send(result);

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Background removal failed."
    });
  }
}
