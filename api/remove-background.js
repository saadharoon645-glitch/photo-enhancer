```javascript
// =====================================================
// PHOTOFIX AI — BACKGROUND REMOVAL API
// Vercel + remove.bg
// =====================================================

export default async function handler(request) {

  // -----------------------------------------
  // ONLY POST ALLOWED
  // -----------------------------------------
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

    // -----------------------------------------
    // API KEY
    // -----------------------------------------
    const apiKey =
      process.env.REMOVE_BG_API_KEY ||
      process.env.REMOVEBG_API_KEY ||
      process.env.REMOVE_BG_KEY;

    if (!apiKey) {
      console.error("REMOVE_BG_API_KEY is missing");

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

    // -----------------------------------------
    // READ FORM DATA FROM FRONTEND
    // -----------------------------------------
    const incomingForm = await request.formData();

    // Accept the common possible field names
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

    // -----------------------------------------
    // CHECK FILE SIZE
    // remove.bg accepts files up to 22 MB.
    // We keep a safer 15 MB limit for PhotoFix.
    // -----------------------------------------
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

    // -----------------------------------------
    // SEND IMAGE TO REMOVE.BG
    // -----------------------------------------
    const removeBgForm = new FormData();

    removeBgForm.append(
      "image_file",
      image,
      image.name || "photo.jpg"
    );

    removeBgForm.append("size", "auto");

    const apiResponse = await fetch(
      "https://api.remove.bg/v1.0/removebg",
      {
        method: "POST",
        headers: {
          "X-Api-Key": apiKey
        },
        body: removeBgForm
      }
    );

    // -----------------------------------------
    // HANDLE REMOVE.BG ERROR
    // -----------------------------------------
    if (!apiResponse.ok) {

      const errorText = await apiResponse.text();

      console.error(
        "remove.bg error:",
        apiResponse.status,
        errorText
      );

      return new Response(
        JSON.stringify({
          success: false,
          error: "Background removal service failed.",
          details: errorText
        }),
        {
          status: apiResponse.status,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }

    // -----------------------------------------
    // GET PROCESSED PNG
    // -----------------------------------------
    const resultBuffer = await apiResponse.arrayBuffer();

    // -----------------------------------------
    // RETURN PNG TO FRONTEND
    // -----------------------------------------
    return new Response(resultBuffer, {
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
        error: "Something went wrong while removing the background."
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
```

**Abhi sirf itna karo:**

1. GitHub → `api` folder
2. `remove-background.js` open karo
3. **Purana poora code delete**
4. Upar wala **poora code paste**
5. **Commit changes**

⚠️ **`script.js` ko abhi change mat karna.**

Ek aur important cheez: Vercel Environment Variables mein API key ka naam **`REMOVE_BG_API_KEY`** hona chahiye. Agar tumne pehle koi doosra naam rakha tha, is code mein doosre do common names bhi support hain. remove.bg ki official API documentation ke mutabiq API key `X-API-Key` header se authenticate hoti hai.

**Code paste + commit karne ke baad mujhe sirf “done” likhna. Phir main next step deployment ka dunga.**
