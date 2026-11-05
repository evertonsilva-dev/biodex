-- Curadoria inicial baseada em espécies existentes no catálogo do COL.

INSERT INTO editorial_collections (slug, title, description, introduction, featured_image_url, species_ids, "order", published)
VALUES
  (
    'gigantes-da-vida',
    'Gigantes da vida',
    'Do fundo do oceano às savanas, conheça algumas das maiores espécies do planeta.',
    'Tamanho também conta histórias sobre adaptação, alimento e espaço. Estas cartas aproximam quatro gigantes de ambientes muito diferentes.',
    NULL,
    ARRAY['KF8T', '398D9', '3W9KV', '3G3KN']::text[],
    1,
    true
  ),
  (
    'estrategias-de-caca',
    'Estratégias de caça',
    'Observe como diferentes predadores encontram seu lugar nas teias da vida.',
    'Emboscada, perseguição ou trabalho em grupo: não existe uma única receita para caçar. Esta seleção reúne felinos e canídeos com estratégias e territórios distintos.',
    NULL,
    ARRAY['4CGXP', '4CGXQ', '4CGXS', 'QLXL', '5BSG3']::text[],
    2,
    true
  ),
  (
    'quando-cai-a-noite',
    'Quando cai a noite',
    'Quatro cartas para explorar ritmos, sentidos e encontros depois do pôr do sol.',
    'A escuridão não significa pausa: mariposas, raposas, lobos e morcegos atravessam a noite de maneiras próprias. Conheça alguns desses percursos sem perder de vista que cada espécie tem seu ritmo.',
    NULL,
    ARRAY['9SSP', '5BSG3', 'QLXL', '4Q34B']::text[],
    3,
    true
  )
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  introduction = EXCLUDED.introduction,
  featured_image_url = EXCLUDED.featured_image_url,
  species_ids = EXCLUDED.species_ids,
  "order" = EXCLUDED."order",
  published = EXCLUDED.published,
  updated_at = now();
