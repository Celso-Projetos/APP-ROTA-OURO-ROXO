# APP ROTA OURO ROXO

Cópia local do código-fonte do aplicativo publicado no AppDeploy.

## Estrutura

- `src/`: interface em React e estilos.
- `backend/`: rotas, banco e atualizações em tempo real.
- `public/resources/`: logo usado pelo aplicativo.
- `tests/tests.json`: cenários de verificação cadastrados no projeto.

## Dependências do AppDeploy

O código importa `@appdeploy/client` na interface e `@appdeploy/sdk` no backend. Esses recursos de login, banco de dados, armazenamento e tempo real dependem do ambiente AppDeploy. O `package.json` exportado não inclui esses pacotes; portanto, esta pasta guarda o código-fonte, mas não é uma instalação independente do backend.

Para iniciar o servidor Vite local, instale Node.js, rode `npm install` e depois `npm run dev`. A execução completa depende de configurar o acesso ao AppDeploy.

Esta exportação inclui os arquivos do projeto, mas não exporta dados armazenados no banco de produção nem credenciais.

Snapshot exportado do AppDeploy, versão `1794526693347`.
