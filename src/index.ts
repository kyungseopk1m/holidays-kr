import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const { AXIOS_URL } = process.env;

export const holidays = async (year: string, year2?: string) => {
    if (year.length !== 4 || (year2 && year2.length !== 4)) {
        return {
            success: false,
            message: 'Please enter the year correctly.',
            data: [],
        }
    }

    try {
        const result = await axios.post(AXIOS_URL as string, {
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
                data: result.data,
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