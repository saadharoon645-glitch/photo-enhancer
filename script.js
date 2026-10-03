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

let rotation = 0;
let flipped = false;

let extraFilter = "none";
let blurAmount = 0;


// ===============================
// IMAGE UPLOAD
// ===============================

if (imageInput) {

  imageInput.addEventListener("change", function () {

    const file = this.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    const reader = new FileReader();

    reader.onload = function (event) {

      previewImage.src = event.target.result;
      previewImage.style.display = "block";

      if (uploadMessage) {
        uploadMessage.textContent =
          "✓ Image ready for editing";
      }

      resetEditor(false);
    };

    reader.readAsDataURL(file);
  });

}


// ===============================
// FILTER ENGINE
// ===============================

function updateFilter() {

  if (!previewImage) return;

  let filter = `
    brightness(${brightness ? brightness.value : 100}%)
    contrast(${contrast ? contrast.value : 100}%)
    saturate(${saturation ? saturation.value : 100}%)
  `;

  if (blurAmount > 0) {
    filter += ` blur(${blurAmount}px)`;
  }

  if (extraFilter !== "none") {
    filter += ` ${extraFilter}`;
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


// ===============================
// SLIDERS
// ===============================

if (brightness) {
  brightness.addEventListener("input", updateFilter);
}

if (contrast) {
  contrast.addEventListener("input", updateFilter);
}

if (saturation) {
  saturation.addEventListener("input", updateFilter);
}


// ===============================
// TRANSFORM
// ===============================

function updateTransform() {

  if (!previewImage) return;

  previewImage.style.transform =
    `rotate(${rotation}deg) scaleX(${flipped ? -1 : 1})`;

}


function rotateImage() {

  rotation += 90;

  if (rotation >= 360) {
    rotation = 0;
  }

  updateTransform();

}


function flipImage() {

  flipped = !flipped;

  updateTransform();

}


// ===============================
// RESET
// ===============================

function resetEditor(showMessage = true) {

  if (brightness) brightness.value = 100;
  if (contrast) contrast.value = 100;
  if (saturation) saturation.value = 100;

  rotation = 0;
  flipped = false;

  extraFilter = "none";
  blurAmount = 0;

  updateFilter();
  updateTransform();

  if (
    showMessage &&
    previewImage &&
    previewImage.src
  ) {
    if (uploadMessage) {
      uploadMessage.textContent =
        "✓ Editing settings reset";
    }
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


// ===============================
// AUTO ENHANCE
// ===============================

function autoEnhance() {

  if (!previewImage || !previewImage.src) {
    alert("Please upload an image first.");
    return;
  }

  if (brightness) brightness.value = 108;
  if (contrast) contrast.value = 112;
  if (saturation) saturation.value = 108;

  extraFilter = "none";
  blurAmount = 0;

  updateFilter();

  if (uploadMessage) {
    uploadMessage.textContent =
      "✨ Auto Enhance applied";
  }

}


// ===============================
// PROFESSIONAL FILTERS
// ===============================

function applyFilter(type) {

  if (!previewImage || !previewImage.src) {
    alert("Please upload an image first.");
    return;
  }

  extraFilter = "none";
  blurAmount = 0;

  if (type === "grayscale") {
    extraFilter = "grayscale(100%)";
  }

  if (type === "sepia") {
    extraFilter = "sepia(85%)";
  }

  if (type === "vintage") {
    extraFilter =
      "sepia(35%) contrast(105%) saturate(85%)";
  }

  if (type === "cinematic") {
    extraFilter =
      "contrast(115%) saturate(90%)";
  }

  if (type === "soft") {
    blurAmount = 0.4;
    extraFilter = "brightness(105%)";
  }

  updateFilter();

}


// ===============================
// TOOL BUTTONS
// ===============================

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
          showComingSoon(
            "Background Remove"
          );
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


// ===============================
// ADVANCED AI MESSAGE
// ===============================

function showComingSoon(feature) {

  if (!previewImage || !previewImage.src) {
    alert("Please upload an image first.");
    return;
  }

  alert(
    feature +
    " needs an AI processing server. " +
    "The button is ready, but the AI backend is not connected yet."
  );

}


// ===============================
// DOWNLOAD
// ===============================

function downloadImage() {

  if (
    !previewImage ||
    !previewImage.src ||
    previewImage.style.display === "none"
  ) {
    alert("Please upload an image first.");
    return;
  }

  const img = new Image();

  img.onload = function () {

    const canvas =
      document.createElement("canvas");

    const ctx =
      canvas.getContext("2d");

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    ctx.save();

    ctx.translate(
      canvas.width / 2,
      canvas.height / 2
    );

    if (rotation !== 0) {

      ctx.rotate(
        rotation * Math.PI / 180
      );

    }

    ctx.scale(
      flipped ? -1 : 1,
      1
    );

    let filter = `
      brightness(${brightness ? brightness.value : 100}%)
      contrast(${contrast ? contrast.value : 100}%)
      saturate(${saturation ? saturation.value : 100}%)
    `;

    if (extraFilter !== "none") {
      filter += ` ${extraFilter}`;
    }

    if (blurAmount > 0) {
      filter += ` blur(${blurAmount}px)`;
    }

    ctx.filter = filter;

    ctx.drawImage(
      img,
      -canvas.width / 2,
      -canvas.height / 2
    );

    ctx.restore();

    const link =
      document.createElement("a");

    link.download =
      "photofix-ai-edited.jpg";

    link.href =
      canvas.toDataURL(
        "image/jpeg",
        0.95
      );

    link.click();

  };

  img.src = previewImage.src;

}


if (downloadButton) {

  downloadButton.addEventListener(
    "click",
    downloadImage
  );

}


// ===============================
// PREMIUM BUTTON
// ===============================

const upgradeButton =
  document.getElementById("upgradeButton");

if (upgradeButton) {

  upgradeButton.addEventListener(
    "click",
    function () {

      alert(
        "PhotoFix Pro — $1.19/month\n\n" +
        "Premium AI features will be available " +
        "when the secure payment and AI backend " +
        "are connected."
      );

    }
  );

}


// ===============================
// SMOOTH NAVIGATION
// ===============================

document.querySelectorAll(
  'a[href^="#"]'
).forEach(function (link) {

  link.addEventListener(
    "click",
    function (event) {

      const target =
        document.querySelector(
          this.getAttribute("href")
        );

      if (target) {

        event.preventDefault();

        target.scrollIntoView({
          behavior: "smooth"
        });

      }

    }
  );

});


// ===============================
// INITIAL STATE
// ===============================

updateFilter();
updateTransform();
