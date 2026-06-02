A análise dos erros reportados ("Not allowed to load local resource") indica que o sistema está tentando carregar URLs do tipo "blob:" que foram criadas em uma sessão ou origem diferente (no aplicativo do promotor) dentro do painel administrativo. Isso ocorre porque o navegador bloqueia o acesso a esses recursos locais por segurança.

Para resolver isso de forma definitiva, implementarei as seguintes mudanças:

### 1. Robustez na Resolução de URLs de Mídia
Atualizarei a função `resolveMediaUrl` em `src/lib/media.ts` para garantir que URLs `blob:` sejam sempre ignoradas no painel administrativo, evitando que cheguem aos atributos `src` das imagens.

### 2. Correção no Editor de Book de Fotos
O componente `BookEditorDialog.tsx` possui uma falha onde ele tenta usar a URL original caso a resolução falhe. Vou alterar para que ele use um placeholder ou ignore a foto se ela for um "blob" inválido.

### 3. Proteção nos Painéis Administrativos
Revisarei os componentes de visualização de execução (`MerchExecucao.tsx`), relatórios (`MerchRelatorios.tsx`) e produtos (`MerchProdutos.tsx`) para garantir que todas as imagens passem pela função de resolução e tratem URLs inválidas exibindo ícones de placeholder em vez de causar erros no console.

### 4. Sincronismo do Promotor
Garantirei que o aplicativo do promotor (`PromotorRota.tsx`) use referências locais seguras (`local-file://`) ao enfileirar ações que envolvam fotos, garantindo que o sincronismo substitua essas referências pelas URLs finais do servidor antes de enviá-las para o banco de dados.

### Detalhes Técnicos:
- **src/lib/media.ts**: Reforçar a detecção de `blob:` e `local-file://`.
- **src/components/merch/BookEditorDialog.tsx**: Corrigir a inicialização do estado `bookPhotos` para não aceitar blobs.
- **src/pages/MerchExecucao.tsx**: Adicionar verificações extras antes de renderizar tags `<img />`.
- **src/pages/promotor/PromotorRota.tsx**: Validar o envio de fotos para o sincronismo offline.
