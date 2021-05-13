declare global {
	namespace NodeJS {
		interface ProcessEnv {
			NODE_ENV: "development" | "production";
			CHECK_GUILD: string;
			FEEDBACK_CHANNEL: string;
			ARCHIVE_CHANNEL: string;
			CMD_PREFIX: string;
		}
	}
}

export {};
