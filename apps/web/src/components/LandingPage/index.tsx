import {
  Arrow,
  ArtCaption,
  ArtFrame,
  ArtLabel,
  ArtOrbit,
  ArtSpecimen,
  Artwork,
  BackgroundMark,
  Body,
  CardTag,
  Feature,
  FeatureGrid,
  Features,
  Footer,
  Header,
  HeaderAction,
  HeaderLink,
  Hero,
  HeroAction,
  HeroActions,
  HeroCopy,
  HeroVisual,
  Intro,
  IntroNote,
  IntroSection,
  Logo,
  Main,
  Nav,
  SectionEyebrow,
  SectionTitle,
  SmallMark,
  Specimen,
  SpecimenArt,
  SpecimenBody,
  SpecimenName,
  SpecimenRank,
  Stamp,
  Strip,
  StripItem,
  Tag,
} from './styles';

const features = [
  {
    number: '01',
    title: 'Um planeta em categorias',
    description: 'Reinos, filos e famílias revelam como cada forma de vida se conecta.',
    mark: '✳',
    color: 'green',
  },
  {
    number: '02',
    title: 'Cada espécie, uma descoberta',
    description: 'Cartas visuais aproximam nomes científicos de histórias fascinantes.',
    mark: '✿',
    color: 'orange',
  },
  {
    number: '03',
    title: 'Detalhes que ganham vida',
    description: 'Explore imagens, sons, mapas de ocorrência e modelos tridimensionais.',
    mark: '◉',
    color: 'blue',
  },
] as const;

function MothIllustration() {
  return (
    <svg
      viewBox="0 0 360 340"
      role="img"
      aria-labelledby="moth-title"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title id="moth-title">Ilustração de uma mariposa em tons de coral e verde</title>
      <defs>
        <linearGradient id="wing-left" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#f4b994" />
          <stop offset="1" stopColor="#dc7257" />
        </linearGradient>
        <linearGradient id="wing-right" x1="1" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#f4b994" />
          <stop offset="1" stopColor="#dc7257" />
        </linearGradient>
      </defs>
      <g stroke="#293b31" strokeWidth="2.5" strokeLinejoin="round">
        <path d="M174 151C137 76 72 49 43 75c-26 24-2 86 41 116 22 15 52 22 83 11-37 16-57 43-49 67 11 31 51 24 72-13l-2-87Z" fill="url(#wing-left)" />
        <path d="M186 151c37-75 102-102 131-76 26 24 2 86-41 116-22 15-52 22-83 11 37 16 57 43 49 67-11 31-51 24-72-13l2-87Z" fill="url(#wing-right)" />
        <path d="M178 157c-27-33-46-50-76-62 9 29 24 52 56 70-26-6-44-3-63 7 28 17 51 22 78 20" fill="none" opacity=".8" />
        <path d="M182 157c27-33 46-50 76-62-9 29-24 52-56 70 26-6 44-3 63 7-28 17-51 22-78 20" fill="none" opacity=".8" />
        <path d="M177 199c-22 28-35 47-42 70 25-11 42-26 54-53M183 199c22 28 35 47 42 70-25-11-42-26-54-53" fill="none" opacity=".8" />
        <path d="M174 154c-17-35-32-53-57-70M186 154c17-35 32-53 57-70" fill="none" strokeLinecap="round" />
        <path d="M177 151c-7-22-9-38-4-55M183 151c7-22 9-38 4-55" fill="none" strokeLinecap="round" />
        <ellipse cx="180" cy="188" rx="8" ry="43" fill="#334a3d" />
        <circle cx="180" cy="143" r="7" fill="#334a3d" />
      </g>
      <g fill="#f3e7d2" opacity=".92">
        <circle cx="88" cy="112" r="5" />
        <circle cx="112" cy="151" r="3.5" />
        <circle cx="272" cy="112" r="5" />
        <circle cx="248" cy="151" r="3.5" />
        <circle cx="151" cy="228" r="4" />
        <circle cx="209" cy="228" r="4" />
      </g>
    </svg>
  );
}

export function LandingPage() {
  return (
    <Main>
      <Header>
        <Logo href="/" aria-label="Biodex, início">
          bio<span>dex</span><SmallMark>✳</SmallMark>
        </Logo>
        <Nav aria-label="Navegação principal">
          <HeaderLink href="#sobre">O atlas</HeaderLink>
          <HeaderLink href="#explore">O que você encontra</HeaderLink>
          <HeaderAction href="/catalog">Explorar catálogo <Arrow aria-hidden="true">↗</Arrow></HeaderAction>
        </Nav>
      </Header>

      <Body>
        <Hero>
          <HeroCopy>
            <Tag><span /> UM ATLAS VISUAL DA VIDA</Tag>
            <h1>O mundo vivo é <em>maior</em> do que parece.</h1>
            <Intro>
              Uma coleção para descobrir, de perto, as espécies extraordinárias que dividem este planeta com a gente.
            </Intro>
            <HeroActions>
              <HeroAction href="/catalog">Entre no catálogo <Arrow aria-hidden="true">↗</Arrow></HeroAction>
              <IntroNote>Milhões de espécies. Infinitas histórias.</IntroNote>
            </HeroActions>
            <Stamp aria-hidden="true">
              <span>ESTUDE</span>
              <b>✳</b>
              <span>EXPLORE</span>
              <b>✳</b>
              <span>PRESERVE</span>
            </Stamp>
          </HeroCopy>

          <HeroVisual aria-label="Uma carta ilustrada de mariposa">
            <BackgroundMark aria-hidden="true">BIODIVERSIDADE · VIDA · BIODIVERSIDADE · VIDA ·</BackgroundMark>
            <ArtOrbit $orbit="outer" />
            <ArtOrbit $orbit="inner" />
            <ArtFrame>
              <ArtLabel><span>LEPIDOPTERA</span><span>001 — 08</span></ArtLabel>
              <Artwork><MothIllustration /></Artwork>
              <ArtSpecimen>
                <div>
                  <SpecimenRank>ANIMALIA · INSECTA</SpecimenRank>
                  <SpecimenName>Actias luna</SpecimenName>
                </div>
                <CardTag>ESPÉCIE</CardTag>
              </ArtSpecimen>
              <ArtCaption>MARIPOSA-LUA <span>↗</span></ArtCaption>
            </ArtFrame>
            <Specimen $position="left">
              <SpecimenArt $tone="leaf">✳</SpecimenArt>
              <SpecimenBody><b>Plantae</b><span>Reino vegetal</span></SpecimenBody>
            </Specimen>
            <Specimen $position="right">
              <SpecimenArt $tone="coral">◌</SpecimenArt>
              <SpecimenBody><b>Fungi</b><span>Reino dos fungos</span></SpecimenBody>
            </Specimen>
          </HeroVisual>
        </Hero>

        <Strip aria-label="Biodex em poucas palavras">
          <StripItem><b>01</b> vida em toda escala</StripItem>
          <StripItem><b>02</b> ciência para explorar</StripItem>
          <StripItem><b>03</b> curiosidade sem fim</StripItem>
          <StripItem><span aria-hidden="true">✳</span> um planeta de possibilidades</StripItem>
        </Strip>

        <IntroSection id="sobre">
          <div>
            <SectionEyebrow>UMA NOVA FORMA DE OLHAR</SectionEyebrow>
            <SectionTitle>Conhecer a vida é o começo de cuidar dela.</SectionTitle>
          </div>
          <p>
            Biodex transforma a classificação da biodiversidade em uma jornada visual.
            Navegue pelos grandes reinos, siga os fios da taxonomia e encontre espécies
            que talvez você nunca tenha imaginado.
          </p>
        </IntroSection>

        <Features id="explore">
          <FeatureGrid>
            {features.map((feature) => (
              <Feature key={feature.number} $tone={feature.color}>
                <div className="feature-top"><span>{feature.number} / 03</span><b aria-hidden="true">{feature.mark}</b></div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
                <span className="feature-line" aria-hidden="true" />
              </Feature>
            ))}
          </FeatureGrid>
        </Features>

        <Footer>
          <Logo href="/" aria-label="Biodex, início">bio<span>dex</span><SmallMark>✳</SmallMark></Logo>
          <p>Feito para quem ainda se surpreende com a vida.</p>
          <a href="/catalog">Descobrir espécies <Arrow aria-hidden="true">↗</Arrow></a>
        </Footer>
      </Body>
    </Main>
  );
}
