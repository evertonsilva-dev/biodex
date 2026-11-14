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

export const ProfileContent = styled.section`
  width: min(100%, 52rem);
  margin: clamp(3rem, 8vh, 5.5rem) 0 0;
`;

export const ProfileHeader = styled.header`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;

  p {
    margin: 0 0 0.25rem;
    color: ${({ theme }) => theme.colors.green};
    font-size: 0.7rem;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  h1 {
    margin: 0;
    font-family: ${({ theme }) => theme.fonts.highlightTitle};
    font-size: clamp(2.8rem, 6vw, 4.5rem);
    font-weight: 400;
    letter-spacing: -0.075em;
    line-height: 0.96;
  }
`;

export const Avatar = styled.div`
  display: grid;
  width: 4.5rem;
  height: 4.5rem;
  flex: 0 0 auto;
  place-items: center;
  overflow: hidden;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.green};
  color: ${({ theme }) => theme.colors.paper};
  font-size: 1.5rem;
  font-weight: 800;

  img { width: 100%; height: 100%; object-fit: cover; }
`;

export const Field = styled.div`
  display: grid;
  gap: 0.5rem;
  margin-top: 1.25rem;
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.75rem;
  font-weight: 750;
  letter-spacing: 0.03em;
  text-transform: uppercase;
`;

export const Value = styled.span`
  padding: 0.25rem 0 0.8rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.line};
  color: ${({ theme }) => theme.colors.ink};
  font-size: 0.95rem;
  font-weight: 500;
  text-transform: none;
`;

export const ProfileForm = styled.form`
  display: grid;
  gap: 1.25rem;
  margin-top: 2rem;
  padding: 1.5rem 0;
  border-top: 1px solid ${({ theme }) => theme.colors.line};
  border-bottom: 1px solid ${({ theme }) => theme.colors.line};
`;

export const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

export const InputField = styled.label`
  display: grid;
  min-width: 0;
  gap: 0.4rem;
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.72rem;
  font-weight: 750;
  letter-spacing: 0.03em;
  text-transform: uppercase;
`;

export const Input = styled.input`
  width: 100%;
  min-height: 2.7rem;
  padding: 0.7rem 0.25rem;
  border: 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.line};
  border-radius: 0;
  background: transparent;
  color: ${({ theme }) => theme.colors.ink};
  font: inherit;
  font-size: 0.9rem;
  text-transform: none;

  &:focus-visible {
    border-bottom: 2px solid ${({ theme }) => theme.colors.green};
    outline: 0;
  }

  &:disabled {
    opacity: 0.6;
  }
`;

export const HelpText = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.8rem;
  line-height: 1.55;
`;

export const ProfileStatus = styled.p`
  margin: 0;
  padding-left: 0.8rem;
  border-left: 2px solid ${({ theme }) => theme.colors.green};
  color: ${({ theme }) => theme.colors.ink};
  font-size: 0.85rem;
  line-height: 1.55;
`;

export const FormError = styled.p`
  margin: 0;
  color: #a12f22;
  font-size: 0.82rem;
  line-height: 1.5;
`;

export const FormActions = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
`;

export const SaveButton = styled.button`
  min-height: 2.5rem;
  padding: 0.65rem 0.9rem;
  border: 1px solid ${({ theme }) => theme.colors.green};
  border-radius: 0;
  background: ${({ theme }) => theme.colors.green};
  color: ${({ theme }) => theme.colors.paper};
  font: inherit;
  font-size: 0.78rem;
  font-weight: 800;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.green};
    outline-offset: 3px;
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
`;

export const EmptyMessage = styled.div`
  .eyebrow {
    margin: 0 0 0.8rem;
    color: ${({ theme }) => theme.colors.green};
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }

  h1 {
    margin: 0;
    font-family: ${({ theme }) => theme.fonts.highlightTitle};
    font-size: clamp(2.6rem, 6vw, 4rem);
    font-weight: 400;
    letter-spacing: -0.07em;
    line-height: 0.98;
  }

  .description {
    max-width: 34rem;
    color: ${({ theme }) => theme.colors.muted};
    line-height: 1.6;
  }

  a {
    display: inline-block;
    padding: 0.65rem 0.15rem;
    border-bottom: 1px solid ${({ theme }) => theme.colors.line};
    color: ${({ theme }) => theme.colors.green};
    font-weight: 800;
    text-decoration: none;
  }

  a:hover { border-bottom-color: ${({ theme }) => theme.colors.green}; }
`;
