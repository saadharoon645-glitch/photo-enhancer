// =====================================================
// PHOTOFIX AI — BACKGROUND REMOVAL API
// Vercel Node.js + bgclear.ai
// =====================================================

export const config = {
  api: {
    bodyParser: false
  }
};

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];

    req.on("data", (chunk) => {
      chunks.push(
        Buffer.isBuffer(chunk)
          ? chunk
          : Buffer.from(chunk)
      );
    });

    req.on("end", () => {
      resolve(Buffer.concat(chunks));
    });

    req.on("error", (error) => {
      reject(error);
    });
  });
}

function getHeader(headers, name) {
  const lines = headers.split("\r\n");
  const wanted = name.toLowerCase();

  for (const line of lines) {
    const colon = line.indexOf(":");

    if (colon === -1) {
      continue;
    }

    const key = line
      .slice(0, colon)
      .trim()
      .toLowerCase();

    if (key === wanted) {
      return line
        .slice(colon + 1)
        .trim();
    }
  }

  return "";
}

function parseMultipart(body, contentType) {
  const match = contentType.match(
    /boundary=(?:"([^"]+)"|([^;]+))/i
  );

  if (!match) {
    throw new Error(
      "Multipart boundary not found."
    );
  }

  const boundary =
    match[1] || match[2];

  const boundaryBuffer = Buffer.from(
    `--${boundary}`
  );

  let position = 0;

  while (true) {
    const start = body.indexOf(
      boundaryBuffer,
      position
    );

    if (start === -1) {
      break;
    }

    let partStart =
      start + boundaryBuffer.length;

    // Final boundary
    if (
      body[partStart] === 45 &&
      body[partStart + 1] === 45
    ) {
      break;
    }

    // Skip CRLF
    if (
      body[partStart] === 13 &&
      body[partStart + 1] === 10
    ) {
      partStart += 2;
    }

    const nextBoundary = body.indexOf(
      boundaryBuffer,
      partStart
    );

    if (nextBoundary === -1) {
      break;
    }

    let partEnd = nextBoundary;

    // Remove CRLF before boundary
    if (
      body[partEnd - 2] === 13 &&
      body[partEnd - 1] === 10
    ) {
      partEnd -= 2;
    }

    const part = body.slice(
      partStart,
      partEnd
    );

    const headerEnd =
      part.indexOf(
        Buffer.from("\r\n\r\n")
      );

    if (headerEnd === -1) {
      position = nextBoundary;
      continue;
    }

    const headerText = part
      .slice(0, headerEnd)
      .toString("utf8");

    const content = part.slice(
      headerEnd + 4
    );

    const disposition =
      getHeader(
        headerText,
        "content-disposition"
      );

    const nameMatch =
      disposition.match(
        /name="([^"]+)"/i
      );

    const fileNameMatch =
      disposition.match(
        /filename="([^"]*)"/i
      );

    const fieldName =
      nameMatch
        ? nameMatch[1]
        : "";

    const fileName =
      fileNameMatch
        ? fileNameMatch[1]
        : "";

    const partType =
      getHeader(
        headerText,
        "content-type"
      );

    if (
      fileName &&
      (
        fieldName === "image_file" ||
        fieldName === "image" ||
        fieldName === "file" ||
        fieldName === "photo"
      )
    ) {
      return {
        buffer: content,
        name:
          fileName ||
          "photo.jpg",
        type:
          partType ||
          "image/jpeg"
      };
    }

    position = nextBoundary;
  }

  return null;
}

export default async function handler(
  req,
  res
) {
  // ---------------------------------------------------
  // METHOD
  // ---------------------------------------------------

  if (req.method !== "POST") {
    res.statusCode = 405;

    res.setHeader(
      "Content-Type",
      "application/json"
    );

    res.end(
      JSON.stringify({
        success: false,
        error:
          "Method not allowed. Use POST."
      })
    );

    return;
  }

  try {
    // -------------------------------------------------
    // API KEY
    // -------------------------------------------------

    const apiKey =
      process.env.BGCLEAR_API_KEY;

    if (!apiKey) {
      console.error(
        "BGCLEAR_API_KEY is missing."
      );

      res.statusCode = 500;

      res.setHeader(
        "Content-Type",
        "application/json"
      );

      res.end(
        JSON.stringify({
          success: false,
          error:
            "BGCLEAR_API_KEY is not configured."
        })
      );

      return;
    }

    // -------------------------------------------------
    // CONTENT TYPE
    // -------------------------------------------------

    const contentType =
      req.headers["content-type"] || "";

    if (
      !contentType
        .toLowerCase()
        .includes(
          "multipart/form-data"
        )
    ) {
      res.statusCode = 400;

      res.setHeader(
        "Content-Type",
        "application/json"
      );

      res.end(
        JSON.stringify({
          success: false,
          error:
            "Expected multipart/form-data."
        })
      );

      return;
    }

    // -------------------------------------------------
    // READ INCOMING REQUEST
    // -------------------------------------------------

    const body =
      await readBody(req);

    if (!body.length) {
      res.statusCode = 400;

      res.setHeader(
        "Content-Type",
        "application/json"
      );

      res.end(
        JSON.stringify({
          success: false,
          error:
            "Empty request body."
        })
      );

      return;
    }

    // -------------------------------------------------
    // SIZE LIMIT
    // -------------------------------------------------

    if (
      body.length >
      15 * 1024 * 1024
    ) {
      res.statusCode = 413;

      res.setHeader(
        "Content-Type",
        "application/json"
      );

      res.end(
        JSON.stringify({
          success: false,
          error:
            "Image is too large. Maximum size is 15 MB."
        })
      );

      return;
    }

    // -------------------------------------------------
    // GET IMAGE
    // -------------------------------------------------

    const file =
      parseMultipart(
        body,
        contentType
      );

    if (!file) {
      res.statusCode = 400;

      res.setHeader(
        "Content-Type",
        "application/json"
      );

      res.end(
        JSON.stringify({
          success: false,
          error:
            "No image file was received."
        })
      );

      return;
    }

    console.log(
      "Image received:",
      file.name,
      file.type,
      file.buffer.length
    );

    // -------------------------------------------------
    // SEND TO BGCLEAR
    // -------------------------------------------------

    const bgForm = new FormData();

    bgForm.append(
      "image_file",
      new Blob(
        [file.buffer],
        {
          type: file.type
        }
      ),
      file.name
    );

    // FREE PREVIEW FOR TESTING
    bgForm.append(
      "size",
      "preview"
    );

    bgForm.append(
      "format",
      "png"
    );

    const bgResponse =
      await fetch(
        "https://www.bgclear.ai/api/v1/remove",
        {
          method: "POST",

          headers: {
            Authorization:
              `Bearer ${apiKey}`
          },

          body: bgForm
        }
      );

    // -------------------------------------------------
    // BGCLEAR ERROR
    // -------------------------------------------------

    if (!bgResponse.ok) {
      const errorText =
        await bgResponse.text();

      console.error(
        "bgclear error:",
        bgResponse.status,
        errorText
      );

      res.statusCode =
        bgResponse.status;

      res.setHeader(
        "Content-Type",
        "application/json"
      );

      res.end(
        JSON.stringify({
          success: false,
          error:
            "bgclear background removal failed.",
          details:
            errorText
        })
      );

      return;
    }

    // -------------------------------------------------
    // RESULT
    // -------------------------------------------------

    const result =
      Buffer.from(
        await bgResponse.arrayBuffer()
      );

    console.log(
      "Background removed successfully:",
      result.length,
      "bytes"
    );

    res.statusCode = 200;

    res.setHeader(
      "Content-Type",
      "image/png"
    );

    res.setHeader(
      "Cache-Control",
      "no-store"
    );

    res.end(result);

  } catch (error) {
    console.error(
      "Background removal server error:",
      error
    );

    res.statusCode = 500;

    res.setHeader(
      "Content-Type",
      "application/json"
    );

    res.end(
      JSON.stringify({
        success: false,
        error:
          "Something went wrong while removing the background.",
        details:
          error.message
      })
    );
  }
}
