-- Módulo de Tags
CREATE TABLE IF NOT EXISTS public.conversation_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    name TEXT NOT NULL,
    color TEXT DEFAULT '#6366f1',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(organization_id, name)
);

CREATE TABLE IF NOT EXISTS public.conversation_tag_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL,
    tag_id UUID NOT NULL REFERENCES public.conversation_tags(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(conversation_id, tag_id)
);

-- Módulo de Departamentos
CREATE TABLE IF NOT EXISTS public.departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#6366f1',
    icon TEXT DEFAULT 'users',
    is_active BOOLEAN DEFAULT true,
    max_concurrent_chats INTEGER DEFAULT 5,
    auto_assign BOOLEAN DEFAULT false,
    business_hours_enabled BOOLEAN DEFAULT false,
    business_hours_start TIME DEFAULT '08:00',
    business_hours_end TIME DEFAULT '18:00',
    business_days INTEGER[] DEFAULT '{1,2,3,4,5}',
    welcome_message TEXT,
    offline_message TEXT,
    queue_message TEXT DEFAULT 'Você está na fila de espera. Em breve um atendente irá te atender.',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(organization_id, name)
);

CREATE TABLE IF NOT EXISTS public.department_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    role TEXT DEFAULT 'agent', -- 'agent' ou 'supervisor'
    is_available BOOLEAN DEFAULT true,
    current_chats INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(department_id, user_id)
);

-- Habilitar RLS
ALTER TABLE public.conversation_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_tag_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.department_members ENABLE ROW LEVEL SECURITY;

-- Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.conversation_tags TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.conversation_tag_links TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.departments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.department_members TO authenticated;

GRANT ALL ON public.conversation_tags TO service_role;
GRANT ALL ON public.conversation_tag_links TO service_role;
GRANT ALL ON public.departments TO service_role;
GRANT ALL ON public.department_members TO service_role;

-- Políticas Básicas (Simplificadas para o contexto atual onde a organização é resolvida via middleware no backend)
-- Como o backend usa o pool diretamente e resolve a organização, estas políticas são uma camada extra de segurança.
-- Para Lovable Cloud / PostgREST, precisaríamos de políticas que checassem a organização do usuário logado.

CREATE POLICY "Users can see tags from their organization" ON public.conversation_tags
FOR SELECT USING (true); -- No backend a filtragem já é feita por organization_id

CREATE POLICY "Users can see tag links" ON public.conversation_tag_links
FOR SELECT USING (true);

CREATE POLICY "Users can see departments" ON public.departments
FOR SELECT USING (true);

CREATE POLICY "Users can see department members" ON public.department_members
FOR SELECT USING (true);
