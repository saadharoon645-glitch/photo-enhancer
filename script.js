// ============================================================
// PHOTOFIX AI — COMPLETE EDITOR JAVASCRIPT
// ============================================================

const imageInput = document.getElementById("imageInput");
const previewImage = document.getElementById("previewImage");
const uploadMessage = document.getElementById("uploadMessage");

const brightness = document.getElementById("brightness");
const contrast = document.getElementById("contrast");
const saturation = document.getElementById("saturation");

const brightnessValue = document.getElementById("brightnessValue");
const contrastValue = document.getElementById("contrastValue");
const saturationValue = document.getElementById("saturationValue");

const resetButton = document.getElementById("resetButton");
const downloadButton = document.getElementById("downloadButton");
const upgradeButton = document.getElementById("upgradeButton");


// ============================================================
// EDITOR STATE
// ============================================================

let rotation = 0;
let flipped = false;

let extraFilter = "none";
let blurAmount = 0;

let originalImageData = null;
let selectedFile = null;


// ============================================================
// EXPORT QUALITY
// ============================================================

let exportQuality = "original";


// ============================================================
// IMAGE UPLOAD
// ============================================================

if (imageInput) {

  imageInput.addEventListener("change", function () {

    const file = this.files && this.files[0];

    if (!file) return;

    if (!file.type || !file.type.startsWith("image/")) {
      alert("Please select a valid image file.");
      this.value = "";
      return;
    }

    selectedFile = file;

    const reader = new FileReader();

    reader.onload = function (event) {

      if (!previewImage) return;

      previewImage.onload = function () {

        originalImageData = {
          width: previewImage.naturalWidth,
          height: previewImage.naturalHeight
        };

        previewImage.style.display = "block";

        resetEditor(false);

        if (uploadMessage) {
          uploadMessage.textContent =
            "✓ Image ready for editing";
        }

      };

      previewImage.src = event.target.result;

    };

    reader.onerror = function () {

      alert("Unable to read this image. Please try again.");

    };

    reader.readAsDataURL(file);

  });

}


// ============================================================
// CHECK IMAGE
// ============================================================

function hasImage() {

  return (
    previewImage &&
    previewImage.src &&
    previewImage.src !== "" &&
    previewImage.style.display !== "none"
  );

}


// ============================================================
// FILTER ENGINE
// ============================================================

function updateFilter() {

  if (!previewImage) return;

  const brightnessAmount =
    brightness ? Number(brightness.value) : 100;

  const contrastAmount =
    contrast ? Number(contrast.value) : 100;

  const saturationAmount =
    saturation ? Number(saturation.value) : 100;

  let filter =
    "brightness(" + brightnessAmount + "%) " +
    "contrast(" + contrastAmount + "%) " +
    "saturate(" + saturationAmount + "%)";

  if (blurAmount > 0) {
    filter += " blur(" + blurAmount + "px)";
  }

  if (extraFilter !== "none") {
    filter += " " + extraFilter;
  }

  previewImage.style.filter = filter;

  if (brightnessValue && brightness) {
    brightnessValue.textContent =
      brightness.value + "%";
  }

  if (contrastValue && contrast) {
    contrastValue.textContent =
      contrast.value + "%";
  }

  if (saturationValue && saturation) {
    saturationValue.textContent =
      saturation.value + "%";
  }

}


// ============================================================
// SLIDERS
// ============================================================

if (brightness) {
  brightness.addEventListener("input", updateFilter);
}

if (contrast) {
  contrast.addEventListener("input", updateFilter);
}

if (saturation) {
  saturation.addEventListener("input", updateFilter);
}


// ============================================================
// TRANSFORM
// ============================================================

function updateTransform() {

  if (!previewImage) return;

  previewImage.style.transform =
    "rotate(" +
    rotation +
    "deg) scaleX(" +
    (flipped ? -1 : 1) +
    ")";

}


function rotateImage() {

  if (!hasImage()) {
    alert("Please upload an image first.");
    return;
  }

  rotation += 90;

  if (rotation >= 360) {
    rotation = 0;
  }

  updateTransform();

}


function flipImage() {

  if (!hasImage()) {
    alert("Please upload an image first.");
    return;
  }

  flipped = !flipped;

  updateTransform();

}


// ============================================================
// RESET
// ============================================================

function resetEditor(showMessage = true) {

  if (brightness) {
    brightness.value = 100;
  }

  if (contrast) {
    contrast.value = 100;
  }

  if (saturation) {
    saturation.value = 100;
  }

  rotation = 0;
  flipped = false;

  extraFilter = "none";
  blurAmount = 0;

  exportQuality = "original";

  updateFilter();
  updateTransform();

  if (
    showMessage &&
    hasImage() &&
    uploadMessage
  ) {

    uploadMessage.textContent =
      "✓ Editing settings reset";

  }

}


if (resetButton) {

  resetButton.addEventListener(
    "click",
    function () {
      resetEditor(true);
    }
  );

}


// ============================================================
// AUTO ENHANCE
// ============================================================

function autoEnhance() {

  if (!hasImage()) {
    alert("Please upload an image first.");
    return;
  }

  if (brightness) {
    brightness.value = 108;
  }

  if (contrast) {
    contrast.value = 112;
  }

  if (saturation) {
    saturation.value = 108;
  }

  extraFilter = "none";
  blurAmount = 0;

  updateFilter();

  if (uploadMessage) {
    uploadMessage.textContent =
      "✨ Auto Enhance applied";
  }

}


// ============================================================
// PROFESSIONAL FILTERS
// ============================================================

function applyFilter(type) {

  if (!hasImage()) {
    alert("Please upload an image first.");
    return;
  }

  extraFilter = "none";
  blurAmount = 0;

  if (type === "grayscale") {

    extraFilter =
      "grayscale(100%)";

  }

  else if (type === "sepia") {

    extraFilter =
      "sepia(85%)";

  }

  else if (type === "vintage") {

    extraFilter =
      "sepia(35%) contrast(105%) saturate(85%)";

  }

  else if (type === "cinematic") {

    extraFilter =
      "contrast(115%) saturate(90%)";

  }

  else if (type === "soft") {

    blurAmount = 0.4;

    extraFilter =
      "brightness(105%)";

  }

  updateFilter();

  if (uploadMessage) {
    uploadMessage.textContent =
      "✓ " +
      type.charAt(0).toUpperCase() +
      type.slice(1) +
      " filter applied";
  }

}


// ============================================================
// EXPORT QUALITY SETTER
// ============================================================

function setExportQuality(quality) {

  if (
    quality !== "original" &&
    quality !== "hd" &&
    quality !== "2k" &&
    quality !== "4k"
  ) {
    quality = "original";
  }

  exportQuality = quality;

  if (uploadMessage) {

    if (quality === "original") {
      uploadMessage.textContent =
        "✓ Original quality selected";
    }

    else if (quality === "hd") {
      uploadMessage.textContent =
        "✓ HD quality selected";
    }

    else if (quality === "2k") {
      uploadMessage.textContent =
        "✓ 2K quality selected";
    }

    else if (quality === "4k") {
      uploadMessage.textContent =
        "✓ 4K quality selected";
    }

  }

}


// ============================================================
// QUALITY BUTTONS
// Supports buttons like:
// data-quality="hd"
// data-quality="2k"
// data-quality="4k"
// ============================================================

document.querySelectorAll("[data-quality]")
  .forEach(function (button) {

    button.addEventListener(
      "click",
      function () {

        setExportQuality(
          this.dataset.quality
        );

        document
          .querySelectorAll("[data-quality]")
          .forEach(function (item) {
            item.classList.remove("active");
          });

        this.classList.add("active");

      }
    );

  });


// ============================================================
// GET EXPORT SIZE
// ============================================================

function getExportSize(width, height) {

  let targetWidth = width;
  let targetHeight = height;

  if (exportQuality === "original") {

    return {
      width: width,
      height: height
    };

  }


  // HD = maximum 1920px
  if (exportQuality === "hd") {

    const maxSize = 1920;

    if (width > height) {

      targetWidth = maxSize;
      targetHeight =
        Math.round(height * (maxSize / width));

    } else {

      targetHeight = maxSize;
      targetWidth =
        Math.round(width * (maxSize / height));

    }

  }


  // 2K = maximum 2560px
  if (exportQuality === "2k") {

    const maxSize = 2560;

    if (width > height) {

      targetWidth = maxSize;
      targetHeight =
        Math.round(height * (maxSize / width));

    } else {

      targetHeight = maxSize;
      targetWidth =
        Math.round(width * (maxSize / height));

    }

  }


  // 4K = maximum 3840px
  if (exportQuality === "4k") {

    const maxSize = 3840;

    if (width > height) {

      targetWidth = maxSize;
      targetHeight =
        Math.round(height * (maxSize / width));

    } else {

      targetHeight = maxSize;
      targetWidth =
        Math.round(width * (maxSize / height));

    }

  }


  return {
    width: Math.max(1, Math.round(targetWidth)),
    height: Math.max(1, Math.round(targetHeight))
  };

}


// ============================================================
// CREATE CANVAS
// ============================================================

function createEditedCanvas(img) {

  const originalWidth = img.naturalWidth;
  const originalHeight = img.naturalHeight;

  const size =
    getExportSize(
      originalWidth,
      originalHeight
    );

  let canvasWidth = size.width;
  let canvasHeight = size.height;


  // Rotation 90/270 swaps canvas dimensions
  if (
    rotation === 90 ||
    rotation === 270
  ) {

    const temp = canvasWidth;

    canvasWidth = canvasHeight;
    canvasHeight = temp;

  }


  const canvas =
    document.createElement("canvas");

  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  const ctx =
    canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Canvas is not supported.");
  }


  ctx.save();

  ctx.translate(
    canvasWidth / 2,
    canvasHeight / 2
  );


  ctx.rotate(
    rotation * Math.PI / 180
  );


  ctx.scale(
    flipped ? -1 : 1,
    1
  );


  const brightnessAmount =
    brightness ? Number(brightness.value) : 100;

  const contrastAmount =
    contrast ? Number(contrast.value) : 100;

  const saturationAmount =
    saturation ? Number(saturation.value) : 100;


  let filter =
    "brightness(" +
    brightnessAmount +
    "%) " +
    "contrast(" +
    contrastAmount +
    "%) " +
    "saturate(" +
    saturationAmount +
    "%)";


  if (blurAmount > 0) {
    filter +=
      " blur(" +
      blurAmount +
      "px)";
  }


  if (extraFilter !== "none") {
    filter +=
      " " +
      extraFilter;
  }


  ctx.filter = filter;


  const drawWidth =
    canvasWidth;

  const drawHeight =
    canvasHeight;


  ctx.drawImage(
    img,
    -drawWidth / 2,
    -drawHeight / 2,
    drawWidth,
    drawHeight
  );


  ctx.restore();


  return canvas;

}


// ============================================================
// DOWNLOAD IMAGE
// ============================================================

function downloadImage() {

  if (!hasImage()) {
    alert("Please upload an image first.");
    return;
  }

  const img =
    new Image();

  img.onload = function () {

    try {

      const canvas =
        createEditedCanvas(img);

      canvas.toBlob(
        function (blob) {

          if (!blob) {
            alert("Unable to create the edited image.");
            return;
          }

          const url =
            URL.createObjectURL(blob);

          const link =
            document.createElement("a");

          link.href = url;

          link.download =
            "photofix-ai-" +
            exportQuality +
            ".jpg";

          document.body.appendChild(link);

          link.click();

          link.remove();

          setTimeout(
            function () {
              URL.revokeObjectURL(url);
            },
            1000
          );

          if (uploadMessage) {
            uploadMessage.textContent =
              "✓ " +
              exportQuality.toUpperCase() +
              " image downloaded";
          }

        },
        "image/jpeg",
        0.95
      );

    }

    catch (error) {

      console.error(error);

      alert(
        "The image could not be exported. " +
        "Please try again."
      );

    }

  };


  img.onerror = function () {

    alert(
      "The image could not be loaded for download."
    );

  };


  img.src =
    previewImage.src;

}


if (downloadButton) {

  downloadButton.addEventListener(
    "click",
    downloadImage
  );

}


// ============================================================
// TOOL BUTTONS
// ============================================================

document.querySelectorAll("[data-action]")
  .forEach(function (button) {

    button.addEventListener(
      "click",
      function () {

        const action =
          this.dataset.action;


        if (action === "rotate") {

          rotateImage();

        }

        else if (action === "flip") {

          flipImage();

        }

        else if (action === "enhance") {

          autoEnhance();

        }

        else if (action === "grayscale") {

          applyFilter("grayscale");

        }

        else if (action === "sepia") {

          applyFilter("sepia");

        }

        else if (action === "vintage") {

          applyFilter("vintage");

        }

        else if (action === "cinematic") {

          applyFilter("cinematic");

        }

        else if (action === "soft") {

          applyFilter("soft");

        }

        else if (action === "download") {

          downloadImage();

        }

        else if (
          action === "background-remove"
        ) {

          backgroundRemove();

        }

        else if (action === "upscale") {

          showComingSoon(
            "AI Upscale"
          );

        }

        else if (action === "face-restore") {

          showComingSoon(
            "Face Restore"
          );

        }

        else if (action === "object-remove") {

          showComingSoon(
            "Object Remover"
          );

        }

      }
    );

  });


// ============================================================
// BACKGROUND REMOVE
// ============================================================

async function backgroundRemove() {

  if (!hasImage()) {
    alert("Please upload an image first.");
    return;
  }


  /*
    IMPORTANT:

    Replace this URL only when your Vercel backend
    endpoint is ready.

    Example:

    const BACKGROUND_REMOVE_API =
      "/api/remove-background";

    API key should NEVER be placed in this frontend file.
  */

  const BACKGROUND_REMOVE_API =
    "/api/remove-background";


  if (uploadMessage) {
    uploadMessage.textContent =
      "⏳ Removing background...";
  }


  try {

    const formData =
      new FormData();

    formData.append(
      "image",
      selectedFile
    );


    const response =
      await fetch(
        BACKGROUND_REMOVE_API,
        {
          method: "POST",
          body: formData
        }
      );


    if (!response.ok) {

      throw new Error(
        "Background removal server error"
      );

    }


    const contentType =
      response.headers.get(
        "content-type"
      ) || "";


    if (
      !contentType.includes("image")
    ) {

      throw new Error(
        "Server did not return an image"
      );

    }


    const blob =
      await response.blob();


    const resultUrl =
      URL.createObjectURL(blob);


    previewImage.src =
      resultUrl;

    previewImage.style.display =
      "block";


    if (uploadMessage) {
      uploadMessage.textContent =
        "✓ Background removed";
    }

  }

  catch (error) {

    console.error(error);

    if (uploadMessage) {
      uploadMessage.textContent =
        "⚠ Background Remove backend is not connected";
    }

    alert(
      "Background Remove is not connected to the AI server yet."
    );

  }

}


// ============================================================
// COMING SOON
// ============================================================

function showComingSoon(feature) {

  if (!hasImage()) {
    alert("Please upload an image first.");
    return;
  }

  alert(
    feature +
    " needs an AI processing server. " +
    "The editor is ready, but this AI backend is not connected yet."
  );

}


// ============================================================
// PREMIUM BUTTON
// ============================================================

if (upgradeButton) {

  upgradeButton.addEventListener(
    "click",
    function () {

      alert(
        "PhotoFix Pro — $1.19/month\n\n" +
        "Premium AI features will be available " +
        "when secure payment and AI processing are connected."
      );

    }
  );

}


// ============================================================
// SMOOTH NAVIGATION
// ============================================================

document.querySelectorAll(
  'a[href^="#"]'
).forEach(function (link) {

  link.addEventListener(
    "click",
    function (event) {

      const href =
        this.getAttribute("href");

      if (!href || href === "#") {
        return;
      }


      const target =
        document.querySelector(href);


      if (target) {

        event.preventDefault();

        target.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });

      }

    }
  );

});


// ============================================================
// INITIAL STATE
// ============================================================

updateFilter();
updateTransform();


// ============================================================
// GLOBAL FUNCTIONS
// Allows HTML buttons such as onclick="rotateImage()"
// ============================================================

window.rotateImage = rotateImage;
window.flipImage = flipImage;
window.autoEnhance = autoEnhance;
window.applyFilter = applyFilter;
window.resetEditor = resetEditor;
window.downloadImage = downloadImage;
window.setExportQuality = setExportQuality;
window.backgroundRemove = backgroundRemove;


// ============================================================
// READY
// ============================================================

console.log(
  "PhotoFix AI editor loaded successfully."
);
