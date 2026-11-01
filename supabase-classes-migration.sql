-- Execute este script no Supabase SQL Editor antes de publicar a versão com classes.
-- As revistas já existentes serão preservadas e associadas à "Classe Geral".

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
UPDATE public.magazines
SET class_id = (SELECT id FROM public.classes WHERE slug = 'geral')
WHERE class_id IS NULL;
ALTER TABLE public.magazines ALTER COLUMN class_id SET DEFAULT 'b08d9448-f0c7-4f01-94bb-37131d57b496'::UUID;
ALTER TABLE public.magazines ALTER COLUMN class_id SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_magazines_class_lesson ON public.magazines (class_id, lesson_date DESC);
CREATE INDEX IF NOT EXISTS idx_classes_active_order ON public.classes (is_active, sort_order, name);

DROP TRIGGER IF EXISTS trigger_classes_updated_at ON public.classes;
CREATE TRIGGER trigger_classes_updated_at
  BEFORE UPDATE ON public.classes
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.classes TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.classes TO authenticated;
GRANT ALL ON public.classes TO service_role;

DROP POLICY IF EXISTS "Public Read Active Classes" ON public.classes;
CREATE POLICY "Public Read Active Classes" ON public.classes
  FOR SELECT TO anon, authenticated USING (is_active = true);

DROP POLICY IF EXISTS "Admin Full Access Classes" ON public.classes;
CREATE POLICY "Admin Full Access Classes" ON public.classes
  FOR ALL TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

DROP POLICY IF EXISTS "Service Role Full Access Classes" ON public.classes;
CREATE POLICY "Service Role Full Access Classes" ON public.classes
  FOR ALL TO service_role USING (true) WITH CHECK (true);
