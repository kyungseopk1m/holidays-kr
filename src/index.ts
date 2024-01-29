import axios from "axios";

export const holidays = async (year: string, year2?: string) => {
    if (year.length !== 4 || (year2 && year2.length !== 4)) {
        return {
            success: false,
            message: 'Please enter the year correctly.',
            data: [],
        }
    }

    if (year < '2004' || (year2 && year2 < '2004')) {
        return {
            success: false,
            message: 'Invalid input range. We provides data from 2004 onwards.',
            data: [],
        }
    }

    try {
        const result = await axios.post('https://scheduler-getholidaydate-lkny2xhv4a-du.a.run.app', {
            year,
            year2,
        });
        if (result.status !== 200) {
            return {
                success: false,
                message: 'Failed to fetch holiday data',
                data: [],
            }
        } else {
            return {
                success: true,
                message: 'Success',
                data: result.data.data,
            }
        }
    } catch (error) {
        return error instanceof Error ?
            {
                success: false,
                message: error.message,
                data: [],
            } :
            {
                success: false,
                message: 'Unknown error',
                data: [],
            }
    }
}