export interface Holiday {
  date: number;
  name: string;
}

export type HolidayResponse =
  | { success: true; message: string; data: Holiday[] }
  | { success: false; message: string; data: Holiday[] };

export interface HolidaysOptions {
  baseUrl?: string;
  signal?: AbortSignal;
}

const DEFAULT_BASE = "https://kdata.kxxseop.workers.dev/api/v1/holidays";
const TIMEOUT_MS = 10000;
const MIN_YEAR = 2004;
const MAX_YEAR_SPAN = 100;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

type CacheEntry = { data: Holiday[]; expiresAt: number };
const memoryCache = new Map<string, CacheEntry>();

const cacheKey = (baseUrl: string, year: number) => `${baseUrl}::${year}`;

const resolveBaseUrl = (override?: string): string => {
  const raw =
    override ??
    (typeof process !== "undefined"
      ? process.env?.HOLIDAYS_KR_BASE_URL
      : undefined) ??
    DEFAULT_BASE;
  return raw.replace(/(?<!\/)\/+$/, "");
};

const fetchYear = async (
  baseUrl: string,
  year: number,
  signal: AbortSignal
): Promise<Holiday[]> => {
  const key = cacheKey(baseUrl, year);
  const hit = memoryCache.get(key);
  if (hit && hit.expiresAt > Date.now()) return hit.data;

  const response = await fetch(`${baseUrl}/${year}.json`, {
    method: "GET",
    signal,
  });

  if (response.status === 404) {
    memoryCache.set(key, { data: [], expiresAt: Date.now() + CACHE_TTL_MS });
    return [];
  }
  if (!response.ok) {
    throw new Error("Failed to fetch holiday data");
  }

  const payload: { data?: Holiday[] } = await response.json();
  const data = Array.isArray(payload?.data) ? payload.data : [];
  memoryCache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
  return data;
};

export const clearCache = (): void => {
  memoryCache.clear();
};

export const holidays = async (
  year: string,
  year2?: string,
  options?: HolidaysOptions
): Promise<HolidayResponse> => {
  if (year2 === "") year2 = undefined;

  if (
    typeof year !== "string" ||
    year.length !== 4 ||
    (year2 && year2.length !== 4) ||
    !/^\d+$/.test(year) ||
    (year2 && !/^\d+$/.test(year2))
  ) {
    return {
      success: false,
      message: "Please enter the year correctly.",
      data: [],
    };
  }

  const yearNum = parseInt(year, 10);
  const year2Num = year2 ? parseInt(year2, 10) : undefined;

  if (yearNum < MIN_YEAR || (year2Num !== undefined && year2Num < MIN_YEAR)) {
    return {
      success: false,
      message: "Invalid input range. We provide data from 2004 onwards.",
      data: [],
    };
  }

  if (year2Num !== undefined && year2Num < yearNum) {
    return {
      success: false,
      message: "The end year must be greater than or equal to the start year.",
      data: [],
    };
  }

  if (year2Num !== undefined && year2Num - yearNum > MAX_YEAR_SPAN) {
    return {
      success: false,
      message: `The year range is too large. The maximum span is ${MAX_YEAR_SPAN} years.`,
      data: [],
    };
  }

  try {
    const baseUrl = resolveBaseUrl(options?.baseUrl);
    const start = yearNum;
    const end = year2Num ?? yearNum;
    const signal = options?.signal ?? AbortSignal.timeout(TIMEOUT_MS);

    const years: number[] = [];
    for (let y = start; y <= end; y++) years.push(y);

    const buckets = await Promise.all(
      years.map((y) => fetchYear(baseUrl, y, signal))
    );

    return {
      success: true,
      message: "Success",
      data: buckets.flat(),
    };
  } catch (error) {
    return error instanceof Error
      ? {
          success: false,
          message: error.message,
          data: [],
        }
      : {
          success: false,
          message: "Unknown error",
          data: [],
        };
  }
};
