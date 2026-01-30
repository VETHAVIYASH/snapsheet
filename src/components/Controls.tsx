import React from 'react';
import { Layout, Download, Grid } from 'lucide-react';

interface LayoutConfig {
    rows: number;
    cols: number;
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
                        Columns ({config.cols})
                    </label>
                    <input
                        type="range"
                        min="1"
                        max="4"
                        value={config.cols}
                        onChange={(e) => onConfigChange({ ...config, cols: Number(e.target.value) })}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rows ({config.rows})
                    </label>
                    <input
                        type="range"
                        min="1"
                        max="6"
                        value={config.rows}
                        onChange={(e) => onConfigChange({ ...config, rows: Number(e.target.value) })}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                </div>

                <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="flex items-center gap-2 text-blue-800 mb-2">
                        <Grid className="w-4 h-4" />
                        <span className="text-sm font-medium">Grid Info</span>
                    </div>
                    <p className="text-xs text-blue-600">
                        {config.rows * config.cols} images per page
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
