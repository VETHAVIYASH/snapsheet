import React, { useMemo } from 'react';
// import { useSortable } from '@dnd-kit/sortable'; // DnD not supported easily with absolute packing yet, disabling drag for now or just reordering array?
// Reordering affects packing order. Let's keep array order reordering in parent if possible, but here we just show result.
// For now, let's remove DnD inside the preview because positions are calculated. 
// User can reorder via a list or we can re-enable DnD in a "List View" later.
// OR: We just render them. 
import { X, RotateCw } from 'lucide-react';
import { packImages } from '../utils/layoutEngine';
import type { PackedItem } from '../utils/layoutEngine';

interface Screenshot {
    id: string;
    preview: string;
    width: number;
    height: number;
}

interface LayoutConfig {
    rows: number;
    cols: number;
    margin: number;
    gap: number;
    allowRotation: boolean;
    scale: number;
    shrinkTolerance: number;
}

interface LayoutPreviewProps {
    images: Screenshot[];
    config: LayoutConfig;
    onRemove: (id: string) => void;
}

export const LayoutPreview: React.FC<LayoutPreviewProps> = ({ images, config, onRemove }) => {
    // Generate packed layout
    const packedItems = useMemo(() => {
        return packImages(images, {
            pageWidth: 210,
            pageHeight: 297,
            margin: config.margin,
            gap: config.gap,
            allowRotation: config.allowRotation,
            scale: config.scale,
            shrinkTolerance: config.shrinkTolerance
        });
    }, [images, config]);

    // Group by page
    const pages = useMemo(() => {
        const p: Record<number, PackedItem[]> = {};
        packedItems.forEach(item => {
            if (!p[item.pageIndex]) p[item.pageIndex] = [];
            p[item.pageIndex].push(item);
        });
        return p;
    }, [packedItems]);

    const pageCount = Object.keys(pages).length || 1;

    return (
        <div className="w-full flex flex-col items-center bg-gray-100 p-8 overflow-y-auto gap-8">
            {Array.from({ length: pageCount }).map((_, pageIdx) => (
                <div
                    key={pageIdx}
                    className="bg-white shadow-2xl relative transition-all duration-300 ease-in-out"
                    style={{
                        width: '210mm',
                        height: '297mm',
                        position: 'relative',
                        zoom: 0.6
                    }}
                >
                    {(pages[pageIdx] || []).map((item) => {
                        const img = images.find(i => i.id === item.id);
                        if (!img) return null;

                        return (
                            <div
                                key={item.id}
                                className="absolute border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden group hover:border-blue-400 transition-colors"
                                style={{
                                    left: `${item.x}mm`,
                                    top: `${item.y}mm`,
                                    width: `${item.width}mm`,
                                    height: `${item.height}mm`,
                                }}
                            >
                                <img
                                    src={img.preview}
                                    alt=""
                                    className="w-full h-full object-fill"
                                    style={{
                                        // If rotated, the item.width/height are the box on page.
                                        // The image itself? 
                                        // If packed as rotated, we probably want to visually rotate the image?
                                        // Yes.
                                        // transform: item.rotated ? 'rotate(90deg)' : 'none'
                                        // But if we rotate, we need to swap w/h in CSS or use object-fit carefully.
                                        // The container has the DIMENSIONS OF THE SLOT.
                                        // If item.rotated is true, it means the image is actually HxW fit into WxH slot?
                                        // Wait.
                                        // If item.rotated:
                                        // The Slot Width = Image Height * Scale
                                        // The Slot Height = Image Width * Scale
                                        // So the image inside needs to be rotated 90deg and fit.
                                        // Rotation transform rotates around center.
                                    }}
                                />
                                {item.rotated && (
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 bg-black/10">
                                        <RotateCw className="text-white w-8 h-8 drop-shadow-md" />
                                    </div>
                                )}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onRemove(item.id);
                                    }}
                                    className="absolute top-1 right-1 p-1 bg-white/90 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 text-red-600 cursor-pointer z-10"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        );
                    })}
                </div>
            ))}
        </div>
    );
};
