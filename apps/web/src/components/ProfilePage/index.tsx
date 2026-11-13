import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getUserProfile, updateUserProfile, type UserProfileInput } from '../../api/profile';
import { useAuth } from '../../auth/AuthProvider';
import { PageNavigation } from '../PageNavigation';
import { TopBar } from '../TopBar';
import {
  Avatar,
  EmptyMessage,
  Field,
  FormActions,
  FormError,
  FormGrid,
  HelpText,
  Input,
  InputField,
  Page,
  ProfileContent,
  ProfileForm,
  ProfileHeader,
  ProfileStatus,
  SaveButton,
  Value,
} from './styles';

const emptyProfile: UserProfileInput = {
  birthDate: '',
  profession: '',
  professionalCouncil: '',
  professionalRegistrationNumber: '',
};

const registrationStatusText = {
  not_submitted: 'Você ainda não informou um registro profissional.',
  pending: 'Registro enviado. A equipe fará a conferência em fonte oficial.',
  active: 'Registro conferido como ativo pela equipe.',
  rejected: 'O registro não foi validado. Confira os dados e envie novamente.',
} as const;

function formatVerifiedAt(value: string | null): string {
  if (!value) return '';
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' }).format(new Date(value));
}

function maskCpf(lastFour: string): string {
  const digits = lastFour.replace(/\D/g, '').slice(-4).padStart(4, 'x');
  return `xxx.xxx.x${digits.slice(0, 2)}-${digits.slice(2)}`;
}

function formatCpf(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  }
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

function isValidCpf(value: string): boolean {
  const digits = value.replace(/\D/g, '');
  if (digits.length !== 11 || /^(\d)\1{10}$/.test(digits)) return false;

  const calculateDigit = (length: number): number => {
    let sum = 0;
    for (let index = 0; index < length; index += 1) {
      sum += Number(digits[index]) * (length + 1 - index);
    }
    const remainder = (sum * 10) % 11;
    return remainder === 10 ? 0 : remainder;
  };

  return calculateDigit(9) === Number(digits[9])
    && calculateDigit(10) === Number(digits[10]);
}

export function ProfilePage() {
  const { user, status, isConfigured, getAccessToken } = useAuth();
  const [imageFailed, setImageFailed] = useState(false);
  const [form, setForm] = useState<UserProfileInput>(emptyProfile);
  const [cpfError, setCpfError] = useState('');
  const [saved, setSaved] = useState(false);
  const queryClient = useQueryClient();
  const profileQuery = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async ({ signal }) => getUserProfile(await getAccessToken(), signal),
    enabled: Boolean(user),
    retry: false,
  });
  const saveProfileMutation = useMutation({
    mutationFn: async () => updateUserProfile(
      await getAccessToken(),
      {
        ...form,
        cpf: form.cpf?.replace(/\D/g, '') || undefined,
        profession: form.profession.trim(),
        professionalCouncil: form.professionalCouncil.trim(),
        professionalRegistrationNumber: form.professionalRegistrationNumber.trim(),
      },
    ),
    onSuccess: async (profile) => {
      queryClient.setQueryData(['user-profile', user?.id], profile);
      setForm((current) => ({ ...current, cpf: '' }));
      setSaved(true);
    },
  });

  useEffect(() => {
    setImageFailed(false);
  }, [user?.image]);

  useEffect(() => {
    const profile = profileQuery.data;
    if (!profile) return;
    setForm({
      birthDate: profile.birthDate ?? '',
      profession: profile.profession ?? '',
      professionalCouncil: profile.professionalCouncil ?? '',
      professionalRegistrationNumber: profile.professionalRegistrationNumber ?? '',
      cpf: '',
    });
  }, [profileQuery.data]);

  function updateField(field: keyof UserProfileInput, value: string) {
    setSaved(false);
    saveProfileMutation.reset();
    setForm((current) => ({ ...current, [field]: value }));
  }

  return (
    <Page>
      <TopBar label="PERFIL" />
      <PageNavigation
        items={[
          { label: 'Catálogo', href: '/catalog' },
          { label: 'Perfil' },
        ]}
        backHref="/catalog"
        backLabel="Voltar ao catálogo"
      />
      <ProfileContent>
        {user ? (
          <>
            <ProfileHeader>
              <Avatar>
                {user.image && !imageFailed
                  ? <img src={user.image} alt="" referrerPolicy="no-referrer" onError={() => setImageFailed(true)} />
                  : <span>{(user.name || user.email).slice(0, 1).toUpperCase()}</span>}
              </Avatar>
              <div>
                <p>Conta Biodex</p>
                <h1>{user.name || 'Seu perfil'}</h1>
              </div>
            </ProfileHeader>
            <Field>
              Nome
              <Value>{user.name || 'Não informado'}</Value>
            </Field>
            <Field>
              E-mail
              <Value>{user.email}</Value>
            </Field>
            {profileQuery.isPending && (
              <ProfileStatus role="status">Carregando seus dados de perfil…</ProfileStatus>
            )}
            {profileQuery.isError && (
              <FormError role="alert">
                Não foi possível carregar seus dados. Atualize a página ou tente novamente.
              </FormError>
            )}
            {profileQuery.data && (
              <>
                <ProfileStatus role="status" aria-live="polite">
                  {registrationStatusText[profileQuery.data.professionalRegistrationStatus]}
                  {profileQuery.data.registrationVerifiedAt
                    ? ` Conferido em ${formatVerifiedAt(profileQuery.data.registrationVerifiedAt)}.`
                    : ''}
                </ProfileStatus>
                <ProfileForm
                  onSubmit={(event) => {
                    event.preventDefault();
                    if (!profileQuery.data.cpfLastFour && !isValidCpf(form.cpf ?? '')) {
                      setCpfError('Informe um CPF válido.');
                      return;
                    }
                    setCpfError('');
                    setSaved(false);
                    saveProfileMutation.mutate();
                  }}
                >
                  <FormGrid>
                    <InputField>
                      Data de nascimento
                      <Input
                        type="date"
                        required
                        max={new Date().toISOString().slice(0, 10)}
                        value={form.birthDate}
                        disabled={
                          saveProfileMutation.isPending
                          || Boolean(profileQuery.data.birthDate)
                        }
                        onChange={(event) => updateField('birthDate', event.target.value)}
                      />
                    </InputField>
                    <InputField>
                      Profissão
                      <Input
                        type="text"
                        autoComplete="organization-title"
                        maxLength={120}
                        required
                        value={form.profession}
                        disabled={saveProfileMutation.isPending}
                        onChange={(event) => updateField('profession', event.target.value)}
                      />
                    </InputField>
                    {profileQuery.data.cpfLastFour ? (
                      <InputField>
                        CPF
                        <Input
                          type="text"
                          aria-label="CPF mascarado"
                          value={maskCpf(profileQuery.data.cpfLastFour)}
                          disabled
                        />
                      </InputField>
                    ) : (
                      <InputField>
                        CPF
                        <Input
                          type="text"
                          inputMode="numeric"
                          autoComplete="off"
                          maxLength={14}
                          placeholder="000.000.000-00"
                          required
                          value={form.cpf ?? ''}
                          aria-invalid={Boolean(cpfError)}
                          aria-describedby={cpfError ? 'cpf-error' : undefined}
                          disabled={saveProfileMutation.isPending}
                          onChange={(event) => {
                            updateField('cpf', formatCpf(event.target.value));
                            setCpfError('');
                          }}
                          onBlur={() => {
                            setCpfError(
                              isValidCpf(form.cpf ?? '') ? '' : 'Informe um CPF válido.',
                            );
                          }}
                        />
                      </InputField>
                    )}
                  </FormGrid>
                  {cpfError && <FormError id="cpf-error" role="alert">{cpfError}</FormError>}
                  <HelpText>
                    O CPF é validado e armazenado criptografado; usamos um identificador seguro
                    para impedir duplicidade. Ele não é exibido publicamente; após salvar,
                    mostramos apenas os últimos quatro dígitos. CPF e data de nascimento ficam
                    bloqueados após o primeiro salvamento.
                  </HelpText>
                  <FormGrid>
                    <InputField>
                      Conselho ou órgão profissional (opcional)
                      <Input
                        type="text"
                        maxLength={120}
                        placeholder="Ex.: CRBio-01"
                        value={form.professionalCouncil}
                        disabled={saveProfileMutation.isPending}
                        onChange={(event) => updateField('professionalCouncil', event.target.value)}
                      />
                    </InputField>
                    <InputField>
                      Número do registro (opcional)
                      <Input
                        type="text"
                        maxLength={80}
                        value={form.professionalRegistrationNumber}
                        disabled={saveProfileMutation.isPending}
                        onChange={(event) => updateField('professionalRegistrationNumber', event.target.value)}
                      />
                    </InputField>
                  </FormGrid>
                  <HelpText>
                    Informe os dois campos para solicitar a validação. A curadoria só é liberada
                    depois que um admin ou root confirmar que o registro está ativo e válido.
                  </HelpText>
                  {saveProfileMutation.isError && (
                    <FormError role="alert">{saveProfileMutation.error.message}</FormError>
                  )}
                  <FormActions>
                    <SaveButton type="submit" disabled={saveProfileMutation.isPending}>
                      {saveProfileMutation.isPending ? 'Salvando…' : 'Salvar perfil'}
                    </SaveButton>
                    {saved && <HelpText role="status">Perfil salvo.</HelpText>}
                  </FormActions>
                </ProfileForm>
              </>
            )}
          </>
        ) : (
          <EmptyMessage>
            <p className="eyebrow">Sua conta</p>
            <h1>{status === 'loading' ? 'Carregando perfil…' : 'Entre na sua conta'}</h1>
            {status !== 'loading' && (
              <>
                <p className="description">
                  {isConfigured
                    ? 'Entre ou crie uma conta para acessar suas informações e coleções sincronizadas.'
                    : 'O login não está configurado neste ambiente.'}
                </p>
                {isConfigured && <a href="/login?returnTo=%2Fprofile">Entrar ou criar conta</a>}
              </>
            )}
          </EmptyMessage>
        )}
      </ProfileContent>
    </Page>
  );
}
