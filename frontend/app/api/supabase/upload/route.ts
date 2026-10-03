// eikon/frontend/app/api/supabase/upload/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = supabaseUrl && supabaseSecretKey
  ? createClient(supabaseUrl, supabaseSecretKey, {
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

    if (!supabaseUrl || !supabaseSecretKey || !supabaseAdmin) {
      return NextResponse.json(
        {
          error: 'Configuração do Supabase incompleta. Configure SUPABASE_URL e SUPABASE_SECRET_KEY no ambiente do servidor.',
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
    const { error: uploadError } = await supabaseAdmin.storage
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
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro inesperado';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}