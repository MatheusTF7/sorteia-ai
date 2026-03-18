export type SharedBingoHostRole = 'drawer' | 'both';

export interface SharedBingoRoomRecord {
  appId: 'sorteia-ai-bingo';
  version: 1;
  roomCode: string;
  status: 'active';
  hostRole: SharedBingoHostRole;
  calledNumbers: number[];
  lastDrawnNumber: number | null;
  createdAt: string;
  updatedAt: string;
}

interface JsonBinMetadata {
  id: string;
  private: boolean;
}

interface JsonBinResponse<T> {
  record: T;
  metadata: JsonBinMetadata;
}

const JSONBIN_BASE_URL = 'https://api.jsonbin.io/v3';
const JSONBIN_KEY_HEADERS = ['X-Access-Key', 'X-Master-Key'] as const;

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function sanitizeCalledNumbers(value: unknown): number[] {
  if (!Array.isArray(value)) return [];

  const seen = new Set<number>();
  const sanitized: number[] = [];

  for (const item of value) {
    if (!Number.isInteger(item) || item < 1 || item > 75 || seen.has(item)) {
      continue;
    }

    seen.add(item);
    sanitized.push(item);
  }

  return sanitized;
}

function normalizeRoomRecord(payload: unknown, roomCode: string): SharedBingoRoomRecord {
  if (!isObject(payload) || payload.appId !== 'sorteia-ai-bingo') {
    throw new Error('A sala informada nao pertence ao bingo compartilhado do Sorteia Ai.');
  }

  const calledNumbers = sanitizeCalledNumbers(payload.calledNumbers);
  const lastDrawnNumber =
    Number.isInteger(payload.lastDrawnNumber) &&
    Number(payload.lastDrawnNumber) >= 1 &&
    Number(payload.lastDrawnNumber) <= 75
      ? Number(payload.lastDrawnNumber)
      : calledNumbers.at(-1) ?? null;

  const hostRole = payload.hostRole === 'both' ? 'both' : 'drawer';

  return {
    appId: 'sorteia-ai-bingo',
    version: 1,
    roomCode,
    status: 'active',
    hostRole,
    calledNumbers,
    lastDrawnNumber,
    createdAt: typeof payload.createdAt === 'string' ? payload.createdAt : new Date().toISOString(),
    updatedAt: typeof payload.updatedAt === 'string' ? payload.updatedAt : new Date().toISOString(),
  };
}

async function parseJson<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type') ?? '';

  if (!contentType.includes('application/json')) {
    throw new Error('JSONBin retornou uma resposta invalida.');
  }

  return (await response.json()) as T;
}

async function parseError(response: Response): Promise<string> {
  try {
    const payload = await parseJson<{ message?: string }>(response);
    return payload.message || `Erro ${response.status} ao acessar o JSONBin.`;
  } catch {
    return `Erro ${response.status} ao acessar o JSONBin.`;
  }
}

async function requestWithApiKey(
  path: string,
  init: RequestInit,
  apiKey: string,
): Promise<Response> {
  const trimmedKey = apiKey.trim();

  if (!trimmedKey) {
    throw new Error('Informe uma chave do JSONBin para criar ou atualizar a sala.');
  }

  let lastResponse: Response | null = null;

  for (const headerName of JSONBIN_KEY_HEADERS) {
    const headers = new Headers(init.headers ?? {});
    headers.set(headerName, trimmedKey);

    const response = await fetch(`${JSONBIN_BASE_URL}${path}`, {
      ...init,
      headers,
    });

    if (response.ok) {
      return response;
    }

    lastResponse = response;

    if (response.status !== 401 && response.status !== 403) {
      return response;
    }
  }

  if (!lastResponse) {
    throw new Error('Nao foi possivel concluir a requisicao no JSONBin.');
  }

  return lastResponse;
}

export function createSharedBingoRecord(
  roomCode: string,
  hostRole: SharedBingoHostRole,
): SharedBingoRoomRecord {
  const now = new Date().toISOString();

  return {
    appId: 'sorteia-ai-bingo',
    version: 1,
    roomCode,
    status: 'active',
    hostRole,
    calledNumbers: [],
    lastDrawnNumber: null,
    createdAt: now,
    updatedAt: now,
  };
}

export async function createSharedBingoRoom(
  apiKey: string,
  hostRole: SharedBingoHostRole,
): Promise<SharedBingoRoomRecord> {
  const payload = createSharedBingoRecord('', hostRole);
  const response = await requestWithApiKey(
    '/b',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Bin-Private': 'false',
        'X-Bin-Name': `sorteia-ai-bingo-${Date.now()}`,
      },
      body: JSON.stringify(payload),
    },
    apiKey,
  );

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const created = await parseJson<JsonBinResponse<SharedBingoRoomRecord>>(response);
  const normalizedRecord = normalizeRoomRecord(
    {
      ...created.record,
      roomCode: created.metadata.id,
    },
    created.metadata.id,
  );

  return updateSharedBingoRoom(created.metadata.id, normalizedRecord, apiKey);
}

export async function readSharedBingoRoom(roomCode: string): Promise<SharedBingoRoomRecord> {
  const response = await fetch(`${JSONBIN_BASE_URL}/b/${roomCode}/latest?meta=false`);

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const payload = await parseJson<unknown>(response);
  return normalizeRoomRecord(payload, roomCode);
}

export async function updateSharedBingoRoom(
  roomCode: string,
  record: SharedBingoRoomRecord,
  apiKey: string,
): Promise<SharedBingoRoomRecord> {
  const response = await requestWithApiKey(
    `/b/${roomCode}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...record,
        roomCode,
        updatedAt: new Date().toISOString(),
      }),
    },
    apiKey,
  );

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const payload = await parseJson<JsonBinResponse<SharedBingoRoomRecord>>(response);
  return normalizeRoomRecord(payload.record, roomCode);
}
