-- ==============================================================================
-- EBD REVISTA MANAGER - PRIMEIRA IGREJA BATISTA DE CATAGUASES
-- Script de Criação do Banco de Dados (Supabase / PostgreSQL)
-- ==============================================================================
-- Execute este script no SQL Editor do seu projeto Supabase:
-- Dashboard > SQL Editor > New query > Colar e clicar em 'Run'.
-- ==============================================================================

-- 1. Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabela de Revistas / Lições da EBD
CREATE TABLE IF NOT EXISTS public.magazines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    edition_quarter TEXT DEFAULT '4º Trimestre / 2026',
    lesson_number INTEGER,
    lesson_date DATE NOT NULL,
    file_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size BIGINT DEFAULT 0,
    cover_image_path TEXT,
    publish_at TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'published', 'archived')),
    whatsapp_scheduled BOOLEAN DEFAULT true,
    whatsapp_sent BOOLEAN DEFAULT false,
    whatsapp_sent_at TIMESTAMPTZ,
    whatsapp_message_custom TEXT,
    views_count INTEGER DEFAULT 0,
    downloads_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Classes e materiais; registros antigos são preservados na Classe Geral.
CREATE TABLE IF NOT EXISTS public.classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL CHECK (char_length(name) BETWEEN 2 AND 80),
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO public.classes (id, name, slug, description, sort_order, is_active)
VALUES ('b08d9448-f0c7-4f01-94bb-37131d57b496', 'Classe Geral', 'geral', 'Classe padrão para os materiais já cadastrados.', 0, true)
ON CONFLICT (slug) DO NOTHING;

ALTER TABLE public.magazines ADD COLUMN IF NOT EXISTS class_id UUID REFERENCES public.classes(id) ON DELETE RESTRICT;
UPDATE public.magazines SET class_id = (SELECT id FROM public.classes WHERE slug = 'geral') WHERE class_id IS NULL;
ALTER TABLE public.magazines ALTER COLUMN class_id SET DEFAULT 'b08d9448-f0c7-4f01-94bb-37131d57b496'::UUID;
ALTER TABLE public.magazines ALTER COLUMN class_id SET NOT NULL;

-- Índices para otimização de busca e agendamento
CREATE INDEX IF NOT EXISTS idx_magazines_status_publish ON public.magazines (status, publish_at);
CREATE INDEX IF NOT EXISTS idx_magazines_lesson_date ON public.magazines (lesson_date DESC);
CREATE INDEX IF NOT EXISTS idx_magazines_created_at ON public.magazines (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_magazines_class_lesson ON public.magazines (class_id, lesson_date DESC);
CREATE INDEX IF NOT EXISTS idx_classes_active_order ON public.classes (is_active, sort_order, name);

-- 3. Tabela de Configurações Gerais e Personalização
CREATE TABLE IF NOT EXISTS public.settings (
    id TEXT PRIMARY KEY DEFAULT 'general',
    church_name TEXT NOT NULL DEFAULT 'Primeira Igreja Batista de Cataguases',
    site_title TEXT NOT NULL DEFAULT 'EBD Digital - PIB Cataguases',
    banner_title TEXT NOT NULL DEFAULT 'Escola Bíblica Dominical',
    banner_subtitle TEXT NOT NULL DEFAULT 'Crescendo na Graça e no Conhecimento da Palavra de Deus',
    banner_image_url TEXT DEFAULT '',
    social_instagram TEXT DEFAULT 'https://instagram.com/pibcataguases',
    social_youtube TEXT DEFAULT 'https://youtube.com/@pibcataguases',
    social_facebook TEXT DEFAULT 'https://facebook.com/pibcataguases',
    social_whatsapp_group TEXT DEFAULT '',
    social_website TEXT DEFAULT 'https://pibcataguases.com.br',
    church_address TEXT DEFAULT 'Rua Nogueira Neves, Cataguases - MG',
    service_times TEXT DEFAULT 'Domingos às 09:00h (EBD) e 19:30h (Culto)',
    whatsapp_api_provider TEXT DEFAULT 'evolution',
    whatsapp_instance_name TEXT DEFAULT 'pib-cataguases-ebd',
    whatsapp_group_jid TEXT DEFAULT '',
    whatsapp_default_message TEXT DEFAULT '📖 *Escola Bíblica Dominical - PIB Cataguases*\n\nA Paz do Senhor! Já está disponível a revista da EBD para o estudo desta semana!\n\n📌 *{titulo}*\n📅 *Data:* {data}\n\n👉 Acesse agora para ler online ou baixar o PDF:\n{link}\n\n_\"Lâmpada para os meus pés é tua palavra, e luz para o meu caminho.\" (Sl 119:105)_',
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Tabela de Logs de Envio do WhatsApp
CREATE TABLE IF NOT EXISTS public.logs_whatsapp (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    magazine_id UUID REFERENCES public.magazines(id) ON DELETE SET NULL,
    recipient TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'pending')),
    message TEXT,
    response_payload JSONB,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_logs_whatsapp_created_at ON public.logs_whatsapp (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_logs_whatsapp_magazine_id ON public.logs_whatsapp (magazine_id);

-- 5. Função Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_magazines_updated_at ON public.magazines;
CREATE TRIGGER trigger_magazines_updated_at
    BEFORE UPDATE ON public.magazines
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trigger_settings_updated_at ON public.settings;
CREATE TRIGGER trigger_settings_updated_at
    BEFORE UPDATE ON public.settings
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trigger_classes_updated_at ON public.classes;
CREATE TRIGGER trigger_classes_updated_at
    BEFORE UPDATE ON public.classes
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 6. Inserção das Configurações Iniciais da PIB Cataguases (se não existirem)
INSERT INTO public.settings (
    id,
    church_name,
    site_title,
    banner_title,
    banner_subtitle,
    social_instagram,
    social_youtube,
    social_facebook,
    church_address,
    service_times
) VALUES (
    'general',
    'Primeira Igreja Batista de Cataguases',
    'EBD Digital - PIB Cataguases',
    'Escola Bíblica Dominical',
    'Crescendo na Graça e no Conhecimento da Palavra de Deus',
    'https://instagram.com/pibcataguases',
    'https://youtube.com/@pibcataguases',
    'https://facebook.com/pibcataguases',
    'Rua Nogueira Neves, Cataguases - MG',
    'Domingos às 09:00h (EBD) e 19:30h (Culto da Família)'
) ON CONFLICT (id) DO NOTHING;

-- 7. Configuração de RLS (Row Level Security)
ALTER TABLE public.magazines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs_whatsapp ENABLE ROW LEVEL SECURITY;

-- Políticas para 'magazines':
-- A) Leitura pública: qualquer visitante pode ver revistas publicadas cuja data seja menor ou igual a agora
DROP POLICY IF EXISTS "Public Read Published Magazines" ON public.magazines;
DROP POLICY IF EXISTS "Admin Full Access Magazines" ON public.magazines;
DROP POLICY IF EXISTS "Service Role Full Access Magazines" ON public.magazines;
CREATE POLICY "Public Read Published Magazines" ON public.magazines
    FOR SELECT
    USING (status = 'published' AND publish_at <= now());

-- B) Administradores autenticados: acesso total (CRUD)
CREATE POLICY "Admin Full Access Magazines" ON public.magazines
    FOR ALL
    TO authenticated
    USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
    WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- C) Service role: acesso total (para workers e API routes)
CREATE POLICY "Service Role Full Access Magazines" ON public.magazines
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Políticas para classes: visitantes podem ver classes ativas; admins gerenciam todas.
GRANT SELECT ON public.classes TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.classes TO authenticated;
GRANT ALL ON public.classes TO service_role;
DROP POLICY IF EXISTS "Public Read Active Classes" ON public.classes;
DROP POLICY IF EXISTS "Admin Full Access Classes" ON public.classes;
DROP POLICY IF EXISTS "Service Role Full Access Classes" ON public.classes;
CREATE POLICY "Public Read Active Classes" ON public.classes
    FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY "Admin Full Access Classes" ON public.classes
    FOR ALL TO authenticated
    USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
    WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
CREATE POLICY "Service Role Full Access Classes" ON public.classes
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Políticas para 'settings':
-- A) Leitura pública das configurações do site
DROP POLICY IF EXISTS "Public Read Settings" ON public.settings;
DROP POLICY IF EXISTS "Admin Update Settings" ON public.settings;
DROP POLICY IF EXISTS "Service Role Full Access Settings" ON public.settings;
CREATE POLICY "Public Read Settings" ON public.settings
    FOR SELECT
    USING (true);

-- B) Administradores autenticados: atualizar configurações
CREATE POLICY "Admin Update Settings" ON public.settings
    FOR ALL
    TO authenticated
    USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
    WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- C) Service role: acesso total
CREATE POLICY "Service Role Full Access Settings" ON public.settings
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Políticas para 'logs_whatsapp':
-- A) Administradores autenticados: visualização de logs
DROP POLICY IF EXISTS "Admin Read Logs" ON public.logs_whatsapp;
DROP POLICY IF EXISTS "Service Role Full Access Logs" ON public.logs_whatsapp;
CREATE POLICY "Admin Read Logs" ON public.logs_whatsapp
    FOR SELECT
    TO authenticated
    USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- B) Service role: gravação e leitura de logs
CREATE POLICY "Service Role Full Access Logs" ON public.logs_whatsapp
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
