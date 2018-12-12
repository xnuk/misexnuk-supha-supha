import { createClient } from 'redis'

const getEnv = (key: string): string => {
	const res = process.env[key]
	if (res == null || res === '') throw "There's no " + key
	return res
}

const callback = <T>(
	resolve: (reply: T) => void,
	reject: (err: Error) => void,
) => (
	err: Error | null,
	reply: T,
): void => err ? reject(err) : resolve(reply)

export const Redis = () => {
	const client = createClient({
		host: getEnv('REDIS_HOST'),
		port: +getEnv('REDIS_PORT'),
		prefix: getEnv('REDIS_PREFIX') + ':',
	})

	return {
		get: (key: string): Promise<string> => new Promise((res, rej) =>
			client.get(key, callback(res, rej))
		),

		set: (
			key: string,
			value: string,
			expireSeconds?: number,
		): Promise<'OK' | undefined> => new Promise((res, rej) =>
			expireSeconds == null
				? client.set(
					key, value,
					callback(res, rej),
				)
				: client.set(
					key, value, 'ex', expireSeconds,
					callback(res, rej),
				)
		),

		hset: (
			key: string,
			field: string,
			value: string,
		): Promise<number> => new Promise((res, rej) =>
			client.hset(
				key, field, value,
				callback(res, rej),
			)
		),

		quit: (cb: () => void) => client.quit(cb)
	}
}
