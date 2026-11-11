/** Bound the entire fetch/body lifetime, including non-cooperating streams. */
export async function readClinGenFeed(url: string, accept: string, label: string, fetcher: typeof fetch) {
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const deadline = new Promise<never>((_resolve, reject) => {
    timer = setTimeout(() => {
      const error = Object.assign(new Error(`${label} timed out after 30 seconds`), { status: 504 });
      controller.abort(error); reject(error);
    }, 30_000);
  });
  try {
    return await Promise.race([deadline, (async () => {
      const response = await fetcher(url, { headers: { Accept: accept, "User-Agent": "clingen-mcp-server/1.0" },
        method: "GET", signal: controller.signal, redirect: "manual" });
      if (controller.signal.aborted) { void response.body?.cancel().catch(() => undefined); controller.signal.throwIfAborted(); }
      const reader = response.body?.getReader();
      if (!reader) throw new Error(`${label} response is empty`);
      const cancel = () => { void reader.cancel().catch(() => undefined); };
      controller.signal.addEventListener("abort", cancel, { once: true });
      return await readFeedBody(reader, controller, label, cancel, url, response);
    })()]);
  } finally { clearTimeout(timer); controller.abort(); }
}

async function readFeedBody(reader: ReadableStreamDefaultReader<Uint8Array<ArrayBufferLike>>, controller: AbortController, label: string, cancel: () => void, url: string, response: Response) {
  const decoder = new TextDecoder("utf-8", { fatal: true, ignoreBOM: true });
  let text = "";
  let bytes = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      controller.signal.throwIfAborted();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > 8000000) throw new Error(`${label} exceeds the 8MB retrieval limit`);
      text += decoder.decode(value, { stream: true });
    }
    text += decoder.decode();
  } finally { controller.signal.removeEventListener("abort", cancel); cancel(); }
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  const response_sha256 = Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, "0")).join("");
  const observation = { source_url: url, retrieved_at: new Date().toISOString(), http_status: response.status, response_sha256 };
  if (response.status !== 200 || response.headers.has("content-range")) {
    throw Object.assign(new Error(`${label} HTTP ${response.status}: expected a complete 200 response`), {
      status: response.ok ? 502 : response.status,
      data: { body: text, retry_after: response.headers.get("retry-after"), ...observation },
    });
  }
  return { response, text, ...observation };
}
