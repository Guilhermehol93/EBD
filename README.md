<div align="center">

# 📖 EBD Revista Manager
### Sistema de Gerenciamento e Distribuição Digital de Revistas da EBD
**Primeira Igreja Batista de Cataguases**

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker)](https://www.docker.com/)
[![Umbrel OS](https://img.shields.io/badge/Umbrel%20OS-Compatible-purple?style=for-the-badge)](https://umbrel.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20Postgres-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](#licença)

<p align="center">
  Software web <strong>100% self-hosted e com custo zero</strong> para automatizar a publicação e o envio no WhatsApp das revistas e lições semanais da Escola Bíblica Dominical da PIB Cataguases.
</p>

[Documentação Interativa (HTML)](./docs/index.html) • [Guia de Instalação no Umbrel via Portainer](#-guia-de-instalação-no-umbrel-os-via-portainer) • [Configuração do WhatsApp](#-automação-do-whatsapp)

**[Abrir tutorial visual de instalação e implementação](./docs/tutorial-instalacao.html)**

</div>

---

## 📌 Índice
1. [Visão Geral](#-visão-geral)
2. [Recursos Principais](#-recursos-principais)
3. [Arquitetura do Sistema](#-arquitetura-do-sistema)
4. [Requisitos do Sistema](#-requisitos-do-sistema)
5. [Guia de Instalação no Umbrel OS via Portainer](#-guia-de-instalação-no-umbrel-os-via-portainer)
6. [Configuração do Banco de Dados (Supabase)](#-configuração-do-banco-de-dados-supabase)
7. [Variáveis de Ambiente (.env)](#-variáveis-de-ambiente-env)
8. [Automação do WhatsApp (Evolution API)](#-automação-do-whatsapp)
9. [Manual de Uso das Interfaces](#-manual-de-uso-das-interfaces)
10. [Resolução de Problemas (Troubleshooting)](#-resolução-de-problemas-troubleshooting)

---

## 📖 Visão Geral

O **EBD Revista Manager** foi projetado especificamente para a **Primeira Igreja Batista de Cataguases** para modernizar o acesso aos materiais de estudo dominical.

O projeto opera sob o princípio de **Custo Zero Absoluto**:
- **Armazenamento 100% Local:** Os PDFs das revistas e imagens de banner são armazenados diretamente no disco do servidor em um volume Docker persistente (`./data/uploads`), eliminando qualquer necessidade de S3, Google Cloud ou planos pagos de storage.
- **Autenticação Segura Gratuita:** Supabase Auth gerencia o acesso administrativo sem custo.
- **WhatsApp Self-Hosted:** Disparo automatizado de mensagens no grupo oficial da EBD através da Evolution API v2 em container local.

---

## ✨ Recursos Principais

### 🌐 Portal Público (Membros da Igreja)
- **Acesso livre:** Sem necessidade de cadastro ou login.
- **Visualização Moderna e Responsiva:** Design elegante e acolhedor (estilo ministério cristão) adaptado para smartphones e tablets.
- **Leitor Online Imersivo:** Leitor de PDF embutido na página com suporte a tela cheia, navegação de páginas e zoom.
- **Download Direto:** Botão rápido para baixar o arquivo PDF no celular.
- **Banner Personalizável:** Foto e lema da igreja configuráveis pelo administrador.
- **Comunidade:** Acesso direto ao canal oficial do WhatsApp, transmissões no YouTube e Instagram da igreja.
- **Biblioteca de Lições:** Consulta de todas as revistas anteriores com busca instantânea.

### 🛡️ Painel Administrativo (Liderança da EBD)
- **Proteção Completa:** Login seguro via Supabase Auth.
- **Upload Simplificado:** Arraste e solte arquivos PDF com validação automática de tamanho.
- **Agendamento Inteligente:** Programe o dia e a hora em que a revista será disponibilizada publicamente (sugestão automática para o próximo domingo às 08:00h).
- **Disparo Automático no WhatsApp:** O robô interno monitora o horário e envia a notificação com link direto para o grupo da igreja no minuto exato da liberação.
- **Gerenciador de Banners e Textos:** Troque fotos, slogans, horários de culto e links sociais sem encostar em código.
- **Logs e Métricas:** Acompanhe o número de leituras, downloads realizados e o histórico de disparos do WhatsApp.

---

## 🏛️ Arquitetura do Sistema

```
                      +------------------------------------------+
                      |         Usuários / Alunos da EBD         |
                      |          (Smartphones / Desktops)        |
                      +--------------------+---------------------+
                                           |
                                           | HTTP / Web
                                           v
+----------------------------------------------------------------------------------+
|                    SERVIDOR LOCAL (Umbrel OS / Docker Host)                     |
|                                                                                  |
|   +--------------------------------------------------------------------------+   |
|   |                          EBD REVISTA MANAGER                             |   |
|   |                     (Container Next.js 14 Standalone)                    |   |
|   |                                                                          |   |
|   |   +-------------------+   +--------------------+   +-----------------+   |   |
|   |   |  Portal Público   |   |  Painel de Admin   |   | Worker Agendador|   |   |   |
|   |   |  (Leitor PDF)     |   |  (Gestão & Upload) |   | (Cron Interno)  |   |   |
|   |   +---------+---------+   +---------+----------+   +--------+--------+   |   |
|   +-------------|-----------------------|-----------------------|------------+   |
|                 |                       |                       |                |
|                 v                       v                       |                |
|   +-----------------------------+       |                       |                |
|   |  VOLUME DOCKER PERSISTENTE  |       |                       |                |
|   |      (./data/uploads)       |       |                       |                |
|   |    PDFs Locais & Banners    |       |                       |                |
|   +-----------------------------+       |                       |                |
|                                         |                       v                |
|                                         |          +-------------------------+   |
|                                         |          |  EVOLUTION API CONTAINER|   |
|                                         |          |  (WhatsApp Self-Hosted) |   |
|                                         |          +------------+------------+   |
+-----------------------------------------|-----------------------|----------------+
                                          |                       |
                                          v                       v
                              +-----------------------+ +--------------------+
                              |     SUPABASE CLOUD    | |  GRUPO DO WHATSAPP |
                              |  (Auth + Postgres DB) | |  (PIB Cataguases)  |
                              +-----------------------+ +--------------------+
```

---

## 💻 Requisitos do Sistema

- Servidor local com **Umbrel OS** (ou qualquer distribuição Linux com Docker e Docker Compose instalados).
- Pelo menos **1 GB de RAM livre** e **5 GB de armazenamento em disco**.
- Conexão com a internet para sincronização com o Supabase e WhatsApp.
- Uma conta gratuita no [Supabase](https://supabase.com).

---

## 🚀 Guia de Instalação no Umbrel OS via Portainer

O fluxo recomendado é criar uma Stack no Portainer usando o repositório Git. Abra **Portainer → ambiente Docker local → Stacks → Add stack**, escolha **Repository**, preencha a URL do repositório e a branch, e defina o Compose path como `docker-compose.yml`. Cadastre as variáveis da aplicação na seção **Environment variables** antes de clicar em **Deploy the stack**.

O Portainer clona o repositório e constrói os serviços. As chaves públicas do Supabase são usadas como argumentos de build; a chave service role e os segredos permanecem no servidor. Faça backup de `data/uploads` antes de atualizar a Stack.

Consulte o [tutorial visual completo de implantação via Portainer](./docs/tutorial-instalacao.html), que também explica a criação do administrador e o pareamento opcional do WhatsApp.

Depois da implantação, acesse `http://umbrel.local:3000` (ou o endereço/IP do Umbrel) e entre no painel em `/admin/login`.

---

## 🗄️ Configuração do Banco de Dados (Supabase)

1. Crie um projeto gratuito no [Supabase](https://supabase.com).
2. Acesse o **SQL Editor** no painel do Supabase.
3. Abra o arquivo [`supabase-schema.sql`](./supabase-schema.sql) deste repositório, copie seu conteúdo e cole no SQL Editor.
4. Clique em **Run** para criar automaticamente:
   - Tabela `magazines` (revistas e metadados)
   - Tabela `settings` (configurações do banner e igreja)
   - Tabela `logs_whatsapp` (registro de disparos)
   - Triggers e políticas de segurança (Row Level Security)
5. Crie o primeiro usuário em **Authentication > Users > Add user** e defina `app_metadata` como `{"role":"admin"}`. Repita para cada administrador; não use `user_metadata`, que pode ser alterado pelo próprio usuário.

---

## ⚙️ Variáveis de Ambiente (.env)

| Variável | Descrição | Exemplo |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL da API do projeto Supabase | `https://xyz.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave pública anônima do Supabase | `eyJhbGciOi...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave de serviço secreta (para cron/worker) | `eyJhbGciOi...` |
| `NEXT_PUBLIC_APP_URL` | URL base para links nas mensagens | `http://umbrel.local:3000` |
| `UPLOAD_DIR` | Diretório de armazenamento persistente | `/app/data/uploads` |
| `PORT` | Porta HTTP da aplicação | `3000` |
| `CRON_SECRET` | Segredo opcional para chamadas externas autenticadas ao cron | Gerar com `openssl rand -hex 32` |
| `WHATSAPP_PROVIDER` | Provedor de envio (`evolution` ou `webhook`) | `evolution` |
| `WHATSAPP_API_URL` | URL interna do container Evolution API | `http://evolution-api:8080` |
| `WHATSAPP_HOST_PORT` | Porta local do Umbrel para configurar a Evolution API | `8081` |
| `WHATSAPP_API_KEY` | Chave forte compartilhada com a Evolution API | Gerar com `openssl rand -hex 32` |
| `WHATSAPP_INSTANCE` | Nome da instância do WhatsApp | `pib-cataguases-ebd` |
| `WHATSAPP_GROUP_JID` | ID do grupo da EBD no WhatsApp | `120363028372648291@g.us` |

---

## 📲 Automação do WhatsApp

O arquivo `docker-compose.yml` inclui a **Evolution API v2**, que roda localmente sem custo e conecta via QR Code do WhatsApp:

### 1. Criar a Instância
Execute no terminal do servidor:
```bash
curl -X POST http://localhost:8081/instance/create \
  -H "apikey: SUA_CHAVE_FORTE" \
  -H "Content-Type: application/json" \
  -d '{"instanceName": "pib-cataguases-ebd", "token": "SUA_CHAVE_FORTE", "qrcode": true}'
```

### 2. Parear o Celular (QR Code)
A porta da Evolution API fica acessível apenas no próprio servidor. Crie um túnel SSH (`ssh -L 8081:127.0.0.1:8081 umbrel@umbrel.local`) e abra no navegador do computador:
```
http://localhost:8081/instance/connect/pib-cataguases-ebd
```
No WhatsApp do celular da igreja: vá em **Aparelhos Conectados > Conectar um Aparelho** e aponte para o QR Code gerado.

### 3. Testar o Disparo
Acesse o Painel Administrativo em **Configurações & Banner**, insira o ID do grupo ou seu número e clique em **Testar Conexão**.

---

## 📋 Manual de Uso das Interfaces

### 1. Upload e Agendamento de Revista
1. Acesse `/admin/login` e entre com seu e-mail e senha.
2. No menu lateral, clique em **Nova Revista**.
3. Arraste o arquivo PDF da lição.
4. Preencha o Título (ex: *Lição 05 - O Fruto do Espírito*), o Número da Lição e a Data do Domingo.
5. Defina a data e hora de liberação (sugerido domingo às 08:00h).
6. Mantenha o interruptor **Disparo Agendado Ativo** ligado para envio automático no WhatsApp.
7. Clique em **Salvar e Agendar Revista**.

### 2. Troca de Banners e Redes Sociais
1. Acesse o menu **Configurações & Banner**.
2. Faça o upload de uma foto personalizada para o fundo do banner.
3. Atualize os links do Instagram, YouTube, Facebook e o link de convite do grupo do WhatsApp.
4. Clique em **Salvar Todas as Configurações**.

---

## 🛠️ Resolução de Problemas (Troubleshooting)

### Como ver os logs dos containers?
No Portainer, abra **Stacks**, selecione `ebd-revista-manager` e escolha o container para ver seus logs.

### Como atualizar a aplicação para uma nova versão do Git?
Envie as alterações para a branch configurada e, no Portainer, abra a Stack e escolha **Pull and redeploy**. Faça backup de `data/uploads` antes da atualização.

### Erro de permissão ao salvar arquivos PDF?
Confira os logs do container `ebd-app` no Portainer e as permissões da pasta `data/uploads`. Evite permissões abertas como `777`.

---

## 📄 Licença

Distribuído sob licença MIT. Desenvolvido para a **Primeira Igreja Batista de Cataguases** para a glória de Deus e a edificação da igreja.
