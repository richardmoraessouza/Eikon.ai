// eikon/frontend/app/api/supabase/upload/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://whydzqwlkhopyvxeclzs.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_O83NbWhvDbpe0Wat06EHrg_Jfr6CsFq';

const supabaseAdmin = serviceRoleKey
  ? createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  : null;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const tipo = String(formData.get('tipo') || 'usuario');
    const previousPath = String(formData.get('previousPath') || '').trim();

    if (!file) {
      return NextResponse.json({ error: 'Arquivo ausente' }, { status: 400 });
    }

    const bucketName = process.env.SUPABASE_BUCKET || 'eikonBase';
    const folder = tipo === 'personagem' ? 'personagens' : 'usuarios';
    const extension = (file.name?.split('.').pop() || 'bin').toLowerCase().replace(/[^a-z0-9]+/g, '');
    const baseName = (file.name?.replace(/\.[^.]+$/, '') || 'arquivo')
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9._-]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 80) || 'arquivo';
    const safeName = `${baseName}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const filePath = `${folder}/${safeName}.${extension || 'bin'}`;

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    if (!supabaseAdmin) {
      return NextResponse.json(
        {
          error: 'Chave de serviço do Supabase não configurada. Configure SUPABASE_SERVICE_ROLE_KEY no ambiente do servidor.',
        },
        { status: 500 }
      );
    }

    let removedPrevious = false;
    if (previousPath) {
      try {
        const { error: removeError } = await supabaseAdmin.storage.from(bucketName).remove([previousPath]);
        removedPrevious = !removeError;
        if (removeError) {
          console.warn('[Supabase upload] Falha ao remover imagem antiga:', removeError.message);
        }
      } catch (cleanupError) {
        console.warn('[Supabase upload] Falha ao remover imagem antiga:', cleanupError);
      }
    }

    const { data, error: uploadError } = await supabaseAdmin.storage
      .from(bucketName)
      .upload(filePath, buffer, {
        contentType: file.type || 'application/octet-stream',
        upsert: true,
      });

    if (uploadError) {
      return NextResponse.json({ error: 'Falha no upload do Supabase', detail: uploadError.message }, { status: 500 });
    }

    const { data: publicUrlData } = supabaseAdmin.storage.from(bucketName).getPublicUrl(filePath);

    return NextResponse.json({
      path: filePath,
      publicUrl: publicUrlData.publicUrl,
      removedPrevious,
      previousPath,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Erro inesperado' }, { status: 500 });
  }
}