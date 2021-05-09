declare global {
	namespace NodeJS {
		interface ProcessEnv {
			NODE_ENV: "development" | "production";
			CHECK_GUILD: string;
			FEEDBACK_CHANNEL: string;
		}
	}
}

export {};
