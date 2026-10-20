/**
 * Vectify - Pixel Processing Engine
 * Handles client-side nearest-neighbor raster scaling, RGBA extraction,
 * color layer clustering, SVG generation with layer optimization, and JSON matrix compilation.
 */

class VectifyEngine {
  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
    this.isProcessing = false;
    this.abortRequested = false;
  }

  /**
   * Converts RGBA values to Hex string (#RRGGBB or #RRGGBBAA)
   */
  static rgbaToHex(r, g, b, a = 255, includeAlpha = false) {
    const toHex = (n) => n.toString(16).padStart(2, '0');
    if (includeAlpha && a < 255) {
      return `#${toHex(r)}${toHex(g)}${toHex(b)}${toHex(a)}`;
    }
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  /**
   * Parse hex to RGBA
   */
  static hexToRgba(hex) {
    let clean = hex.replace('#', '');
    if (clean.length === 3) {
      clean = clean.split('').map(c => c + c).join('') + 'ff';
    } else if (clean.length === 6) {
      clean += 'ff';
    }
    const num = parseInt(clean, 16);
    return {
      r: (num >> 24) & 255,
      g: (num >> 16) & 255,
      b: (num >> 8) & 255,
      a: num & 255
    };
  }

  /**
   * Cancel ongoing processing
   */
  abort() {
    if (this.isProcessing) {
      this.abortRequested = true;
    }
  }

  /**
   * Process an HTML Image Element into pixel data, SVG, and JSON
   * 
   * @param {HTMLImageElement} image - Source image
   * @param {Object} options - Configuration options
   * @param {Function} onProgress - Progress callback (percent 0-100, statusText)
   * @returns {Promise<Object>} Processed result
   */
  async processImage(image, options = {}, onProgress = () => {}) {
    this.isProcessing = true;
    this.abortRequested = false;

    const startTime = performance.now();

    const {
      targetWidth = 64,
      targetHeight = 64,
      fitMode = 'stretch', // 'stretch' | 'contain' | 'cover' | 'original'
      skipTransparent = true,
      alphaThreshold = 0, // 0 = transparent, pixels with a <= threshold are skipped
      svgMode = 'grouped', // 'grouped' (same color to same layer) | 'rects' (flat rects) | 'paths' (merged path)
      svgIncludeFillOnRect = false, // if grouped, rect can inherit fill from <g> or have inline fill
      jsonFormat = 'matrix2d', // 'matrix2d' | 'flat' | 'indexed'
      includeNullInMatrix = true
    } = options;

    const width = Math.min(Math.max(1, parseInt(targetWidth, 10)), 1024);
    const height = Math.min(Math.max(1, parseInt(targetHeight, 10)), 1024);

    onProgress(5, `Preparing canvas (${width} × ${height})...`);

    // Setup canvas with disabled smoothing for pure nearest-neighbor scaling
    this.canvas.width = width;
    this.canvas.height = height;

    this.ctx.imageSmoothingEnabled = false;
    this.ctx.mozImageSmoothingEnabled = false;
    this.ctx.webkitImageSmoothingEnabled = false;
    this.ctx.msImageSmoothingEnabled = false;

    this.ctx.clearRect(0, 0, width, height);

    // Draw image according to fit mode
    if (fitMode === 'contain') {
      const scale = Math.min(width / image.naturalWidth, height / image.naturalHeight);
      const drawW = Math.round(image.naturalWidth * scale);
      const drawH = Math.round(image.naturalHeight * scale);
      const drawX = Math.round((width - drawW) / 2);
      const drawY = Math.round((height - drawH) / 2);
      this.ctx.drawImage(image, drawX, drawY, drawW, drawH);
    } else if (fitMode === 'cover') {
      const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
      const drawW = Math.round(image.naturalWidth * scale);
      const drawH = Math.round(image.naturalHeight * scale);
      const drawX = Math.round((width - drawW) / 2);
      const drawY = Math.round((height - drawH) / 2);
      this.ctx.drawImage(image, drawX, drawY, drawW, drawH);
    } else {
      // Default: stretch to exact grid width and height
      this.ctx.drawImage(image, 0, 0, width, height);
    }

    onProgress(15, `Reading raster pixel data (${(width * height).toLocaleString()} px)...`);
    await new Promise(r => setTimeout(r, 0));

    if (this.abortRequested) throw new Error('Aborted');

    // Read full RGBA image data
    const imgData = this.ctx.getImageData(0, 0, width, height);
    const data = imgData.data;
    const totalPixels = width * height;

    // Data structures for results
    // colorLayers: map of hexColor -> array of { x, y }
    const colorLayers = new Map();
    // 2D Matrix of coordinates and colors (x, y, color)
    const matrix2D = new Array(height);
    // Flat array of valid pixels
    const flatList = [];

    let transparentCount = 0;
    let validPixelCount = 0;

    // Process rows in asynchronous chunks to keep UI responsive
    // Especially important for 512x512 (262k) and 1024x1024 (1M+ pixels)
    const chunkSize = width >= 512 ? 16 : (width >= 256 ? 32 : 64);

    for (let y = 0; y < height; y++) {
      matrix2D[y] = new Array(width);

      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        const a = data[idx + 3];

        const isTransparent = a <= alphaThreshold;

        if (isTransparent) {
          transparentCount++;
          matrix2D[y][x] = {
            x,
            y,
            color: includeNullInMatrix ? null : undefined
          };
          continue;
        }

        const hex = VectifyEngine.rgbaToHex(r, g, b, a, a < 255);
        validPixelCount++;

        // Add to matrix
        matrix2D[y][x] = { x, y, color: hex };
        flatList.push({ x, y, color: hex });

        // Add to color layer group (grouping same colored pixels to same layer!)
        let layer = colorLayers.get(hex);
        if (!layer) {
          layer = [];
          colorLayers.set(hex, layer);
        }
        layer.push({ x, y });
      }

      // Yield every chunk of rows to update progress bar and avoid UI lockup
      if (y % chunkSize === 0 || y === height - 1) {
        const progressPercent = 15 + Math.round((y / height) * 45); // 15% to 60%
        onProgress(progressPercent, `Analyzing pixels: row ${y + 1}/${height}...`);
        await new Promise(r => setTimeout(r, 0));
        if (this.abortRequested) throw new Error('Aborted');
      }
    }

    onProgress(65, `Building color layers (${colorLayers.size} unique colors found)...`);
    await new Promise(r => setTimeout(r, 0));

    // Sort color layers by pixel count descending (most dominant colors first)
    const sortedLayers = Array.from(colorLayers.entries())
      .map(([color, pixels]) => ({
        color,
        pixels,
        count: pixels.length,
        percentage: ((pixels.length / (totalPixels - transparentCount || 1)) * 100).toFixed(1)
      }))
      .sort((a, b) => b.count - a.count);

    onProgress(75, `Generating optimized SVG...`);
    await new Promise(r => setTimeout(r, 0));
    if (this.abortRequested) throw new Error('Aborted');

    // Generate SVG string with color layers
    const svgString = this.generateSvg(sortedLayers, width, height, {
      svgMode,
      svgIncludeFillOnRect,
      flatList
    });

    onProgress(88, `Generating JSON pixel data matrix...`);
    await new Promise(r => setTimeout(r, 0));
    if (this.abortRequested) throw new Error('Aborted');

    // Generate JSON string
    let jsonResult;
    if (jsonFormat === 'flat') {
      jsonResult = flatList;
    } else if (jsonFormat === 'indexed') {
      // Palette + compact index grid
      const palette = sortedLayers.map(l => l.color);
      const colorToIndex = new Map(palette.map((c, i) => [c, i]));
      const grid = matrix2D.map(row => 
        row.map(cell => cell.color ? colorToIndex.get(cell.color) : -1)
      );
      jsonResult = {
        width,
        height,
        palette,
        grid
      };
    } else {
      // Default: clean 2D array matrix of coordinates and colors (x, y, color)
      jsonResult = matrix2D;
    }

    const jsonString = JSON.stringify(jsonResult, null, 2);

    const endTime = performance.now();
    const durationMs = Math.round(endTime - startTime);

    onProgress(100, `Done in ${durationMs}ms!`);

    this.isProcessing = false;

    // Create Blobs for fast downloads
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const jsonBlob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });

    return {
      width,
      height,
      totalPixels,
      validPixelCount,
      transparentCount,
      uniqueColorsCount: sortedLayers.length,
      colorLayers: sortedLayers,
      matrix2D,
      flatList,
      svgString,
      svgBlob,
      svgBlobUrl: URL.createObjectURL(svgBlob),
      jsonString,
      jsonBlob,
      jsonBlobUrl: URL.createObjectURL(jsonBlob),
      durationMs
    };
  }

  /**
   * Generates SVG output with same-colored pixels grouped in layers
   */
  generateSvg(sortedLayers, width, height, options = {}) {
    const {
      svgMode = 'grouped',
      svgIncludeFillOnRect = false,
      flatList = []
    } = options;

    const lines = [];
    lines.push(`<?xml version="1.0" encoding="UTF-8"?>`);
    lines.push(`<!-- Generated by Vectify (https://github.com/vectify) -->`);
    lines.push(`<!-- Grid Size: ${width}x${height} | Unique Color Layers: ${sortedLayers.length} -->`);
    lines.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" shape-rendering="crispEdges">`);

    if (svgMode === 'paths') {
      // Merged path mode: Group pixels by color into a single compound <path> per color
      for (const layer of sortedLayers) {
        const cleanId = layer.color.replace('#', '');
        let pathData = '';
        for (let i = 0; i < layer.pixels.length; i++) {
          const { x, y } = layer.pixels[i];
          pathData += `M${x},${y}h1v1h-1z `;
        }
        lines.push(`  <path id="layer-${cleanId}" fill="${layer.color}" d="${pathData.trim()}" />`);
      }
    } else if (svgMode === 'rects') {
      // Raw unlayered individual rects with inline fill
      for (let i = 0; i < flatList.length; i++) {
        const { x, y, color } = flatList[i];
        lines.push(`  <rect x="${x}" y="${y}" width="1" height="1" fill="${color}" />`);
      }
    } else {
      // Default & Primary Requirement:
      // "the same coloured pixels to same layer, so the svg stay obtimised"
      // Grouping into <g id="layer-color" fill="color">
      // Every pixel is an individual <rect x="x" y="y" width="1" height="1" /> element
      // Inheriting fill from <g> eliminates massive redundant fill attributes!
      for (const layer of sortedLayers) {
        const cleanId = layer.color.replace('#', '');
        lines.push(`  <g id="layer-${cleanId}" fill="${layer.color}">`);
        for (let i = 0; i < layer.pixels.length; i++) {
          const { x, y } = layer.pixels[i];
          if (svgIncludeFillOnRect) {
            lines.push(`    <rect x="${x}" y="${y}" width="1" height="1" fill="${layer.color}" />`);
          } else {
            lines.push(`    <rect x="${x}" y="${y}" width="1" height="1" />`);
          }
        }
        lines.push(`  </g>`);
      }
    }

    lines.push(`</svg>`);
    return lines.join('\n');
  }

  /**
   * Helper to format byte sizes into KB/MB string
   */
  static formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }
}

// Export for browser
window.VectifyEngine = VectifyEngine;
