import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const user = request.headers.get('x-admin-user') || '';
    const pass = request.headers.get('x-admin-pass') || '';
    
    const backend = process.env.BACKEND_URL || 'http://localhost:8080';
    const resp = await fetch(`${backend.replace(/\/$/, '')}/admin/reports/${id}`, { 
      method: 'DELETE', 
      headers: { 'x-admin-user': user, 'x-admin-pass': pass } 
    });
    const data = await resp.json();
    return NextResponse.json(data, { status: resp.status });
  } catch (e) {
    return NextResponse.json({ error: 'server' }, { status: 500 });
  }
}
