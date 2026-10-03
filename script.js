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


// =========================
// IMAGE UPLOAD
// =========================

if (imageInput) {
  imageInput.addEventListener("change", function () {

    const file = this.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = function (event) {

      if (previewImage) {
        previewImage.src = event.target.result;
        previewImage.style.display = "block";
      }

      if (uploadMessage) {
        uploadMessage.textContent =
          "Image uploaded successfully!";
      }

    };

    reader.readAsDataURL(file);
  });
}


// =========================
// PHOTO FILTERS
// =========================

function updateFilter() {

  if (!previewImage) return;

  previewImage.style.filter = `
    brightness(${brightness.value}%)
    contrast(${contrast.value}%)
    saturate(${saturation.value}%)
  `;

  if (brightnessValue) {
    brightnessValue.textContent =
      brightness.value + "%";
  }

  if (contrastValue) {
    contrastValue.textContent =
      contrast.value + "%";
  }

  if (saturationValue) {
    saturationValue.textContent =
      saturation.value + "%";
  }
}


if (brightness) {
  brightness.addEventListener("input", updateFilter);
}

if (contrast) {
  contrast.addEventListener("input", updateFilter);
}

if (saturation) {
  saturation.addEventListener("input", updateFilter);
}


// =========================
// RESET
// =========================

if (resetButton) {

  resetButton.addEventListener("click", function () {

    if (brightness) brightness.value = 100;
    if (contrast) contrast.value = 100;
    if (saturation) saturation.value = 100;

    rotation = 0;
    flipped = false;

    if (previewImage) {
      previewImage.style.transform =
        "rotate(0deg) scaleX(1)";
    }

    updateFilter();

  });

}


// =========================
// ROTATE / FLIP / ENHANCE
// =========================

document.querySelectorAll("[data-action]").forEach(function (button) {

  button.addEventListener("click", function () {

    const action = this.dataset.action;


    // ROTATE
    if (action === "rotate") {

      rotation += 90;

      if (previewImage) {

        previewImage.style.transform =
          `rotate(${rotation}deg) scaleX(${flipped ? -1 : 1})`;

      }

    }


    // FLIP
    if (action === "flip") {

      flipped = !flipped;

      if (previewImage) {

        previewImage.style.transform =
          `rotate(${rotation}deg) scaleX(${flipped ? -1 : 1})`;

      }

    }


    // AUTO ENHANCE
    if (action === "enhance") {

      if (brightness) brightness.value = 108;
      if (contrast) contrast.value = 112;
      if (saturation) saturation.value = 110;

      updateFilter();

      alert("✨ Auto Enhance applied!");

    }


    // DOWNLOAD
    if (action === "download") {

      downloadImage();

    }

  });

});


// =========================
// DOWNLOAD EDITED IMAGE
// =========================

function downloadImage() {

  if (!previewImage || !previewImage.src) {

    alert("Please upload an image first.");

    return;

  }

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  const img = new Image();

  img.onload = function () {

    canvas.width = img.width;
    canvas.height = img.height;

    ctx.filter = `
      brightness(${brightness.value}%)
      contrast(${contrast.value}%)
      saturate(${saturation.value}%)
    `;

    ctx.drawImage(img, 0, 0);

    const link = document.createElement("a");

    link.download = "photofix-enhanced.jpg";

    link.href =
      canvas.toDataURL("image/jpeg", 0.95);

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


// =========================
// PREMIUM DEMO CHECKOUT
// =========================

const upgradeButton =
  document.getElementById("upgradeButton");

if (upgradeButton) {

  upgradeButton.addEventListener(
    "click",
    function () {

      const paymentBox =
        document.createElement("div");

      paymentBox.innerHTML = `

        <div class="payment-overlay"
             id="paymentOverlay">

          <div class="payment-box">

            <button
              class="payment-close"
              id="paymentClose">
              ×
            </button>

            <div class="payment-logo">
              💳
            </div>

            <h2>
              Upgrade to PhotoFix Pro
            </h2>

            <p class="payment-subtitle">
              Unlock premium photo editing features.
            </p>

            <div class="payment-price">
              $1.19
              <span>/ month</span>
            </div>

            <div class="payment-method">
              <strong>JazzCash</strong>
              <span>Demo payment</span>
            </div>

            <button
              class="payment-button"
              id="continuePayment">
              Continue with JazzCash
            </button>

            <small class="payment-note">
              Payment gateway is not connected yet.
              This is a demo checkout interface.
            </small>

          </div>

        </div>

      `;

      document.body.appendChild(paymentBox);


      const closeButton =
        document.getElementById("paymentClose");

      const continueButton =
        document.getElementById("continuePayment");


      if (closeButton) {

        closeButton.onclick = function () {

          const overlay =
            document.getElementById(
              "paymentOverlay"
            );

          if (overlay) {
            overlay.remove();
          }

        };

      }


      if (continueButton) {

        continueButton.onclick = function () {

          alert(
            "JazzCash payment gateway is not connected yet. This is currently a demo."
          );

        };

      }

    }
  );

}


// =========================
// SMOOTH NAVIGATION
// =========================

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


// =========================
// START
// =========================

updateFilter();
