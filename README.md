# Conversor Excel para TXT

Este projeto é um conversor de arquivos Excel para TXT, desenvolvido com Next.js, TypeScript e Tailwind CSS.

## Funcionalidades

- Upload de arquivos Excel
- Conversão para três formatos de arquivo TXT
- Visualização prévia dos arquivos gerados
- Download individual ou em ZIP
- Suporte a arquivos EAN (opcional)

## Requisitos

- Node.js 18.x ou superior
- npm ou yarn

## Instalação

1. Clone o repositório:

\`\`\`bash
git clone https://github.com/seu-usuario/conversor-excel-txt.git
cd conversor-excel-txt
\`\`\`

2. Instale as dependências:

\`\`\`bash
npm install
# ou
yarn install
\`\`\`

3. Execute o projeto em modo de desenvolvimento:

\`\`\`bash
npm run dev
# ou
yarn dev
\`\`\`

4. Acesse o projeto em [http://localhost:3000](http://localhost:3000)

## Estrutura de Arquivos

- `app/` - Páginas e rotas da aplicação
- `components/` - Componentes React reutilizáveis
- `public/` - Arquivos estáticos e uploads temporários
- `lib/` - Funções utilitárias

## Como Usar

1. Acesse a página inicial
2. Faça upload do arquivo Excel principal (obrigatório)
3. Opcionalmente, faça upload do arquivo EAN
4. Clique em "Converter Arquivos"
5. Visualize a prévia dos arquivos gerados
6. Faça o download individual ou em ZIP dos arquivos

## Formatos de Saída

- **Estoque lista.txt** - Contém código, quantidade e valor unitário
- **Conferência Ok.txt** - Contém código, descrição, quantidade e informações extras
- **Lista de Produtos ATUAIS.txt** - Contém código, descrição e informações extras

## Licença

MIT
\`\`\`

Let's create a .gitignore file:

```text file=".gitignore"
# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts

# uploads
/public/uploads/
