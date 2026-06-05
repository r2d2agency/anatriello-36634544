# Guia de Deploy e Rollback (Sem Git em Produção)

Este projeto está configurado para usar **Docker**, o que permite mover o sistema entre servidores sem precisar de Git ou instalar dependências manualmente no servidor de produção.

## 1. Como gerar uma nova versão (em DEV)

Sempre que você terminar uma alteração no ambiente de desenvolvimento e quiser levar para a produção:

1. Abra o terminal na raiz do projeto.
2. Execute o script de release:
   ```bash
   ./scripts/release.sh
   ```
3. O script vai gerar imagens Docker versionadas (ex: `v202310271430`).
4. Se você optar por "Exportar para .tar", ele criará arquivos na pasta `releases/`.

## 2. Como levar para a Produção

### Opção A: Usando arquivos .tar (Mais simples)
1. Copie a pasta `releases/vXXXXXXXX` para o seu servidor de produção (via SCP, FTP, Pendrive, etc).
2. No servidor de produção, carregue as imagens:
   ```bash
   docker load < frontend.tar
   docker load < backend.tar
   ```
3. Atualize o arquivo `docker-compose.yml` e o `.env` no servidor.
4. Suba o sistema:
   ```bash
   VERSION=vXXXXXXXX docker-compose up -d
   ```

### Opção B: Usando um Registro (Docker Hub / GitHub)
*Recomendado para automatização completa.*

## 3. Como fazer ROLLBACK (Voltar versão)

Se a versão nova der erro, você não precisa mexer no código. Basta rodar o comando apontando para a versão anterior:

```bash
# Exemplo: Voltando para a versão de ontem
VERSION=v202310261000 docker-compose up -d
```

O Docker vai parar os containers atuais e subir instantaneamente os containers da versão que você especificou.

## 4. Banco de Dados

As migrações de banco de dados (arquivos `.sql` em `backend/`) devem ser aplicadas ao banco de produção. 
Recomenda-se usar uma ferramenta de migração ou aplicar os scripts manualmente via `psql` no servidor.

---
**Dica:** No servidor de produção, você pode criar um arquivo `.env` na raiz com:
```env
VERSION=v202310271430
FRONTEND_PORT=80
BACKEND_PORT=3001
```
E rodar apenas `docker-compose up -d`.
