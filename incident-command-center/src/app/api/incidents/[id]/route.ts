import { NextResponse } from 'next/server';
import { getIncidentById } from '@/lib/incident-store';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const incident = getIncidentById(resolvedParams.id);
  
  if (!incident) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ incident });
}
