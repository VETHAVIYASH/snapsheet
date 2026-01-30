import React from 'react';
import { Layout, Download, Grid } from 'lucide-react';

interface LayoutConfig {
    rows: number; // Keeping for compatibility or remove? Better remove or ignore. 
    cols: number; // Ignored in packing mode
    margin: number;
    gap: number;
    allowRotation: boolean;
    scale: number;
    shrinkTolerance: number;
}

interface ControlsProps {
    config: LayoutConfig;
    onConfigChange: (newConfig: LayoutConfig) => void;
    onDownload: () => void;
}

export const Controls: React.FC<ControlsProps> = ({ config, onConfigChange, onDownload }) => {
    return (
        <div className="w-80 bg-white border-l border-gray-200 p-6 flex flex-col h-full">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Layout className="w-5 h-5 text-blue-600" />
                Page Layout
            </h2>

            <div className="space-y-6 flex-1">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Image Scale ({(config.scale * 100).toFixed(0)}%)
                    </label>
                    <input
                        type="range"
                        min="0.01"
                        max="0.5"
                        step="0.01"
                        value={config.scale}
                        onChange={(e) => onConfigChange({ ...config, scale: Number(e.target.value) })}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Shrink Tolerance ({(config.shrinkTolerance * 100).toFixed(0)}%)
                    </label>
                    <input
                        type="range"
                        min="0"
                        max="0.5"
                        step="0.01"
                        value={config.shrinkTolerance}
                        onChange={(e) => onConfigChange({ ...config, shrinkTolerance: Number(e.target.value) })}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Allow shrinking up to this % to fill holes.
                    </p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Margin ({config.margin}mm)
                    </label>
                    <input
                        type="range"
                        min="0"
                        max="20"
                        step="1"
                        value={config.margin}
                        onChange={(e) => onConfigChange({ ...config, margin: Number(e.target.value) })}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Gap ({config.gap}mm)
                    </label>
                    <input
                        type="range"
                        min="0"
                        max="20"
                        step="1"
                        value={config.gap}
                        onChange={(e) => onConfigChange({ ...config, gap: Number(e.target.value) })}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                </div>

                <div className="flex items-center gap-3">
                    <input
                        type="checkbox"
                        id="allowRotation"
                        checked={config.allowRotation}
                        onChange={(e) => onConfigChange({ ...config, allowRotation: e.target.checked })}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                    />
                    <label htmlFor="allowRotation" className="text-sm font-medium text-gray-700 select-none">
                        Auto-Rotate Images
                    </label>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="flex items-center gap-2 text-blue-800 mb-2">
                        <Grid className="w-4 h-4" />
                        <span className="text-sm font-medium">Layout Info</span>
                    </div>
                    <p className="text-xs text-blue-600">
                        Images are automatically packed to minimize space.
                    </p>
                </div>
            </div>

            <div className="mt-auto pt-6 border-t border-gray-100">
                <button
                    onClick={onDownload}
                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors shadow-sm active:transform active:scale-95"
                >
                    <Download className="w-5 h-5" />
                    Download PDF
                </button>
            </div>
        </div>
    );
};
