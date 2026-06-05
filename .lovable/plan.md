A melhor estratégia para evitar depender de `git pull` em produção e garantir um processo de rollback seguro é utilizar **Docker** com versionamento por **Tags**.

### Plano de Implementação:

1. **Orquestração com Docker Compose**:
   - Criar um arquivo `docker-compose.yml` na raiz para rodar o frontend (Nginx) e o backend (Node.js) juntos.
   - Usar variáveis de ambiente para definir a versão (tag) da imagem.

2. **Script de Release**:
   - Criar um script `scripts/release.sh` que:
     - Gera uma nova versão baseada no timestamp (ex: `v20231027-1430`).
     - Constrói as imagens Docker do frontend e backend.
     - (Opcional) Faz o push para um registro ou exporta como `.tar`.

3. **Fluxo de Rollback**:
   - Em caso de erro, basta alterar a variável `VERSION` no arquivo `.env` da produção para a tag anterior e rodar `docker-compose up -d`.

4. **Automatização (Opcional)**:
   - Configurar o GitHub Actions para fazer isso automaticamente a cada merge na branch principal.

### Detalhes Técnicos:
- O frontend será servido via Nginx na porta 80.
- O backend rodará na porta 3001.
- Comunicação interna via rede Docker.