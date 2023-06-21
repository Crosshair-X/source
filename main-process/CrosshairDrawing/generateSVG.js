function render(crosshairDrawing, firingOffsetActivated, firingOpacityRemaining) {

    // for all layers in crosshair drawing, turn into array

    // this was being done in the windows form because the slider value was set from 0->20 with a step of 2
    // if steps of 1 are done past an index of 2, it starts to look wonky
    // this allows the possible outline thicknesses to be 1,2,4,6,8,10...
    const adjustedThickness = crosshairDrawing.outline.thickness == 0 ? 1 : crosshairDrawing.outline.thickness;
    const adjustedLineLength = crosshairDrawing.line.length == 0 ? 1 : crosshairDrawing.line.length;
    const adjustedLineThickness = crosshairDrawing.line.thickness == 0 ? 1 : crosshairDrawing.line.thickness;

    const viewBoxString = generateViewBoxSVG(crosshairDrawing, adjustedThickness, 1);


    const dotString = generateDotSVG(crosshairDrawing);

    const lineString = generateLinesSVG(crosshairDrawing, 0, 1);

    const outlineString = generateOutlineSVG(crosshairDrawing, adjustedThickness, adjustedLineLength, adjustedLineThickness, 0, 1);

    const newString = `${viewBoxString}     
    <filter id="dotBlur" x="-250%" y="-250%" width="500%" height="500%">
    <feGaussianBlur in="SourceGraphic" stdDeviation="${crosshairDrawing.dot.blur ? crosshairDrawing.dot.blur : 0}" />
    </filter>
    <filter id="linesBlur" x="-250%" y="-250%" width="500%" height="500%">
    <feGaussianBlur in="SourceGraphic" stdDeviation="${crosshairDrawing.line.blur ? crosshairDrawing.line.blur : 0}" />
    </filter>
    <filter id="outlineBlur" x="-250%" y="-250%" width="500%" height="500%">
    <feGaussianBlur in="SourceGraphic" stdDeviation="${crosshairDrawing.outline.blur ? crosshairDrawing.outline.blur : 0}" />
    </filter>
  ${outlineString}
  ${dotString} ${lineString}   </svg>`;

    return newString;
}

function generateDotSVG(crosshairDrawing) {
    const dot = crosshairDrawing.dot;

    if (dot.shape == "ring") {
       return `\t<circle
                    stroke="${parseColor(dot.color)}"
                    stroke-opacity="${dot.opacity}"
                    stroke-width="${dot.thickness}"
                    fill="transparent"
                    r="${dot.diameter/2}"
                    filter="url(#dotBlur)"
                />\n`
    }
    const isCircle = dot.shape == "circle" ? true : false;
    const rotate = dot.shape == "diamond" ? true : false;
    return `\t<rect id="dot" x="${- dot.diameter / 2}" y="${- dot.diameter / 2}" width="${dot.diameter}" height="${dot.diameter}" ${rotate ? 'transform="rotate(45)"' : ''} stroke="none" fill-opacity="${dot.opacity}" ${isCircle ? " rx= \"" + String(dot.diameter / 2) + "\"" : ""} fill="${parseColor(dot.color)}" filter="url(#dotBlur)"/>\n`;
}

function generateLinesSVG(crosshairDrawing, firingOffsetActivated, firingOpacityRemaining) {
    const line = crosshairDrawing.line;
    const shape = crosshairDrawing.shape;

    const firingOffset = line.offset;

    const xshape = ((shape === "x" || shape === "^")) ? true : false;
    const triangle = crosshairDrawing.line.shape == "triangle" ? true : false;

    const rotation = (isNaN(line.rotation)? 0:line.rotation) + (xshape? 45:0);

    let topLine, bottomLine, rightLine, leftLine

    if (triangle) {
        let x = -line.thickness / 2, y = -(firingOffset + line.length), w = line.thickness, h = line.length;
        topLine = `\t<polygon id="topLine" points = "${x},${y} ${x + w},${y} ${x + (w / 2)},${y + h}" ${'transform="rotate('+ rotation +')"'} stroke="none" fill-opacity="${xshape ? line.opacity : line.opacity * firingOpacityRemaining}" fill="${parseColor(line.color)}" filter="url(#linesBlur)"/>\n`;
        x = -line.thickness / 2, y = firingOffset, w = line.thickness, h = line.length;
        bottomLine = `\t<polygon id="bottomLine" points = "${x + (w / 2)},${y} ${x},${y + h} ${x + w},${y + h}" ${'transform="rotate('+ rotation +')"'} stroke="none" fill-opacity="${line.opacity}" fill="${parseColor(line.color)}" filter="url(#linesBlur)"/>\n`;
        x = firingOffset, y = -line.thickness / 2, w = line.length, h = line.thickness;
        rightLine = `\t<polygon id="rightLine" points = "${x},${y + (h / 2)} ${x + w},${y} ${x + w},${y + h}"  ${'transform="rotate('+ rotation +')"'} stroke="none" fill-opacity="${line.opacity}" fill="${parseColor(line.color)}" filter="url(#linesBlur)"/>\n`;
        x = -(firingOffset + line.length), y = -line.thickness / 2, w = line.length, h = line.thickness;
        leftLine = `\t<polygon id="leftLine" points = "${x},${y} ${x + w},${y + (h / 2)} ${x},${y + h}" ${'transform="rotate('+ rotation +')"'} stroke="none" fill-opacity="${line.opacity}" fill="${parseColor(line.color)}" filter="url(#linesBlur)"/>\n`;
    } else {
        topLine = `\t<rect id="topLine" x="${-line.thickness / 2}" y="${-(firingOffset + line.length)}" width="${line.thickness}" height="${line.length}" ${ 'transform="rotate('+ rotation +')"'} stroke="none" fill-opacity="${xshape ? line.opacity : line.opacity * firingOpacityRemaining}" fill="${parseColor(line.color)}" filter="url(#linesBlur)"/>\n`;
        bottomLine = `\t<rect id="bottomLine" x="${-line.thickness / 2}" y="${firingOffset}" width="${line.thickness}" height="${line.length}" ${ 'transform="rotate('+ rotation +')"'} stroke="none" fill-opacity="${line.opacity}" fill="${parseColor(line.color)}" filter="url(#linesBlur)"/>\n`;
        rightLine = `\t<rect id="rightLine" x="${firingOffset}" y="${-line.thickness / 2}" width="${line.length}" height="${line.thickness}" ${'transform="rotate('+ rotation +')"'} stroke="none" fill-opacity="${line.opacity}" fill="${parseColor(line.color)}" filter="url(#linesBlur)"/>\n`;
        leftLine = `\t<rect id="leftLine" x="${-(firingOffset + line.length)}" y="${-line.thickness / 2}" width="${line.length}" height="${line.thickness}" ${'transform="rotate('+ rotation +')"' } stroke="none" fill-opacity="${line.opacity}" fill="${parseColor(line.color)}" filter="url(#linesBlur)"/>\n`;
    }
    return ((shape == "T" || shape == "^") ? "" : topLine) +  bottomLine + ((shape == "^") ? "" : leftLine) +  rightLine ;
}

function generateOutlineSVG(crosshairDrawing, adjustedThickness, adjustedLineLength, adjustedLineThickness, firingOffsetActivated, firingOpacityRemaining) {
    const dot = crosshairDrawing.dot;
    const line = crosshairDrawing.line;
    const outline = crosshairDrawing.outline;
    const shape = crosshairDrawing.shape;

    const firingOffset = line.offset;

    const isCircle = dot.shape == "circle" || dot.shape == "ring" ? true : false;
    const rotate = dot.shape == "diamond" ? true : false;
    const dotOutline = `\t<rect id="dotOutline" x="${- (dot.diameter + adjustedThickness) / 2}" y="${- (dot.diameter + adjustedThickness) / 2}" width="${dot.diameter + adjustedThickness}" height="${dot.diameter + adjustedThickness}" ${rotate ? 'transform="rotate(45)"' : ''} ${isCircle ? " rx= \"" + String(dot.diameter) + "\"" : ""}  style="fill: none; stroke-opacity: ${outline.opacity}; stroke: ${parseColor(outline.color)}; stroke-width: ${adjustedThickness}; " filter="url(#outlineBlur)"/>\n`;

    const xshape = ((shape === "x" || shape === "^")) ? true : false;

    const rotation = (isNaN(line.rotation)? 0:line.rotation)  + (xshape? 45:0);

    const triangle = crosshairDrawing.line.shape == "triangle" ? true : false;


    let topLineOutline, bottomLineOutline, rightLineOutline, leftLineOutline
    if (triangle) {
        let x = -line.thickness / 2, y = -(firingOffset + line.length), w = line.thickness, h = line.length;
        topLineOutline = `\t<polygon id="topLineOutline" points = "${x},${y} ${x + w},${y} ${x + (w / 2)},${y + h}" ${'transform="rotate('+ rotation +')"'} style="fill: none; stroke-opacity: ${xshape ? outline.opacity : outline.opacity * firingOpacityRemaining}; stroke: ${parseColor(outline.color)}; stroke-width: ${adjustedThickness}" filter="url(#outlineBlur)"/>\n`;
        x = -line.thickness / 2, y = firingOffset, w = line.thickness, h = line.length;
        bottomLineOutline = `\t<polygon id="bottomLineOutline" points = "${x + (w / 2)},${y} ${x},${y + h} ${x + w},${y + h}" ${'transform="rotate('+ rotation +')"'} style="fill: none; stroke-opacity: ${outline.opacity}; stroke: ${parseColor(outline.color)}; stroke-width: ${adjustedThickness};" filter="url(#outlineBlur)"/>\n`;
        x = firingOffset, y = -line.thickness / 2, w = line.length, h = line.thickness;
        rightLineOutline = `\t<polygon id="rightLineOutline" points = "${x},${y + (h / 2)} ${x + w},${y} ${x + w},${y + h}" ${'transform="rotate('+ rotation +')"'} style="fill: none; stroke-opacity: ${outline.opacity}; stroke: ${parseColor(outline.color)}; stroke-width: ${adjustedThickness}" filter="url(#outlineBlur)"/>\n`;
        x = -(firingOffset + line.length), y = -line.thickness / 2, w = line.length, h = line.thickness;
        leftLineOutline = `\t<polygon id="leftLineOutline" points = "${x},${y} ${x + w},${y + (h / 2)} ${x},${y + h}" ${'transform="rotate('+ rotation +')"'} style="fill: none; stroke-opacity: ${outline.opacity}; stroke: ${parseColor(outline.color)}; stroke-width: ${adjustedThickness}" filter="url(#outlineBlur)"/>\n`;
    }
    else {
        topLineOutline = `\t<rect id="topLineOutline" x="${- (adjustedLineThickness + adjustedThickness) / 2}" y="${-(firingOffset + adjustedLineLength + adjustedThickness / 2)}" width="${adjustedLineThickness + adjustedThickness}" height="${adjustedLineLength + adjustedThickness}" ${'transform="rotate('+ rotation +')"'} style="fill: none; stroke-opacity: ${xshape ? outline.opacity : outline.opacity * firingOpacityRemaining}; stroke: ${parseColor(outline.color)}; stroke-width: ${adjustedThickness}" filter="url(#outlineBlur)"/>\n`;
        bottomLineOutline = `\t<rect id="bottomLineOutline"  x="${- (adjustedLineThickness + adjustedThickness) / 2}" y="${firingOffset - adjustedThickness / 2}" width="${adjustedLineThickness + adjustedThickness}" height="${adjustedLineLength + adjustedThickness}" ${'transform="rotate('+ rotation +')"'} style="fill: none; stroke-opacity: ${outline.opacity}; stroke: ${parseColor(outline.color)}; stroke-width: ${adjustedThickness};" filter="url(#outlineBlur)"/>\n`;
        rightLineOutline = `\t<rect id="rightLineOutline"  x="${firingOffset - adjustedThickness / 2}" y="${-adjustedLineThickness / 2 - adjustedThickness / 2}" width="${adjustedLineLength + adjustedThickness}" height="${adjustedLineThickness + adjustedThickness}" ${'transform="rotate('+ rotation +')"'} style="fill: none; stroke-opacity: ${outline.opacity}; stroke: ${parseColor(outline.color)}; stroke-width: ${adjustedThickness};" filter="url(#outlineBlur)"/>\n`;
        leftLineOutline = `\t<rect id="leftLineOutline"  x="${-(firingOffset + adjustedLineLength + adjustedThickness / 2)}" y="${-adjustedLineThickness / 2 - adjustedThickness / 2}" width="${adjustedLineLength + adjustedThickness}" height="${adjustedLineThickness + adjustedThickness}" ${'transform="rotate('+ rotation +')"'} style="fill: none; stroke-opacity: ${outline.opacity}; stroke: ${parseColor(outline.color)}; stroke-width: ${adjustedThickness};" filter="url(#outlineBlur)"/>\n`;
    }

    return ((dot.opacity != 0 && dot.diameter != 0) ? dotOutline : '') + ((line.opacity != 0 && line.length != 0 && line.thickness != 0) ? ((shape == "T" || shape == "^") ? "" : topLineOutline) + bottomLineOutline + ((shape == "^") ? "" : leftLineOutline) +  rightLineOutline : '');
}

function generateViewBoxSVG(crosshairDrawing, adjustedThickness, firingOffsetActivated) {

    const line = crosshairDrawing.line;
    const lineBound = (line.offset + line.length + adjustedThickness )  + (crosshairDrawing.firingOptions.firingOffset);
    const dotBound = (Math.sqrt(crosshairDrawing.dot.diameter**2 + crosshairDrawing.dot.diameter**2)) / 2 + (Math.sqrt(adjustedThickness**2 +adjustedThickness**2)) ;

    let bound = 0;

    if (lineBound >= dotBound) {
        bound = lineBound;
    } else {
        bound = dotBound;
    }

    const x = -2*bound;
    const y = -2*bound;

    const width = bound * 4;
    const height = bound * 4;

    return `<svg width="${width}" height="${height}" viewBox="${x} ${y} ${width} ${height}" style="display: block;" fill="none" xmlns="http://www.w3.org/2000/svg">\n`
}

function parseColor(color) {
    if (color.search(',') == -1) {
        return `${color}`
    } else {
        return `rgb(${color})`
    }
}

exports.render = render;
