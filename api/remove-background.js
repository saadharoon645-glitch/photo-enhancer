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

    // Read the original multipart request
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

    if (body.length > 16 * 1024 * 1024) {
      return res.status(413).json({
        error: "Photo 15MB se choti honi chahiye.",
      });
    }

    const boundaryMatch = contentType.match(
      /boundary="?([^";]+)"?/i
    );

    if (!boundaryMatch) {
      return res.status(400).json({
        error: "Invalid upload boundary.",
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
    let filename = "photofix-photo.jpg";

    let position = 0;

    while (position < body.length) {
      const boundaryIndex = body.indexOf(
        boundary,
        position
      );

      if (boundaryIndex === -1) {
        break;
      }

      let partStart =
        boundaryIndex + boundary.length;

      // Final boundary
      if (
        body[partStart] === 45 &&
        body[partStart + 1] === 45
      ) {
        break;
      }

      // Skip CRLF after boundary
      if (
        body[partStart] === 13 &&
        body[partStart + 1] === 10
      ) {
        partStart += 2;
      }

      const nextBoundary = body.indexOf(
        boundary,
        partStart
      );

      if (nextBoundary === -1) {
        break;
      }

      const part = body.subarray(
        partStart,
        nextBoundary
      );

      const headerIndex = part.indexOf(
        headerSeparator
      );

      if (headerIndex !== -1) {
        const headers = part
          .subarray(0, headerIndex)
          .toString("utf8");

        if (
          headers.includes('name="image"')
        ) {
          const filenameMatch =
            headers.match(
              /filename="([^"]*)"/i
            );

          if (
            filenameMatch &&
            filenameMatch[1]
          ) {
            filename =
              filenameMatch[1];
          }

          if (
            headers.includes(
              "image/png"
            )
          ) {
            imageType =
              "image/png";
          } else if (
            headers.includes(
              "image/webp"
            )
          ) {
            imageType =
              "image/webp";
          } else {
            imageType =
              "image/jpeg";
          }

          let dataStart =
            headerIndex +
            headerSeparator.length;

          let dataEnd =
            part.length;

          // Remove CRLF before boundary
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

      position =
        nextBoundary;
    }

    if (
      !imageBuffer ||
      imageBuffer.length === 0
    ) {
      return res.status(400).json({
        error: "No image found.",
      });
    }

    if (
      imageBuffer.length >
      15 * 1024 * 1024
    ) {
      return res.status(413).json({
        error:
          "Photo 15MB se choti honi chahiye.",
      });
    }

    console.log(
      "PhotoFix: image received",
      imageBuffer.length,
      imageType,
      filename
    );

    // Send image to ClearBackdrop
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

    const controller =
      new AbortController();

    const timeout =
      setTimeout(() => {
        controller.abort();
      }, 90000);

    let response;

    try {
      response = await fetch(
        "https://clearbackdrop.com/api/v1/remove-background",
        {
          method: "POST",
          body: formData,
          headers: {
            Accept: "image/png",
          },
          signal: controller.signal,
        }
      );
    } catch (error) {
      console.error(
        "ClearBackdrop connection error:",
        error
      );

      if (
        error &&
        error.name === "AbortError"
      ) {
        return res.status(504).json({
          error:
            "AI processing mein bohat time lag raha hai. Dobara try karo.",
        });
      }

      return res.status(502).json({
        error:
          "ClearBackdrop AI server se connection nahi ho saka.",
      });
    } finally {
      clearTimeout(timeout);
    }

    console.log(
      "ClearBackdrop status:",
      response.status
    );

    console.log(
      "ClearBackdrop content type:",
      response.headers.get(
        "content-type"
      )
    );

    // API error
    if (!response.ok) {
      let errorText = "";

      try {
        errorText =
          await response.text();
      } catch (readError) {
        console.error(
          "Error response read failed:",
          readError
        );
      }

      console.error(
        "ClearBackdrop API error:",
        response.status,
        errorText
      );

      return res.status(502).json({
        error:
          "ClearBackdrop error (" +
          response.status +
          "): " +
          (
            errorText ||
            "Background removal failed."
          ),
      });
    }

    // Make sure we actually received an image
    const resultType =
      (
        response.headers.get(
          "content-type"
        ) || ""
      ).toLowerCase();

    if (
      !resultType.startsWith("image/")
    ) {
      const unexpected =
        await response.text();

      console.error(
        "Unexpected ClearBackdrop response:",
        unexpected
      );

      return res.status(502).json({
        error:
          "AI ne image ke bajaye unexpected response diya.",
      });
    }

    const resultBuffer =
      Buffer.from(
        await response.arrayBuffer()
      );

    if (
      !resultBuffer.length
    ) {
      return res.status(502).json({
        error:
          "AI ne empty image return ki.",
      });
    }

    console.log(
      "PhotoFix: result received",
      resultBuffer.length
    );

    // Return transparent PNG to frontend
    res.setHeader(
      "Content-Type",
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

    res.setHeader(
      "X-Model-Used",
      response.headers.get(
        "X-Model-Used"
      ) || "fast"
    );

    return res
      .status(200)
      .send(resultBuffer);

  } catch (error) {
    console.error(
      "PhotoFix background removal error:",
      error
    );

    return res.status(500).json({
      error:
        error &&
        error.message
          ? error.message
          : "Background removal failed.",
    });
  }
}
