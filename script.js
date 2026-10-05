/* =====================================================
   PHOTOFIX AI — STABLE PHOTO EDITOR
   Mobile Upload + Preview + Editing + AI Background Removal
===================================================== */

document.addEventListener("DOMContentLoaded", function () {

  /* =========================
     ELEMENTS
  ========================= */

  const photoInput =
    document.getElementById("photoInput");

  const choosePhotoBtn =
    document.getElementById("choosePhotoBtn");

  const heroChooseBtn =
    document.getElementById("heroChooseBtn");

  const uploadArea =
    document.getElementById("uploadArea");

  const uploadMessage =
    document.getElementById("uploadMessage");

  const canvas =
    document.getElementById("canvas");

  const emptyPreview =
    document.getElementById("emptyPreview");

  const statusBox =
    document.getElementById("statusBox");

  const brightness =
    document.getElementById("brightness");

  const contrast =
    document.getElementById("contrast");

  const saturation =
    document.getElementById("saturation");

  const brightnessValue =
    document.getElementById("brightnessValue");

  const contrastValue =
    document.getElementById("contrastValue");

  const saturationValue =
    document.getElementById("saturationValue");

  const rotateBtn =
    document.getElementById("rotateBtn");

  const flipBtn =
    document.getElementById("flipBtn");

  const bwBtn =
    document.getElementById("bwBtn");

  const sepiaBtn =
    document.getElementById("sepiaBtn");

  const vintageBtn =
    document.getElementById("vintageBtn");

  const enhanceBtn =
    document.getElementById("enhanceBtn");

  const resetBtn =
    document.getElementById("resetBtn");

  const removeBgBtn =
    document.getElementById("removeBgBtn");

  const aiEnhanceBtn =
    document.getElementById("aiEnhanceBtn");

  const quickEffectsBtn =
    document.getElementById("quickEffectsBtn");

  const downloadBtn =
    document.getElementById("downloadBtn");

  const qualityButtons =
    document.querySelectorAll(
      ".quality-button"
    );


  /* =========================
     STATE
  ========================= */

  let originalImage = null;
  let currentFile = null;

  let rotation = 0;
  let flipped = false;
  let filterMode = "none";

  let exportQuality = "original";

  let resultObjectUrl = null;


  /* =========================
     STATUS
  ========================= */

  function showStatus(message) {

    if (!statusBox) {
      console.log(message);
      return;
    }

    statusBox.textContent =
      message;

    statusBox.style.display =
      "block";
  }


  /* =========================
     SCROLL
  ========================= */

  function scrollToEditor() {

    const editor =
      document.getElementById("editor") ||
      document.querySelector(".editor") ||
      document.querySelector(".editor-section");

    if (!editor) return;

    setTimeout(function () {

      editor.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });

    }, 200);
  }


  /* =========================
     SLIDER LABELS
  ========================= */

  function updateSliderLabels() {

    if (
      brightness &&
      brightnessValue
    ) {
      brightnessValue.textContent =
        brightness.value + "%";
    }

    if (
      contrast &&
      contrastValue
    ) {
      contrastValue.textContent =
        contrast.value + "%";
    }

    if (
      saturation &&
      saturationValue
    ) {
      saturationValue.textContent =
        saturation.value + "%";
    }
  }


  /* =========================
     FILE PICKER
  ========================= */

  function openFilePicker(event) {

    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    if (photoInput) {
      photoInput.click();
    }
  }


  if (choosePhotoBtn) {
    choosePhotoBtn.addEventListener(
      "click",
      openFilePicker
    );
  }


  if (heroChooseBtn) {
    heroChooseBtn.addEventListener(
      "click",
      openFilePicker
    );
  }


  /* =========================
     RESET CONTROLS
  ========================= */

  function resetControls() {

    rotation = 0;
    flipped = false;
    filterMode = "none";

    if (brightness) {
      brightness.value = 100;
    }

    if (contrast) {
      contrast.value = 100;
    }

    if (saturation) {
      saturation.value = 100;
    }

    updateSliderLabels();
  }


  /* =========================
     LOAD IMAGE
  ========================= */

  function loadImageFile(file) {

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp"
    ];

    if (
      !allowedTypes.includes(
        file.type
      )
    ) {
      showStatus(
        "❌ Sirf JPG, PNG ya WEBP photo choose karo."
      );
      return;
    }

    const maxSize =
      15 * 1024 * 1024;

    if (file.size > maxSize) {
      showStatus(
        "❌ Photo 15MB se choti honi chahiye."
      );
      return;
    }

    showStatus(
      "Photo load ho rahi hai..."
    );

    const objectUrl =
      URL.createObjectURL(file);

    const image =
      new Image();

    image.onload =
      function () {

        originalImage =
          image;

        currentFile =
          file;

        resetControls();

        if (emptyPreview) {
          emptyPreview.style.display =
            "none";
        }

        if (canvas) {
          canvas.style.display =
            "block";
        }

        drawPreview();

        if (uploadMessage) {
          uploadMessage.textContent =
            file.name;
        }

        showStatus(
          "✅ Photo successfully loaded."
        );

        URL.revokeObjectURL(
          objectUrl
        );

        scrollToEditor();
      };

    image.onerror =
      function () {

        URL.revokeObjectURL(
          objectUrl
        );

        showStatus(
          "❌ Photo load nahi ho saki. Dobara try karo."
        );
      };

    image.src =
      objectUrl;
  }


  /* =========================
     FILE INPUT
  ========================= */

  if (photoInput) {

    photoInput.addEventListener(
      "change",
      function (event) {

        const file =
          event.target.files &&
          event.target.files[0];

        loadImageFile(file);

      }
    );

  }


  /* =========================
     DRAG & DROP
  ========================= */

  if (uploadArea) {

    uploadArea.addEventListener(
      "dragover",
      function (event) {

        event.preventDefault();

        uploadArea.classList.add(
          "drag-over"
        );

      }
    );

    uploadArea.addEventListener(
      "dragleave",
      function () {

        uploadArea.classList.remove(
          "drag-over"
        );

      }
    );

    uploadArea.addEventListener(
      "drop",
      function (event) {

        event.preventDefault();

        uploadArea.classList.remove(
          "drag-over"
        );

        const file =
          event.dataTransfer.files &&
          event.dataTransfer.files[0];

        loadImageFile(file);

      }
    );
  }


  /* =========================
     FILTER
  ========================= */

  function getFilterString() {

    const b =
      brightness
        ? Number(brightness.value)
        : 100;

    const c =
      contrast
        ? Number(contrast.value)
        : 100;

    const s =
      saturation
        ? Number(saturation.value)
        : 100;

    let filter =
      "brightness(" +
      b +
      "%) " +
      "contrast(" +
      c +
      "%) " +
      "saturate(" +
      s +
      "%)";

    if (filterMode === "bw") {
      filter +=
        " grayscale(100%)";
    }

    if (filterMode === "sepia") {
      filter +=
        " sepia(80%)";
    }

    if (filterMode === "vintage") {
      filter +=
        " sepia(35%) saturate(85%) contrast(105%)";
    }

    return filter;
  }


  /* =========================
     DRAW PREVIEW
  ========================= */

  function drawPreview() {

    if (
      !canvas ||
      !originalImage
    ) {
      return;
    }

    const ctx =
      canvas.getContext("2d");

    if (!ctx) return;

    const sourceWidth =
      originalImage.naturalWidth ||
      originalImage.width;

    const sourceHeight =
      originalImage.naturalHeight ||
      originalImage.height;

    if (
      !sourceWidth ||
      !sourceHeight
    ) {
      return;
    }

    const maxPreview =
      1600;

    let width =
      sourceWidth;

    let height =
      sourceHeight;

    const largest =
      Math.max(
        width,
        height
      );

    if (
      largest >
      maxPreview
    ) {

      const scale =
        maxPreview /
        largest;

      width =
        Math.round(
          width * scale
        );

      height =
        Math.round(
          height * scale
        );
    }

    const isRotated =
      rotation % 180 !== 0;

    canvas.width =
      isRotated
        ? height
        : width;

    canvas.height =
      isRotated
        ? width
        : height;

    ctx.save();

    ctx.clearRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    ctx.imageSmoothingEnabled =
      true;

    ctx.imageSmoothingQuality =
      "high";

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

  [
    brightness,
    contrast,
    saturation
  ].forEach(function (slider) {

    if (!slider) return;

    slider.addEventListener(
      "input",
      function () {

        updateSliderLabels();
        drawPreview();

      }
    );

  });


  /* =========================
     EDIT BUTTONS
  ========================= */

  if (rotateBtn) {

    rotateBtn.addEventListener(
      "click",
      function () {

        rotation =
          (rotation + 90) %
          360;

        drawPreview();
      }
    );
  }


  if (flipBtn) {

    flipBtn.addEventListener(
      "click",
      function () {

        flipped =
          !flipped;

        drawPreview();
      }
    );
  }


  if (bwBtn) {

    bwBtn.addEventListener(
      "click",
      function () {

        filterMode =
          filterMode === "bw"
            ? "none"
            : "bw";

        drawPreview();
      }
    );
  }


  if (sepiaBtn) {

    sepiaBtn.addEventListener(
      "click",
      function () {

        filterMode =
          filterMode === "sepia"
            ? "none"
            : "sepia";

        drawPreview();
      }
    );
  }


  if (vintageBtn) {

    vintageBtn.addEventListener(
      "click",
      function () {

        filterMode =
          filterMode === "vintage"
            ? "none"
            : "vintage";

        drawPreview();
      }
    );
  }


  if (enhanceBtn) {

    enhanceBtn.addEventListener(
      "click",
      function () {

        if (!originalImage) {
          showStatus(
            "Pehle photo choose karo."
          );
          return;
        }

        if (brightness) {
          brightness.value =
            105;
        }

        if (contrast) {
          contrast.value =
            108;
        }

        if (saturation) {
          saturation.value =
            108;
        }

        filterMode =
          "none";

        updateSliderLabels();
        drawPreview();

        showStatus(
          "✨ Photo enhanced."
        );
      }
    );
  }


  if (resetBtn) {

    resetBtn.addEventListener(
      "click",
      function () {

        if (!originalImage) {
          showStatus(
            "Pehle photo choose karo."
          );
          return;
        }

        resetControls();
        drawPreview();

        showStatus(
          "↩️ Editing reset ho gayi."
        );
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

        if (!originalImage) {
          showStatus(
            "Pehle photo choose karo."
          );
          return;
        }

        if (brightness) {
          brightness.value =
            105;
        }

        if (contrast) {
          contrast.value =
            110;
        }

        if (saturation) {
          saturation.value =
            106;
        }

        updateSliderLabels();
        drawPreview();

        showStatus(
          "✨ AI Enhance applied."
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

        if (!originalImage) {
          showStatus(
            "Pehle photo choose karo."
          );
          return;
        }

        if (brightness) {
          brightness.value =
            103;
        }

        if (contrast) {
          contrast.value =
            106;
        }

        if (saturation) {
          saturation.value =
            110;
        }

        filterMode =
          "none";

        updateSliderLabels();
        drawPreview();

        showStatus(
          "✨ Quick effects applied."
        );
      }
    );
  }


  /* =========================
     QUALITY
  ========================= */

  if (qualityButtons.length) {

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
              button.dataset.quality ||
              button.getAttribute(
                "data-quality"
              ) ||
              "original";

            showStatus(
              "Export quality: " +
              exportQuality
            );
          }
        );
      }
    );
  }


  /* =========================
     EXPORT
  ========================= */

  function drawToCanvas(
    outputCanvas,
    maxSize
  ) {

    if (
      !outputCanvas ||
      !originalImage
    ) {
      return false;
    }

    const ctx =
      outputCanvas.getContext(
        "2d"
      );

    if (!ctx) return false;

    const sourceWidth =
      originalImage.naturalWidth ||
      originalImage.width;

    const sourceHeight =
      originalImage.naturalHeight ||
      originalImage.height;

    let width =
      sourceWidth;

    let height =
      sourceHeight;

    if (
      maxSize &&
      Math.max(
        width,
        height
      ) > maxSize
    ) {

      const scale =
        maxSize /
        Math.max(
          width,
          height
        );

      width =
        Math.round(
          width * scale
        );

      height =
        Math.round(
          height * scale
        );
    }

    const isRotated =
      rotation % 180 !== 0;

    outputCanvas.width =
      isRotated
        ? height
        : width;

    outputCanvas.height =
      isRotated
        ? width
        : height;

    ctx.save();

    ctx.imageSmoothingEnabled =
      true;

    ctx.imageSmoothingQuality =
      "high";

    ctx.filter =
      getFilterString();

    ctx.translate(
      outputCanvas.width / 2,
      outputCanvas.height / 2
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

    ctx.drawImage(
      originalImage,
      -width / 2,
      -height / 2,
      width,
      height
    );

    ctx.restore();

    return true;
  }


  /* =========================
     DOWNLOAD
  ========================= */

  if (downloadBtn) {

    downloadBtn.addEventListener(
      "click",
      function () {

        if (!originalImage) {
          showStatus(
            "Pehle photo choose karo."
          );
          return;
        }

        let maxSize = null;

        if (
          exportQuality === "HD"
        ) {
          maxSize = 1920;
        }

        if (
          exportQuality === "2K"
        ) {
          maxSize = 2560;
        }

        if (
          exportQuality === "4K"
        ) {
          maxSize = 3840;
        }

        const outputCanvas =
          document.createElement(
            "canvas"
          );

        if (
          !drawToCanvas(
            outputCanvas,
            maxSize
          )
        ) {
          showStatus(
            "❌ Image export nahi ho saki."
          );
          return;
        }

        outputCanvas.toBlob(
          function (blob) {

            if (!blob) {
              showStatus(
                "❌ PNG export failed."
              );
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

            link.href =
              url;

            link.download =
              "photofix-ai-edited.png";

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
              "✅ Photo download ho gayi."
            );
          },
          "image/png"
        );
      }
    );
  }


  /* =====================================================
     AI BACKGROUND REMOVAL
  ===================================================== */

  if (removeBgBtn) {

    removeBgBtn.addEventListener(
      "click",
      function (event) {

        event.preventDefault();
        event.stopPropagation();

        removeBackground();
      }
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

    if (
      removeBgBtn &&
      removeBgBtn.disabled
    ) {
      return;
    }

    if (removeBgBtn) {
      removeBgBtn.disabled =
        true;

      removeBgBtn.textContent =
        "Removing Background...";
    }

    try {

      showStatus(
        "Photo AI ke liye prepare ho rahi hai..."
      );

      const sourceWidth =
        originalImage.naturalWidth ||
        originalImage.width;

      const sourceHeight =
        originalImage.naturalHeight ||
        originalImage.height;

      if (
        !sourceWidth ||
        !sourceHeight
      ) {
        throw new Error(
          "Photo dimensions nahi mil sakin."
        );
      }


      /* =========================
         PREPARE IMAGE
      ========================= */

      const maxUploadSize =
        2200;

      let uploadWidth =
        sourceWidth;

      let uploadHeight =
        sourceHeight;

      const largest =
        Math.max(
          sourceWidth,
          sourceHeight
        );

      if (
        largest >
        maxUploadSize
      ) {

        const scale =
          maxUploadSize /
          largest;

        uploadWidth =
          Math.max(
            1,
            Math.round(
              sourceWidth *
              scale
            )
          );

        uploadHeight =
          Math.max(
            1,
            Math.round(
              sourceHeight *
              scale
            )
          );
      }


      const uploadCanvas =
        document.createElement(
          "canvas"
        );

      uploadCanvas.width =
        uploadWidth;

      uploadCanvas.height =
        uploadHeight;


      const uploadCtx =
        uploadCanvas.getContext(
          "2d"
        );

      if (!uploadCtx) {
        throw new Error(
          "Mobile image processing failed."
        );
      }


      uploadCtx.clearRect(
        0,
        0,
        uploadWidth,
        uploadHeight
      );

      uploadCtx.imageSmoothingEnabled =
        true;

      uploadCtx.imageSmoothingQuality =
        "high";


      uploadCtx.drawImage(
        originalImage,
        0,
        0,
        uploadWidth,
        uploadHeight
      );


      /* =========================
         CONVERT
      ========================= */

      showStatus(
        "Photo compress ho rahi hai..."
      );

      const uploadBlob =
        await new Promise(
          function (
            resolve,
            reject
          ) {

            uploadCanvas.toBlob(
              function (blob) {

                if (
                  blob &&
                  blob.size > 0
                ) {
                  resolve(blob);
                } else {
                  reject(
                    new Error(
                      "Photo prepare nahi ho saki."
                    )
                  );
                }

              },
              "image/jpeg",
              0.82
            );
          }
        );


      console.log(
        "PhotoFix upload size:",
        uploadBlob.size
      );


      if (
        uploadBlob.size >
        15 * 1024 * 1024
      ) {
        throw new Error(
          "Photo upload ke liye bohat bari hai."
        );
      }


      /* =========================
         FORM DATA
      ========================= */

      const formData =
        new FormData();

      formData.append(
        "image",
        uploadBlob,
        "photofix-photo.jpg"
      );


      /* =========================
         REQUEST
      ========================= */

      showStatus(
        "AI background removal start ho raha hai..."
      );

      const controller =
        new AbortController();

      const timeout =
        setTimeout(
          function () {
            controller.abort();
          },
          90000
        );


      let response;

      try {

        response =
          await fetch(
            "/api/remove-background",
            {
              method: "POST",
              body: formData,
              cache: "no-store",
              signal: controller.signal
            }
          );

      } catch (error) {

        console.error(
          "PhotoFix fetch error:",
          error
        );

        if (
          error &&
          error.name ===
          "AbortError"
        ) {
          throw new Error(
            "AI processing mein bohat time lag raha hai. Dobara try karo."
          );
        }

        throw new Error(
          "AI server se connection nahi ho saka."
        );

      } finally {

        clearTimeout(
          timeout
        );
      }


      console.log(
        "PhotoFix API status:",
        response.status
      );

      const responseType =
        (
          response.headers.get(
            "content-type"
          ) || ""
        ).toLowerCase();

      console.log(
        "PhotoFix API type:",
        responseType
      );


      /* =========================
         ERROR RESPONSE
      ========================= */

      if (!response.ok) {

        let errorMessage =
          "Background removal failed.";

        try {

          if (
            responseType.includes(
              "application/json"
            )
          ) {

            const data =
              await response.json();

            if (
              data &&
              data.error
            ) {
              errorMessage =
                data.error;
            }

          } else {

            const text =
              await response.text();

            if (text) {
              errorMessage =
                text.substring(
                  0,
                  300
                );
            }
          }

        } catch (error) {
          console.error(
            "API error read failed:",
            error
          );
        }

        throw new Error(
          errorMessage
        );
      }


      /* =========================
         IMAGE CHECK
      ========================= */

      if (
        !responseType.startsWith(
          "image/"
        )
      ) {

        throw new Error(
          "AI ne image ke bajaye unexpected response diya."
        );
      }


      showStatus(
        "AI result mil gaya..."
      );


      /* =========================
         RESULT BLOB
      ========================= */

      const resultBlob =
        await response.blob();

      if (
        !resultBlob ||
        resultBlob.size === 0
      ) {
        throw new Error(
          "AI ne empty image return ki."
        );
      }


      console.log(
        "Background result size:",
        resultBlob.size
      );


      /* =========================
         RESULT URL
      ========================= */

      if (resultObjectUrl) {

        URL.revokeObjectURL(
          resultObjectUrl
        );

        resultObjectUrl =
          null;
      }

      resultObjectUrl =
        URL.createObjectURL(
          resultBlob
        );


      showStatus(
        "Background removed image load ho rahi hai..."
      );


      /* =========================
         LOAD RESULT
      ========================= */

      const resultImage =
        new Image();

      resultImage.decoding =
        "async";


      await new Promise(
        function (
          resolve,
          reject
        ) {

          let finished =
            false;

          const finish =
            function (
              error
            ) {

              if (finished) {
                return;
              }

              finished =
                true;

              if (error) {
                reject(error);
              } else {
                resolve();
              }
            };


          resultImage.onload =
            function () {
              finish();
            };


          resultImage.onerror =
            function () {
              finish(
                new Error(
                  "AI result image load nahi ho saki."
                )
              );
            };


          resultImage.src =
            resultObjectUrl;
        }
      );


      if (
        !resultImage.naturalWidth ||
        !resultImage.naturalHeight
      ) {
        throw new Error(
          "AI result image valid nahi hai."
        );
      }


      console.log(
        "Result image loaded:",
        resultImage.naturalWidth,
        resultImage.naturalHeight
      );


      /* =========================
         SET RESULT
      ========================= */

      originalImage =
        resultImage;


      try {

        currentFile =
          new File(
            [resultBlob],
            "photofix-background-removed.png",
            {
              type:
                "image/png"
            }
          );

      } catch (error) {

        console.warn(
          "File object update failed:",
          error
        );
      }


      /* =========================
         RESET EDITING
      ========================= */

      rotation =
        0;

      flipped =
        false;

      filterMode =
        "none";


      if (brightness) {
        brightness.value =
          100;
      }

      if (contrast) {
        contrast.value =
          100;
      }

      if (saturation) {
        saturation.value =
          100;
      }

      updateSliderLabels();


      /* =========================
         SHOW RESULT
      ========================= */

      if (emptyPreview) {
        emptyPreview.style.display =
          "none";
      }

      if (canvas) {
        canvas.style.display =
          "block";
      }


      drawPreview();


      if (uploadMessage) {
        uploadMessage.textContent =
          "Background removed successfully";
      }


      showStatus(
        "✅ Background successfully remove ho gaya."
      );


    } catch (error) {

      console.error(
        "Background removal error:",
        error
      );

      showStatus(
        "❌ " +
        (
          error &&
          error.message
            ? error.message
            : "Background removal failed."
        )
      );

    } finally {

      if (removeBgBtn) {

        removeBgBtn.disabled =
          false;

        removeBgBtn.textContent =
          "Remove Background";
      }
    }
  }


  /* =========================
     INITIAL STATE
  ========================= */

  updateSliderLabels();

  if (canvas) {
    canvas.style.display =
      "none";
  }

  if (emptyPreview) {
    emptyPreview.style.display =
      "block";
  }

  console.log(
    "PhotoFix AI editor loaded successfully."
  );

});
