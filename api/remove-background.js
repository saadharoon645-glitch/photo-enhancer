export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    const contentType = req.headers["content-type"] || "";

    if (!contentType.includes("multipart/form-data")) {
      return res.status(400).json({
        error: "Image upload required.",
      });
    }

    const boundaryMatch = contentType.match(/boundary="?([^";]+)"?/);

    if (!boundaryMatch) {
      return res.status(400).json({
        error: "Invalid upload boundary.",
      });
    }

    const chunks = [];

    for await (const chunk of req) {
      chunks.push(
        Buffer.isBuffer(chunk)
          ? chunk
          : Buffer.from(chunk)
      );
    }

    const body = Buffer.concat(chunks);

    if (!body.length) {
      return res.status(400).json({
        error: "Empty upload.",
      });
    }

    if (body.length > 15 * 1024 * 1024 + 1024 * 1024) {
      return res.status(413).json({
        error: "Photo 15MB se choti honi chahiye.",
      });
    }

    const boundary = Buffer.from(
      "--" + boundaryMatch[1]
    );

    const headerSeparator = Buffer.from(
      "\r\n\r\n"
    );

    let imageBuffer = null;
    let imageType = "image/jpeg";
    let filename = "image.jpg";

    let position = 0;

    while (position < body.length) {
      const boundaryIndex = body.indexOf(
        boundary,
        position
      );

      if (boundaryIndex === -1) {
        break;
      }

      const partStart =
        boundaryIndex + boundary.length;

      if (
        body[partStart] === 45 &&
        body[partStart + 1] === 45
      ) {
        break;
      }

      let actualStart = partStart;

      if (
        body[actualStart] === 13 &&
        body[actualStart + 1] === 10
      ) {
        actualStart += 2;
      }

      const nextBoundary = body.indexOf(
        boundary,
        actualStart
      );

      if (nextBoundary === -1) {
        break;
      }

      const part = body.subarray(
        actualStart,
        nextBoundary
      );

      const headerIndex = part.indexOf(
        headerSeparator
      );

      if (headerIndex !== -1) {
        const headers = part
          .subarray(0, headerIndex)
          .toString("utf8");

        if (headers.includes('name="image"')) {
          const filenameMatch = headers.match(
            /filename="([^"]*)"/i
          );

          if (filenameMatch && filenameMatch[1]) {
            filename = filenameMatch[1];
          }

          if (headers.includes("image/png")) {
            imageType = "image/png";
          } else if (headers.includes("image/webp")) {
            imageType = "image/webp";
          } else if (headers.includes("image/jpeg")) {
            imageType = "image/jpeg";
          }

          let dataStart =
            headerIndex + headerSeparator.length;

          let dataEnd = part.length;

          if (
            dataEnd >= 2 &&
            part[dataEnd - 2] === 13 &&
            part[dataEnd - 1] === 10
          ) {
            dataEnd -= 2;
          }

          imageBuffer = part.subarray(
            dataStart,
            dataEnd
          );

          break;
        }
      }

      position = nextBoundary;
    }

    if (!imageBuffer || imageBuffer.length === 0) {
      return res.status(400).json({
        error: "No image found.",
      });
    }

    if (imageBuffer.length > 15 * 1024 * 1024) {
      return res.status(413).json({
        error: "Photo 15MB se choti honi chahiye.",
      });
    }

    const formData = new FormData();

    const imageBlob = new Blob(
      [imageBuffer],
      {
        type: imageType,
      }
    );

    formData.append(
      "image",
      imageBlob,
      filename
    );

    const controller = new AbortController();

    const timeout = setTimeout(() => {
      controller.abort();
    }, 90000);

    let response;

    try {
      response = await fetch(
        "https://clearbackdrop.com/api/v1/remove-background",
        {
          method: "POST",
          body: formData,
          signal: controller.signal,
          headers: {
            Accept: "image/png",
          },
        }
      );
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      const errorText = await response.text();

      console.error(
        "ClearBackdrop error:",
        response.status,
        errorText
      );

      return res.status(response.status).json({
        error:
          errorText ||
          `Background removal failed (${response.status}).`,
      });
    }

    const resultBuffer = Buffer.from(
      await response.arrayBuffer()
    );

    if (!resultBuffer.length) {
      return res.status(502).json({
        error: "AI ne empty image return ki.",
      });
    }

    res.setHeader(
      "Content-Type",
      response.headers.get("content-type") ||
        "image/png"
    );

    res.setHeader(
      "Content-Length",
      resultBuffer.length
    );

    res.setHeader(
      "Cache-Control",
      "no-store, no-cache, must-revalidate"
    );

    res.setHeader(
      "X-PhotoFix-AI",
      "ClearBackdrop"
    );

    return res.status(200).send(resultBuffer);

  } catch (error) {
    console.error(
      "Background removal error:",
      error
    );

    if (error.name === "AbortError") {
      return res.status(504).json({
        error:
          "Background removal took too long. Please try again.",
      });
    }

    return res.status(500).json({
      error:
        error.message ||
        "Background removal failed.",
    });
  }
}
