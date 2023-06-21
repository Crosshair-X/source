// Json holding the settings for an empty crosshair

exports.emptyCrosshair = {
    drawing: {
      dot: { diameter: 30, opacity: 0, color: "0, 255, 64", blur: 0},
      line: {
        length: 2,
        thickness: 0,
        offset: 4,
        opacity: 0,
        color: "Aqua",
        blur: 0,
        rotation: 0
      },
      outline: { thickness: 0, opacity: 0, color: "Black", blur: 0 },
      firingOptions: { tShapeWhenFiring: true, firingOffset: 0, duration: 0 },
      shape: "+",
    },
    properties: {
      offset: {
        x: 0,
        y: 0
      },
      name: "Empty",
    },
    generatedSvg: "<svg></svg>"
  }