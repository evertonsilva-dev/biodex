-- Curadoria inicial baseada em espécies existentes no catálogo do COL.

INSERT INTO editorial_collections (slug, title, description, introduction, featured_image_url, species_ids, steps, "order", published)
VALUES
  (
    'gigantes-da-vida',
    'Gigantes da vida',
    'Do fundo do oceano às savanas, descubra como o tamanho transforma corpo, alimento e território.',
    'Nesta trilha, quatro gigantes mostram diferentes relações entre escala, adaptação e ambiente. Em cada passo, observe como um corpo extraordinário responde aos desafios de viver.',
    NULL,
    ARRAY['KF8T', '398D9', '3W9KV', '3G3KN']::text[],
    '[
      {
        "speciesId": "KF8T",
        "title": "O maior animal do planeta",
        "narrative": "A baleia-azul é o maior animal conhecido. Ainda assim, sua dieta é quase toda composta de krill, que ela retém ao filtrar grandes volumes de água por suas barbas.",
        "sourceLabel": "NOAA Fisheries",
        "sourceUrl": "https://www.fisheries.noaa.gov/species/blue-whale"
      },
      {
        "speciesId": "398D9",
        "title": "Uma tromba precisa e poderosa",
        "narrative": "A tromba reúne o nariz e o lábio superior. Sem ossos e com cerca de 150 mil unidades musculares, ela combina movimentos delicados com força para levantar objetos.",
        "sourceLabel": "Smithsonian National Zoo",
        "sourceUrl": "https://nationalzoo.si.edu/animals/asian-elephant"
      },
      {
        "speciesId": "3W9KV",
        "title": "Um recorde em terra",
        "narrative": "O elefante-africano é o maior animal terrestre. Suas grandes orelhas também ajudam a dissipar calor, uma adaptação importante em dias quentes.",
        "sourceLabel": "Animal Diversity Web",
        "sourceUrl": "https://animaldiversity.org/accounts/Loxodonta_africana/"
      },
      {
        "speciesId": "3G3KN",
        "title": "A diversidade também está no nome",
        "narrative": "A Giraffe Conservation Foundation reconhece quatro espécies distintas de girafa na África. Pesquisas sobre distribuição e características revelam uma diversidade maior do que o olhar à primeira vista percebe.",
        "sourceLabel": "Giraffe Conservation Foundation",
        "sourceUrl": "https://giraffeconservation.org/giraffe-species/"
      }
    ]'::jsonb,
    1,
    true
  ),
  (
    'estrategias-de-caca',
    'Estratégias de caça',
    'De investidas individuais à cooperação, explore diferentes estratégias de predadores.',
    'A busca por alimento não segue uma receita única. Percorra cinco predadores e descubra como território, flexibilidade e aprendizado moldam diferentes estratégias.',
    NULL,
    ARRAY['4CGXP', '4CGXQ', '4CGXS', 'QLXL', '5BSG3']::text[],
    '[
      {
        "speciesId": "4CGXP",
        "title": "Quem caça?",
        "narrative": "Leões machos e fêmeas podem caçar. Embora as fêmeas sejam mais associadas às investidas, a busca por alimento não é uma tarefa exclusiva delas.",
        "sourceLabel": "Panthera",
        "sourceUrl": "https://panthera.org/cat/lion"
      },
      {
        "speciesId": "4CGXQ",
        "title": "A caça também atravessa a água",
        "narrative": "A onça-pintada é uma nadadora poderosa e pode caçar répteis aquáticos, como jacarés e tartarugas. Em florestas alagadas, a água faz parte do território de caça.",
        "sourceLabel": "Panthera",
        "sourceUrl": "https://panthera.org/cat/jaguar"
      },
      {
        "speciesId": "4CGXS",
        "title": "Um caçador de muitos ambientes",
        "narrative": "Tigres vivem em paisagens que vão de florestas tropicais e manguezais a regiões nevadas. Também são bons nadadores, mostrando como uma espécie pode se adaptar a territórios muito diferentes.",
        "sourceLabel": "Panthera",
        "sourceUrl": "https://panthera.org/cat/tiger"
      },
      {
        "speciesId": "QLXL",
        "title": "A caça se aprende em grupo",
        "narrative": "Filhotes de lobo recebem cuidado e alimento dos membros do bando; por volta dos dez meses, começam a caçar com ele. A coordenação da matilha se constrói ao longo do crescimento.",
        "sourceLabel": "Animal Diversity Web",
        "sourceUrl": "https://animaldiversity.org/accounts/Canis_lupus/"
      },
      {
        "speciesId": "5BSG3",
        "title": "Uma estratégia flexível",
        "narrative": "A raposa-vermelha é onívora: pode comer roedores, coelhos, insetos, frutas e até carcaças. Uma dieta variada ajuda a aproveitar os alimentos disponíveis em cada ambiente.",
        "sourceLabel": "Animal Diversity Web",
        "sourceUrl": "https://animaldiversity.org/accounts/Vulpes_vulpes/"
      }
    ]'::jsonb,
    2,
    true
  ),
  (
    'quando-cai-a-noite',
    'Quando cai a noite',
    'Uma jornada pelos sentidos e ritmos que ganham vida depois do pôr do sol.',
    'A noite não é igual para todos: uma mariposa segue sinais químicos, raposas alternam seus horários, lobos percorrem longas distâncias e uma raposa-voadora se orienta pela visão.',
    NULL,
    ARRAY['9SSP', '5BSG3', 'QLXL', '4Q34B']::text[],
    '[
      {
        "speciesId": "9SSP",
        "title": "Um encontro guiado pelo cheiro",
        "narrative": "A mariposa-lua é noturna. As fêmeas liberam feromônios, e os machos seguem esse rastro químico; o acasalamento costuma começar depois da meia-noite.",
        "sourceLabel": "Animal Diversity Web",
        "sourceUrl": "https://animaldiversity.org/accounts/Actias_luna/"
      },
      {
        "speciesId": "5BSG3",
        "title": "Duas janelas de atividade",
        "narrative": "A raposa-vermelha pode ser ativa à noite ou no crepúsculo. Nem toda espécie noturna segue o mesmo relógio: algumas também aproveitam os momentos de transição entre dia e noite.",
        "sourceLabel": "Animal Diversity Web",
        "sourceUrl": "https://animaldiversity.org/accounts/Vulpes_vulpes/"
      },
      {
        "speciesId": "QLXL",
        "title": "Passos que atravessam a escuridão",
        "narrative": "No outono e no inverno, os deslocamentos dos lobos costumam ocorrer à noite e cobrir longas distâncias. Uivos ajudam os membros do bando a se localizar e a se reunir para caçar.",
        "sourceLabel": "Animal Diversity Web",
        "sourceUrl": "https://animaldiversity.org/accounts/Canis_lupus/"
      },
      {
        "speciesId": "4Q34B",
        "title": "Morcegos com outro mapa sensorial",
        "narrative": "A raposa-voadora-grande se orienta pela visão durante o voo, em vez de usar ecolocalização. Visão e olfato também ajudam a localizar alimento: nem todo morcego navega da mesma forma.",
        "sourceLabel": "Animal Diversity Web",
        "sourceUrl": "https://animaldiversity.org/accounts/Pteropus_vampyrus/"
      }
    ]'::jsonb,
    3,
    true
  )
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  introduction = EXCLUDED.introduction,
  featured_image_url = EXCLUDED.featured_image_url,
  species_ids = EXCLUDED.species_ids,
  steps = EXCLUDED.steps,
  "order" = EXCLUDED."order",
  published = EXCLUDED.published,
  updated_at = now();
