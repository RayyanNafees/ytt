import { fetchTranscript } from "youtube-transcript-plus";
import { Hono } from "hono";

const app = new Hono();

app.get("/", (c) =>
  c.text(
    "Download Youtube video transcript by \n ytt.deno.dev/<video_id_or_url>",
  ),
);

app.get("/*", async (c) => {
  const video = c.req.query("v");
  const raw = c.req.query("raw");
  const txt = c.req.query("txt");
  const text = txt || c.req.query("text");

  if (video) {
    try {
      const then = Date.now();
      if (!raw) {
        const transcript = await fetchTranscript(video).then((r) =>
          r.map((i) => i.text).join(" "),
        );
        const secondsTook = (Date.now() - then) / 1000;
        return text
          ? c.text(transcript)
          : c.json({
              ok: true,
              transcript,
              secondsTook,
              length: transcript.length,
              video,
            });
      }
      const transcript = await fetchTranscript(video);
      const secondsTook = (Date.now() - then) / 1000;
      return c.json({
        ok: true,
        transcript,
        secondsTook,
        length: transcript.length,
        video,
      });
    } catch (e) {
      return c.json({
        ok: false,
        message: "Error Transcribing Video: " + e,
        video,
      });
    }
  }
  return c.json({
    ok: false,
    video,
    message: "Video not found",
  });
});

export default app;
