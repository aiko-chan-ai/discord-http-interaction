declare function DiscordHTTPInteraction(
	express,
	options: Option,
	callback: callback,
) {
    return express;
};

interface Option {
    publicKey: string;
    port?: number;
}

declare function callback(interactionRaw: object) {}

export = DiscordHTTPInteraction;