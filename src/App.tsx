import { useState, useCallback } from 'react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { UploadZone } from './components/UploadZone';
import { LayoutPreview } from './components/LayoutPreview';
import { Controls } from './components/Controls';
import { generatePDF } from './utils/pdfGenerator';
import { ArrowLeft } from 'lucide-react';

interface Screenshot {
  id: string;
  file: File;
  preview: string;
  width: number;
  height: number;
}

interface LayoutConfig {
  rows: number; // Ignored
  cols: number; // Ignored
  margin: number; // mm
  gap: number; // mm
  allowRotation: boolean;
  scale: number; // Factor (e.g. 0.1)
  shrinkTolerance: number;
}

function App() {
  const [images, setImages] = useState<Screenshot[]>([]);
  const [config, setConfig] = useState<LayoutConfig>({
    rows: 3,
    cols: 2,
    margin: 0,
    gap: 5,
    allowRotation: false,
    scale: 0.1,
    shrinkTolerance: 0
  });

  const handleImagesSelected = useCallback(async (files: File[]) => {
    const newImages: Screenshot[] = [];

    for (const file of files) {
      const preview = URL.createObjectURL(file);
      // Load image to get dimensions
      const img = new Image();
      img.src = preview;
      await new Promise((resolve) => { img.onload = resolve; });

      newImages.push({
        id: crypto.randomUUID(),
        file,
        preview,
        width: img.width,
        height: img.height
      });
    }

    setImages(prev => [...prev, ...newImages]);
  }, []);

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setImages((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleDownload = async () => {
    if (images.length === 0) return;
    try {
      await generatePDF(images, config);
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      alert("Error generating PDF. Please try again.");
    }
  };

  if (images.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="max-w-xl w-full text-center space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">SnapSheet</h1>
            <p className="text-gray-600 text-lg">
              Turn your screenshots into a perfectly formatted A4 PDF.
            </p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <UploadZone onImagesSelected={handleImagesSelected} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col h-screen overflow-hidden">
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setImages([])}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">SnapSheet</h1>
        </div>
        <div className="text-sm text-gray-500">
          {images.length} images selected
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-hidden bg-gray-100 relative">
            <DndContext
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <LayoutPreview images={images} config={config} onRemove={removeImage} />
            </DndContext>
          </div>
        </main>

        <aside className="w-80 bg-white border-l border-gray-200 h-full overflow-y-auto shrink-0 z-10">
          <Controls
            config={config}
            onConfigChange={setConfig}
            onDownload={handleDownload}
          />
        </aside>
      </div>
    </div>
  );
}

export default App;
