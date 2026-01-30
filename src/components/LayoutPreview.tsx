import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { X } from 'lucide-react';

interface Screenshot {
    id: string;
    preview: string;
}

interface LayoutConfig {
    rows: number;
    cols: number;
}

interface LayoutPreviewProps {
    images: Screenshot[];
    config: LayoutConfig;
    onRemove: (id: string) => void;
}

// Draggable Image Item
const SortableImage = ({ id, src, onRemove }: { id: string, src: string, onRemove: (id: string) => void }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="relative w-full h-full border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden group hover:border-blue-400 transition-colors"
        >
            <img src={src} alt="" className="max-w-full max-h-full object-contain" />
            <button
                onPointerDown={(e) => {
                    e.stopPropagation(); // Prevent drag start
                    // e.preventDefault();
                }}
                onClick={(e) => {
                    e.stopPropagation();
                    onRemove(id);
                }}
                className="absolute top-2 right-2 p-1 bg-white/90 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 text-red-600 cursor-pointer z-10"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};

export const LayoutPreview: React.FC<LayoutPreviewProps> = ({ images, config, onRemove }) => {
    // A4 aspect ratio is 1:1.414 (210mm x 297mm)
    // We'll use a fixed width for preview and calculate height

    return (
        <div className="w-full flex justify-center bg-gray-100 p-8 overflow-y-auto">
            <div
                className="bg-white shadow-2xl relative transition-all duration-300 ease-in-out"
                style={{
                    width: '210mm',
                    height: '297mm', // strict A4 size
                    // Scale down for screen if needed, but better to let container handle scroll or scale
                    // For now, let's just use a transform scale wrapper if we want responsive,
                    // or just CSS aspect-ratio for a responsive container.
                    // Let's stick to mm for accurate print preview visualization.
                    zoom: 0.6 // Quick hack to fit on screen, or better: transform: scale(0.6)
                }}
            >
                <div
                    className="absolute inset-0 p-[10mm]" // 10mm margin
                    style={{
                        display: 'grid',
                        gridTemplateColumns: `repeat(${config.cols}, 1fr)`,
                        gridTemplateRows: `repeat(${config.rows}, 1fr)`,
                        gap: '5mm'
                    }}
                >
                    <SortableContext
                        items={images.map(img => img.id)}
                        strategy={rectSortingStrategy}
                    >
                        {images.slice(0, config.rows * config.cols).map((img) => (
                            <SortableImage key={img.id} id={img.id} src={img.preview} onRemove={onRemove} />
                        ))}
                        {/* Fill specific empty slots if needed to show grid? */}
                        {Array.from({ length: Math.max(0, (config.rows * config.cols) - images.length) }).map((_, i) => (
                            <div key={`empty-${i}`} className="border-2 border-dashed border-gray-200 rounded-lg" />
                        ))}
                    </SortableContext>
                </div>
            </div>
        </div>
    );
};
