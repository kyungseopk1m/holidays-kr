import { holidays, clearCache } from "../src";

const ok = (data: Array<{ date: number; name: string }>) =>
  ({
    ok: true,
    status: 200,
    json: async () => ({ data }),
  }) as Response;

describe("holidays", () => {
  let fetchSpy: jest.SpyInstance;

  beforeEach(() => {
    clearCache();
    delete process.env.HOLIDAYS_KR_BASE_URL;
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

  it("should return an error (not throw) if year is null or undefined", async () => {
    const fromNull = await holidays(null as unknown as string);
    const fromUndefined = await holidays(undefined as unknown as string);
    const expected = {
      success: false,
      message: "Please enter the year correctly.",
      data: [],
    };
    expect(fromNull).toEqual(expected);
    expect(fromUndefined).toEqual(expected);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("should return an error and not fetch when the year range is too large", async () => {
    const result = await holidays("2004", "9999");
    expect(result.success).toBe(false);
    expect(result.message).toContain("range is too large");
    expect(fetchSpy).not.toHaveBeenCalled();
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

describe("holidays — baseUrl resolution", () => {
  let fetchSpy: jest.SpyInstance;

  beforeEach(() => {
    clearCache();
    delete process.env.HOLIDAYS_KR_BASE_URL;
    fetchSpy = jest.spyOn(global, "fetch");
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it("should use options.baseUrl when provided", async () => {
    fetchSpy.mockResolvedValueOnce(ok([{ date: 20240101, name: "1월1일" }]));

    await holidays("2024", undefined, {
      baseUrl: "https://my-mirror.example.com/api",
    });

    expect(fetchSpy).toHaveBeenCalledWith(
      "https://my-mirror.example.com/api/2024.json",
      expect.objectContaining({ method: "GET" })
    );
  });

  it("should use HOLIDAYS_KR_BASE_URL env when option not provided", async () => {
    process.env.HOLIDAYS_KR_BASE_URL = "https://env-mirror.example.com/api";
    fetchSpy.mockResolvedValueOnce(ok([{ date: 20240101, name: "1월1일" }]));

    await holidays("2024");

    expect(fetchSpy).toHaveBeenCalledWith(
      "https://env-mirror.example.com/api/2024.json",
      expect.any(Object)
    );
  });

  it("should prefer options.baseUrl over env", async () => {
    process.env.HOLIDAYS_KR_BASE_URL = "https://env-mirror.example.com/api";
    fetchSpy.mockResolvedValueOnce(ok([{ date: 20240101, name: "1월1일" }]));

    await holidays("2024", undefined, {
      baseUrl: "https://option-mirror.example.com/api",
    });

    expect(fetchSpy).toHaveBeenCalledWith(
      "https://option-mirror.example.com/api/2024.json",
      expect.any(Object)
    );
  });

  it("should strip trailing slashes from baseUrl", async () => {
    fetchSpy.mockResolvedValueOnce(ok([{ date: 20240101, name: "1월1일" }]));

    await holidays("2024", undefined, {
      baseUrl: "https://my-mirror.example.com/api///",
    });

    expect(fetchSpy).toHaveBeenCalledWith(
      "https://my-mirror.example.com/api/2024.json",
      expect.any(Object)
    );
  });

  it("should use options.signal when provided", async () => {
    const controller = new AbortController();
    fetchSpy.mockResolvedValueOnce(ok([{ date: 20240101, name: "1월1일" }]));

    await holidays("2024", undefined, { signal: controller.signal });

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ signal: controller.signal })
    );
  });
});

describe("holidays — in-memory cache", () => {
  let fetchSpy: jest.SpyInstance;

  beforeEach(() => {
    clearCache();
    delete process.env.HOLIDAYS_KR_BASE_URL;
    fetchSpy = jest.spyOn(global, "fetch");
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it("should fetch the same year only once on repeat calls", async () => {
    const items = [{ date: 20240101, name: "1월1일" }];
    fetchSpy.mockResolvedValueOnce(ok(items));

    const first = await holidays("2024");
    const second = await holidays("2024");

    expect(first).toEqual(second);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it("should cache 404 responses (no refetch for non-existent year)", async () => {
    fetchSpy.mockResolvedValueOnce({ ok: false, status: 404 } as Response);

    const first = await holidays("2099");
    const second = await holidays("2099");

    expect(first).toEqual(second);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it("should treat different baseUrls as separate cache entries", async () => {
    fetchSpy
      .mockResolvedValueOnce(ok([{ date: 20240101, name: "A" }]))
      .mockResolvedValueOnce(ok([{ date: 20240101, name: "B" }]));

    const a = await holidays("2024", undefined, {
      baseUrl: "https://a.example.com",
    });
    const b = await holidays("2024", undefined, {
      baseUrl: "https://b.example.com",
    });

    expect(a.data[0].name).toBe("A");
    expect(b.data[0].name).toBe("B");
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it("clearCache() should force refetch", async () => {
    const items = [{ date: 20240101, name: "1월1일" }];
    fetchSpy
      .mockResolvedValueOnce(ok(items))
      .mockResolvedValueOnce(ok(items));

    await holidays("2024");
    clearCache();
    await holidays("2024");

    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });
});
