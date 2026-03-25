export interface Holiday {
  date: number;
  name: string;
}

export type HolidayResponse =
  | { success: true; message: string; data: Holiday[] }
  | { success: false; message: string; data: Holiday[] };

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

  if (yearNum < 2004 || (year2Num !== undefined && year2Num < 2004)) {
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
    const response = await fetch(
      "https://scheduler-getholidaydate-lkny2xhv4a-du.a.run.app",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          year,
          year2,
        }),
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!response.ok) {
      return {
        success: false,
        message: "Failed to fetch holiday data",
        data: [],
      };
    }

    const result: { data?: Holiday[] } = await response.json();

    return {
      success: true,
      message: "Success",
      data: result?.data ?? [],
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
