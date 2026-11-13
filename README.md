# Biodex

Catálogo visual de biodiversidade em formato de cartas colecionáveis. O projeto é um monorepo com frontend React/Vite e uma API Node.js; a primeira versão não é um jogo.

## Stack

- **Web:** React, TypeScript, Vite, styled-components e TanStack Query.
- **API:** Node.js e TypeScript, Express 5, PostgreSQL (`pg`), validação de ambiente, middleware de segurança HTTP e logs estruturados; pode ser executada em Node.js ou Cloudflare Workers.
- **Dados:** o catálogo taxonômico e os caches ficam em tabelas PostgreSQL; o navegador acessa a API e fontes públicas de mídia, sem receber credenciais do banco.
- **Modelos 3D:** a ficha da espécie busca modelos públicos pela API do Sketchfab e incorpora o viewer oficial. Resultados que mencionam o nome científico são priorizados; se não houver correspondência, tenta-se o nome comum. A identificação não é garantida; cada modelo mantém a atribuição e a licença exibidas pelo Sketchfab.

## Navegação

A página inicial (`/`) apresenta o projeto; o catálogo visual fica em `/catalog`, com sugestões de nomes populares, científicos e sinônimos enquanto você digita. As fichas continuam disponíveis em `/species/:id`, com navegação de retorno preservando os filtros aplicados no catálogo. As coleções pessoais ficam em `/collections` e exigem login; coleções compartilhadas carregam até 100 espécies do catálogo e não exigem conta. A área `/login` permite entrar ou se cadastrar com e-mail e senha ou Google; `/profile` exibe os dados da conta e também exige login. Com Neon Auth configurado, as coleções pessoais são sincronizadas com a API; a primeira sincronização importa as coleções locais sem removê-las até confirmar a cópia remota.

## Estrutura

```text
apps/
  api/
    src/
      app.ts                  configuração Express, middlewares e health check
      server.ts               inicialização e encerramento gracioso
      config/env.ts           leitura e validação das variáveis de ambiente
      database/pool.ts        pool compartilhado do PostgreSQL
      database/query.ts       cliente SQL parametrizado
      database/catalog-readiness.ts
                              validação das tabelas necessárias para servir o catálogo
      database/catalog-cache-schema.ts
                              schema idempotente dos caches de imagens e enriquecimento
      routes/                 rotas HTTP do catálogo
      http/                   controllers Express e erros HTTP
      catalog/
        controllers/          endpoints e regras de negócio do catálogo
        services/images.ts   consultas licenciadas a fontes de imagens
        utils/species-enrichment.ts
                              enriquecimento científico e cache de fontes externas
    dist/                     JavaScript compilado pelo TypeScript
    scripts/                  importação, migração e manutenção dos dados
  web/
    src/                      aplicação React
    worker/index.ts           adaptador da API Express para Cloudflare
    wrangler.jsonc             configuração do Worker, assets e Hyperdrive
```

## Requisitos

- Node.js 22.19+
- npm 10+

## Desenvolvimento

1. Instale as dependências na raiz:

   ```sh
   npm install
   ```

2. Configure a API copiando `apps/api/.env.example` para `apps/api/.env` e preenchendo a conexão PostgreSQL. Use `DATABASE_URL` pooled para a API e mantenha as variáveis individuais se os importadores precisarem acessar um PostgreSQL local.

   A busca de artigos usa metadados do OpenAlex. Configure opcionalmente `OPENALEX_API_KEY` na API para evitar depender da cota anônima compartilhada; mantenha essa chave somente no ambiente do backend.

3. Inicie a API:

   ```sh
   npm run dev:api
   ```

4. Em outro terminal, inicie o frontend com atualização automática ao salvar:

   ```sh
   npm run dev
   ```

   Esse comando inicia o Vite com HMR e conecta à API local em `http://localhost:1337/api` (ou à URL definida por `VITE_API_URL` em `apps/web/.env.local`). Para testar o Worker localmente com Wrangler, use `npm run dev:cloudflare`; esse fluxo constrói os arquivos antes de iniciar o Worker e não oferece HMR. A API escuta na porta `1337` por padrão, oferece `/health` e permite configurar origens com `CORS_ORIGINS`. Erros são formatados por um middleware único, e a API registra requisições com logs estruturados.

O login é opcional. Para desenvolvimento com Neon Auth, use uma branch isolada com `auth: true` em `neon.ts` (por exemplo, `neon checkout dev-auth --create --no-env-pull`) e obtenha somente as variáveis de Auth com `neon env pull --service auth --file .env.local`. O frontend lê `NEON_AUTH_BASE_URL` dessa configuração; a API também lê `NEON_AUTH_BASE_URL` e `NEON_AUTH_JWKS_URL` do `.env.local` na raiz. O cadastro por e-mail exige um código de confirmação de seis dígitos, enviado pelo provedor compartilhado do Neon Auth (`auth@mail.myneon.app`). A recuperação de senha também usa o envio de e-mail gerenciado pelo Neon Auth; os links de redefinição expiram em 15 minutos. Esses remetentes são gerenciados pelo Neon e não precisam de configuração no `.env`; para usar outro remetente, configure um provedor SMTP personalizado em Settings → Better Auth na branch correspondente. Aplique `apps/api/scripts/user-collections-schema.sql` ao banco usado pela API antes de testar as coleções autenticadas. Não aplique a configuração de Auth à branch principal sem intenção explícita. Em produção, configure a origem confiável da aplicação e credenciais próprias para Google OAuth.

Para compilar a API, execute `npm run build:api`. Para compilar e validar as rotas e middlewares sem conectar ao banco, execute `npm test --workspace @biodex/api`. Em desenvolvimento, `tsx watch` executa os arquivos TypeScript diretamente; em produção, `npm run start:api` executa a saída compilada em `apps/api/dist`.

## Deploy gratuito na Cloudflare

O deploy usa um único Cloudflare Worker para servir o frontend React/Vite como arquivos estáticos e encaminhar `/api/*` e `/health` para a API Express. O banco permanece no Neon; o acesso é feito pelo binding Hyperdrive `HYPERDRIVE`. O deploy exige uma conta Cloudflare e uma configuração Hyperdrive apontando para o banco Neon.

1. No Neon, crie um usuário de banco para a aplicação com as permissões necessárias e copie a conexão direta (sem `-pooler`). O Hyperdrive fará o pool de conexões. Não coloque a URL de conexão em arquivos versionados.
2. No Cloudflare, crie uma configuração Hyperdrive para essa conexão e associe-a ao Worker `biodex`. Substitua o ID de exemplo em `apps/web/wrangler.jsonc` pelo ID da configuração criada.
3. Faça login na Cloudflare pelo Wrangler e publique:

   ```sh
   npx wrangler login
   npm run deploy:cloudflare
   ```

   Configure também `ROOT_USER_ID` como Secret do Worker `biodex` em **Settings → Variables and Secrets**, usando o ID da sua conta no Neon Auth de produção. O Worker lê esse secret para determinar o papel root; o valor em `apps/api/.env` só vale para a API local.

4. O endpoint `/health` valida a conexão e as tabelas necessárias do catálogo. Se retornar `503`, aplique antes o schema de cache e importe os dados do catálogo.

Para criar um Preview pelo Cloudflare Workers Builds, mantenha o build como `npm run build --workspace @biodex/web -- --mode cloudflare` e use `npm run preview:cloudflare` como comando de deploy. O script usa `apps/web/dist/worker/wrangler.json`, gerado pelo plugin Vite: além do bloco `previews`, ele contém o `assets.directory` que o build calcula e que o comando Preview exige. Não execute `npx wrangler preview` com o `wrangler.jsonc` fonte, pois esse arquivo não contém o caminho dos assets compilados. Configure bindings de Preview somente para recursos de staging/teste.

Para desenvolver localmente com o Worker e Hyperdrive, defina `CLOUDFLARE_HYPERDRIVE_LOCAL_CONNECTION_STRING_HYPERDRIVE` no ambiente com uma conexão PostgreSQL direta e execute `npm run dev:cloudflare`. Essa variável é local e não deve ser compartilhada ou versionada. Use um banco local ou um branch de desenvolvimento, pois o modo local conecta diretamente ao banco; o pool otimizado do Hyperdrive só é usado no Worker publicado.

No plano gratuito da Cloudflare, Workers têm limite de 100 mil requisições por dia e 10 ms de CPU por invocação; Hyperdrive permite até 100 mil consultas ao banco por dia. As requisições de arquivos estáticos não contam como requisições do Worker. Confira os [limites do Workers](https://developers.cloudflare.com/workers/platform/pricing/) e do [Hyperdrive](https://developers.cloudflare.com/hyperdrive/platform/pricing/) antes de um lançamento com tráfego significativo.

Antes de iniciar a API em um banco já existente, aplique o schema dos caches:

```sh
npm run migrate:catalog-cache
```

A migração é idempotente. Em Neon, mantenha `DATABASE_URL` pooled para a API e configure também `DATABASE_URL_UNPOOLED`; o comando valida que ambas apontam para o mesmo banco e usa a conexão direta. Os importadores do Catalogue of Life e da PBDB também preparam esse schema. O health check verifica as tabelas do catálogo e dos caches e retorna `503` quando a instalação estiver incompleta.

Para habilitar contribuições, aplique também o schema de papéis, conteúdo editorial e sugestões de foto:

```sh
npm run migrate:contributions
```

Essa migração é idempotente e deve ser aplicada ao banco usado pela API antes do deploy. Em Neon, use uma branch de desenvolvimento e configure `DATABASE_URL_UNPOOLED` junto da URL pooled. Configure `ROOT_USER_ID` na API com o `sub` da conta que será o único root; esse papel é derivado da variável e não pode ser concedido pela interface.

O perfil armazena data de nascimento e profissão, mas não exibe a idade. CPF e data de nascimento ficam imutáveis após o primeiro salvamento. O CPF é validado, único e criptografado pela API; ele nunca é retornado completo, e o perfil exibe apenas uma máscara com os quatro últimos dígitos (por exemplo, `xxx.xxx.x65-05`). Configure `CPF_ENCRYPTION_KEY` com uma chave aleatória de 32 bytes codificada em Base64, tanto em `apps/api/.env` quanto como Secret do Worker `biodex`. Gere-a com `node -e "console.log(require('node:crypto').randomBytes(32).toString('base64'))"`. Não compartilhe nem altere essa chave sem planejar a migração dos CPFs já cadastrados.

O registro profissional é opcional. Para conceder curadoria, um admin ou root deve conferir o conselho e o número em uma fonte oficial e marcar o registro como ativo na área de contribuições. Alterar esses dados invalida a revisão anterior e remove o papel de curador até uma nova validação e concessão.

## Importação do Catalogue of Life

O ZIP fornecido é o Catalogue of Life **COL26.10 XR**, DOI `10.48580/dgzlf`. O discovery encontrou 19.449 entradas, 1,39 GB compactados e 5,32 GB descompactados. `NameUsage.tsv` contém 8.504.545 usos de nomes, incluindo 5.075.242 aceitos, 3.118.808 sinônimos, 140.657 sinônimos ambíguos e 7.021 nomes misaplicados. São 2.359.753 espécies aceitas. O pacote também contém 2.051.390 nomes vernaculares, dos quais 74.888 estão marcados como português (`por`); não inclui imagens de espécies.

O importador lê os arquivos diretamente do ZIP, sem extrair os 5,32 GB para disco. Importa `NameUsage.tsv`, `VernacularName.tsv` e `NameRelation.tsv`; referências bibliográficas, distribuições, material-tipo e metadados individuais das fontes ficam para uma etapa posterior. O identificador original do Catalogue of Life e o DOI da versão são preservados. Os registros virais são identificados separadamente; a listagem padrão omite vírus, e eles aparecem ao selecionar uma categoria viral. Cada táxon também guarda a origem dos dados, permitindo atualizar o Catalogue of Life sem apagar registros importados de outras bases.

### Requisitos para importar

- PostgreSQL com `pg_trgm` disponível para as buscas.
- Configure `DATABASE_CLIENT=postgres`, `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_NAME`, `DATABASE_USERNAME` e `DATABASE_PASSWORD` em `apps/api/.env`.
- Reserve espaço para as tabelas e índices do banco. A carga é transacional e pode exigir vários gigabytes além do arquivo ZIP.

Faça primeiro uma validação integral do ZIP, sem PostgreSQL:

```sh
npm run import:col --workspace @biodex/api -- --archive "C:\caminho\para\catalogue.zip" --dry-run
```

Após configurar e iniciar o PostgreSQL, execute a ingestão:

```sh
npm run import:col --workspace @biodex/api -- --archive "C:\caminho\para\catalogue.zip"
```

O importador não substitui os dados por padrão quando a mesma versão já existe. Use `--force` somente para substituir/recarregar explicitamente a versão. Após uma carga efetiva, os caches de imagens e enriquecimento são limpos para não reaproveitar dados da taxonomia anterior.

## Importação de dinossauros da Paleobiology Database

O importador complementar consulta a API pública da [Paleobiology Database](https://paleobiodb.org/), sem exigir chave. Ele importa espécies fósseis aceitas de Dinosauria que a PBDB classifica como regulares, além dos táxons ancestrais necessários para montar a classificação completa. Cada registro recebe um identificador `pbdb:` e a origem fica explícita; somente as espécies-alvo aparecem como cartas. A classificação mantém os ranks da fonte: por exemplo, `Reptilia` é a classe e `Dinosauria` é apresentado como grupo taxonômico, não como classe formal.

Com PostgreSQL configurado em `apps/api/.env`, valide primeiro a resposta e a árvore taxonômica:

```sh
npm run import:pbdb --workspace @biodex/api -- --dry-run
```

Depois importe ou atualize os registros PBDB:

```sh
npm run import:pbdb --workspace @biodex/api
```

A atualização substitui apenas os registros da Paleobiology Database e é transacional; não remove registros nem edições do Catalogue of Life. A busca por `Dinosauria` encontra o grupo taxonômico, e a ficha exibe a fonte e a referência bibliográfica retornada pela PBDB. Após a importação, o cache de imagens é limpo e somente o cache de enriquecimento dos identificadores `pbdb:` é invalidado. A API e o conjunto de dados podem mudar ao longo do tempo.

## Banco reduzido para demonstração no Neon

Para publicar uma demonstração usando o limite gratuito de armazenamento, gere um pacote a partir do PostgreSQL local:

```sh
npm run export:neon-demo --workspace @biodex/api
```

O exportador seleciona até 250 espécies aceitas de cada reino do Catalogue of Life, prioriza táxons com nomes em português/inglês, inclui algumas espécies conhecidas e mantém todas as espécies de dinossauros da Paleobiology Database já importadas. Os ancestrais taxonômicos necessários, até cinco nomes vernaculares em português/inglês por táxon e relações entre táxons preservados também são incluídos. Use `--per-kingdom 250` para controlar a amostra por reino ou `--total-species 200000` para distribuir uma meta total proporcionalmente entre reinos. Os arquivos são escritos em `apps/api/.tmp/neon-demo-<data>`.

O pacote contém CSVs do catálogo reduzido e `manifest.json` com contagens/estimativa. O banco de origem não é alterado e o script requer PostgreSQL em `apps/api/.env` e um diretório de saída vazio.

Para atualizar somente o catálogo de um banco Neon já existente, crie primeiro um branch de backup e gere o pacote maior:

```powershell
npm run export:neon-demo --workspace @biodex/api -- --total-species 200000 --output .tmp/neon-demo-200k
npm run replace:neon-catalog --workspace @biodex/api -- --input .tmp/neon-demo-200k
```

O segundo comando valida o pacote e as URLs `DATABASE_URL` (pooled) e `DATABASE_URL_UNPOOLED` (direct), sem gravar alterações. Acrescente `--apply` para substituir, em uma transação, as quatro tabelas do catálogo e limpar os caches derivados de taxonomia. Ele confere espécies, dinossauros, ancestrais e referências sem destino, roda `ANALYZE` e interrompe a transação se o banco chegar a 900 MB. Nunca publique a connection string ou o pacote junto ao código-fonte.

Para a API em produção, defina `DATABASE_URL` com a URL **pooled** do Neon e `CORS_ORIGINS` com a origem pública do frontend. Use `DATABASE_URL_UNPOOLED` para importações e operações de banco. Em produção, configure `VITE_API_URL` com a URL pública da API terminada em `/api`.

## Informações complementares e sons

Ao abrir uma ficha, `GET /api/catalog/species/:id/enrichment` busca informações adicionais sob demanda e mantém um cache PostgreSQL por espécie. O iNaturalist pode fornecer nome comum, resumo enciclopédico, observações e avaliação de conservação; o GBIF pode fornecer contagem de ocorrências e países com registros. Para espécies extintas, a PBDB pode acrescentar intervalos geológicos, idades aproximadas, localidades e referências, consultando até 100 ocorrências correspondentes.

Para espécies viventes de Animalia, a ficha também procura áudio nos registros multimídia do GBIF. Só são exibidas gravações com URL HTTPS e licença Creative Commons ou domínio público reconhecida, com autoria, licença e link para o registro. O nome identificado no registro fica visível, pois pode ser de uma subespécie. O player personalizado usa os controles de mídia do navegador por trás de uma interface própria com barras estilizadas, progresso e busca; iniciar outra gravação pausa a anterior. A reprodução começa diretamente no áudio e não depende da leitura cross-origin necessária para gerar uma forma de onda. A ficha também mostra um mapa de densidade de ocorrências georreferenciadas do GBIF sobre um mapa-base monocromático servido pelo GBIF, com dados cartográficos do OpenStreetMap. O mapa mostra registros conhecidos, não limites de endemismo nem toda a distribuição da espécie; os tiles são carregados diretamente do GBIF. A galeria usa `react-image-gallery`, com miniaturas, navegação por toque/teclado e tela cheia; quando disponível, o fullscreen carrega a imagem original em resolução máxima. Os dados complementares são armazenados por 30 dias; respostas parciais por falha de fonte expiram em 12 horas.

A ViralZone é apresentada como uma fonte externa para vírus, sem copiar seu conteúdo: não foi encontrada uma API pública estável para integrar suas fichas automaticamente. As fontes podem não ter dados para todas as espécies e podem ficar temporariamente indisponíveis; isso não impede o carregamento da ficha principal.

### Busca, filtros e ordenação

A busca do catálogo aceita nomes científicos, nomes populares e nomes científicos relacionados por sinonímia no Catalogue of Life; termos com pelo menos três caracteres são necessários. Os resultados priorizam correspondências exatas e prefixos antes de correspondências parciais. É possível combinar a busca com filtros taxonômicos, ambientes e fonte do registro, além de filtrar espécies viventes ou extintas. Ambientes múltiplos são divididos em opções individuais; a seleção de mais de um ambiente inclui espécies que correspondam a qualquer um deles. A ordenação pode ser por relevância, nome científico ou nome popular, e a seleção pode ser compartilhada pela URL.

Endpoints:

- `GET /api/catalog/species?page=1&pageSize=48&search=...&sort=relevance&kingdom=...&phylum=...&class=...&order=...&family=...&genus=...&habitat=marine&habitat=freshwater&source=...&extinct=true`
- `GET /api/catalog/species/:id` retorna o registro completo disponível de uma espécie aceita, incluindo sua ancestralidade taxonômica, autoria, informações sobre extinção e ambiente, nomes vernaculares, nomes e relações vinculados, identificadores das fontes e metadados da edição importada.
- `GET /api/catalog/species/:id/enrichment` retorna descrições atribuídas às respectivas fontes e armazenadas em cache, informações de conservação e ocorrências, registros fósseis e, quando disponíveis, áudios licenciados de animais.
- `GET /api/catalog/kingdoms`
- `GET /api/catalog/facets?field=phylum&kingdom=animalia` retorna opções taxonômicas limitadas ao táxon superior selecionado. Os campos aceitos são `kingdom`, `phylum`, `class`, `order`, `family` e `genus`.
- `GET /api/catalog/image?taxonId=col%3A123&scientificName=Panthera%20leo` resolve primeiro o identificador único do táxon no catálogo e usa seu nome científico e hierarquia taxonômica para restringir a correspondência do GBIF; se o identificador não estiver disponível, o nome científico continua sendo aceito como fallback. A chave do cache usa o identificador do táxon, evitando colisões entre espécies homônimas. As imagens são buscadas no GBIF, iNaturalist e Wikimedia Commons, nessa ordem quando há contexto taxonômico. Para uma correspondência exata no Commons, o nome científico precisa aparecer no título ou nos metadados descritivos da imagem (categorias, por si só, não bastam); resultados com indícios de ilustração, fóssil ou outro conteúdo não fotográfico são descartados, e os metadados com correspondência mais forte são priorizados. A imagem de táxons superiores é sempre o último recurso: só é procurada se nenhuma imagem específica da espécie for encontrada. Nesse caso, o sistema percorre os ancestrais imediatos e superiores (gênero, família, ordem, classe, filo e reino), usando fotos de táxons do iNaturalist e o Wikimedia Commons em cada nível. Para vírus, a busca usa termos relacionados a vírions, ilustrações e micrografias. Os resultados incluem o nível taxonômico e o nome do táxon representado, e nunca são apresentados como imagens específicas da espécie. Acrescente `&gallery=true` para solicitar até oito fotos licenciadas para a galeria da ficha; os resultados da galeria são armazenados em cache no PostgreSQL junto com a imagem principal. Resultados positivos ficam em cache por 180 dias e buscas sem resultado, por 14 dias, em `col_species_image_cache`. Buscas sem resultado feitas pelo mecanismo de fallback anterior são repetidas; falhas dos provedores não são armazenadas em cache.
