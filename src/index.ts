export interface Holiday {
  date: number;
  name: string;
}

export type HolidayResponse =
  | { success: true; message: string; data: Holiday[] }
  | { success: false; message: string; data: Holiday[] };

const ENDPOINT = "https://kdata.vercel.app/api/v1/holidays";
const TIMEOUT_MS = 10000;
const MIN_YEAR = 2004;

const fetchYear = async (
  year: number,
  signal: AbortSignal
): Promise<Holiday[]> => {
  const response = await fetch(`${ENDPOINT}/${year}.json`, {
    method: "GET",
    signal,
  });

  if (response.status === 404) return [];
  if (!response.ok) {
    throw new Error("Failed to fetch holiday data");
  }

  const payload: { data?: Holiday[] } = await response.json();
  return Array.isArray(payload?.data) ? payload.data : [];
};

export const holidays = async (
  year: string,
  year2?: string
): Promise<HolidayResponse> => {
  if (year2 === "") year2 = undefined;

  if (
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

  try {
    const start = yearNum;
    const end = year2Num ?? yearNum;
    const signal = AbortSignal.timeout(TIMEOUT_MS);

    const years: number[] = [];
    for (let y = start; y <= end; y++) years.push(y);

    const buckets = await Promise.all(
      years.map((y) => fetchYear(y, signal))
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
