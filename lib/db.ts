import 'server-only';
type Row = Record<string, any>;
export class Statement {
  constructor(private sql: string, private params: unknown[] = []) {}
  bind(...params: unknown[]) { return new Statement(this.sql, params); }
  async all<T = Row>(): Promise<{ results: T[]; success: boolean }> {
    const account = process.env.CLOUDFLARE_ACCOUNT_ID;
    const database = process.env.CLOUDFLARE_D1_DATABASE_ID;
    const token = process.env.CLOUDFLARE_API_TOKEN;
    if (!account || !database || !token) throw Error('Database configuration is missing.');
    const response = await fetch('https://api.cloudflare.com/client/v4/accounts/' + encodeURIComponent(account) + '/d1/database/' + encodeURIComponent(database) + '/query', {
      method: 'POST', headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
      body: JSON.stringify({ sql: this.sql, params: this.params }), cache: 'no-store', signal: AbortSignal.timeout(15000)
    });
    const body = await response.json() as { success?: boolean; result?: { success?: boolean; results?: T[] }[] };
    const result = body.result?.[0];
    if (!response.ok || !body.success || !result?.success) throw Error('Database query failed.');
    return { results: result.results ?? [], success: true };
  }
  async first<T = Row>(): Promise<T | null> { return (await this.all<T>()).results[0] ?? null; }
  async run() { return this.all(); }
}
export function db() { return { prepare(sql: string) { return new Statement(sql); } }; }
