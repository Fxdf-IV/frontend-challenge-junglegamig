// Filtro puro de deduplicação e controle de versão monotônica para eventos em tempo real.

/** Metadados mínimos exigidos para validar frescor de um evento Socket.IO. */
export interface VersionedRealtimeEvent {
  eventId: string;
  resourceId: string;
  version: number;
  type: string;
}

/**
 * Cria um filtro de eventos que rejeita eventIds repetidos e versões iguais ou anteriores
 * para a mesma combinação de tipo e recurso.
 */
export function createEventGuard() {
  const seen = new Set<string>();
  const versions = new Map<string, number>();

  return (event: VersionedRealtimeEvent): boolean => {
    if (seen.has(event.eventId)) return false;
    seen.add(event.eventId);
    const key = `${event.type}:${event.resourceId}`;
    if ((versions.get(key) ?? 0) >= event.version) return false;
    versions.set(key, event.version);
    return true;
  };
}
