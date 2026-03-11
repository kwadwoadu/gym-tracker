import { describe, it, expect } from "vitest";
import { getYouTubeVideoId, getYouTubeThumbnail, isYouTubeUrl } from "../utils";

describe("getYouTubeVideoId", () => {
  it("extracts ID from standard watch URL", () => {
    expect(getYouTubeVideoId("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });

  it("extracts ID from short URL", () => {
    expect(getYouTubeVideoId("https://youtu.be/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });

  it("extracts ID from embed URL", () => {
    expect(getYouTubeVideoId("https://www.youtube.com/embed/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });

  it("extracts ID with extra query params", () => {
    expect(getYouTubeVideoId("https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=42")).toBe("dQw4w9WgXcQ");
  });

  it("returns null for empty string", () => {
    expect(getYouTubeVideoId("")).toBeNull();
  });

  it("returns null for non-YouTube URL", () => {
    expect(getYouTubeVideoId("https://vimeo.com/123456")).toBeNull();
  });

  it("returns null for invalid video ID length", () => {
    expect(getYouTubeVideoId("https://youtube.com/watch?v=short")).toBeNull();
  });

  it("handles IDs with hyphens and underscores", () => {
    expect(getYouTubeVideoId("https://youtu.be/ab-cd_ef_1X")).toBe("ab-cd_ef_1X");
  });
});

describe("getYouTubeThumbnail", () => {
  it("returns hqdefault thumbnail URL", () => {
    const url = getYouTubeThumbnail("https://youtu.be/dQw4w9WgXcQ");
    expect(url).toBe("https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg");
  });

  it("returns null for non-YouTube URL", () => {
    expect(getYouTubeThumbnail("https://vimeo.com/123")).toBeNull();
  });
});

describe("isYouTubeUrl", () => {
  it("returns true for valid YouTube URL", () => {
    expect(isYouTubeUrl("https://youtube.com/watch?v=dQw4w9WgXcQ")).toBe(true);
  });

  it("returns false for non-YouTube URL", () => {
    expect(isYouTubeUrl("https://google.com")).toBe(false);
  });
});
