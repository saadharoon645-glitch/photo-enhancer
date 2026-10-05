/* =====================================================
   PHOTOFIX AI — STABLE MOBILE EDITOR
===================================================== */

document.addEventListener("DOMContentLoaded", function () {

  /* =========================
     ELEMENTS
  ========================= */

  const photoInput = document.getElementById("photoInput");
  const choosePhotoBtn = document.getElementById("choosePhotoBtn");
  const heroChooseBtn = document.getElementById("heroChooseBtn");

  const uploadArea = document.getElementById("uploadArea");
  const uploadMessage = document.getElementById("uploadMessage");

  const canvas = document.getElementById("canvas");
  const emptyPreview = document.getElementById("emptyPreview");
  const statusBox = document.getElementById("status");

  const brightness = document.getElementById("brightness");
  const contrast = document.getElementById("contrast");
  const saturation = document.getElementById("saturation");

  const brightnessValue = document.getElementById("brightnessValue");
  const contrastValue = document.getElementById("contrastValue");
  const saturationValue = document.getElementById("saturationValue");

  const rotateBtn = document.getElementById("rotateBtn");
  const flipBtn = document.getElementById("flipBtn");
  const bwBtn = document.getElementById("bwBtn");
  const sepiaBtn = document.getElementById("sepiaBtn");
  const vintageBtn = document.getElementById("vintageBtn");
  const enhanceBtn = document.getElementById("enhanceBtn");
  const resetBtn = document.getElementById("resetBtn");

  const removeBgBtn = document.getElementById("removeBgBtn");
  const aiEnhanceBtn = document.getElementById("aiEnhanceBtn");
  const quickEffectsBtn = document.getElementById("quickEffectsBtn");

  const downloadBtn = document.getElementById("downloadBtn");

  const qualityButtons =
    document.querySelectorAll(".quality-button");


  /* =========================
     CANVAS
  ========================= */

  const ctx = canvas ? canvas.getContext("2d") : null;


  /* =========================
     STATE
  ========================= */

  let originalImage = null;
  let currentFile = null;

  let rotation = 0;
  let flipped = false;
  let filterMode = "none";

  let exportQuality = "original";


  /* =========================
     STATUS
  ========================= */

  function showStatus(message) {
    if (statusBox) {
      statusBox.textContent = message;
    }
  }


  /* =========================
     SLIDER LABELS
  ========================= */

  function updateSliderLabels() {

    if (brightness && brightnessValue) {
      brightnessValue.textContent =
        brightness.value + "%";
    }

    if (contrast && contrastValue) {
      contrastValue.textContent =
        contrast.value + "%";
    }

    if (saturation && saturationValue) {
      saturationValue.textContent =
        saturation.value + "%";
    }

  }


  /* =========================
     RESET CONTROLS
  ========================= */

  function resetControls() {

    if (brightness) brightness.value = 100;
    if (contrast) contrast.value = 100;
    if (saturation) saturation.value = 100;

    rotation = 0;
    flipped = false;
    filterMode = "none";

    updateSliderLabels();

  }


  /* =========================
     OPEN FILE PICKER
  ========================= */

  function openFilePicker() {

    if (!photoInput) {
      showStatus("Photo input nahi mila.");
      return;
    }

    photoInput.click();

  }


  /* =========================
     CHOOSE PHOTO BUTTON
  ========================= */

  if (choosePhotoBtn) {

    choosePhotoBtn.addEventListener("click", function (event) {

      event.preventDefault();

      openFilePicker();

    });

  }


  /* =========================
     START EDITING BUTTON
     
     IMPORTANT:
     File picker MUST open directly
     from the user's click.
  ========================= */

  if (heroChooseBtn) {

    heroChooseBtn.addEventListener("click", function (event) {

      event.preventDefault();

      openFilePicker();

    });

  }


  /* =========================
     UPLOAD PHOTO
  ========================= */

  if (photoInput) {

    photoInput.addEventListener("change", function () {

      const file =
        photoInput.files &&
        photoInput.files.length
          ? photoInput.files[0]
          : null;

      if (!file) {
        return;
      }


      /* =========================
         FILE TYPE
      ========================= */

      const validTypes = [
        "image/jpeg",
        "image/png",
        "image/webp"
      ];

      if (!validTypes.includes(file.type)) {

        showStatus(
          "Please select a JPG, PNG or WEBP image."
        );

        if (uploadMessage) {
          uploadMessage.textContent =
            "Invalid image format.";
        }

        photoInput.value = "";

        return;
      }


      /* =========================
         FILE SIZE
      ========================= */

      if (file.size > 15 * 1024 * 1024) {

        showStatus(
          "Photo 15MB se choti honi chahiye."
        );

        if (uploadMessage) {
          uploadMessage.textContent =
            "File is larger than 15MB.";
        }

        photoInput.value = "";

        return;
      }


      /* =========================
         SAVE FILE
      ========================= */

      currentFile = file;

      showStatus("Photo load ho rahi hai...");

      if (uploadMessage) {
        uploadMessage.textContent =
          "Loading photo...";
      }


      /* =========================
         OBJECT URL
      ========================= */

      const imageUrl =
        URL.createObjectURL(file);

      const img =
        new Image();


      img.onload = function () {

        try {

          originalImage = img;

          resetControls();


          if (canvas) {
            canvas.style.display = "block";
          }

          if (emptyPreview) {
            emptyPreview.style.display = "none";
          }


          drawPreview();


          if (uploadMessage) {
            uploadMessage.textContent =
              file.name;
          }

          showStatus(
            "Photo uploaded successfully."
          );


        } catch (error) {

          console.error(
            "Photo preview error:",
            error
          );

          originalImage = null;
          currentFile = null;

          if (canvas) {
            canvas.style.display = "none";
          }

          if (emptyPreview) {
            emptyPreview.style.display = "flex";
          }

          if (uploadMessage) {
            uploadMessage.textContent =
              "Photo preview failed.";
          }

          showStatus(
            "Photo preview nahi ban saki."
          );

        }


        URL.revokeObjectURL(imageUrl);

      };


      img.onerror = function () {

        URL.revokeObjectURL(imageUrl);

        originalImage = null;
        currentFile = null;

        if (canvas) {
          canvas.style.display = "none";
        }

        if (emptyPreview) {
          emptyPreview.style.display = "flex";
        }

        if (uploadMessage) {
          uploadMessage.textContent =
            "Photo load failed.";
        }

        showStatus(
          "Photo load nahi ho saki."
        );

      };


      img.src = imageUrl;

    });

  }


  /* =========================
     DRAG & DROP
  ========================= */

  if (uploadArea) {

    uploadArea.addEventListener(
      "dragover",
      function (event) {

        event.preventDefault();

        uploadArea.classList.add("dragover");

      }
    );


    uploadArea.addEventListener(
      "dragleave",
      function () {

        uploadArea.classList.remove("dragover");

      }
    );


    uploadArea.addEventListener(
      "drop",
      function (event) {

        event.preventDefault();

        uploadArea.classList.remove("dragover");

        const files =
          event.dataTransfer &&
          event.dataTransfer.files;

        if (!files || !files.length) {
          return;
        }

        if (photoInput) {

          photoInput.files = files;

          photoInput.dispatchEvent(
            new Event("change")
          );

        }

      }
    );

  }


  /* =========================
     PREVIEW SIZE
  ========================= */

  function getPreviewSize(width, height) {

    const maxSize = 1600;

    const largest =
      Math.max(width, height);

    if (!largest || largest <= maxSize) {

      return {
        width: width,
        height: height
      };

    }

    const scale =
      maxSize / largest;

    return {

      width:
        Math.max(
          1,
          Math.round(width * scale)
        ),

      height:
        Math.max(
          1,
          Math.round(height * scale)
        )

    };

  }


  /* =========================
     FILTER STRING
  ========================= */

  function getFilterString() {

    let filters =
      "brightness(" +
      brightness.value +
      "%) " +

      "contrast(" +
      contrast.value +
      "%) " +

      "saturate(" +
      saturation.value +
      "%)";


    if (filterMode === "bw") {

      filters +=
        " grayscale(100%)";

    }


    if (filterMode === "sepia") {

      filters +=
        " sepia(100%)";

    }


    if (filterMode === "vintage") {

      filters +=
        " sepia(30%) " +
        "contrast(110%) " +
        "saturate(85%)";

    }


    if (filterMode === "enhance") {

      filters +=
        " contrast(115%) " +
        "saturate(110%) " +
        "brightness(105%)";

    }


    return filters;

  }


  /* =========================
     DRAW PREVIEW
  ========================= */

  function drawPreview() {

    if (!originalImage || !canvas || !ctx) {
      return;
    }


    const sourceWidth =
      originalImage.naturalWidth ||
      originalImage.width;

    const sourceHeight =
      originalImage.naturalHeight ||
      originalImage.height;


    const safe =
      getPreviewSize(
        sourceWidth,
        sourceHeight
      );


    drawToCanvas(
      safe.width,
      safe.height
    );

  }


  /* =========================
     DRAW CANVAS
  ========================= */

  function drawToCanvas(width, height) {

    if (!originalImage || !canvas || !ctx) {
      return;
    }


    const rotated =
      rotation === 90 ||
      rotation === 270;


    canvas.width =
      rotated
        ? height
        : width;

    canvas.height =
      rotated
        ? width
        : height;


    ctx.save();


    ctx.clearRect(
      0,
      0,
      canvas.width,
      canvas.height
    );


    ctx.filter =
      getFilterString();


    ctx.translate(
      canvas.width / 2,
      canvas.height / 2
    );


    ctx.rotate(
      rotation *
      Math.PI /
      180
    );


    if (flipped) {

      ctx.scale(
        -1,
        1
      );

    }


    ctx.imageSmoothingEnabled = true;

    ctx.imageSmoothingQuality =
      "high";


    ctx.drawImage(
      originalImage,

      -width / 2,
      -height / 2,

      width,
      height
    );


    ctx.restore();

  }


  /* =========================
     SLIDERS
  ========================= */

  if (brightness) {

    brightness.addEventListener(
      "input",
      function () {

        updateSliderLabels();
        drawPreview();

      }
    );

  }


  if (contrast) {

    contrast.addEventListener(
      "input",
      function () {

        updateSliderLabels();
        drawPreview();

      }
    );

  }


  if (saturation) {

    saturation.addEventListener(
      "input",
      function () {

        updateSliderLabels();
        drawPreview();

      }
    );

  }


  /* =========================
     REQUIRE PHOTO
  ========================= */

  function requirePhoto() {

    if (!originalImage) {

      showStatus(
        "Pehle photo choose karo."
      );

      return false;

    }

    return true;

  }


  /* =========================
     ROTATE
  ========================= */

  if (rotateBtn) {

    rotateBtn.addEventListener(
      "click",
      function () {

        if (!requirePhoto()) {
          return;
        }

        rotation =
          (rotation + 90) % 360;

        drawPreview();

      }
    );

  }


  /* =========================
     FLIP
  ========================= */

  if (flipBtn) {

    flipBtn.addEventListener(
      "click",
      function () {

        if (!requirePhoto()) {
          return;
        }

        flipped =
          !flipped;

        drawPreview();

      }
    );

  }


  /* =========================
     B&W
  ========================= */

  if (bwBtn) {

    bwBtn.addEventListener(
      "click",
      function () {

        if (!requirePhoto()) {
          return;
        }

        filterMode = "bw";

        drawPreview();

        showStatus(
          "Black & White effect applied."
        );

      }
    );

  }


  /* =========================
     SEPIA
  ========================= */

  if (sepiaBtn) {

    sepiaBtn.addEventListener(
      "click",
      function () {

        if (!requirePhoto()) {
          return;
        }

        filterMode = "sepia";

        drawPreview();

        showStatus(
          "Sepia effect applied."
        );

      }
    );

  }


  /* =========================
     VINTAGE
  ========================= */

  if (vintageBtn) {

    vintageBtn.addEventListener(
      "click",
      function () {

        if (!requirePhoto()) {
          return;
        }

        filterMode = "vintage";

        drawPreview();

        showStatus(
          "Vintage effect applied."
        );

      }
    );

  }


  /* =========================
     ENHANCE
  ========================= */

  if (enhanceBtn) {

    enhanceBtn.addEventListener(
      "click",
      function () {

        if (!requirePhoto()) {
          return;
        }

        filterMode = "enhance";

        drawPreview();

        showStatus(
          "Enhance effect applied."
        );

      }
    );

  }


  /* =========================
     RESET
  ========================= */

  if (resetBtn) {

    resetBtn.addEventListener(
      "click",
      function () {

        if (!requirePhoto()) {
          return;
        }

        resetControls();

        drawPreview();

        showStatus(
          "Photo reset ho gayi."
        );

      }
    );

  }


  /* =========================
     QUALITY
  ========================= */

  qualityButtons.forEach(
    function (button) {

      button.addEventListener(
        "click",
        function () {

          qualityButtons.forEach(
            function (item) {

              item.classList.remove(
                "active"
              );

            }
          );


          button.classList.add(
            "active"
          );


          exportQuality =
            button.dataset.quality;


          showStatus(
            "Export quality: " +
            exportQuality.toUpperCase()
          );

        }
      );

    }
  );


  /* =========================
     EXPORT SIZE
  ========================= */

  function getExportSize() {

    const sourceWidth =
      originalImage.naturalWidth ||
      originalImage.width;

    const sourceHeight =
      originalImage.naturalHeight ||
      originalImage.height;


    if (exportQuality === "original") {

      return {
        width: sourceWidth,
        height: sourceHeight
      };

    }


    let targetLongestSide;


    if (exportQuality === "hd") {

      targetLongestSide = 1280;

    } else if (exportQuality === "2k") {

      targetLongestSide = 2560;

    } else if (exportQuality === "4k") {

      targetLongestSide = 3840;

    } else {

      targetLongestSide =
        Math.max(
          sourceWidth,
          sourceHeight
        );

    }


    const sourceLongest =
      Math.max(
        sourceWidth,
        sourceHeight
      );


    if (
      sourceLongest >=
      targetLongestSide
    ) {

      return {
        width: sourceWidth,
        height: sourceHeight
      };

    }


    const scale =
      targetLongestSide /
      sourceLongest;


    return {

      width:
        Math.max(
          1,
          Math.round(
            sourceWidth * scale
          )
        ),

      height:
        Math.max(
          1,
          Math.round(
            sourceHeight * scale
          )
        )

    };

  }


  /* =========================
     DOWNLOAD
  ========================= */

  if (downloadBtn) {

    downloadBtn.addEventListener(
      "click",
      function () {

        if (!requirePhoto()) {
          return;
        }


        downloadBtn.disabled = true;

        downloadBtn.textContent =
          "Preparing PNG...";


        try {

          const size =
            getExportSize();


          const exportCanvas =
            document.createElement(
              "canvas"
            );


          const exportCtx =
            exportCanvas.getContext(
              "2d"
            );


          const rotated =
            rotation === 90 ||
            rotation === 270;


          exportCanvas.width =
            rotated
              ? size.height
              : size.width;

          exportCanvas.height =
            rotated
              ? size.width
              : size.height;


          exportCtx.save();


          exportCtx.clearRect(
            0,
            0,
            exportCanvas.width,
            exportCanvas.height
          );


          exportCtx.filter =
            getFilterString();


          exportCtx.imageSmoothingEnabled =
            true;

          exportCtx.imageSmoothingQuality =
            "high";


          exportCtx.translate(
            exportCanvas.width / 2,
            exportCanvas.height / 2
          );


          exportCtx.rotate(
            rotation *
            Math.PI /
            180
          );


          if (flipped) {

            exportCtx.scale(
              -1,
              1
            );

          }


          exportCtx.drawImage(
            originalImage,

            -size.width / 2,
            -size.height / 2,

            size.width,
            size.height
          );


          exportCtx.restore();


          exportCanvas.toBlob(
            function (blob) {

              if (!blob) {

                showStatus(
                  "PNG create nahi ho saki."
                );

                downloadBtn.disabled =
                  false;

                downloadBtn.textContent =
                  "Download PNG";

                return;

              }


              const url =
                URL.createObjectURL(
                  blob
                );


              const link =
                document.createElement(
                  "a"
                );


              link.href = url;

              link.download =
                "photofix-ai-" +
                exportQuality +
                ".png";


              document.body.appendChild(
                link
              );


              link.click();

              link.remove();


              setTimeout(
                function () {

                  URL.revokeObjectURL(
                    url
                  );

                },
                1000
              );


              showStatus(
                exportQuality.toUpperCase() +
                " PNG download start ho gayi."
              );


              downloadBtn.disabled =
                false;

              downloadBtn.textContent =
                "Download PNG";

            },
            "image/png"
          );


        } catch (error) {

          console.error(
            "Download error:",
            error
          );


          showStatus(
            "Image download nahi ho saki."
          );


          downloadBtn.disabled =
            false;

          downloadBtn.textContent =
            "Download PNG";

        }

      }
    );

  }


  /* =========================
     AI ENHANCE
  ========================= */

  if (aiEnhanceBtn) {

    aiEnhanceBtn.addEventListener(
      "click",
      function () {

        if (!requirePhoto()) {
          return;
        }

        filterMode = "enhance";

        brightness.value = 105;
        contrast.value = 115;
        saturation.value = 110;

        updateSliderLabels();

        drawPreview();

        showStatus(
          "AI Enhance effect applied."
        );

      }
    );

  }


  /* =========================
     QUICK EFFECTS
  ========================= */

  if (quickEffectsBtn) {

    quickEffectsBtn.addEventListener(
      "click",
      function () {

        if (!requirePhoto()) {
          return;
        }

        filterMode = "vintage";

        brightness.value = 105;
        contrast.value = 110;
        saturation.value = 90;

        updateSliderLabels();

        drawPreview();

        showStatus(
          "Quick effect applied."
        );

      }
    );

  }


  /* =========================
     BACKGROUND REMOVAL
  ========================= */

  if (removeBgBtn) {

    removeBgBtn.addEventListener(
      "click",
      removeBackground
    );

  }


  async function removeBackground() {

    if (
      !originalImage ||
      !currentFile
    ) {

      showStatus(
        "Pehle photo choose karo."
      );

      return;

    }


    removeBgBtn.disabled = true;

    removeBgBtn.textContent =
      "Removing Background...";


    showStatus(
      "AI background removal start ho raha hai..."
    );


    try {

      const formData =
        new FormData();


      formData.append(
        "image",
        currentFile,
        currentFile.name
      );


      const response =
        await fetch(
          "/api/remove-background",
          {
            method: "POST",
            body: formData
          }
        );


      if (!response.ok) {

        let message =
          "Background removal failed.";


        try {

          const contentType =
            response.headers.get(
              "content-type"
            ) || "";


          if (
            contentType.includes(
              "application/json"
            )
          ) {

            const data =
              await response.json();


            if (
              data &&
              data.error
            ) {

              message =
                data.error;

            }

          } else {

            const serverText =
              await response.text();


            if (serverText) {

              message =
                "Server error: " +
                serverText.slice(
                  0,
                  180
                );

            }

          }

        } catch (error) {

          console.error(
            "Server response error:",
            error
          );

        }


        throw new Error(
          message
        );

      }


      const blob =
        await response.blob();


      if (
        !blob.type ||
        !blob.type.startsWith("image/")
      ) {

        throw new Error(
          "Server ne image result return nahi kiya."
        );

      }


      const imageUrl =
        URL.createObjectURL(
          blob
        );


      const img =
        new Image();


      img.onload =
        function () {

          originalImage = img;

          rotation = 0;
          flipped = false;
          filterMode = "none";

          brightness.value = 100;
          contrast.value = 100;
          saturation.value = 100;

          updateSliderLabels();


          if (canvas) {
            canvas.style.display =
              "block";
          }

          if (emptyPreview) {
            emptyPreview.style.display =
              "none";
          }


          drawPreview();


          URL.revokeObjectURL(
            imageUrl
          );


          showStatus(
            "Background successfully remove ho gaya."
          );


          removeBgBtn.disabled =
            false;

          removeBgBtn.textContent =
            "Remove Background";

        };


      img.onerror =
        function () {

          URL.revokeObjectURL(
            imageUrl
          );


          removeBgBtn.disabled =
            false;

          removeBgBtn.textContent =
            "Remove Background";


          showStatus(
            "AI result image load nahi ho saki."
          );

        };


      img.src =
        imageUrl;


    } catch (error) {

      console.error(
        "Background removal error:",
        error
      );


      showStatus(
        error.message ||
        "Background removal failed."
      );


      removeBgBtn.disabled =
        false;

      removeBgBtn.textContent =
        "Remove Background";

    }

  }


  /* =========================
     INITIAL STATE
  ========================= */

  updateSliderLabels();


  if (canvas) {
    canvas.style.display = "none";
  }


  if (emptyPreview) {
    emptyPreview.style.display = "flex";
  }


  showStatus(
    "Choose a photo to start editing."
  );


});
