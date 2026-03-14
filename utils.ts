import {
	YoutubeTranscriptVideoUnavailableError,
	YoutubeTranscriptDisabledError,
	YoutubeTranscriptNotAvailableError,
	YoutubeTranscriptNotAvailableLanguageError,
} from "youtube-transcript-plus";

export const handleFetchTranscriptError = (error: Error) => {
	if (error instanceof YoutubeTranscriptVideoUnavailableError) {
		console.error("Video is unavailable:", error.videoId);
	} else if (error instanceof YoutubeTranscriptDisabledError) {
		console.error("Transcripts are disabled:", error.videoId);
	} else if (error instanceof YoutubeTranscriptNotAvailableError) {
		console.error("No transcript available:", error.videoId);
	} else if (error instanceof YoutubeTranscriptNotAvailableLanguageError) {
		console.error("Language not available:", error.lang, error.availableLangs);
	} else {
		console.error("An unexpected error occurred:", error.message);
	}
};

export class _CustomCache implements CacheStrategy {
	private kv!: Deno.Kv;

	private constructor(kv: Deno.Kv) {
		this.kv = kv;
	}

	static async create(): Promise<CustomCache> {
		const kv = await Deno.openKv();
		return new CustomCache(kv);
	}

	async get(key: string): Promise<string | null> {
		console.log("KV get");
		return (await this.kv.get([key])).value as string | null;
	}

	async set(key: string, value: string, ttl?: number): Promise<void> {
		await this.kv.set([key], value, ttl ? { expireIn: ttl } : undefined);
		console.log("KV SET:", key, "->", value.slice(0, 5), "...");
	}
}
