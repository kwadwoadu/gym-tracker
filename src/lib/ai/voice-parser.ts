/**
 * Tier 1 voice parser - regex-based NLP for set data extraction.
 * Works fully offline.
 */

export interface ParsedSetData {
  weight: number | null;
  reps: number | null;
  rpe: number | null;
  modifier: "same" | "up" | "down" | null;
  modifierAmount: number | null;
  confidence: number; // 0-100
  raw: string;
}

const WORD_TO_NUMBER: Record<string, number> = {
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5,
  six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15,
  sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20,
  thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70,
  eighty: 80, ninety: 90, hundred: 100,
};

const RPE_WORDS: Record<string, number> = {
  easy: 5, light: 5, moderate: 7, medium: 7,
  hard: 8, tough: 8, difficult: 8,
  "very hard": 9, heavy: 9, brutal: 9,
  failed: 10, max: 10, maximal: 10, failure: 10,
};

function wordsToNumber(text: string): number | null {
  const cleaned = text.trim().toLowerCase();

  // Direct number
  const direct = parseFloat(cleaned);
  if (!isNaN(direct)) return direct;

  // Word number
  if (WORD_TO_NUMBER[cleaned] !== undefined) return WORD_TO_NUMBER[cleaned];

  // Compound like "eighty five"
  const parts = cleaned.split(/[\s-]+/);
  if (parts.length === 2) {
    const a = WORD_TO_NUMBER[parts[0]];
    const b = WORD_TO_NUMBER[parts[1]];
    if (a !== undefined && b !== undefined) {
      if (a === 100) return 100 + b;
      return a + b;
    }
  }

  // "one hundred ten"
  if (parts.length === 3 && parts[1] === "hundred") {
    const a = WORD_TO_NUMBER[parts[0]];
    const c = WORD_TO_NUMBER[parts[2]];
    if (a !== undefined && c !== undefined) return a * 100 + c;
  }

  return null;
}

/**
 * Parse a voice transcript into structured set data.
 */
export function parseVoiceInput(transcript: string, lastWeight?: number): ParsedSetData {
  const raw = transcript;
  const text = transcript.toLowerCase().trim();

  const result: ParsedSetData = {
    weight: null,
    reps: null,
    rpe: null,
    modifier: null,
    modifierAmount: null,
    confidence: 0,
    raw,
  };

  // Check for modifiers
  const sameMatch = text.match(/\bsame\s*(weight)?\b/);
  if (sameMatch) {
    result.modifier = "same";
    if (lastWeight) result.weight = lastWeight;
  }

  const upMatch = text.match(/\b(?:up|plus|\+)\s*([\d.]+|[\w\s]+?)\s*(?:kg|kilos?|pounds?|lbs?)?/);
  if (upMatch && lastWeight) {
    const amount = wordsToNumber(upMatch[1]);
    if (amount !== null) {
      result.modifier = "up";
      result.modifierAmount = amount;
      result.weight = lastWeight + amount;
    }
  }

  const downMatch = text.match(/\b(?:down|minus|-)\s*([\d.]+|[\w\s]+?)\s*(?:kg|kilos?|pounds?|lbs?)?/);
  if (downMatch && lastWeight) {
    const amount = wordsToNumber(downMatch[1]);
    if (amount !== null) {
      result.modifier = "down";
      result.modifierAmount = amount;
      result.weight = lastWeight - amount;
    }
  }

  // Extract weight (number followed by kg/kilos/pounds)
  if (result.weight === null) {
    const weightMatch = text.match(/([\d.]+)\s*(?:kg|kilos?|k)\b/);
    if (weightMatch) {
      result.weight = parseFloat(weightMatch[1]);
    } else {
      // Try "X pounds/lbs" and convert
      const lbsMatch = text.match(/([\d.]+)\s*(?:pounds?|lbs?)\b/);
      if (lbsMatch) {
        result.weight = Math.round(parseFloat(lbsMatch[1]) * 0.453592 * 2) / 2;
      } else {
        // First number might be weight
        const firstNum = text.match(/^([\d.]+)\b/);
        if (firstNum && parseFloat(firstNum[1]) >= 10) {
          result.weight = parseFloat(firstNum[1]);
        }
      }
    }
  }

  // Extract reps
  const repsMatch = text.match(/([\d]+)\s*(?:reps?|repetitions?)\b/) ||
    text.match(/\bfor\s+([\d]+)\b/) ||
    text.match(/\b(?:did|got)\s+([\d]+)\b/) ||
    text.match(/\bx\s*([\d]+)\b/) ||
    text.match(/\bby\s+([\d]+)\b/);
  if (repsMatch) {
    result.reps = parseInt(repsMatch[1]);
  } else {
    // Second standalone number might be reps
    const numbers = text.match(/\b(\d+)\b/g);
    if (numbers && numbers.length >= 2 && result.weight !== null) {
      const secondNum = parseInt(numbers[1]);
      if (secondNum <= 30) result.reps = secondNum;
    }
  }

  // Extract RPE
  const rpeMatch = text.match(/\brpe\s*([\d.]+)\b/) || text.match(/\brate\s*([\d.]+)\b/);
  if (rpeMatch) {
    result.rpe = parseFloat(rpeMatch[1]);
  } else {
    // Natural language RPE
    for (const [word, rpe] of Object.entries(RPE_WORDS)) {
      if (text.includes(word)) {
        result.rpe = rpe;
        break;
      }
    }
  }

  // "failed at X"
  const failedMatch = text.match(/\bfailed?\s*(?:at|on)\s*([\d]+)\b/);
  if (failedMatch) {
    result.reps = parseInt(failedMatch[1]);
    result.rpe = 10;
  }

  // Calculate confidence
  let score = 0;
  if (result.weight !== null) score += 40;
  if (result.reps !== null) score += 40;
  if (result.rpe !== null) score += 20;
  result.confidence = score;

  return result;
}
