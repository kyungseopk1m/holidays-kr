import axios from 'axios';
import { holidays } from '../src';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('holidays', () => {
    it('should return an error if the year is not 4 digits or contains non-numeric characters', async () => {
        const result = await holidays('20a4');
        expect(result).toEqual({
            success: false,
            message: 'Please enter the year correctly.',
            data: [],
        });
    });

    it('should return an error if the year is before 2004', async () => {
        const result = await holidays('2003');
        expect(result).toEqual({
            success: false,
            message: 'Invalid input range. We provides data from 2004 onwards.',
            data: [],
        });
    });

    it('should return success and data if the API call is successful', async () => {
        const mockData = { data: { data: ['holiday1', 'holiday2'] } };
        mockedAxios.post.mockResolvedValueOnce({
            status: 200,
            data: mockData,
        });

        const result = await holidays('2024');
        expect(result).toEqual({
            success: true,
            message: 'Success',
            data: mockData.data,
        });
    });

    it('should return an error if the API call fails', async () => {
        mockedAxios.post.mockRejectedValueOnce(new Error('Network Error'));

        const result = await holidays('2024');
        expect(result).toEqual({
            success: false,
            message: 'Network Error',
            data: [],
        });
    });

    it('should return an error if the API returns a non-200 status', async () => {
        mockedAxios.post.mockResolvedValueOnce({
            status: 500,
            data: {},
        });

        const result = await holidays('2024');
        expect(result).toEqual({
            success: false,
            message: 'Failed to fetch holiday data',
            data: [],
        });
    });
});