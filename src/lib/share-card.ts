export interface ShareCardData {
  workoutName: string;
  date: string;
  totalVolume: number;
  duration: number;
  topSets: { exercise: string; weight: number; reps: number }[];
  prs: { exercise: string; weight: number }[];
  streakDays: number;
}

export type CardFormat = "stories" | "square";

const DIMENSIONS: Record<CardFormat, { width: number; height: number }> = {
  stories: { width: 1080, height: 1920 },
  square: { width: 1080, height: 1080 },
};

export async function generateShareCard(
  data: ShareCardData,
  format: CardFormat = "stories"
): Promise<Blob> {
  const { width, height } = DIMENSIONS[format];
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, "#0A0A0A");
  gradient.addColorStop(1, "#1A1A1A");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Accent line at top
  ctx.fillStyle = "#CDFF00";
  ctx.fillRect(0, 0, width, 4);

  // Logo
  ctx.fillStyle = "#CDFF00";
  ctx.font = "bold 48px Inter, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("SetFlow", width / 2, 120);

  // Workout name
  const name = data.workoutName.length > 30
    ? data.workoutName.slice(0, 27) + "..."
    : data.workoutName;
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 64px Inter, system-ui, sans-serif";
  ctx.fillText(name.toUpperCase(), width / 2, 280);

  // Date
  ctx.fillStyle = "#A0A0A0";
  ctx.font = "32px Inter, system-ui, sans-serif";
  ctx.fillText(data.date, width / 2, 340);

  // Stats boxes
  drawStatBox(ctx, width / 2 - 220, 420, "Volume", `${data.totalVolume.toLocaleString()} kg`);
  drawStatBox(ctx, width / 2 + 20, 420, "Duration", `${data.duration} min`);

  // Top sets
  ctx.textAlign = "left";
  ctx.fillStyle = "#CDFF00";
  ctx.font = "bold 36px Inter, system-ui, sans-serif";
  ctx.fillText("TOP SETS", 80, 680);

  data.topSets.slice(0, 3).forEach((set, i) => {
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "32px Inter, system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(set.exercise, 80, 740 + i * 60);
    ctx.fillStyle = "#A0A0A0";
    ctx.textAlign = "right";
    ctx.fillText(`${set.weight}kg x${set.reps}`, width - 80, 740 + i * 60);
  });

  // PRs
  if (data.prs.length > 0) {
    const prY = format === "stories" ? 940 : 780;
    ctx.textAlign = "center";
    ctx.fillStyle = "#CDFF00";
    ctx.font = "bold 40px Inter, system-ui, sans-serif";
    ctx.fillText(`NEW PR! ${data.prs[0].exercise} ${data.prs[0].weight}kg`, width / 2, prY);
  }

  // Streak
  if (data.streakDays > 0) {
    const streakY = format === "stories" ? height - 200 : height - 120;
    ctx.fillStyle = "#F59E0B";
    ctx.font = "bold 36px Inter, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`${data.streakDays} day streak`, width / 2, streakY);
  }

  // Footer
  ctx.fillStyle = "#666666";
  ctx.font = "24px Inter, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("gym.adu.dk", width / 2, height - 60);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), "image/png");
  });
}

function drawStatBox(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  label: string,
  value: string
): void {
  ctx.fillStyle = "#1A1A1A";
  ctx.beginPath();
  ctx.roundRect(x, y, 200, 120, 16);
  ctx.fill();

  ctx.fillStyle = "#A0A0A0";
  ctx.font = "24px Inter, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(label, x + 100, y + 40);

  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 36px Inter, system-ui, sans-serif";
  ctx.fillText(value, x + 100, y + 90);
}

export async function downloadShareCard(blob: Blob, filename: string): Promise<void> {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function shareCard(blob: Blob, title: string): Promise<void> {
  if (navigator.share) {
    const file = new File([blob], "setflow-workout.png", { type: "image/png" });
    await navigator.share({ title, files: [file] });
  } else {
    await downloadShareCard(blob, "setflow-workout.png");
  }
}
