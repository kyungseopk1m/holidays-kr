import { holidays } from "../src";

const ok = (data: Array<{ date: number; name: string }>) =>
  ({
    ok: true,
    status: 200,
    json: async () => ({ data }),
  }) as Response;

describe("holidays", () => {
  let fetchSpy: jest.SpyInstance;

  beforeEach(() => {
    fetchSpy = jest.spyOn(global, "fetch");
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it("should return an error if the year is not 4 digits or contains non-numeric characters", async () => {
    const result = await holidays("20a4");
    expect(result).toEqual({
      success: false,
      message: "Please enter the year correctly.",
      data: [],
    });
  });

  it("should return an error if the year is before 2004", async () => {
    const result = await holidays("2003");
    expect(result).toEqual({
      success: false,
      message: "Invalid input range. We provide data from 2004 onwards.",
      data: [],
    });
  });

  it("should return success and data if the API call is successful", async () => {
    const items = [{ date: 20240101, name: "1월1일" }];
    fetchSpy.mockResolvedValueOnce(ok(items));

    const result = await holidays("2024");
    expect(result).toEqual({
      success: true,
      message: "Success",
      data: items,
    });
  });

  it("should return an error if the API call fails", async () => {
    fetchSpy.mockRejectedValueOnce(new Error("Network Error"));

    const result = await holidays("2024");
    expect(result).toEqual({
      success: false,
      message: "Network Error",
      data: [],
    });
  });

  it("should return an error if year2 is not 4 digits", async () => {
    const result = await holidays("2024", "20");
    expect(result).toEqual({
      success: false,
      message: "Please enter the year correctly.",
      data: [],
    });
  });

  it("should return an error if year2 is before 2004", async () => {
    const result = await holidays("2004", "2003");
    expect(result).toEqual({
      success: false,
      message: "Invalid input range. We provide data from 2004 onwards.",
      data: [],
    });
  });

  it("should return an error if year2 is less than year", async () => {
    const result = await holidays("2020", "2010");
    expect(result).toEqual({
      success: false,
      message: "The end year must be greater than or equal to the start year.",
      data: [],
    });
  });

  it("should return success with year2 parameter (data merged across years)", async () => {
    const items2020 = [{ date: 20200101, name: "1월1일" }];
    const items2021 = [{ date: 20210101, name: "1월1일" }];
    fetchSpy
      .mockResolvedValueOnce(ok(items2020))
      .mockResolvedValueOnce(ok(items2021));

    const result = await holidays("2020", "2021");
    expect(result).toEqual({
      success: true,
      message: "Success",
      data: [...items2020, ...items2021],
    });
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it("should return an error if a non-Error is thrown", async () => {
    fetchSpy.mockRejectedValueOnce("string error");

    const result = await holidays("2024");
    expect(result).toEqual({
      success: false,
      message: "Unknown error",
      data: [],
    });
  });

  it("should handle timeout errors", async () => {
    const abortError = new Error("The operation was aborted due to timeout");
    abortError.name = "TimeoutError";
    fetchSpy.mockRejectedValueOnce(abortError);

    const result = await holidays("2024");
    expect(result).toEqual({
      success: false,
      message: "The operation was aborted due to timeout",
      data: [],
    });
  });

  it("should treat empty string year2 as undefined", async () => {
    const items = [{ date: 20240101, name: "1월1일" }];
    fetchSpy.mockResolvedValueOnce(ok(items));

    const result = await holidays("2024", "");
    expect(result).toEqual({
      success: true,
      message: "Success",
      data: items,
    });
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it("should return an error if the API returns a non-200 status", async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: false,
      status: 500,
    } as Response);

    const result = await holidays("2024");
    expect(result).toEqual({
      success: false,
      message: "Failed to fetch holiday data",
      data: [],
    });
  });

  it("should treat 404 as empty data (success)", async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: false,
      status: 404,
    } as Response);

    const result = await holidays("2099");
    expect(result).toEqual({
      success: true,
      message: "Success",
      data: [],
    });
  });
});
