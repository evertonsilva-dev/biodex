import styled, { keyframes } from 'styled-components';

const appear = keyframes`
  from { opacity: 0; transform: translateY(18px); }
  to { opacity: 1; transform: translateY(0); }
`;

const drift = keyframes`
  0%, 100% { transform: translateY(0) rotate(-2deg); }
  50% { transform: translateY(-12px) rotate(1deg); }
`;

const orbit = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const reveal = keyframes`
  from { opacity: 0; transform: translateY(24px) scale(.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
`;

export const Main = styled.main`
  min-height: 100vh;
  overflow: hidden;
  background: #f3efe4;
  color: #23332a;

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: .01ms !important;
      animation-iteration-count: 1 !important;
      scroll-behavior: auto !important;
      transition-duration: .01ms !important;
    }
  }
`;

export const Header = styled.header`
  position: relative;
  z-index: 2;
  display: flex;
  width: min(1320px, calc(100% - 8vw));
  height: 92px;
  align-items: center;
  justify-content: space-between;
  margin: 0 auto;
  border-bottom: 1px solid #23332a1c;

  @media (max-width: 700px) {
    width: calc(100% - 2.5rem);
    height: 76px;
  }
`;

export const Logo = styled.a`
  display: inline-flex;
  align-items: center;
  color: #23332a;
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: 1.65rem;
  font-weight: 900;
  letter-spacing: -.09em;
  text-decoration: none;

  span { color: #da765b; }
`;

export const SmallMark = styled.i`
  margin: -1rem 0 0 .2rem;
  color: #77906b !important;
  font-size: .75rem;
  font-style: normal;
`;

export const Nav = styled.nav`
  display: flex;
  align-items: center;
  gap: clamp(1.2rem, 3vw, 3rem);

  @media (max-width: 560px) {
    gap: .75rem;
  }
`;

export const HeaderLink = styled.a`
  color: #59645a;
  font-size: .82rem;
  font-weight: 600;
  text-decoration: none;
  transition: color 160ms ease;

  &:hover { color: #da765b; }

  @media (max-width: 560px) { display: none; }
`;

export const HeaderAction = styled.a`
  display: inline-flex;
  align-items: center;
  gap: .6rem;
  padding: .75rem 1rem;
  border: 1px solid #23332a30;
  border-radius: 999px;
  color: #23332a;
  font-size: .78rem;
  font-weight: 700;
  text-decoration: none;
  transition: background 180ms ease, color 180ms ease, transform 180ms ease;

  &:hover { transform: translateY(-2px); background: #23332a; color: #fffaf0; }
`;

export const Arrow = styled.span`
  display: inline-block;
  font-size: 1.1em;
  transition: transform 180ms ease;

  a:hover & { transform: translate(2px, -2px); }
`;

export const Body = styled.div`
  width: min(1320px, calc(100% - 8vw));
  margin: 0 auto;

  @media (max-width: 700px) { width: calc(100% - 2.5rem); }
`;

export const Hero = styled.section`
  display: grid;
  min-height: min(720px, calc(100vh - 92px));
  grid-template-columns: minmax(0, .9fr) minmax(420px, 1.1fr);
  align-items: center;
  gap: 2rem;
  padding: 3.5rem 0 4.5rem;

  @media (max-width: 900px) {
    min-height: auto;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    padding: 4rem 0;
  }

  @media (max-width: 700px) {
    grid-template-columns: 1fr;
    gap: 2.5rem;
    padding: 4rem 0 3rem;
  }
`;

export const HeroCopy = styled.div`
  position: relative;
  z-index: 1;
  padding: 1rem 0 2rem;
  animation: ${appear} 700ms both;

  h1 {
    max-width: 690px;
    margin: 1.55rem 0 1.35rem;
    font-family: Georgia, 'Times New Roman', serif;
    font-size: clamp(3.55rem, 7.3vw, 7.4rem);
    font-weight: 400;
    letter-spacing: -.085em;
    line-height: .91;
  }

  h1 em {
    color: #dc795f;
    font-weight: 400;
  }

  @media (max-width: 900px) {
    h1 { font-size: clamp(3.3rem, 7.4vw, 5.3rem); }
  }

  @media (max-width: 700px) {
    padding: 0;
    h1 { max-width: 580px; font-size: clamp(3.5rem, 14vw, 5.5rem); }
  }
`;

export const Tag = styled.p`
  display: flex;
  align-items: center;
  gap: .65rem;
  margin: 0;
  color: #687365;
  font-size: .7rem;
  font-weight: 800;
  letter-spacing: .16em;

  span {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #da765b;
    box-shadow: 0 0 0 4px #da765b20;
  }
`;

export const Intro = styled.p`
  max-width: 410px;
  margin: 0;
  color: #657066;
  font-size: clamp(.95rem, 1.3vw, 1.1rem);
  line-height: 1.75;
`;

export const HeroActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1.35rem;
  margin-top: 2rem;
`;

export const HeroAction = styled.a`
  display: inline-flex;
  min-height: 54px;
  align-items: center;
  justify-content: center;
  gap: 1.15rem;
  padding: 0 1.3rem;
  border-radius: 999px;
  background: #304b3b;
  color: #fff9ee;
  font-size: .9rem;
  font-weight: 700;
  text-decoration: none;
  box-shadow: 0 8px 18px #304b3b20;
  transition: transform 180ms ease, box-shadow 180ms ease, background 180ms ease;

  &:hover { transform: translateY(-3px); background: #23392d; box-shadow: 0 13px 25px #304b3b30; }
`;

export const IntroNote = styled.span`
  color: #7e857b;
  font-size: .72rem;
  letter-spacing: .02em;
`;

export const Stamp = styled.div`
  display: flex;
  align-items: center;
  gap: .7rem;
  margin-top: clamp(3.5rem, 8vh, 6.5rem);
  color: #8b8b79;
  font-size: .6rem;
  font-weight: 700;
  letter-spacing: .17em;

  b { color: #da765b; font-size: .85rem; }

  @media (max-width: 700px) { display: none; }
`;

export const HeroVisual = styled.div`
  position: relative;
  display: grid;
  min-height: 560px;
  place-items: center;
  isolation: isolate;
  animation: ${reveal} 900ms 120ms both;

  @media (max-width: 900px) { min-height: 470px; }
  @media (max-width: 700px) { min-height: min(112vw, 520px); }
`;

export const BackgroundMark = styled.span`
  position: absolute;
  z-index: -1;
  right: -14%;
  bottom: 3%;
  color: #e7dfce;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(4rem, 9vw, 9rem);
  letter-spacing: -.08em;
  white-space: nowrap;
  transform: rotate(-12deg);
`;

export const ArtOrbit = styled.div<{ $orbit: 'outer' | 'inner' }>`
  position: absolute;
  z-index: -1;
  width: ${({ $orbit }) => $orbit === 'outer' ? '86%' : '70%'};
  aspect-ratio: 1;
  border: 1px solid ${({ $orbit }) => $orbit === 'outer' ? '#9da58b80' : '#d8876b75'};
  border-radius: 50%;
  animation: ${orbit} ${({ $orbit }) => $orbit === 'outer' ? '70s' : '48s'} linear infinite;

  &::before {
    position: absolute;
    top: 11%;
    left: 18%;
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background: ${({ $orbit }) => $orbit === 'outer' ? '#da765b' : '#82906b'};
    content: '';
  }
`;

export const ArtFrame = styled.div`
  position: relative;
  display: flex;
  width: min(65%, 330px);
  min-width: 270px;
  height: 470px;
  flex-direction: column;
  justify-content: space-between;
  padding: 1.05rem 1.15rem 1rem;
  overflow: hidden;
  border: 1px solid #f1e4d1;
  border-radius: 14px;
  background:
    radial-gradient(ellipse at 50% 49%, #f6ccaa 0%, #e8a47f 34%, #58715a 34.3%, #334c3c 75%);
  box-shadow: 0 26px 70px #26392d3b, 0 5px 15px #26392d21;
  animation: ${drift} 7s ease-in-out infinite;

  @media (max-width: 900px) { min-width: 235px; height: 390px; }
  @media (max-width: 700px) { width: 60%; min-width: 245px; height: 410px; }
`;

export const ArtLabel = styled.div`
  z-index: 1;
  display: flex;
  justify-content: space-between;
  color: #fff6e8;
  font-size: .56rem;
  font-weight: 800;
  letter-spacing: .15em;
`;

export const Artwork = styled.div`
  position: absolute;
  inset: 18% 0 21%;
  display: grid;
  place-items: center;

  svg { width: 112%; height: auto; overflow: visible; filter: drop-shadow(0 13px 12px #253c3333); }
`;

export const ArtSpecimen = styled.div`
  z-index: 1;
  display: flex;
  align-items: end;
  justify-content: space-between;
  padding-top: 1.2rem;
  border-top: 1px solid #fff9ee78;
  color: #fff8eb;
`;

export const SpecimenRank = styled.span`
  display: block;
  margin-bottom: .35rem;
  color: #e7ccb4;
  font-size: .51rem;
  font-weight: 800;
  letter-spacing: .12em;
`;

export const SpecimenName = styled.span`
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 1.38rem;
  font-style: italic;
`;

export const CardTag = styled.span`
  padding: .38rem .5rem;
  border: 1px solid #fff9ee80;
  border-radius: 99px;
  font-size: .5rem;
  font-weight: 700;
  letter-spacing: .12em;
`;

export const ArtCaption = styled.div`
  position: absolute;
  top: 49%;
  left: -3.2rem;
  display: flex;
  width: 125px;
  justify-content: space-between;
  color: #fff5e3;
  font-size: .57rem;
  font-weight: 800;
  letter-spacing: .12em;
  transform: rotate(-90deg);

  span { color: #e9aa8d; font-size: .8rem; }
`;

export const Specimen = styled.div<{ $position: 'left' | 'right' }>`
  position: absolute;
  z-index: 1;
  top: ${({ $position }) => $position === 'left' ? '22%' : '69%'};
  ${({ $position }) => $position === 'left' ? 'left: 0;' : 'right: -1%;'}
  display: flex;
  align-items: center;
  gap: .65rem;
  min-width: 152px;
  padding: .6rem .8rem .6rem .6rem;
  border: 1px solid #fffdf2a8;
  border-radius: 12px;
  background: #faf6eaed;
  box-shadow: 0 12px 30px #28372d1f;
  animation: ${drift} ${({ $position }) => $position === 'left' ? '6s' : '7.5s'} ease-in-out infinite;
  animation-delay: ${({ $position }) => $position === 'left' ? '-1.5s' : '-3s'};

  @media (max-width: 900px) { min-width: 135px; padding: .5rem; }
  @media (max-width: 480px) { min-width: 125px; gap: .45rem; }
`;

export const SpecimenArt = styled.div<{ $tone: 'leaf' | 'coral' }>`
  display: grid;
  width: 39px;
  height: 43px;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 8px;
  background: ${({ $tone }) => $tone === 'leaf' ? '#dce4cf' : '#f1d8c8'};
  color: ${({ $tone }) => $tone === 'leaf' ? '#59744b' : '#c8755a'};
  font-size: 1.7rem;
`;

export const SpecimenBody = styled.div`
  display: grid;
  gap: .22rem;
  b { color: #304336; font-family: Georgia, 'Times New Roman', serif; font-size: .9rem; }
  span { color: #7e8578; font-size: .61rem; }
`;

export const Strip = styled.div`
  display: flex;
  min-height: 69px;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  border-top: 1px solid #23332a29;
  border-bottom: 1px solid #23332a29;

  @media (max-width: 700px) { flex-wrap: wrap; justify-content: flex-start; padding: 1rem 0; }
`;

export const StripItem = styled.span`
  color: #737b6d;
  font-size: .72rem;
  font-weight: 600;
  letter-spacing: .03em;

  b { margin-right: .55rem; color: #da765b; font-size: .62rem; letter-spacing: .1em; }
  span { margin-right: .45rem; color: #78906c; }
`;

export const IntroSection = styled.section`
  display: grid;
  grid-template-columns: 1.1fr .9fr;
  align-items: end;
  gap: 4rem;
  padding: clamp(5rem, 10vw, 9rem) 0 4rem;
  scroll-margin-top: 2rem;

  > p {
    max-width: 430px;
    margin: 0 0 .45rem;
    color: #687267;
    font-size: .98rem;
    line-height: 1.85;
  }

  @media (max-width: 700px) {
    grid-template-columns: 1fr;
    gap: 1.2rem;
    padding: 5rem 0 3rem;
  }
`;

export const SectionEyebrow = styled.p`
  margin: 0 0 1rem;
  color: #79876c;
  font-size: .67rem;
  font-weight: 800;
  letter-spacing: .16em;
`;

export const SectionTitle = styled.h2`
  max-width: 660px;
  margin: 0;
  color: #2a3c30;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(2.4rem, 5vw, 4.7rem);
  font-weight: 400;
  letter-spacing: -.065em;
  line-height: 1.02;
`;

export const Features = styled.section`
  padding-bottom: 7rem;
  scroll-margin-top: 2rem;
`;

export const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  border-top: 1px solid #23332a29;
  border-bottom: 1px solid #23332a29;

  @media (max-width: 700px) { grid-template-columns: 1fr; }
`;

export const Feature = styled.article<{ $tone: 'green' | 'orange' | 'blue' }>`
  position: relative;
  min-height: 240px;
  padding: 1.5rem 1.7rem 2rem 0;
  overflow: hidden;
  animation: ${appear} 600ms both;
  animation-delay: ${({ $tone }) => $tone === 'green' ? '100ms' : $tone === 'orange' ? '220ms' : '340ms'};

  & + & { padding-left: 1.7rem; border-left: 1px solid #23332a29; }
  .feature-top { display: flex; align-items: center; justify-content: space-between; color: #879081; font-size: .63rem; font-weight: 700; letter-spacing: .13em; }
  .feature-top b { color: ${({ $tone }) => $tone === 'green' ? '#77906b' : $tone === 'orange' ? '#da765b' : '#668a91'}; font-size: 1.45rem; font-weight: 400; }
  h3 { max-width: 260px; margin: 2.3rem 0 .8rem; color: #2f4035; font-family: Georgia, 'Times New Roman', serif; font-size: 1.5rem; font-weight: 400; letter-spacing: -.035em; }
  p { max-width: 290px; margin: 0; color: #72796e; font-size: .84rem; line-height: 1.7; }
  .feature-line { position: absolute; right: 1.7rem; bottom: 0; left: 0; height: 2px; background: ${({ $tone }) => $tone === 'green' ? '#82936e' : $tone === 'orange' ? '#da765b' : '#668a91'}; transform: scaleX(.18); transform-origin: left; transition: transform 300ms ease; }
  &:hover .feature-line { transform: scaleX(1); }

  @media (max-width: 700px) {
    min-height: 205px;
    padding: 1.4rem 0 1.7rem;
    & + & { padding-left: 0; border-top: 1px solid #23332a29; border-left: 0; }
    h3 { margin-top: 1.4rem; }
    .feature-line { right: 0; }
  }
`;

export const Footer = styled.footer`
  display: flex;
  min-height: 105px;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  border-top: 1px solid #23332a29;

  ${Logo} { font-size: 1.3rem; }
  p { margin: 0; color: #7d8277; font-size: .76rem; }
  > a:last-child { color: #39513f; font-size: .78rem; font-weight: 700; text-decoration: none; }
  > a:last-child:hover { color: #da765b; }

  @media (max-width: 700px) {
    flex-wrap: wrap;
    justify-content: space-between;
    padding: 1.3rem 0;
    p { order: 1; width: 100%; }
  }
`;
