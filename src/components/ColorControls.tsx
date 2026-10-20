import React, { useRef } from 'react';
import { hexToRgb, rgbToHex } from '../data/colors';
import { SkinCategory, SkinItem } from '../types/skin';
import { Translations } from '../data/locales';

interface ColorControlsProps {
  category: SkinCategory;
  activeItem?: SkinItem | null;
  currentColor: string;
  onColorChange: (color: string) => void;
  tr: Translations;
}

// Exact 15 color swatches ordered row-by-row matching Screenshot (240).png:
const SCREENSHOT_PALETTE: string[] = [
  '#613915', '#e2bc7b', '#c21c1c', '#ebe8e4', '#124d87',
  '#97491b', '#706662', '#178c32', '#e3dd26', '#fc0eb3',
  '#b17050', '#151515', '#ae2ad3', '#449acc', '#d0672a',
];

export const ColorControls: React.FC<ColorControlsProps> = ({
  currentColor,
  onColorChange,
}) => {
  const colorInputRef = useRef<HTMLInputElement>(null);
  const safeHex = currentColor && currentColor.startsWith('#') ? currentColor.toLowerCase() : '#151515';
  const { r, g, b } = hexToRgb(safeHex);

  const handleSliderChange = (channel: 'r' | 'g' | 'b', val: number) => {
    const clamped = Math.max(0, Math.min(255, val));
    const newR = channel === 'r' ? clamped : r;
    const newG = channel === 'g' ? clamped : g;
    const newB = channel === 'b' ? clamped : b;
    onColorChange(rgbToHex(newR, newG, newB));
  };

  const handleStep = (channel: 'r' | 'g' | 'b', delta: number) => {
    const currentVal = channel === 'r' ? r : channel === 'g' ? g : b;
    handleSliderChange(channel, currentVal + delta);
  };

  return (
    <div className="w-full bg-[#11131a] border-t border-white/10 p-2.5 sm:p-3 select-none shadow-2xl backdrop-blur-md">
      {/* Side-by-Side Grid: Presets on Left, RGB Sliders on Right */}
      <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] lg:grid-cols-[auto_1fr] gap-3 sm:gap-4 items-center justify-between">
        {/* Left Column: COLOR PALETTE Header + 15 Swatches */}
        <div className="flex flex-col gap-1.5 shrink-0">
          {/* Header: COLOR PALETTE + Hex Badge */}
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-[13px] font-black text-neutral-200 tracking-wider uppercase font-sans">
              COLOR PALETTE
            </span>

            {/* Clickable Hex Badge */}
            <div
              onClick={() => colorInputRef.current?.click()}
              className="relative cursor-pointer bg-[#181c2d] border border-white/20 px-2.5 py-0.5 rounded-lg shadow-inner flex items-center hover:border-[#BEF264] transition active:scale-95"
              title="Click to pick custom color"
            >
              <span className="font-mono text-[11px] font-bold text-[#BEF264] uppercase">
                {safeHex}
              </span>
              <input
                ref={colorInputRef}
                type="color"
                value={safeHex.length === 7 ? safeHex : '#151515'}
                onChange={(e) => onColorChange(e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full pointer-events-none"
              />
            </div>
          </div>

          {/* 15 Swatches: Exactly 5 columns × 3 rows */}
          <div className="grid grid-cols-5 gap-1.5 w-fit">
            {SCREENSHOT_PALETTE.map((color) => {
              const isSelected = safeHex.toLowerCase() === color.toLowerCase();
              return (
                <button
                  key={color}
                  onClick={() => onColorChange(color)}
                  style={{ backgroundColor: color }}
                  className={`relative w-7 h-7 sm:w-8 sm:h-8 rounded-lg cursor-pointer transition-transform shadow-sm ${
                    isSelected
                      ? 'border-2 border-white ring-2 ring-[#BEF264] scale-105 z-10'
                      : 'border border-white/20 hover:scale-105 active:scale-95'
                  }`}
                  title={color}
                />
              );
            })}
          </div>
        </div>

        {/* Right Column: Encased RGB Sliders Box */}
        <div className="rgb-controls-box flex flex-col justify-center gap-2 max-w-sm sm:max-w-md w-full">
          {/* Red Slider Row */}
          <div className="flex items-center gap-2 sm:gap-3 w-full">
            <button
              onClick={() => handleStep('r', -5)}
              className="rgb-stepper-btn shrink-0"
              title="Decrease Red"
            >
              -
            </button>
            <div className="flex-1 flex items-center px-1">
              <input
                type="range"
                min="0"
                max="255"
                value={r}
                onChange={(e) => handleSliderChange('r', parseInt(e.target.value, 10))}
                className="rgb-slider rgb-slider-red"
                title={`Red: ${r}`}
              />
            </div>
            <button
              onClick={() => handleStep('r', 5)}
              className="rgb-stepper-btn shrink-0"
              title="Increase Red"
            >
              +
            </button>
          </div>

          {/* Green Slider Row */}
          <div className="flex items-center gap-2 sm:gap-3 w-full">
            <button
              onClick={() => handleStep('g', -5)}
              className="rgb-stepper-btn shrink-0"
              title="Decrease Green"
            >
              -
            </button>
            <div className="flex-1 flex items-center px-1">
              <input
                type="range"
                min="0"
                max="255"
                value={g}
                onChange={(e) => handleSliderChange('g', parseInt(e.target.value, 10))}
                className="rgb-slider rgb-slider-green"
                title={`Green: ${g}`}
              />
            </div>
            <button
              onClick={() => handleStep('g', 5)}
              className="rgb-stepper-btn shrink-0"
              title="Increase Green"
            >
              +
            </button>
          </div>

          {/* Blue Slider Row */}
          <div className="flex items-center gap-2 sm:gap-3 w-full">
            <button
              onClick={() => handleStep('b', -5)}
              className="rgb-stepper-btn shrink-0"
              title="Decrease Blue"
            >
              -
            </button>
            <div className="flex-1 flex items-center px-1">
              <input
                type="range"
                min="0"
                max="255"
                value={b}
                onChange={(e) => handleSliderChange('b', parseInt(e.target.value, 10))}
                className="rgb-slider rgb-slider-blue"
                title={`Blue: ${b}`}
              />
            </div>
            <button
              onClick={() => handleStep('b', 5)}
              className="rgb-stepper-btn shrink-0"
              title="Increase Blue"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
