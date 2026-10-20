/**
 * Vectify - Main Application Controller (Apple UI/UX Edition)
 * Pure Dark & Pure White Studio Modes, Segmented Controls,
 * Viewport Zoom/Pan, Pixel Inspector HUD, and File Exports.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Application State
  const state = {
    currentImage: null,
    currentFileName: 'image.png',
    currentFileSize: 0,
    engine: new VectifyEngine(),
    result: null,
    activeTab: 'preview',
    zoom: 1,
    panX: 0,
    panY: 0,
    isPanning: false,
    startPanX: 0,
    startPanY: 0,
    showGrid: true,
    highlightColor: null,
    isProcessing: false,
    debounceTimer: null,
    theme: localStorage.getItem('vectify_theme') || 'dark'
  };

  // DOM Elements
  const htmlRoot = document.documentElement;
  const btnThemeToggle = document.getElementById('btnThemeToggle');
  const themeIcon = document.getElementById('themeIcon');

  const dropZone = document.getElementById('dropZone');
  const fileInput = document.getElementById('fileInput');
  const imageInfoCard = document.getElementById('imageInfoCard');
  const imageThumbnail = document.getElementById('imageThumbnail');
  const imageFileName = document.getElementById('imageFileName');
  const imageDimensions = document.getElementById('imageDimensions');
  const imageFileSize = document.getElementById('imageFileSize');
  const btnClearImage = document.getElementById('btnClearImage');

  // Controls
  const gridSelect = document.getElementById('gridSelect');
  const customDimensionsGroup = document.getElementById('customDimensionsGroup');
  const customWidthInput = document.getElementById('customWidth');
  const customHeightInput = document.getElementById('customHeight');
  const fitModeSelect = document.getElementById('fitModeSelect');
  const svgModeSelect = document.getElementById('svgModeSelect');
  const toggleSkipTransparent = document.getElementById('toggleSkipTransparent');
  const alphaThresholdSlider = document.getElementById('alphaThresholdSlider');
  const alphaThresholdVal = document.getElementById('alphaThresholdVal');
  const jsonFormatSelect = document.getElementById('jsonFormatSelect');
  const btnProcess = document.getElementById('btnProcess');
  const gridBadge = document.getElementById('gridBadge');

  // Progress Bar
  const progressContainer = document.getElementById('progressContainer');
  const progressBar = document.getElementById('progressBar');
  const progressPercent = document.getElementById('progressPercent');
  const progressStatus = document.getElementById('progressStatus');

  // Canvas Viewport & Overlays
  const viewportContainer = document.getElementById('viewportContainer');
  const canvasStage = document.getElementById('canvasStage');
  const previewCanvas = document.getElementById('previewCanvas');
  const gridOverlayCanvas = document.getElementById('gridOverlayCanvas');
  const previewEmptyState = document.getElementById('previewEmptyState');
  const pixelHud = document.getElementById('pixelHud');
  const hudSwatch = document.getElementById('hudSwatch');
  const hudCoords = document.getElementById('hudCoords');
  const hudHex = document.getElementById('hudHex');
  const hudRgba = document.getElementById('hudRgba');

  // Toolbar
  const btnZoomIn = document.getElementById('btnZoomIn');
  const btnZoomOut = document.getElementById('btnZoomOut');
  const btnZoomFit = document.getElementById('btnZoomFit');
  const zoomLabel = document.getElementById('zoomLabel');
  const btnToggleGrid = document.getElementById('btnToggleGrid');

  // Segmented Tabs & Code Viewers
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');
  const colorLayersList = document.getElementById('colorLayersList');
  const layerCountBadge = document.getElementById('layerCountBadge');
  const btnResetLayerFilter = document.getElementById('btnResetLayerFilter');
  const svgCodeViewer = document.getElementById('svgCodeViewer');
  const svgSizeBadge = document.getElementById('svgSizeBadge');
  const btnCopySvgCode = document.getElementById('btnCopySvgCode');
  const jsonCodeViewer = document.getElementById('jsonCodeViewer');
  const jsonSizeBadge = document.getElementById('jsonSizeBadge');
  const btnCopyJsonCode = document.getElementById('btnCopyJsonCode');

  // Stats Ribbon
  const statGridSize = document.getElementById('statGridSize');
  const statTotalPixels = document.getElementById('statTotalPixels');
  const statValidPixels = document.getElementById('statValidPixels');
  const statUniqueColors = document.getElementById('statUniqueColors');
  const statDuration = document.getElementById('statDuration');
  const statSizes = document.getElementById('statSizes');

  // Export Buttons
  const btnDownloadSvg = document.getElementById('btnDownloadSvg');
  const btnDownloadJson = document.getElementById('btnDownloadJson');
  const toastContainer = document.getElementById('toastContainer');

  // Quick Sample Buttons
  const sampleHeroButtons = [document.getElementById('btnSampleHero'), document.getElementById('btnSampleHeroMobile')];
  const sampleHeartButtons = [document.getElementById('btnSampleHeart'), document.getElementById('btnSampleHeartMobile')];
  const samplePotionButtons = [document.getElementById('btnSamplePotion'), document.getElementById('btnSamplePotionMobile')];
  const sampleCubeButtons = [document.getElementById('btnSampleCube'), document.getElementById('btnSampleCubeMobile')];
  const btnResetApp = document.getElementById('btnResetApp');

  /**
   * Theme Management (Pure Dark & Pure White)
   */
  function applyTheme(theme) {
    state.theme = theme;
    localStorage.setItem('vectify_theme', theme);
    if (theme === 'light') {
      htmlRoot.classList.remove('dark');
      htmlRoot.classList.add('light');
      themeIcon.setAttribute('data-lucide', 'moon');
    } else {
      htmlRoot.classList.remove('light');
      htmlRoot.classList.add('dark');
      themeIcon.setAttribute('data-lucide', 'sun');
    }
    if (window.lucide) window.lucide.createIcons();
    if (state.result) {
      renderGridOverlay(state.result.width, state.result.height);
    }
  }

  btnThemeToggle.addEventListener('click', () => {
    applyTheme(state.theme === 'dark' ? 'light' : 'dark');
  });

  applyTheme(state.theme);

  /**
   * Show Apple-styled minimalist toast
   */
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = 'apple-toast px-4 py-2.5 text-xs font-medium flex items-center gap-2.5 pointer-events-auto';
    
    let iconName = 'info';
    if (type === 'success') iconName = 'check';
    if (type === 'warning') iconName = 'alert-circle';
    if (type === 'error') iconName = 'x-circle';

    toast.innerHTML = `
      <i data-lucide="${iconName}" class="w-3.5 h-3.5 shrink-0 opacity-80"></i>
      <span class="flex-1">${message}</span>
    `;

    toastContainer.appendChild(toast);
    if (window.lucide) window.lucide.createIcons();

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(8px)';
      toast.style.transition = 'all 0.2s ease';
      setTimeout(() => toast.remove(), 200);
    }, 2800);
  }

  /**
   * Load Image Source
   */
  function loadImageSource(src, fileName, fileSize = 0) {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      state.currentImage = img;
      state.currentFileName = fileName || 'image.png';
      state.currentFileSize = fileSize || Math.round(src.length * 0.75);

      imageThumbnail.src = src;
      imageFileName.textContent = state.currentFileName;
      imageDimensions.textContent = `${img.naturalWidth} × ${img.naturalHeight} px`;
      imageFileSize.textContent = VectifyEngine.formatBytes(state.currentFileSize);
      imageInfoCard.classList.remove('hidden');

      // Requirement: Default to the size of the input image
      updateGridSelectorForImage(img.naturalWidth, img.naturalHeight);

      // Automatically convert
      triggerProcess();
    };

    img.onerror = () => {
      showToast('Failed to load image. Please verify file format.', 'error');
    };

    img.src = src;
  }

  function updateGridSelectorForImage(naturalW, naturalH) {
    const originalOption = gridSelect.querySelector('option[value="original"]');
    const clampedW = Math.min(naturalW, 1024);
    const clampedH = Math.min(naturalH, 1024);

    if (originalOption) {
      originalOption.textContent = `Default: Original Image (${clampedW} × ${clampedH})`;
    }

    gridSelect.value = 'original';
    gridBadge.textContent = `Input: ${clampedW} × ${clampedH}`;
    customDimensionsGroup.classList.add('hidden');
    customWidthInput.value = clampedW;
    customHeightInput.value = clampedH;
  }

  /**
   * Process Image Engine Execution
   */
  async function triggerProcess() {
    if (!state.currentImage) {
      showToast('Please upload an image first or pick a preset.', 'warning');
      return;
    }

    if (state.isProcessing) {
      state.engine.abort();
    }

    state.isProcessing = true;
    btnProcess.disabled = true;
    progressContainer.classList.remove('hidden');
    progressBar.style.width = '0%';
    progressPercent.textContent = '0%';
    progressStatus.textContent = 'Analyzing raster pixels...';

    let targetW = 64;
    let targetH = 64;
    const selectedGrid = gridSelect.value;

    if (selectedGrid === 'original') {
      targetW = Math.min(state.currentImage.naturalWidth, 1024);
      targetH = Math.min(state.currentImage.naturalHeight, 1024);
    } else if (selectedGrid === 'custom') {
      targetW = Math.min(Math.max(1, parseInt(customWidthInput.value, 10) || 64), 1024);
      targetH = Math.min(Math.max(1, parseInt(customHeightInput.value, 10) || 64), 1024);
    } else {
      const dim = parseInt(selectedGrid, 10);
      targetW = dim;
      targetH = dim;
    }

    const options = {
      targetWidth: targetW,
      targetHeight: targetH,
      fitMode: fitModeSelect.value,
      skipTransparent: toggleSkipTransparent.checked,
      alphaThreshold: parseInt(alphaThresholdSlider.value, 10),
      svgMode: svgModeSelect.value,
      jsonFormat: jsonFormatSelect.value,
      includeNullInMatrix: true
    };

    try {
      const result = await state.engine.processImage(
        state.currentImage,
        options,
        (percent, statusText) => {
          progressBar.style.width = `${percent}%`;
          progressPercent.textContent = `${percent}%`;
          progressStatus.textContent = statusText;
        }
      );

      state.result = result;
      state.highlightColor = null;

      renderToPreviewCanvas(result);
      renderColorLayers(result.colorLayers);

      svgCodeViewer.value = result.svgString;
      svgSizeBadge.textContent = VectifyEngine.formatBytes(result.svgBlob.size);

      jsonCodeViewer.value = result.jsonString;
      jsonSizeBadge.textContent = VectifyEngine.formatBytes(result.jsonBlob.size);

      statGridSize.textContent = `${result.width} × ${result.height}`;
      statTotalPixels.textContent = result.totalPixels.toLocaleString();
      statValidPixels.textContent = result.validPixelCount.toLocaleString();
      statUniqueColors.textContent = result.uniqueColorsCount.toLocaleString();
      statDuration.textContent = `${result.durationMs} ms`;
      statSizes.textContent = `${VectifyEngine.formatBytes(result.svgBlob.size)} / ${VectifyEngine.formatBytes(result.jsonBlob.size)}`;

      btnDownloadSvg.disabled = false;
      btnDownloadJson.disabled = false;
      previewEmptyState.classList.add('hidden');

      resetViewportToFit(result.width, result.height);
      showToast(`Processed ${result.validPixelCount.toLocaleString()} pixels into ${result.uniqueColorsCount} color layers`, 'success');
    } catch (err) {
      if (err.message !== 'Aborted') {
        console.error('Processing error:', err);
        showToast('Processing error encountered', 'error');
      }
    } finally {
      state.isProcessing = false;
      btnProcess.disabled = false;
      setTimeout(() => {
        progressContainer.classList.add('hidden');
      }, 1000);
    }
  }

  /**
   * Render Pixels to Preview Canvas
   */
  function renderToPreviewCanvas(result) {
    const { width, height, matrix2D } = result;

    previewCanvas.width = width;
    previewCanvas.height = height;
    gridOverlayCanvas.width = width;
    gridOverlayCanvas.height = height;

    const ctx = previewCanvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, width, height);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const cell = matrix2D[y][x];
        if (cell && cell.color) {
          if (state.highlightColor && cell.color !== state.highlightColor) {
            ctx.fillStyle = state.theme === 'light' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)';
          } else {
            ctx.fillStyle = cell.color;
          }
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }

    renderGridOverlay(width, height);
  }

  function renderGridOverlay(width, height) {
    const ctx = gridOverlayCanvas.getContext('2d');
    ctx.clearRect(0, 0, width, height);

    if (!state.showGrid || width > 256 || height > 256) return;

    ctx.strokeStyle = state.theme === 'light' ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 0.05;

    for (let x = 0; x <= width; x++) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    for (let y = 0; y <= height; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  }

  /**
   * Render Color Layers Explorer
   */
  function renderColorLayers(layers) {
    colorLayersList.innerHTML = '';
    layerCountBadge.textContent = layers.length;

    if (layers.length === 0) {
      colorLayersList.innerHTML = `<p class="col-span-full text-xs text-[var(--text-secondary)] text-center py-8">No opaque colors found.</p>`;
      return;
    }

    layers.forEach((layer) => {
      const card = document.createElement('div');
      card.className = 'layer-row apple-card-subtle p-2.5 flex items-center justify-between gap-3 cursor-pointer select-none transition hover:border-[var(--border-hover)]';
      card.dataset.color = layer.color;

      card.innerHTML = `
        <div class="flex items-center gap-2.5 min-w-0">
          <div class="w-5 h-5 rounded-md border border-[var(--border-medium)] shrink-0" style="background-color: ${layer.color}"></div>
          <div class="flex flex-col min-w-0">
            <span class="font-mono text-xs font-semibold text-[var(--text-primary)] truncate">${layer.color}</span>
            <span class="text-[10px] text-[var(--text-secondary)] font-mono">${layer.count.toLocaleString()} px (${layer.percentage}%)</span>
          </div>
        </div>
        <button class="btn-copy-hex btn-apple-secondary p-1 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)]" title="Copy Hex">
          <i data-lucide="copy" class="w-3 h-3"></i>
        </button>
      `;

      card.addEventListener('click', (e) => {
        if (e.target.closest('.btn-copy-hex')) return;

        if (state.highlightColor === layer.color) {
          state.highlightColor = null;
          card.classList.remove('ring-1', 'ring-[var(--text-primary)]');
        } else {
          document.querySelectorAll('.layer-row').forEach(r => r.classList.remove('ring-1', 'ring-[var(--text-primary)]'));
          state.highlightColor = layer.color;
          card.classList.add('ring-1', 'ring-[var(--text-primary)]');
        }

        if (state.result) {
          renderToPreviewCanvas(state.result);
        }
      });

      const copyBtn = card.querySelector('.btn-copy-hex');
      copyBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(layer.color).then(() => {
          showToast(`Copied ${layer.color}`, 'info');
        });
      });

      colorLayersList.appendChild(card);
    });

    if (window.lucide) window.lucide.createIcons();
  }

  btnResetLayerFilter.addEventListener('click', () => {
    state.highlightColor = null;
    document.querySelectorAll('.layer-row').forEach(r => r.classList.remove('ring-1', 'ring-[var(--text-primary)]'));
    if (state.result) {
      renderToPreviewCanvas(state.result);
    }
  });

  /**
   * Viewport Controls
   */
  function updateViewportTransform() {
    canvasStage.style.transform = `translate(${state.panX}px, ${state.panY}px) scale(${state.zoom})`;
    zoomLabel.textContent = `${Math.round(state.zoom * 100)}%`;
  }

  function resetViewportToFit(width, height) {
    if (!width || !height) return;
    const viewW = viewportContainer.clientWidth || 600;
    const viewH = viewportContainer.clientHeight || 460;

    const scaleW = (viewW - 64) / width;
    const scaleH = (viewH - 64) / height;
    state.zoom = Math.max(1, Math.min(scaleW, scaleH, 16));
    state.panX = 0;
    state.panY = 0;
    updateViewportTransform();
  }

  btnZoomIn.addEventListener('click', () => {
    state.zoom = Math.min(state.zoom * 1.5, 48);
    updateViewportTransform();
  });

  btnZoomOut.addEventListener('click', () => {
    state.zoom = Math.max(state.zoom / 1.5, 0.2);
    updateViewportTransform();
  });

  btnZoomFit.addEventListener('click', () => {
    if (state.result) {
      resetViewportToFit(state.result.width, state.result.height);
    }
  });

  btnToggleGrid.addEventListener('click', () => {
    state.showGrid = !state.showGrid;
    btnToggleGrid.style.opacity = state.showGrid ? '1' : '0.5';
    if (state.result) {
      renderGridOverlay(state.result.width, state.result.height);
    }
  });

  viewportContainer.addEventListener('wheel', (e) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.2 : 0.83;
    state.zoom = Math.min(Math.max(0.2, state.zoom * factor), 48);
    updateViewportTransform();
  }, { passive: false });

  viewportContainer.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    state.isPanning = true;
    state.startPanX = e.clientX - state.panX;
    state.startPanY = e.clientY - state.panY;
  });

  window.addEventListener('mousemove', (e) => {
    if (state.isPanning) {
      state.panX = e.clientX - state.startPanX;
      state.panY = e.clientY - state.startPanY;
      updateViewportTransform();
    }
  });

  window.addEventListener('mouseup', () => {
    state.isPanning = false;
  });

  /**
   * Pixel Inspector HUD
   */
  viewportContainer.addEventListener('mousemove', (e) => {
    if (!state.result || state.isPanning) {
      pixelHud.classList.add('hidden');
      return;
    }

    const rect = previewCanvas.getBoundingClientRect();
    if (
      e.clientX < rect.left ||
      e.clientX > rect.right ||
      e.clientY < rect.top ||
      e.clientY > rect.bottom
    ) {
      pixelHud.classList.add('hidden');
      return;
    }

    const pixelX = Math.floor(((e.clientX - rect.left) / rect.width) * state.result.width);
    const pixelY = Math.floor(((e.clientY - rect.top) / rect.height) * state.result.height);

    if (
      pixelX >= 0 && pixelX < state.result.width &&
      pixelY >= 0 && pixelY < state.result.height
    ) {
      const cell = state.result.matrix2D[pixelY] ? state.result.matrix2D[pixelY][pixelX] : null;

      hudCoords.textContent = `X: ${pixelX}, Y: ${pixelY}`;
      hudHex.textContent = cell && cell.color ? cell.color : 'Transparent';
      hudSwatch.style.backgroundColor = cell && cell.color ? cell.color : 'transparent';

      if (cell && cell.color) {
        const rgba = VectifyEngine.hexToRgba(cell.color);
        hudRgba.textContent = `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${(rgba.a / 255).toFixed(2)})`;
      } else {
        hudRgba.textContent = 'rgba(0, 0, 0, 0)';
      }

      pixelHud.classList.remove('hidden');
    } else {
      pixelHud.classList.add('hidden');
    }
  });

  viewportContainer.addEventListener('mouseleave', () => {
    pixelHud.classList.add('hidden');
  });

  /**
   * File Upload Handlers
   */
  dropZone.addEventListener('click', () => fileInput.click());

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
  });

  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
  });

  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
  });

  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  });

  window.addEventListener('paste', (e) => {
    const items = e.clipboardData ? e.clipboardData.items : [];
    for (const item of items) {
      if (item.type.indexOf('image') !== -1) {
        const file = item.getAsFile();
        handleFile(file);
        showToast('Pasted image from clipboard', 'success');
        break;
      }
    }
  });

  function handleFile(file) {
    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      loadImageSource(e.target.result, file.name, file.size);
    };
    reader.readAsDataURL(file);
  }

  btnClearImage.addEventListener('click', () => {
    state.currentImage = null;
    state.result = null;
    imageInfoCard.classList.add('hidden');
    previewEmptyState.classList.remove('hidden');
    fileInput.value = '';

    const ctx = previewCanvas.getContext('2d');
    ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
    const overlayCtx = gridOverlayCanvas.getContext('2d');
    overlayCtx.clearRect(0, 0, gridOverlayCanvas.width, gridOverlayCanvas.height);

    btnDownloadSvg.disabled = true;
    btnDownloadJson.disabled = true;
    statGridSize.textContent = '-- × --';
    statTotalPixels.textContent = '0';
    statValidPixels.textContent = '0';
    statUniqueColors.textContent = '0';
    statDuration.textContent = '0 ms';
    statSizes.textContent = '0 / 0 KB';
    svgCodeViewer.value = '';
    jsonCodeViewer.value = '';
    colorLayersList.innerHTML = '';
    layerCountBadge.textContent = '0';

    showToast('Image cleared', 'info');
  });

  /**
   * Debounced Reprocess
   */
  function queueReprocess() {
    clearTimeout(state.debounceTimer);
    state.debounceTimer = setTimeout(() => {
      if (state.currentImage) {
        triggerProcess();
      }
    }, 200);
  }

  gridSelect.addEventListener('change', () => {
    if (gridSelect.value === 'custom') {
      customDimensionsGroup.classList.remove('hidden');
    } else {
      customDimensionsGroup.classList.add('hidden');
    }

    if (gridSelect.value === 'original' && state.currentImage) {
      gridBadge.textContent = `Input: ${Math.min(state.currentImage.naturalWidth, 1024)} × ${Math.min(state.currentImage.naturalHeight, 1024)}`;
    } else {
      gridBadge.textContent = `Grid: ${gridSelect.value}`;
    }

    queueReprocess();
  });

  customWidthInput.addEventListener('input', queueReprocess);
  customHeightInput.addEventListener('input', queueReprocess);
  fitModeSelect.addEventListener('change', queueReprocess);
  svgModeSelect.addEventListener('change', queueReprocess);
  toggleSkipTransparent.addEventListener('change', queueReprocess);
  jsonFormatSelect.addEventListener('change', queueReprocess);

  alphaThresholdSlider.addEventListener('input', () => {
    alphaThresholdVal.textContent = alphaThresholdSlider.value;
    queueReprocess();
  });

  btnProcess.addEventListener('click', triggerProcess);

  /**
   * Apple Segmented Control Tab Navigation
   */
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.dataset.tab;
      state.activeTab = targetTab;

      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      tabPanes.forEach(pane => pane.classList.add('hidden'));
      if (targetTab === 'preview') {
        document.getElementById('tabContentPreview').classList.remove('hidden');
        document.getElementById('canvasToolbar').classList.remove('hidden');
      } else if (targetTab === 'layers') {
        document.getElementById('tabContentLayers').classList.remove('hidden');
        document.getElementById('canvasToolbar').classList.add('hidden');
      } else if (targetTab === 'svg') {
        document.getElementById('tabContentSvg').classList.remove('hidden');
        document.getElementById('canvasToolbar').classList.add('hidden');
      } else if (targetTab === 'json') {
        document.getElementById('tabContentJson').classList.remove('hidden');
        document.getElementById('canvasToolbar').classList.add('hidden');
      }
    });
  });

  /**
   * Clipboard Actions
   */
  btnCopySvgCode.addEventListener('click', () => {
    if (!state.result) return;
    navigator.clipboard.writeText(state.result.svgString).then(() => {
      showToast('SVG Markup copied to clipboard', 'success');
    });
  });

  btnCopyJsonCode.addEventListener('click', () => {
    if (!state.result) return;
    navigator.clipboard.writeText(state.result.jsonString).then(() => {
      showToast('JSON Matrix copied to clipboard', 'success');
    });
  });

  /**
   * Downloads (Requirement 4: Distinct download buttons for grid_image.svg & pixel_data.json)
   */
  btnDownloadSvg.addEventListener('click', () => {
    if (!state.result) return;
    const a = document.createElement('a');
    a.href = state.result.svgBlobUrl;
    const baseName = state.currentFileName.replace(/\.[^/.]+$/, '');
    a.download = `${baseName}_grid.svg` || 'grid_image.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast('Downloaded grid_image.svg', 'success');
  });

  btnDownloadJson.addEventListener('click', () => {
    if (!state.result) return;
    const a = document.createElement('a');
    a.href = state.result.jsonBlobUrl;
    const baseName = state.currentFileName.replace(/\.[^/.]+$/, '');
    a.download = `${baseName}_pixel_data.json` || 'pixel_data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast('Downloaded pixel_data.json', 'success');
  });

  /**
   * Presets
   */
  sampleHeroButtons.forEach(btn => {
    if (!btn) return;
    btn.addEventListener('click', () => {
      const sample = SampleImages.getArcadeHero();
      loadImageSource(sample.dataUrl, sample.name, 1200);
      showToast('Loaded Hero preset', 'info');
    });
  });

  sampleHeartButtons.forEach(btn => {
    if (!btn) return;
    btn.addEventListener('click', () => {
      const sample = SampleImages.getCyberHeart();
      loadImageSource(sample.dataUrl, sample.name, 1400);
      showToast('Loaded Heart preset', 'info');
    });
  });

  samplePotionButtons.forEach(btn => {
    if (!btn) return;
    btn.addEventListener('click', () => {
      const sample = SampleImages.getMagicPotion();
      loadImageSource(sample.dataUrl, sample.name, 2100);
      showToast('Loaded Potion preset', 'info');
    });
  });

  sampleCubeButtons.forEach(btn => {
    if (!btn) return;
    btn.addEventListener('click', () => {
      const sample = SampleImages.getRetroLogo();
      loadImageSource(sample.dataUrl, sample.name, 3400);
      showToast('Loaded Cube preset', 'info');
    });
  });

  btnResetApp.addEventListener('click', () => {
    btnClearImage.click();
    gridSelect.value = 'original';
    fitModeSelect.value = 'stretch';
    svgModeSelect.value = 'grouped';
    toggleSkipTransparent.checked = true;
    alphaThresholdSlider.value = 0;
    alphaThresholdVal.textContent = '0';
    jsonFormatSelect.value = 'matrix2d';
    showToast('Reset all settings', 'info');
  });

  // Keyboard Shortcuts
  window.addEventListener('keydown', (e) => {
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) return;

    if (e.key === 'g' || e.key === 'G') {
      btnToggleGrid.click();
    } else if (e.key === '+' || e.key === '=') {
      btnZoomIn.click();
    } else if (e.key === '-' || e.key === '_') {
      btnZoomOut.click();
    }
  });

  // Load initial clean preset
  setTimeout(() => {
    const initialSample = SampleImages.getCyberHeart();
    loadImageSource(initialSample.dataUrl, initialSample.name, 1400);
  }, 100);
});
