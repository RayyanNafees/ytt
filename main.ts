import { fetchTranscript, CacheStrategy } from "youtube-transcript-plus";
import { Hono } from "hono";
import { CustomCache, handleFetchTranscriptError } from "./utils.ts";

// Add CustomCache in fetchTrascript options
// Reference: https://www.npmjs.com/package/youtube-transcript-plus#custom-caching
// { cache: await new CustomCache.create() }

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


	try {
		const then = Date.now();
		const transcript = await fetchTranscript(video, { lang: "en" }).catch(
			handleFetchTranscriptError,
		);
		const secondsTook = (Date.now() - then) / 1000;

		if (raw) {
			return c.json({
				ok: true,
				transcript,
				secondsTook,
				length: transcript.length,
				video,
			});
		}
		const textTrascript = transcript.map((i) => i.text).join(" ");
		return text
			? c.text(textTrascript)
			: c.json({
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
});

export default app;
