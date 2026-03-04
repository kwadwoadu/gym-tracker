"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Camera, ChevronLeft, ChevronRight, Trash2, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HEADING, LABEL } from "@/lib/typography";
import db, { generateId, getToday } from "@/lib/db";
import type { ProgressPhoto } from "@/lib/db";

type Pose = "front" | "side" | "back";

const POSES: { key: Pose; label: string }[] = [
  { key: "front", label: "Front" },
  { key: "side", label: "Side" },
  { key: "back", label: "Back" },
];

export function PhotoProgress() {
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [selectedPose, setSelectedPose] = useState<Pose>("front");
  const [compareMode, setCompareMode] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [compareIndices, setCompareIndices] = useState<[number, number]>([0, 1]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const loadPhotos = useCallback(async () => {
    const all = await db.progressPhotos
      .where("pose")
      .equals(selectedPose)
      .reverse()
      .sortBy("date");
    setPhotos(all);
  }, [selectedPose]);

  useEffect(() => {
    loadPhotos();
  }, [loadPhotos]);

  // Filter photos for selected pose
  const posePhotos = useMemo(() => photos, [photos]);

  const handleCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    await db.progressPhotos.add({
      id: generateId(),
      date: getToday(),
      pose: selectedPose,
      blob: file,
      createdAt: new Date().toISOString(),
    });

    loadPhotos();
    // Reset input so same file can be selected again
    e.target.value = "";
  };

  const handleDelete = async (id: string) => {
    await db.progressPhotos.delete(id);
    loadPhotos();
  };

  // Slider touch/mouse handling
  const handleSliderMove = useCallback(
    (clientX: number) => {
      if (!sliderRef.current) return;
      const rect = sliderRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setSliderPosition(pct);
    },
    []
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      isDragging.current = true;
      handleSliderMove(e.clientX);
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [handleSliderMove]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging.current) return;
      handleSliderMove(e.clientX);
    },
    [handleSliderMove]
  );

  const handlePointerUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  // Navigate compare photos
  const navigateCompare = (direction: "prev" | "next", which: 0 | 1) => {
    setCompareIndices((prev) => {
      const newIndices: [number, number] = [...prev];
      if (direction === "prev") {
        newIndices[which] = Math.max(0, prev[which] - 1);
      } else {
        newIndices[which] = Math.min(posePhotos.length - 1, prev[which] + 1);
      }
      return newIndices;
    });
  };

  const getPhotoUrl = (photo: ProgressPhoto) => {
    return URL.createObjectURL(photo.blob);
  };

  return (
    <div className="px-4 space-y-4">
      {/* Pose Selector */}
      <div className="flex gap-2">
        {POSES.map((p) => (
          <button
            key={p.key}
            onClick={() => {
              setSelectedPose(p.key);
              setCompareMode(false);
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-medium transition-all ${
              selectedPose === p.key
                ? "bg-[#CDFF00] text-black"
                : "bg-[#1A1A1A] text-white/40"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {posePhotos.length === 0 ? (
        /* Empty state */
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-2xl bg-[#1A1A1A] flex items-center justify-center mx-auto mb-4">
            <Camera className="w-8 h-8 text-white/20" />
          </div>
          <h3 className={`${HEADING.h3} text-white mb-2`}>
            Track Your Progress
          </h3>
          <p className="text-sm text-white/40 mb-6 max-w-[260px] mx-auto">
            Take {selectedPose} pose photos regularly to see your transformation
            over time.
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-6 py-3 rounded-xl bg-[#CDFF00] text-black font-semibold active:scale-[0.98] transition-transform"
          >
            Take First Photo
          </button>
        </div>
      ) : compareMode && posePhotos.length >= 2 ? (
        /* Compare mode - before/after slider */
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className={`${LABEL.caption} text-white/40`}>
              Before / After
            </h3>
            <button
              onClick={() => setCompareMode(false)}
              className="text-xs text-[#CDFF00] font-medium"
            >
              Exit Compare
            </button>
          </div>

          {/* Date navigation */}
          <div className="flex gap-2 mb-3">
            {/* Before date */}
            <div className="flex-1 flex items-center justify-between bg-[#1A1A1A] rounded-lg px-3 py-2">
              <button
                onClick={() => navigateCompare("next", 0)}
                disabled={compareIndices[0] >= posePhotos.length - 1}
                className="p-1 min-w-[44px] min-h-[44px] flex items-center justify-center disabled:opacity-20"
              >
                <ChevronLeft className="w-4 h-4 text-white/60" />
              </button>
              <span className="text-xs text-white/60">
                {new Date(posePhotos[compareIndices[0]]?.date).toLocaleDateString(
                  "en",
                  { month: "short", day: "numeric", year: "numeric" }
                )}
              </span>
              <button
                onClick={() => navigateCompare("prev", 0)}
                disabled={compareIndices[0] <= 0}
                className="p-1 min-w-[44px] min-h-[44px] flex items-center justify-center disabled:opacity-20"
              >
                <ChevronRight className="w-4 h-4 text-white/60" />
              </button>
            </div>
            {/* After date */}
            <div className="flex-1 flex items-center justify-between bg-[#1A1A1A] rounded-lg px-3 py-2">
              <button
                onClick={() => navigateCompare("next", 1)}
                disabled={compareIndices[1] >= posePhotos.length - 1}
                className="p-1 min-w-[44px] min-h-[44px] flex items-center justify-center disabled:opacity-20"
              >
                <ChevronLeft className="w-4 h-4 text-white/60" />
              </button>
              <span className="text-xs text-white/60">
                {new Date(posePhotos[compareIndices[1]]?.date).toLocaleDateString(
                  "en",
                  { month: "short", day: "numeric", year: "numeric" }
                )}
              </span>
              <button
                onClick={() => navigateCompare("prev", 1)}
                disabled={compareIndices[1] <= 0}
                className="p-1 min-w-[44px] min-h-[44px] flex items-center justify-center disabled:opacity-20"
              >
                <ChevronRight className="w-4 h-4 text-white/60" />
              </button>
            </div>
          </div>

          {/* Slider comparison */}
          <div
            ref={sliderRef}
            className="relative w-full aspect-[3/4] rounded-xl overflow-hidden bg-[#1A1A1A] touch-none select-none"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            {/* Before image (full) */}
            <PhotoImage
              photo={posePhotos[compareIndices[0]]}
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* After image (clipped) */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ clipPath: `inset(0 0 0 ${sliderPosition}%)` }}
            >
              <PhotoImage
                photo={posePhotos[compareIndices[1]]}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
            {/* Slider line */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg z-10"
              style={{ left: `${sliderPosition}%` }}
            >
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-lg">
                <div className="flex gap-0.5">
                  <ChevronLeft className="w-3 h-3 text-black" />
                  <ChevronRight className="w-3 h-3 text-black" />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Gallery mode */
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className={`${LABEL.caption} text-white/40`}>
              {posePhotos.length} photo{posePhotos.length !== 1 ? "s" : ""}
            </h3>
            {posePhotos.length >= 2 && (
              <button
                onClick={() => {
                  setCompareIndices([posePhotos.length - 1, 0]);
                  setSliderPosition(50);
                  setCompareMode(true);
                }}
                className="text-xs text-[#CDFF00] font-medium min-h-[44px] flex items-center"
              >
                Compare
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            {posePhotos.map((photo) => (
              <div
                key={photo.id}
                className="relative aspect-[3/4] rounded-xl overflow-hidden bg-[#1A1A1A] group"
              >
                <PhotoImage
                  photo={photo}
                  className="w-full h-full object-cover"
                />
                {/* Date overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                  <p className="text-xs text-white font-medium">
                    {new Date(photo.date).toLocaleDateString("en", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
                {/* Delete button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(photo.id);
                  }}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-3.5 h-3.5 text-white/80" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hidden file input for camera capture */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleCapture}
      />

      {/* Capture FAB (visible when not in empty state) */}
      {posePhotos.length > 0 && (
        <div className="fixed bottom-24 right-4 z-30">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-14 h-14 rounded-full bg-[#CDFF00] text-black flex items-center justify-center shadow-lg active:scale-95 transition-transform"
          >
            <Camera className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
}

/** Helper component that creates an object URL from a Blob and displays it */
function PhotoImage({
  photo,
  className,
}: {
  photo: ProgressPhoto | undefined;
  className?: string;
}) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!photo?.blob) {
      setUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(photo.blob);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [photo]);

  if (!url) {
    return (
      <div className={`${className} flex items-center justify-center bg-[#1A1A1A]`}>
        <ImageIcon className="w-8 h-8 text-white/10" />
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt={`Progress photo - ${photo?.pose}`} className={className} />
  );
}
