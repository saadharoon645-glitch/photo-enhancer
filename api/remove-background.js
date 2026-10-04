export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const chunks = [];

    for await (const chunk of req) {
      chunks.push(
        Buffer.isBuffer(chunk)
          ? chunk
          : Buffer.from(chunk)
      );
    }

    const body = Buffer.concat(chunks);

    const contentType =
      req.headers["content-type"] || "";

    if (!contentType.includes("multipart/form-data")) {
      return res.status(400).json({
        error: "Image upload required."
      });
    }

    const boundaryMatch =
      contentType.match(/boundary="?([^";]+)"?/);

    if (!boundaryMatch) {
      return res.status(400).json({
        error: "Invalid upload."
      });
    }

    const boundary =
      Buffer.from("--" + boundaryMatch[1]);

    const headerSeparator =
      Buffer.from("\r\n\r\n");

    let imageBuffer = null;
    let imageType = "image/jpeg";
    let filename = "image.jpg";

    let start = 0;

    while (start < body.length) {

      const boundaryIndex =
        body.indexOf(boundary, start);

      if (boundaryIndex === -1) {
        break;
      }

      const partStart =
        boundaryIndex + boundary.length;

      const nextBoundary =
        body.indexOf(boundary, partStart);

      if (nextBoundary === -1) {
        break;
      }

      const part =
        body.subarray(
          partStart,
          nextBoundary
        );

      const headerIndex =
        part.indexOf(headerSeparator);

      if (headerIndex !== -1) {

        const headers =
          part
            .subarray(0, headerIndex)
            .toString("utf8");

        if (
          headers.includes('name="image"')
        ) {

          const filenameMatch =
            headers.match(
              /filename="([^"]*)"/
            );

          if (filenameMatch) {
            filename =
              filenameMatch[1] ||
              "image.jpg";
          }

          if (
            headers.includes("image/png")
          ) {
            imageType = "image/png";
          }

          if (
            headers.includes("image/webp")
          ) {
            imageType = "image/webp";
          }

          if (
            headers.includes("image/jpeg")
          ) {
            imageType = "image/jpeg";
          }

          let dataStart =
            headerIndex +
            headerSeparator.length;

          let dataEnd =
            part.length;

          if (
            dataEnd >= 2 &&
            part[dataEnd - 2] === 13 &&
            part[dataEnd - 1] === 10
          ) {
            dataEnd -= 2;
          }

          imageBuffer =
            part.subarray(
              dataStart,
              dataEnd
            );

          break;
        }
      }

      start =
        nextBoundary;
    }

    if (!imageBuffer || imageBuffer.length === 0) {
      return res.status(400).json({
        error: "No image found."
      });
    }

    if (imageBuffer.length > 15 * 1024 * 1024) {
      return res.status(413).json({
        error: "Photo 15MB se choti honi chahiye."
      });
    }

    const formData =
      new FormData();

    const blob =
      new Blob(
        [imageBuffer],
        {
          type: imageType
        }
      );

    formData.append(
      "image",
      blob,
      filename
    );

    const response =
      await fetch(
        "https://clearbackdrop.com/api/v1/remove-background",
        {
          method: "POST",
          body: formData
        }
      );

    if (!response.ok) {

      const errorText =
        await response.text();

      console.error(
        "ClearBackdrop error:",
        response.status,
        errorText
      );

      return res.status(
        response.status
      ).json({
        error:
          errorText ||
          "Background removal failed."
      });
    }

    const result =
      Buffer.from(
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

    return res
      .status(200)
      .send(result);

  } catch (error) {

    console.error(
      "Background removal error:",
      error
    );

    return res.status(500).json({
      error:
        error.message ||
        "Background removal failed."
    });
  }
}
