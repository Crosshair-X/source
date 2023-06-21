const { ipcRenderer } = require("electron");
let currentCrosshairObj, currentCrosshairImg;

ipcRenderer.send("put-in-tray");

ipcRenderer.on("update", (event, state) => {
  if (state.crosshairType === "customimages") {
    updateCrosshairImage(
      JSON.parse(state.crosshairImage),
      state.crosshairOffset
    );
    currentCrosshairObj = null;
     // if left click
     if (state.leftMouseState && state.leftMouseState.action == "mousedown") {
      go();
    } else if (state.leftMouseState && state.leftMouseState.action == "mouseup") {
      stop();
    }

    // if the state is hidden, hide the crosshair
    if (state.isCrosshairHidden) {
      hideCrosshair();
    } else {
      showCrosshair();
    }

    if (state.isUsingExclusiveFullscreen) {
      hideCrosshair();
    }
  } else {
    currentCrosshairImg = null;
    // updating crosshair if it makes sense

    state.crosshairImage.model = JSON.parse(state.crosshairImage.model);
    if (state.crosshairImage.model.shape == "^") {
      state.crosshairImage.model.shape = "x";
    }
    updateCrosshair(state);

    // updating mouse events if it makes sense

    // if left click
    if (state.leftMouseState && state.leftMouseState.action == "mousedown") {
      go();
    } else if (state.leftMouseState && state.leftMouseState.action == "mouseup") {
      stop();
    }

    // if the state is hidden, hide the crosshair
    if (state.isCrosshairHidden) {
      hideCrosshair();
    } else {
      showCrosshair();
    }

    if (state.isUsingExclusiveFullscreen) {
      hideCrosshair();
    }
  }
});

function hideCrosshair() {
  document.getElementById("svg-target").style.display = "none";
}

function showCrosshair() {
  document.getElementById("svg-target").style.display = "block";
}

ipcRenderer.on("MouseUp", (event) => {
  stop();
});

ipcRenderer.on("MouseDown", (event) => {
  go();
});

let firingOffsetTopLineAnimation,
  firingOffsetLeftLineAnimation,
  firingOffsetRightLineAnimation,
  firingOffsetBottomLineAnimation;
let tShapeFiringAnimation;


function setTShapeWhenFiringAnimation(firingOptions) {
  tShapeFiringAnimation = anime({
    targets: "#topLine, #topLineOutline",
    fillOpacity: 0,
    duration:
      !firingOptions.duration || firingOptions.duration == 0
        ? 1
        : firingOptions.duration * 1000,
    easing: "linear",
    strokeOpacity: 0,
    autoplay: false,
    loop: false,
    delay:
      !firingOptions.startDelay || firingOptions.startDelay == 0
        ? 1
        : firingOptions.startDelay * 1000,
  });
}

// Translate the x and y coordinates of an object based off the rotation of the line (0-360) and the direction of the line
// Example: if the line is rotated 45 degrees and the direction is "up", the x and y coordinates will be translated by 1 and -1
// Example: if the line is rotated 45 degrees and the direction is "down", the x and y coordinates will be translated by -1 and 1
// Example: if the line is rotated 45 degrees and the direction is "left", the x and y coordinates will be translated by -1 and -1
// Example: if the line is rotated 45 degrees and the direction is "down", the x and y coordinates will be translated by 1 and 1

function calculateTranslation(rotation, direction) {
  let x = 0;
  let y = 0;
  if (direction == "up") {
    x = Math.cos((rotation + 90) * (Math.PI / 180));
    y = Math.sin((rotation + 90) * (Math.PI / 180));
  } else if (direction == "down") {
    x = Math.cos((rotation - 90) * (Math.PI / 180));
    y = Math.sin((rotation - 90) * (Math.PI / 180));
  } else if (direction == "left") {
    x = Math.cos((rotation - 180) * (Math.PI / 180));
    y = Math.sin((rotation - 180) * (Math.PI / 180));
  } else if (direction == "right") {
    x = Math.cos(rotation * (Math.PI / 180));
    y = Math.sin(rotation * (Math.PI / 180));
  }
  return { x: x, y: y };
}

function setFiringOffsetAnimations(crosshair) {
  const firingOptions = crosshair.crosshairImage.model.firingOptions;
  const xShape = crosshair.crosshairImage.model.shape == "x";
  const initialRotation = [
    crosshair.crosshairImage.model.line.rotation + (xShape ? 45 : 0) + "deg",
    crosshair.crosshairImage.model.line.rotation + (xShape ? 45 : 0) + "deg",
  ];

  const translationTopLine = calculateTranslation(
    crosshair.crosshairImage.model.line.rotation + (xShape ? 45 : 0),
    "up"
  );
  const translationBottomLine = calculateTranslation(
    crosshair.crosshairImage.model.line.rotation + (xShape ? 45 : 0),
    "down"
  );
  const translationLeftLine = calculateTranslation(
    crosshair.crosshairImage.model.line.rotation + (xShape ? 45 : 0),
    "left"
  );
  const translationRightLine = calculateTranslation(
    crosshair.crosshairImage.model.line.rotation + (xShape ? 45 : 0),
    "right"
  );

  firingOffsetTopLineAnimation = anime({
    targets: "#topLine, #topLineOutline",
    translateY: translationBottomLine.y * firingOptions.firingOffset,
    translateX: translationBottomLine.x * firingOptions.firingOffset,
    duration: firingOptions.duration == 0 ? 1 : firingOptions.duration * 1000,
    easing: "linear",
    autoplay: false,
    loop: false,
    delay: firingOptions.startDelay == 0 ? 1 : firingOptions.startDelay * 1000,
    rotate: initialRotation, //Setting initial and target values for the transform
  });

  firingOffsetLeftLineAnimation = anime({
    targets: "#leftLine, #leftLineOutline",
    translateY: translationLeftLine.y * firingOptions.firingOffset,
    translateX: translationLeftLine.x * firingOptions.firingOffset,
    duration: firingOptions.duration == 0 ? 1 : firingOptions.duration * 1000,
    easing: "linear",
    autoplay: false,
    loop: false,
    delay: firingOptions.startDelay == 0 ? 1 : firingOptions.startDelay * 1000,
    rotate: initialRotation, //Setting initial and target values for the transform
  });

  firingOffsetRightLineAnimation = anime({
    targets: "#rightLine, #rightLineOutline",
    translateX: translationRightLine.x * firingOptions.firingOffset,
    translateY: translationRightLine.y * firingOptions.firingOffset,
    duration: firingOptions.duration == 0 ? 1 : firingOptions.duration * 1000,
    easing: "linear",
    autoplay: false,
    loop: false,
    delay: firingOptions.startDelay == 0 ? 1 : firingOptions.startDelay * 1000,
    rotate: initialRotation, //Setting initial and target values for the transform
  });

  firingOffsetBottomLineAnimation = anime({
    targets: "#bottomLine, #bottomLineOutline",
    translateY: translationTopLine.y * firingOptions.firingOffset,
    translateX: translationTopLine.x * firingOptions.firingOffset,
    duration: firingOptions.duration == 0 ? 1 : firingOptions.duration * 1000,
    easing: "linear",
    autoplay: false,
    loop: false,
    delay: firingOptions.startDelay == 0 ? 1 : firingOptions.startDelay * 1000,
    rotate: initialRotation, //Setting initial and target values for the transform
  });
}

function stop() {
  if (tShapeFiringAnimation) {
    tShapeFiringAnimation.pause();
    tShapeFiringAnimation.seek(0);
  }

  if (firingOffsetTopLineAnimation) {
    firingOffsetTopLineAnimation.pause();
    firingOffsetTopLineAnimation.seek(0);

    firingOffsetLeftLineAnimation.pause();
    firingOffsetLeftLineAnimation.seek(0);

    firingOffsetRightLineAnimation.pause();
    firingOffsetRightLineAnimation.seek(0);

    firingOffsetBottomLineAnimation.pause();
    firingOffsetBottomLineAnimation.seek(0);
  }
}

function go() {
  if (tShapeFiringAnimation) {
    tShapeFiringAnimation.play();
  }

  if (firingOffsetTopLineAnimation) {
    firingOffsetTopLineAnimation.play();
    firingOffsetLeftLineAnimation.play();
    firingOffsetRightLineAnimation.play();
    firingOffsetBottomLineAnimation.play();
  }
}

function drawInlineSVG(ctx, rawSVG, callback) {
  const svg = new Blob([rawSVG], { type: "image/svg+xml;charset=utf-8" }),
    domURL = self.URL || self.webkitURL || self,
    url = domURL.createObjectURL(svg),
    img = new Image();

  img.onload = function () {
    ctx.drawImage(this, 0, 0);
    domURL.revokeObjectURL(url);
    callback(this);
  };

  img.src = url;
}

function updateCrosshairImage(crosshairImage, offset) {
  // Load svg-target div with image in JSON.parse(state.crosshairImage).path
  // Add an img tag with the image in JSON.parse(state.crosshairImage).path as src
// console.log(crosshairImage)
  if (crosshairImage.localPath && crosshairImage.localPath != currentCrosshairImg) {
    currentCrosshairImg = crosshairImage.localPath;

    // Get the svg element
    const svg = document.getElementById("svg-target");
    // console.log("Image type: " + crosshairImage.imageType);
    // Append an img tag to the svg element
    svg.innerHTML = `<div><img id="currentCrosshairImg" style="opacity: ${crosshairImage.imageTransparency};zoom: ${crosshairImage.imageSize}" src="${crosshairImage.localPath}" alt="Red dot" /></div>`;

  } else {
    // Get the element with id="currentCrosshairImg" and set the zoom style property to crosshairImage.imageSize
    const img = document.getElementById("currentCrosshairImg");
    // console.log("Just updating size")
    img.style.zoom = crosshairImage.imageSize;
    img.style.opacity = crosshairImage.imageTransparency;
    
  }
  document
  .getElementById("svg-target")
  .style.setProperty("top", "calc(50% - " + offset.y + "px)");
document
  .getElementById("svg-target")
  .style.setProperty("left", "calc(50% + " + offset.x + "px)");

  // set content of svg to be an svg that embeds the b64 image stored in state.crosshairImage
  // create the svg string where the image is embedded
}

function updateCrosshair(crosshairObj) {
  if (JSON.stringify(currentCrosshairObj) != JSON.stringify(crosshairObj)) {
    stop();
    document.getElementById("svg-target").innerHTML =
      crosshairObj.crosshairImage.drawing;
    drawInlineSVG();
    document
      .getElementById("svg-target")
      .style.setProperty(
        "top",
        "calc(50% - " + crosshairObj.crosshairOffset.y + "px)"
      );
    document
      .getElementById("svg-target")
      .style.setProperty(
        "left",
        "calc(50% + " + crosshairObj.crosshairOffset.x + "px)"
      );
    if (
      crosshairObj.crosshairImage.model.firingOptions.tShapeWhenFiring &&
      crosshairObj.crosshairImage.model.shape != "x"
    ) {
      setTShapeWhenFiringAnimation(
        crosshairObj.crosshairImage.model.firingOptions
      );
    } else {
      tShapeFiringAnimation = null;
    }

    if (crosshairObj.crosshairImage.model.firingOptions.firingOffset > 0) {
      setFiringOffsetAnimations(crosshairObj);
    } else {
      firingOffsetLeftLineAnimation = null;
      firingOffsetTopLineAnimation = null;
      firingOffsetRightLineAnimation = null;
      firingOffsetBottomLineAnimation = null;
    }

    currentCrosshairObj = crosshairObj;
  }
}
