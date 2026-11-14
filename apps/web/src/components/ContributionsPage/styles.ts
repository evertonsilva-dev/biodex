import styled from 'styled-components';

export const Page = styled.main`
  width: min(1200px, calc(100% - 3rem));
  min-height: 100vh;
  margin: 0 auto;
  padding: 2rem 0 5rem;
  color: ${({ theme }) => theme.colors.ink};

  @media (max-width: 600px) {
    width: min(100% - 2rem, 1200px);
    padding-top: 1.25rem;
  }
`;

export const Intro = styled.header`
  max-width: 48rem;
  padding: 4.5rem 0 2.5rem;

  @media (max-width: 600px) {
    padding: 3rem 0 2rem;
  }
`;

export const Eyebrow = styled.p`
  margin: 0 0 0.8rem;
  color: ${({ theme }) => theme.colors.green};
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
`;

export const Title = styled.h1`
  margin: 0;
  font-family: ${({ theme }) => theme.fonts.highlightTitle};
  font-size: clamp(2.8rem, 6vw, 5rem);
  font-weight: 400;
  letter-spacing: -0.075em;
  line-height: 0.96;
`;

export const Description = styled.p`
  max-width: 40rem;
  margin: 0.9rem 0 0;
  color: ${({ theme }) => theme.colors.muted};
  line-height: 1.65;
`;

export const RolePill = styled.span`
  display: inline-flex;
  align-items: center;
  margin-top: 1rem;
  padding: 0.4rem 0.7rem;
  border: 1px solid ${({ theme }) => theme.colors.green}50;
  border-radius: 999px;
  color: ${({ theme }) => theme.colors.green};
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
`;

export const Section = styled.section`
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid ${({ theme }) => theme.colors.line};
`;

export const SectionHeader = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;

  h2 {
    margin: 0;
    font-family: ${({ theme }) => theme.fonts.highlightTitle};
    font-size: clamp(1.7rem, 3.5vw, 2.45rem);
    font-weight: 400;
    letter-spacing: -0.055em;
  }

  p {
    margin: 0.4rem 0 0;
    color: ${({ theme }) => theme.colors.muted};
    font-size: 0.82rem;
    line-height: 1.55;
  }

  @media (max-width: 650px) {
    align-items: flex-start;
    flex-direction: column;
  }
`;

export const Count = styled.span`
  flex: 0 0 auto;
  color: ${({ theme }) => theme.colors.green};
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
`;

export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 19rem), 1fr));
  column-gap: 2rem;
  row-gap: 2rem;
`;

export const Card = styled.article`
  min-width: 0;
  padding: 1rem 0 0;
  border-top: 1px solid ${({ theme }) => theme.colors.line};
`;

export const CardTitle = styled.h3`
  margin: 0;
  color: ${({ theme }) => theme.colors.ink};
  font-family: ${({ theme }) => theme.fonts.highlightTitle};
  font-size: 1.25rem;
  font-weight: 400;
  letter-spacing: -0.035em;
  line-height: 1.25;
`;

export const Muted = styled.p`
  margin: 0.45rem 0 0;
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.78rem;
  line-height: 1.55;
  overflow-wrap: anywhere;
`;

export const Status = styled.p`
  margin: 0.8rem 0;
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.85rem;
  line-height: 1.6;
`;

export const ErrorMessage = styled.p`
  margin: 0.75rem 0;
  padding: 0.65rem 0.8rem;
  border-left: 2px solid #a12f22;
  background: ${({ theme }) => theme.colors.paper};
  color: #a12f22;
  font-size: 0.8rem;
  line-height: 1.5;
`;

export const ButtonRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
  margin-top: 0.9rem;
`;

const BaseButton = styled.button`
  display: inline-flex;
  min-height: 2.25rem;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  padding: 0.5rem 0.15rem;
  border: 0;
  border-bottom: 1px solid transparent;
  border-radius: 0;
  background: transparent;
  color: ${({ theme }) => theme.colors.green};
  font: inherit;
  font-size: 0.78rem;
  font-weight: 800;
  text-align: left;
  cursor: pointer;
  transition: color 160ms ease, border-color 160ms ease, opacity 160ms ease;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.green};
    outline-offset: 3px;
  }

  &:hover:not(:disabled) {
    border-bottom-color: currentColor;
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`;

export const PrimaryButton = styled(BaseButton)``;

export const SecondaryButton = styled(BaseButton)`
  color: ${({ theme }) => theme.colors.muted};

  &:focus-visible { outline-color: ${({ theme }) => theme.colors.ink}; }
`;

export const DangerButton = styled(BaseButton)`
  color: #9c3428;

  &:focus-visible { outline-color: #9c3428; }
`;

export const TextLink = styled.a`
  display: inline-block;
  padding: 0.35rem 0.1rem;
  border-bottom: 1px solid transparent;
  color: ${({ theme }) => theme.colors.green};
  font-size: 0.78rem;
  font-weight: 750;
  text-decoration: none;

  &:hover { border-bottom-color: currentColor; }
  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.green};
    outline-offset: 3px;
  }
`;

export const Form = styled.form`
  display: grid;
  gap: 1rem;
  width: min(100%, 54rem);
  margin: 0 0 1.25rem;
  padding: 1.5rem 0;
  border-top: 1px solid ${({ theme }) => theme.colors.line};
  border-bottom: 1px solid ${({ theme }) => theme.colors.line};
`;

export const Field = styled.label`
  display: grid;
  min-width: 0;
  gap: 0.4rem;
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.72rem;
  font-weight: 750;
  letter-spacing: 0.03em;
  text-transform: uppercase;
`;

const BaseInput = styled.input`
  width: 100%;
  min-height: 2.7rem;
  padding: 0.7rem 0.25rem;
  border: 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.line};
  border-radius: 0;
  background: transparent;
  color: ${({ theme }) => theme.colors.ink};
  font: inherit;
  font-size: 0.85rem;
  text-transform: none;

  &:focus-visible {
    border-bottom: 2px solid ${({ theme }) => theme.colors.green};
    outline: 0;
  }
`;

export const Input = styled(BaseInput)``;
export const Select = styled(BaseInput).attrs({ as: 'select' })``;
export const Textarea = styled(BaseInput).attrs({ as: 'textarea' })`
  min-height: 6rem;
  resize: vertical;
  line-height: 1.5;
`;

export const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.9rem;

  @media (max-width: 650px) {
    grid-template-columns: 1fr;
  }
`;

export const SearchResults = styled.div`
  display: grid;
  gap: 0.45rem;
  max-height: 15rem;
  overflow-y: auto;
`;

export const SearchResult = styled.button`
  display: flex;
  width: 100%;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.8rem;
  padding: 0.7rem 0.25rem;
  border: 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.line};
  background: transparent;
  color: ${({ theme }) => theme.colors.ink};
  font: inherit;
  text-align: left;
  cursor: pointer;

  &:hover:not(:disabled) {
    color: ${({ theme }) => theme.colors.green};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.green};
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`;

export const TagList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
`;

export const Tag = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.35rem 0.55rem;
  border: 1px solid ${({ theme }) => theme.colors.green}50;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.paper};
  color: ${({ theme }) => theme.colors.ink};
  font-size: 0.73rem;

  button {
    display: grid;
    width: 1.2rem;
    height: 1.2rem;
    place-items: center;
    padding: 0;
    border: 0;
    border-radius: 50%;
    background: transparent;
    color: ${({ theme }) => theme.colors.muted};
    cursor: pointer;
  }

  button:hover { color: ${({ theme }) => theme.colors.ink}; }
`;

export const StepCard = styled.div`
  display: grid;
  gap: 0.75rem;
  padding: 1rem 0 0;
  border-top: 1px solid ${({ theme }) => theme.colors.line};

  h4 {
    margin: 0;
    color: ${({ theme }) => theme.colors.green};
    font-size: 0.75rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
`;

export const PhotoRow = styled.div`
  display: grid;
  grid-template-columns: 5.5rem minmax(0, 1fr);
  align-items: start;
  gap: 0.9rem;

  img {
    display: block;
    width: 5.5rem;
    height: 5.5rem;
    border-radius: 0.25rem;
    background: ${({ theme }) => theme.colors.background};
    object-fit: cover;
  }
`;

export const UserRow = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(10rem, 0.8fr) auto;
  align-items: center;
  gap: 0.8rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.line};

  &:last-child { border-bottom: 0; }

  @media (max-width: 700px) {
    grid-template-columns: minmax(0, 1fr) auto;
    .role-control { grid-column: 1 / -1; }
  }

  .registration-review { grid-column: 1 / -1; }
`;

export const RoleControl = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5rem;

  select { min-width: 8rem; }

  @media (max-width: 700px) {
    justify-content: flex-start;
  }
`;
