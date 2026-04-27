export interface Holiday {
  date: number;
  name: string;
}

export interface HolidaysOptions {
  baseUrl?: string;
  signal?: AbortSignal;
}

const DEFAULT_BASE_URL = "https://kdata.vercel.app";
const DEFAULT_TIMEOUT_MS = 10000;
const MIN_YEAR = 2004;

const toYearNumber = (input: string | number, label: string): number => {
  const str = typeof input === "number" ? String(input) : input;
  if (typeof str !== "string" || !/^\d{4}$/.test(str)) {
    throw new TypeError(
      `${label} must be a 4-digit year (string or number). received: ${JSON.stringify(input)}`,
    );
  }
  const num = parseInt(str, 10);
  if (num < MIN_YEAR) {
    throw new RangeError(
      `${label} must be ${MIN_YEAR} or later. received: ${num}`,
    );
  }
  return num;
};

const stripTrailingSlashes = (url: string): string => {
  let i = url.length;
  while (i > 0 && url.charCodeAt(i - 1) === 47) i--;
  return url.slice(0, i);
};

const resolveBaseUrl = (options?: HolidaysOptions): string => {
  if (options?.baseUrl) return stripTrailingSlashes(options.baseUrl);
  const envUrl =
    typeof process !== "undefined"
      ? process.env?.HOLIDAYS_KR_BASE_URL
      : undefined;
  return stripTrailingSlashes(
    envUrl && envUrl.length > 0 ? envUrl : DEFAULT_BASE_URL,
  );
};

const fetchYear = async (
  year: number,
  baseUrl: string,
  signal: AbortSignal,
): Promise<Holiday[]> => {
  const response = await fetch(`${baseUrl}/api/v1/holidays/${year}.json`, {
    method: "GET",
    signal,
  });

  if (response.status === 404) return [];

  if (!response.ok) {
    throw new Error(
      `Failed to fetch holidays for ${year}: HTTP ${response.status}`,
    );
  }

  const payload = (await response.json()) as {
    year?: number;
    data?: Holiday[];
  };
  return Array.isArray(payload.data) ? payload.data : [];
};

export const holidays = async (
  year: string | number,
  year2?: string | number,
  options?: HolidaysOptions,
): Promise<Holiday[]> => {
  const normalizedYear2 =
    year2 === "" || year2 === undefined ? undefined : year2;

  const start = toYearNumber(year, "year");
  const end =
    normalizedYear2 !== undefined
      ? toYearNumber(normalizedYear2, "year2")
      : start;

  if (end < start) {
    throw new RangeError(
      `year2 must be greater than or equal to year. received: year=${start}, year2=${end}`,
    );
  }

  const baseUrl = resolveBaseUrl(options);
  const signal = options?.signal ?? AbortSignal.timeout(DEFAULT_TIMEOUT_MS);

  const years: number[] = [];
  for (let y = start; y <= end; y++) years.push(y);

  const buckets = await Promise.all(
    years.map((y) => fetchYear(y, baseUrl, signal)),
  );

  return buckets.flat();
};
