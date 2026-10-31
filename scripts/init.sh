#!/bin/bash
# ==============================================================================
# Script de Inicialização e Preparação de Ambiente - Umbrel OS / Linux
# EBD Revista Manager - Primeira Igreja Batista de Cataguases
# ==============================================================================

set -e

echo "🚀 Iniciando preparação do ambiente EBD Revista Manager..."

# 1. Cria diretórios de persistência locais se não existirem
mkdir -p data/uploads/magazines
mkdir -p data/uploads/banners

# 2. Ajusta permissões de escrita para os containers
chmod -R 777 data/uploads

# 3. Verifica existência do arquivo .env
if [ ! -f .env ]; then
  if [ -f .env.example ]; then
    echo "⚠️ Arquivo .env não encontrado. Copiando de .env.example..."
    cp .env.example .env
    echo "❗ Por favor, edite o arquivo .env e configure suas credenciais do Supabase antes de iniciar!"
  else
    echo "❌ Arquivo .env.example não encontrado!"
    exit 1
  fi
fi

echo "✅ Diretórios e permissões configurados com sucesso."
echo "Para iniciar os containers no Umbrel OS, execute:"
echo "docker compose up -d --build"
