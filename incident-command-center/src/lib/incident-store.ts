export interface Incident {
  id: string;
  title: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'resolved';
  createdAt: string;
  originalError: any;
  aiAnalysis: {
    summary: string;
    suspectedFiles: string[];
    mitigationPlan: string;
  };
}

// Em desenvolvimento, o Next.js reinicializa os módulos devido ao Hot Reload e isolamento de rotas.
// Guardar o array no globalThis garante que o estado em memória persista entre chamadas de API e páginas.
const globalForIncidents = globalThis as unknown as {
  incidents: Incident[];
};

if (!globalForIncidents.incidents) {
  globalForIncidents.incidents = [];
}

export function addIncident(incident: Incident) {
  globalForIncidents.incidents.unshift(incident);
  console.log(`[Store] Incidente adicionado! Total em memória: ${globalForIncidents.incidents.length}`);
}

export function getIncidents() {
  return globalForIncidents.incidents;
}

export function getIncidentById(id: string) {
  return globalForIncidents.incidents.find(i => i.id === id);
}

export function updateIncidentStatus(id: string, status: Incident['status']) {
  const incident = getIncidentById(id);
  if (incident) {
    incident.status = status;
  }
}
