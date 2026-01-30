export interface Rect {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface PackedItem {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    pageIndex: number;
    rotated: boolean;
}

export interface PackerConfig {
    pageWidth: number;
    pageHeight: number;
    margin: number;
    gap: number;
    allowRotation: boolean;
    scale: number;
    shrinkTolerance: number;
}

interface Node {
    x: number;
    y: number;
    width: number;
    height: number;
}

class PagePacker {
    width: number;
    height: number;
    gap: number;
    freeRects: Node[];

    constructor(width: number, height: number, gap: number) {
        this.width = width;
        this.height = height;
        this.gap = gap;
        this.freeRects = [{ x: 0, y: 0, width: width, height: height }];
    }

    pack(width: number, height: number): { x: number, y: number } | null {
        // Best Short Side Fit (BSSF)
        let bestNode: Node = { x: 0, y: 0, width: 0, height: 0 };
        let bestShortSideFit = Number.MAX_VALUE;
        let bestLongSideFit = Number.MAX_VALUE;
        let found = false;

        for (let i = 0; i < this.freeRects.length; i++) {
            const freeRect = this.freeRects[i];

            // Try to place the rectangle in upright orientation
            if (freeRect.width >= width && freeRect.height >= height) {
                const leftoverHoriz = Math.abs(freeRect.width - width);
                const leftoverVert = Math.abs(freeRect.height - height);
                const shortSideFit = Math.min(leftoverHoriz, leftoverVert);
                const longSideFit = Math.max(leftoverHoriz, leftoverVert);

                if (shortSideFit < bestShortSideFit || (shortSideFit === bestShortSideFit && longSideFit < bestLongSideFit)) {
                    bestNode = { x: freeRect.x, y: freeRect.y, width: width, height: height };
                    bestShortSideFit = shortSideFit;
                    bestLongSideFit = longSideFit;
                    found = true;
                }
            }
        }

        if (!found) return null;

        this.splitFreeRects(bestNode);
        return bestNode;
    }

    splitFreeRects(usedNode: Node) {
        const newFreeRects: Node[] = [];
        // Add gap to the used dimensions when splitting, effectively reserving the space
        // However, the item itself is placed at x, y. The free space around it needs to account for the gap?
        // Actually, simpler approach: we treat the item size as (width + gap, height + gap) during packing calculation,
        // assuming gap is added to the right/bottom. 
        // BUT, edge items shouldn't have gap.
        // Let's rely on standard MaxRects and just subtract gap from available space or add padding?

        // Better approach for gaps:
        // When placing an item, we effectively consume (width + gap, height + gap).
        // EXCEPT when checking if it fits, we need to be careful.
        // Let's stick to the standard MaxRects split logic first.

        for (let i = 0; i < this.freeRects.length; i++) {
            const freeRect = this.freeRects[i];
            if (this.intersects(freeRect, usedNode)) {
                // New rects from split
                if (usedNode.x < freeRect.x + freeRect.width && usedNode.x + usedNode.width > freeRect.x) {
                    // New node at the top side of the used node
                    if (usedNode.y > freeRect.y && usedNode.y < freeRect.y + freeRect.height) {
                        const newNode: Node = {
                            x: freeRect.x,
                            y: freeRect.y,
                            width: freeRect.width,
                            height: usedNode.y - freeRect.y
                        };
                        newFreeRects.push(newNode);
                    }

                    // New node at the bottom side of the used node
                    if (usedNode.y + usedNode.height < freeRect.y + freeRect.height) {
                        const newNode: Node = {
                            x: freeRect.x,
                            y: usedNode.y + usedNode.height,
                            width: freeRect.width,
                            height: freeRect.y + freeRect.height - (usedNode.y + usedNode.height)
                        };
                        newFreeRects.push(newNode);
                    }
                }

                if (usedNode.y < freeRect.y + freeRect.height && usedNode.y + usedNode.height > freeRect.y) {
                    // New node at the left side of the used node
                    if (usedNode.x > freeRect.x && usedNode.x < freeRect.x + freeRect.width) {
                        const newNode: Node = {
                            x: freeRect.x,
                            y: freeRect.y,
                            width: usedNode.x - freeRect.x,
                            height: freeRect.height
                        };
                        newFreeRects.push(newNode);
                    }

                    // New node at the right side of the used node
                    if (usedNode.x + usedNode.width < freeRect.x + freeRect.width) {
                        const newNode: Node = {
                            x: usedNode.x + usedNode.width,
                            y: freeRect.y,
                            width: freeRect.x + freeRect.width - (usedNode.x + usedNode.width),
                            height: freeRect.height
                        };
                        newFreeRects.push(newNode);
                    }
                }
            } else {
                newFreeRects.push(freeRect);
            }
        }

        // Filter contained rectangles
        for (let i = 0; i < newFreeRects.length; i++) {
            for (let j = i + 1; j < newFreeRects.length; j++) {
                if (this.isContained(newFreeRects[i], newFreeRects[j])) {
                    newFreeRects.splice(i, 1);
                    i--;
                    break;
                }
                if (this.isContained(newFreeRects[j], newFreeRects[i])) {
                    newFreeRects.splice(j, 1);
                    j--;
                }
            }
        }

        this.freeRects = newFreeRects;
    }

    intersects(r1: Node, r2: Node): boolean {
        return r1.x < r2.x + r2.width &&
            r1.x + r1.width > r2.x &&
            r1.y < r2.y + r2.height &&
            r1.y + r1.height > r2.y;
    }

    isContained(r1: Node, r2: Node): boolean {
        return r1.x >= r2.x && r1.y >= r2.y &&
            r1.x + r1.width <= r2.x + r2.width &&
            r1.y + r1.height <= r2.y + r2.height;
    }
}

export const packImages = (
    images: { id: string; width: number; height: number }[],
    config: PackerConfig
): PackedItem[] => {
    const packedItems: PackedItem[] = [];
    const pages: PagePacker[] = [];

    // Sort images (Area descending often yields better results, or Max Side)
    // Let's try Area Descending first
    const sortedImages = [...images].sort((a, b) => (b.width * b.height) - (a.width * a.height));

    const contentWidth = config.pageWidth - (2 * config.margin);
    const contentHeight = config.pageHeight - (2 * config.margin);

    for (const img of sortedImages) {
        let placed = false;

        // Convert px to mmish relative scale or just work in one unit.
        // The images come in with px dimensions. The page is in mm.
        // We need to scale images down to fit reasonably or deciding a scale factor.
        // Problem: "shrink-wrap to image bounds" means we respect the image's intrinsic ratio.
        // BUT we need to decide how big they appear on page.
        // User request: "Maximize # of screenshots per A4 page". "Container dimensions must be image-driven".
        // This implies we shouldn't force them to a grid.
        // BUT they need to be readable.
        // Let's try to fit them at a target scale, or maybe "pack as many as possible" implies 
        // they should be as small as legible?
        // Actually, usually this means "at a specific DPI" or "fit X images".
        // If we just pack them at 1:1 pixel=unit, they might be huge or tiny.
        // Let's Assume a default Width for reference (e.g. 1/2 page width) to start, 
        // or better: The packer works with minimal modification to inputs.
        // Let's assume we want to maintain the image's aspect ratio.
        // We need to determine the "print size".
        // For now, let's assume we want to pack them such that they fit efficiently.
        // A simple heuristic: Scale images so the largest one fits about 1/2 page width?
        // OR: Ask user for a "Scale" or "Target Columns".
        // Since we removed Rows/Cols, maybe we introduce a "Scale" slider?
        // Or we just try to pack them into the page. If they are too big, we scale them down?
        // Let's act like we have a 'Target Width' for the images, say 80mm?
        // NO, the request says "maximum number of screenshots". This implies making them smaller?
        // OR it means "given a set of images, arrange them efficiently".
        // The previous implementation used a grid.
        // Let's assume we keep the 'scale' logic somewhat consistent with "fitting them on page".
        // Let's map 1 px = 0.26mm (96 DPI).
        // If an image is 1920px wide -> ~500mm. Too big for A4 (210mm).
        // We definitely need to scale them.
        // Let's Auto-Scale them? Or allow user to scale.
        // Let's add a "Scale" factor to the config, defaulting to 1 (which might be too big).
        // Or we stick to a heuristic: normalize all images to have a width of roughly 1/3 page width?
        // Let's use a fixed arbitrary scale for now that makes sense (e.g. width = 80mm) and respect aspect ratio.
        // Better: Allow the packer to receive "target dimensions".
        // FOR NOW: We will scale all images down so they fit at least 2 columns width-wise for standard 1080p screenshots.
        // Let's assume a "Base width" of 90mm for calculation.

        // We'll calculate the 'print' dimensions based on a standard scale factor.
        // Let's simply say: 1 px = 0.1 mm to start. 1920px -> 192mm (fits full page width).
        // 1000px -> 100mm.
        // Let's use this scale.

        const scale = config.scale;
        let w = img.width * scale;
        let h = img.height * scale;

        // Ensure it fits at variance
        if (w > contentWidth) {
            const ratio = contentWidth / w;
            w = contentWidth;
            h = h * ratio;
        }
        if (h > contentHeight) {
            const ratio = contentHeight / h;
            h = contentHeight;
            w = w * ratio;
        }

        // Attempt to pack in existing pages
        for (let pIdx = 0; pIdx < pages.length; pIdx++) {
            const page = pages[pIdx];
            const res = tryPackOnPage(page, w, h, config.gap, config.allowRotation, config.shrinkTolerance);
            if (res) {
                packedItems.push({
                    id: img.id,
                    x: res.x + config.margin,
                    y: res.y + config.margin,
                    width: res.width,
                    height: res.height,
                    pageIndex: pIdx,
                    rotated: res.rotated
                });
                placed = true;
                break;
            }
        }

        // If not placed, create new page
        if (!placed) {
            const newPage = new PagePacker(contentWidth, contentHeight, config.gap);
            pages.push(newPage);
            const res = tryPackOnPage(newPage, w, h, config.gap, config.allowRotation, config.shrinkTolerance);
            if (res) {
                packedItems.push({
                    id: img.id,
                    x: res.x + config.margin,
                    y: res.y + config.margin,
                    width: res.width,
                    height: res.height,
                    pageIndex: pages.length - 1,
                    rotated: res.rotated
                });
            } else {
                console.warn("Image too big for page even on new page", img);
            }
        }
    }

    return packedItems;
};

function tryPackOnPage(page: PagePacker, w: number, h: number, gap: number, allowRotation: boolean, shrinkTolerance: number = 0) {
    // 1. Try Strict Fit First (Normal & Rotated)
    const effectiveW = w + gap;
    const effectiveH = h + gap;

    // Normal
    const fitNormal = page.pack(effectiveW, effectiveH);
    if (fitNormal) return { ...fitNormal, rotated: false, width: w, height: h };

    // Rotated
    if (allowRotation) {
        const fitRotated = page.pack(effectiveH, effectiveW);
        if (fitRotated) return { ...fitRotated, rotated: true, width: h, height: w };
    }

    // 2. Try Shrinking if Strict Fit failed
    if (shrinkTolerance > 0) {
        // Find the best hole that fits the image if we shrink it.
        const effectiveGap = gap;

        let bestCandidate: { node: Node, scale: number, rotated: boolean } | null = null;

        // Check all freeRects
        for (const rect of page.freeRects) {
            // Check Normal
            const maxW = rect.width - effectiveGap;
            const maxH = rect.height - effectiveGap;

            if (maxW > 0 && maxH > 0) {
                const sW = maxW / w;
                const sH = maxH / h;
                const sNormal = Math.min(sW, sH);

                if (sNormal >= (1 - shrinkTolerance)) {
                    // Valid candidate
                    const actualScale = Math.min(1, sNormal);
                    if (!bestCandidate || actualScale > bestCandidate.scale) {
                        bestCandidate = { node: rect, scale: actualScale, rotated: false };
                    }
                }

                // Check Rotated
                if (allowRotation) {
                    const sW_rot = maxW / h;
                    const sH_rot = maxH / w;
                    const sRotated = Math.min(sW_rot, sH_rot);

                    if (sRotated >= (1 - shrinkTolerance)) {
                        const actualScale = Math.min(1, sRotated);
                        if (!bestCandidate || actualScale > bestCandidate.scale) {
                            bestCandidate = { node: rect, scale: actualScale, rotated: true };
                        }
                    }
                }
            }
        }

        if (bestCandidate) {
            const targetW = bestCandidate.rotated ? h : w;
            const targetH = bestCandidate.rotated ? w : h;

            const scaledW = targetW * bestCandidate.scale;
            const scaledH = targetH * bestCandidate.scale;

            const res = page.pack(scaledW + effectiveGap, scaledH + effectiveGap);
            if (res) {
                return {
                    x: res.x,
                    y: res.y,
                    rotated: bestCandidate.rotated,
                    width: scaledW,
                    height: scaledH
                };
            }
        }
    }

    return null;
}
