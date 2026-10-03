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
let originalImage = "";

function updateImage() {
  if (!previewImage.src) return;

  previewImage.style.filter = `
    brightness(${brightness.value}%)
    contrast(${contrast.value}%)
    saturate(${saturation.value}%)
  `;

  previewImage.style.transform =
    `rotate(${rotation}deg) scaleX(${flipped ? -1 : 1})`;
}

/* PHOTO UPLOAD */

imageInput.addEventListener("change", function () {
  const file = this.files[0];

  if (!file) return;

  if (!file.type.startsWith("image/")) {
    alert("Please select an image file.");
    return;
  }

  const reader = new FileReader();

  reader.onload = function (event) {
    originalImage = event.target.result;

    previewImage.src = originalImage;
    previewImage.style.display = "block";
    uploadMessage.style.display = "none";

    rotation = 0;
    flipped = false;

    updateImage();
  };

  reader.readAsDataURL(file);
});


/* SLIDERS */

brightness.addEventListener("input", function () {
  brightnessValue.textContent = this.value;
  updateImage();
});

contrast.addEventListener("input", function () {
  contrastValue.textContent = this.value;
  updateImage();
});

saturation.addEventListener("input", function () {
  saturationValue.textContent = this.value;
  updateImage();
});


/* RESET */

resetButton.addEventListener("click", function () {
  brightness.value = 100;
  contrast.value = 100;
  saturation.value = 100;

  brightnessValue.textContent = "100";
  contrastValue.textContent = "100";
  saturationValue.textContent = "100";

  rotation = 0;
  flipped = false;

  updateImage();
});


/* TOOL BUTTONS */

const toolButtons = document.querySelectorAll(".tool-grid button");

toolButtons.forEach(function (button) {

  button.addEventListener("click", function () {

    const action = this.dataset.action;

    if (!previewImage.src) {
      alert("Please upload a photo first.");
      return;
    }

    if (action === "rotate") {
      rotation += 90;

      if (rotation >= 360) {
        rotation = 0;
      }

      updateImage();
    }


    if (action === "flip") {
      flipped = !flipped;
      updateImage();
    }


    if (action === "enhance") {
      brightness.value = 108;
      contrast.value = 112;
      saturation.value = 110;

      brightnessValue.textContent = "108";
      contrastValue.textContent = "112";
      saturationValue.textContent = "110";

      updateImage();

      alert("Auto Enhance applied!");
    }


    if (action === "download") {
      downloadEditedImage();
    }

  });

});


/* DOWNLOAD */

downloadButton.addEventListener("click", function () {

  if (!previewImage.src) {
    alert("Please upload a photo first.");
    return;
  }

  downloadEditedImage();

});


function downloadEditedImage() {

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  const image = new Image();

  image.onload = function () {

    const angle = ((rotation % 360) + 360) % 360;

    const isRotated = angle === 90 || angle === 270;

    canvas.width = isRotated ? image.naturalHeight : image.naturalWidth;
    canvas.height = isRotated ? image.naturalWidth : image.naturalHeight;

    ctx.save();

    ctx.translate(canvas.width / 2, canvas.height / 2);

    ctx.rotate(angle * Math.PI / 180);

    ctx.scale(
      flipped ? -1 : 1,
      1
    );

    ctx.filter = `
      brightness(${brightness.value}%)
      contrast(${contrast.value}%)
      saturate(${saturation.value}%)
    `;

    ctx.drawImage(
      image,
      -image.naturalWidth / 2,
      -image.naturalHeight / 2
    );

    ctx.restore();

    const link = document.createElement("a");

    link.download = "pixelforge-edited-photo.png";

    link.href = canvas.toDataURL("image/png");

    link.click();
  };

  image.src = previewImage.src;
}


/* PREMIUM BUTTON */

const upgradeButton = document.querySelector(".price-button.primary");

if (upgradeButton) {

  upgradeButton.addEventListener("click", function () {

    alert(
      "PixelForge Pro is coming soon. Advanced AI features will be connected in the next version."
    );

  });

}


/* SMOOTH ANCHOR LINKS */

document.querySelectorAll('a[href^="#"]').forEach(function (link) {

  link.addEventListener("click", function (event) {

    const target = document.querySelector(this.getAttribute("href"));

    if (target) {
      event.preventDefault();

      target.scrollIntoView({
        behavior: "smooth"
      });
    }

  });

});
