import { holidays } from "../src";

const ok = (year: number, data: Array<{ date: number; name: string }>) =>
  ({
    ok: true,
    status: 200,
    json: async () => ({ year, data }),
  }) as Response;

const notFound = () =>
  ({
    ok: false,
    status: 404,
    json: async () => ({ error: "Not Found" }),
  }) as Response;

const serverError = (status = 500) =>
  ({
    ok: false,
    status,
    json: async () => ({ error: "Server Error" }),
  }) as Response;

describe("holidays (v2)", () => {
  let fetchSpy: jest.SpyInstance;
  const originalEnv = process.env.HOLIDAYS_KR_BASE_URL;

  beforeEach(() => {
    fetchSpy = jest.spyOn(global, "fetch");
    delete process.env.HOLIDAYS_KR_BASE_URL;
  });

  afterEach(() => {
    fetchSpy.mockRestore();
    if (originalEnv === undefined) {
      delete process.env.HOLIDAYS_KR_BASE_URL;
    } else {
      process.env.HOLIDAYS_KR_BASE_URL = originalEnv;
    }
  });

  describe("입력 검증", () => {
    it("4자리 숫자가 아니면 TypeError", async () => {
      await expect(holidays("20a4")).rejects.toThrow(TypeError);
      await expect(holidays("20")).rejects.toThrow(TypeError);
      await expect(holidays("20250")).rejects.toThrow(TypeError);
    });

    it("year2가 4자리 숫자가 아니면 TypeError", async () => {
      await expect(holidays("2024", "20")).rejects.toThrow(TypeError);
    });

    it("2004 미만이면 RangeError", async () => {
      await expect(holidays("2003")).rejects.toThrow(RangeError);
      await expect(holidays(2003)).rejects.toThrow(RangeError);
    });

    it("year2가 2004 미만이면 RangeError", async () => {
      await expect(holidays("2010", "2003")).rejects.toThrow(RangeError);
    });

    it("year2 < year 이면 RangeError", async () => {
      await expect(holidays("2020", "2010")).rejects.toThrow(RangeError);
    });

    it('year2 = "" 는 undefined 로 처리 (v1 호환)', async () => {
      fetchSpy.mockResolvedValueOnce(ok(2024, []));
      await expect(holidays("2024", "")).resolves.toEqual([]);
      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });

    it("number 타입 year 입력 정상 동작", async () => {
      fetchSpy.mockResolvedValueOnce(ok(2025, [{ date: 20250101, name: "1월1일" }]));
      const result = await holidays(2025);
      expect(result).toEqual([{ date: 20250101, name: "1월1일" }]);
    });

    it("4자리 미만 number(예: 999) 는 TypeError", async () => {
      await expect(holidays(999)).rejects.toThrow(TypeError);
    });
  });

  describe("정상 호출", () => {
    it("단일 연도 GET 요청, 응답 data 반환", async () => {
      const items = [
        { date: 20250101, name: "1월1일" },
        { date: 20250303, name: "삼일절" },
      ];
      fetchSpy.mockResolvedValueOnce(ok(2025, items));

      const result = await holidays("2025");

      expect(result).toEqual(items);
      expect(fetchSpy).toHaveBeenCalledTimes(1);
      const [url, init] = fetchSpy.mock.calls[0];
      expect(url).toBe("https://kdata.vercel.app/api/v1/holidays/2025.json");
      expect(init.method).toBe("GET");
    });

    it("범위 호출 시 연도별 GET 후 데이터를 시간순으로 머지", async () => {
      fetchSpy
        .mockResolvedValueOnce(ok(2024, [{ date: 20240101, name: "1월1일" }]))
        .mockResolvedValueOnce(ok(2025, [{ date: 20250101, name: "1월1일" }]))
        .mockResolvedValueOnce(ok(2026, [{ date: 20260101, name: "1월1일" }]));

      const result = await holidays("2024", "2026");

      expect(result.map((h) => h.date)).toEqual([20240101, 20250101, 20260101]);
      expect(fetchSpy).toHaveBeenCalledTimes(3);
      const calledUrls = fetchSpy.mock.calls.map((c) => c[0]);
      expect(calledUrls).toEqual([
        "https://kdata.vercel.app/api/v1/holidays/2024.json",
        "https://kdata.vercel.app/api/v1/holidays/2025.json",
        "https://kdata.vercel.app/api/v1/holidays/2026.json",
      ]);
    });

    it("payload.data 가 누락된 응답은 빈 배열로 취급", async () => {
      fetchSpy.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ year: 2025 }),
      } as Response);
      const result = await holidays("2025");
      expect(result).toEqual([]);
    });
  });

  describe("404 처리", () => {
    it("단일 연도 404 시 빈 배열", async () => {
      fetchSpy.mockResolvedValueOnce(notFound());
      const result = await holidays("2099");
      expect(result).toEqual([]);
    });

    it("범위 중간 연도 404 는 빈 배열로 머지, 다른 연도 데이터는 유지", async () => {
      fetchSpy
        .mockResolvedValueOnce(ok(2025, [{ date: 20250101, name: "1월1일" }]))
        .mockResolvedValueOnce(notFound())
        .mockResolvedValueOnce(ok(2027, [{ date: 20270101, name: "1월1일" }]));

      const result = await holidays("2025", "2027");
      expect(result.map((h) => h.date)).toEqual([20250101, 20270101]);
    });
  });

  describe("baseUrl 오버라이드", () => {
    it("options.baseUrl 가 환경변수/기본값보다 우선", async () => {
      process.env.HOLIDAYS_KR_BASE_URL = "https://env.example.com";
      fetchSpy.mockResolvedValueOnce(ok(2025, []));

      await holidays("2025", undefined, {
        baseUrl: "https://opt.example.com",
      });

      expect(fetchSpy.mock.calls[0][0]).toBe(
        "https://opt.example.com/api/v1/holidays/2025.json",
      );
    });

    it("HOLIDAYS_KR_BASE_URL 환경변수가 기본값을 대체", async () => {
      process.env.HOLIDAYS_KR_BASE_URL = "https://env.example.com";
      fetchSpy.mockResolvedValueOnce(ok(2025, []));

      await holidays("2025");

      expect(fetchSpy.mock.calls[0][0]).toBe(
        "https://env.example.com/api/v1/holidays/2025.json",
      );
    });

    it("baseUrl 끝의 trailing slash 는 정규화", async () => {
      fetchSpy.mockResolvedValueOnce(ok(2025, []));

      await holidays("2025", undefined, {
        baseUrl: "https://opt.example.com//",
      });

      expect(fetchSpy.mock.calls[0][0]).toBe(
        "https://opt.example.com/api/v1/holidays/2025.json",
      );
    });
  });

  describe("AbortSignal", () => {
    it("options.signal 이 fetch 에 그대로 전달", async () => {
      const controller = new AbortController();
      fetchSpy.mockResolvedValueOnce(ok(2025, []));

      await holidays("2025", undefined, { signal: controller.signal });

      const [, init] = fetchSpy.mock.calls[0];
      expect(init.signal).toBe(controller.signal);
    });

    it("signal 미지정 시 기본 timeout signal 사용 (AbortSignal 인스턴스)", async () => {
      fetchSpy.mockResolvedValueOnce(ok(2025, []));

      await holidays("2025");

      const [, init] = fetchSpy.mock.calls[0];
      expect(init.signal).toBeInstanceOf(AbortSignal);
    });

    it("이미 abort 된 signal 은 fetch 에 그대로 전달되어 reject", async () => {
      const controller = new AbortController();
      controller.abort(new Error("aborted by test"));
      fetchSpy.mockImplementationOnce((_url: string, init: RequestInit) => {
        if (init.signal?.aborted) {
          return Promise.reject(init.signal.reason);
        }
        return Promise.resolve(ok(2025, []));
      });

      await expect(
        holidays("2025", undefined, { signal: controller.signal }),
      ).rejects.toThrow("aborted by test");
    });
  });

  describe("HTTP 에러", () => {
    it("5xx 응답은 Error throw", async () => {
      fetchSpy.mockResolvedValueOnce(serverError(500));
      await expect(holidays("2025")).rejects.toThrow(/HTTP 500/);
    });

    it("network 에러는 그대로 propagate", async () => {
      fetchSpy.mockRejectedValueOnce(new Error("Network Error"));
      await expect(holidays("2025")).rejects.toThrow("Network Error");
    });
  });
});
