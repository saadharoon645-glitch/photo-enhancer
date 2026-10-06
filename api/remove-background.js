// =====================================================
// PHOTOFIX AI — BACKGROUND REMOVAL API
// Vercel + bgclear.ai
// =====================================================

export default async function handler(request) {
  // Only POST is allowed
  if (request.method !== "POST") {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Method not allowed. Use POST."
      }),
      {
        status: 405,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
  }

  try {
    const apiKey = process.env.BGCLEAR_API_KEY;

    if (!apiKey) {
      console.error("BGCLEAR_API_KEY is missing");

      return new Response(
        JSON.stringify({
          success: false,
          error: "Background removal API key is not configured."
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }

    // Get uploaded image from frontend
    const incomingForm = await request.formData();

    const image =
      incomingForm.get("image") ||
      incomingForm.get("image_file") ||
      incomingForm.get("file") ||
      incomingForm.get("photo");

    if (!image || typeof image === "string") {
      return new Response(
        JSON.stringify({
          success: false,
          error: "No image file was received."
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }

    // 15 MB maximum
    if (image.size > 15 * 1024 * 1024) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Image is too large. Maximum size is 15 MB."
        }),
        {
          status: 413,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }

    // Send image to bgclear
    const bgForm = new FormData();

    bgForm.append(
      "image_file",
      image,
      image.name || "photo.jpg"
    );

    // Preview is FREE and is good for testing
    bgForm.append("size", "preview");

    // Transparent PNG result
    bgForm.append("format", "png");

    const response = await fetch(
      "https://www.bgclear.ai/api/v1/remove",
      {
        method: "POST",

        headers: {
          Authorization: `Bearer ${apiKey}`
        },

        body: bgForm
      }
    );

    // API error
    if (!response.ok) {
      const errorText = await response.text();

      console.error(
        "bgclear error:",
        response.status,
        errorText
      );

      return new Response(
        JSON.stringify({
          success: false,
          error: "Background removal service failed.",
          details: errorText
        }),
        {
          status: response.status,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }

    // Get transparent PNG
    const result = await response.arrayBuffer();

    return new Response(result, {
      status: 200,

      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "no-store"
      }
    });

  } catch (error) {
    console.error(
      "Background removal server error:",
      error
    );

    return new Response(
      JSON.stringify({
        success: false,
        error: "Something went wrong while removing the background.",
        details: error.message
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
  }
}
