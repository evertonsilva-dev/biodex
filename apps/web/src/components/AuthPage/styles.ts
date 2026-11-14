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

export const AuthLayout = styled.section`
  display: grid;
  width: min(100%, 66rem);
  grid-template-columns: minmax(0, 1fr) minmax(18rem, 0.8fr);
  align-items: start;
  gap: clamp(2.5rem, 8vw, 7rem);
  margin: clamp(3rem, 8vh, 5.5rem) 0 0;

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
    gap: 2rem;
    margin-top: 3rem;
  }
`;

export const Heading = styled.header`
  margin: 0;

  p {
    margin: 0 0 0.55rem;
    color: ${({ theme }) => theme.colors.green};
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }

  h1 {
    margin: 0;
    font-family: ${({ theme }) => theme.fonts.highlightTitle};
    font-size: clamp(2.8rem, 6vw, 5rem);
    font-weight: 400;
    letter-spacing: -0.075em;
    line-height: 0.96;
  }

  span {
    display: block;
    max-width: 34rem;
    margin-top: 0.8rem;
    color: ${({ theme }) => theme.colors.muted};
    font-size: 0.95rem;
    line-height: 1.55;
  }
`;

export const FormSection = styled.div`
  min-width: 0;
  padding-top: 0.3rem;

  form { display: grid; gap: 1.25rem; }

  @media (max-width: 760px) {
    padding-top: 1.4rem;
    border-top: 1px solid ${({ theme }) => theme.colors.line};
  }
`;

export const GoogleAction = styled.div`
  display: flex;
  width: 100%;
  justify-content: center;
`;

export const Field = styled.label`
  display: grid;
  gap: 0.35rem;
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.75rem;
  font-weight: 750;
  letter-spacing: 0.03em;
`;

export const Input = styled.input`
  width: 100%;
  min-height: 2.7rem;
  padding: 0.6rem 0.25rem;
  border: 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.line};
  border-radius: 0;
  background: transparent;
  color: ${({ theme }) => theme.colors.ink};
  font: inherit;

  &:focus {
    border-bottom: 2px solid ${({ theme }) => theme.colors.green};
    outline: 0;
  }
`;

const Button = styled.button`
  display: inline-flex;
  min-height: 2.8rem;
  align-items: center;
  justify-content: center;
  gap: 0.65rem;
  padding: 0.7rem 1.1rem;
  border: 1px solid ${({ theme }) => theme.colors.green};
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.green};
  color: ${({ theme }) => theme.colors.paper};
  font: inherit;
  font-size: 0.82rem;
  font-weight: 800;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.green};
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.55;
    cursor: wait;
  }
`;

export const GoogleButton = styled(Button)`
  position: relative;
  width: min(100%, 18rem);
  margin: 0 0 0.4rem;
  border-color: ${({ theme }) => theme.colors.line};
  background: ${({ theme }) => theme.colors.paper};
  color: ${({ theme }) => theme.colors.ink};
  text-align: center;

  svg {
    position: absolute;
    left: 1.1rem;
  }

  &:hover:not(:disabled) {
    border-color: ${({ theme }) => theme.colors.green};
    background: ${({ theme }) => theme.colors.background};
  }
`;

export const PrimaryButton = styled(Button)`
  width: min(100%, 18rem);
  margin: 0.25rem auto 0;
  &:hover:not(:disabled) { filter: brightness(1.08); }
`;

export const SecondaryButton = styled.button`
  justify-self: center;
  padding: 0.25rem;
  border: 0;
  background: transparent;
  color: ${({ theme }) => theme.colors.green};
  font: inherit;
  font-size: 0.8rem;
  font-weight: 800;
  cursor: pointer;

  &:hover:not(:disabled) { text-decoration: underline; }
  &:disabled { opacity: 0.55; cursor: wait; }
`;

export const Divider = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin: 1.25rem 0;
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.72rem;

  &::before, &::after {
    height: 1px;
    flex: 1;
    background: ${({ theme }) => theme.colors.line};
    content: '';
  }
`;

export const SwitchMode = styled.p`
  margin: 1.25rem 0 0;
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.8rem;
  text-align: center;

  a {
    color: ${({ theme }) => theme.colors.green};
    font-weight: 800;
    text-decoration: none;
  }
  a:hover { text-decoration: underline; }
`;

export const ErrorMessage = styled.p`
  margin: 0 0 1rem;
  padding: 0.7rem 0 0.7rem 0.8rem;
  border-left: 2px solid #a12f22;
  color: #a12f22;
  font-size: 0.8rem;
  line-height: 1.45;
`;

export const InfoMessage = styled.p`
  margin: 0;
  padding: 0.8rem 0 0.8rem 0.9rem;
  border-left: 2px solid ${({ theme }) => theme.colors.green};
  color: ${({ theme }) => theme.colors.ink};
  font-size: 0.82rem;
  line-height: 1.5;

  a { color: ${({ theme }) => theme.colors.green}; font-weight: 800; }
`;
