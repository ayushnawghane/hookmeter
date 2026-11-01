/* eslint-disable @typescript-eslint/no-explicit-any -- raw Redis JSON */
// Upstash Redis over its REST API (no SDK). Kept free of next/cache so proxy.ts can use it.

const url = () => process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
const token = () => process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;

export const redisEnabled = () => Boolean(url() && token());

export async function redis(...command: (string | number)[]): Promise<any> {
  const res = await fetch(url()!, {
    method: "POST",
    headers: { authorization: `Bearer ${token()}`, "content-type": "application/json" },
    body: JSON.stringify(command),
    cache: "no-store",
  });
  const body = await res.json();
  if (body.error) throw new Error(`Redis: ${body.error}`);
  return body.result;
}
