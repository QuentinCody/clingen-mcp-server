import { afterEach, expect, it, vi } from "vitest";
import { readClinGenFeed } from "./feed-http";

afterEach(() => vi.useRealTimers());
it.each(["fetch", "stream"])("bounds a non-cooperating %s without awaiting cancellation", async stage => {
  vi.useFakeTimers();
  const cancel = vi.fn(() => new Promise<void>(() => {}));
  const fetcher = stage === "fetch" ? (() => new Promise<Response>(() => {})) : (async () => new Response(new ReadableStream({ cancel })));
  const work = expect(readClinGenFeed("https://fixture.test", "text/csv", "Fixture", fetcher)).rejects.toMatchObject({ status: 504 });
  await vi.advanceTimersByTimeAsync(30_000); await work;
  if (stage === "stream") expect(cancel).toHaveBeenCalledOnce();
  expect(vi.getTimerCount()).toBe(0);
});
it.each([206, 302, 429])("retains native HTTP %s error evidence and rejects incomplete representations", async status => {
  const work = readClinGenFeed("https://fixture.test", "text/csv", "Fixture", async () => new Response("α unavailable", { status, headers: { "retry-after": "60" } }));
  await expect(work).rejects.toMatchObject({ status: status === 206 ? 502 : status,
    data: { body: "α unavailable", http_status: status, retry_after: "60", response_sha256: expect.stringMatching(/^[a-f0-9]{64}$/) } });
});
it("rejects a Content-Range response even with HTTP 200", async () => {
  await expect(readClinGenFeed("https://fixture.test", "text/csv", "Fixture", async () => new Response("partial", { headers: { "content-range": "bytes 0-6/10" } }))).rejects.toMatchObject({ status: 502 });
});
