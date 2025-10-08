export const holidays = async (year: string, year2?: string) => {
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

  if (year < "2004" || (year2 && year2 < "2004")) {
    return {
      success: false,
      message: "Invalid input range. We provides data from 2004 onwards.",
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
      }
    );

    if (!response.ok) {
      return {
        success: false,
        message: "Failed to fetch holiday data",
        data: [],
      };
    }

    const result = await response.json();

    return {
      success: true,
      message: "Success",
      data: result.data,
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
