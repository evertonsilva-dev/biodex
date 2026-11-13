import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, Pencil, ShieldCheck, Trash2, X } from 'lucide-react';
import { useAuth } from '../../auth/AuthProvider';
import {
  assignUserRole,
  createEditorialContent,
  deleteEditorialContent,
  getContributionAccount,
  getManagedEditorialContent,
  getManagedUsers,
  getMyPhotoSuggestions,
  getPendingPhotoSuggestions,
  reviewPhotoSuggestion,
  reviewProfessionalRegistration,
  updateEditorialContent,
  type AccountRole,
  type AssignableAccountRole,
  type EditorialContentInput,
  type ManagedEditorialContent,
  type ProfessionalRegistrationStatus,
} from '../../api/contributions';
import { PageNavigation } from '../PageNavigation';
import { TopBar } from '../TopBar';
import { EditorialContentForm } from './EditorialContentForm';
import {
  ButtonRow,
  Card,
  CardTitle,
  Count,
  DangerButton,
  Description,
  ErrorMessage,
  Eyebrow,
  Grid,
  Intro,
  Muted,
  Page,
  PhotoRow,
  PrimaryButton,
  RoleControl,
  RolePill,
  Section,
  SectionHeader,
  SecondaryButton,
  Select,
  Status,
  TextLink,
  Title,
  UserRow,
} from './styles';

const roleLabels: Record<AccountRole, string> = {
  user: 'Usuário',
  curator: 'Curador',
  admin: 'Admin',
  root: 'Root',
};

const registrationStatusLabels: Record<ProfessionalRegistrationStatus, string> = {
  not_submitted: 'Não informado',
  pending: 'Pendente',
  active: 'Ativo e validado',
  rejected: 'Não validado',
};

function isModerator(role: AccountRole): boolean {
  return role === 'admin' || role === 'root';
}

function canManageEditorial(role: AccountRole): boolean {
  return role === 'curator' || role === 'admin' || role === 'root';
}

function formatDate(value: string | null): string {
  if (!value) return 'Ainda não registrado';
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function ContributionsPage() {
  const { user, getAccessToken } = useAuth();
  const queryClient = useQueryClient();
  const [creatingContent, setCreatingContent] = useState(false);
  const [editingContent, setEditingContent] = useState<ManagedEditorialContent | null>(null);
  const [roleDrafts, setRoleDrafts] = useState<Record<string, AssignableAccountRole>>({});
  const accountQuery = useQuery({
    queryKey: ['contributions', 'me', user?.id],
    queryFn: async ({ signal }) => getContributionAccount(await getAccessToken(), signal),
    enabled: Boolean(user),
    retry: false,
  });
  const role = accountQuery.data?.role;
  const suggestionsQuery = useQuery({
    queryKey: ['contributions', 'my-photo-suggestions', user?.id],
    queryFn: async ({ signal }) => getMyPhotoSuggestions(await getAccessToken(), signal),
    enabled: Boolean(role),
    retry: false,
  });
  const editorialQuery = useQuery({
    queryKey: ['contributions', 'editorial-content', user?.id, role],
    queryFn: async ({ signal }) => getManagedEditorialContent(await getAccessToken(), signal),
    enabled: Boolean(role && canManageEditorial(role)),
    retry: false,
  });
  const usersQuery = useQuery({
    queryKey: ['contributions', 'users', user?.id],
    queryFn: async ({ signal }) => getManagedUsers(await getAccessToken(), signal),
    enabled: Boolean(role && isModerator(role)),
    retry: false,
  });
  const pendingPhotosQuery = useQuery({
    queryKey: ['contributions', 'pending-photo-suggestions'],
    queryFn: async ({ signal }) => getPendingPhotoSuggestions(await getAccessToken(), signal),
    enabled: Boolean(role && isModerator(role)),
    retry: false,
  });

  const roleMutation = useMutation({
    mutationFn: async ({ userId, nextRole }: { userId: string; nextRole: AssignableAccountRole }) => (
      assignUserRole(await getAccessToken(), userId, nextRole)
    ),
    onSuccess: async () => {
      setRoleDrafts({});
      await queryClient.invalidateQueries({ queryKey: ['contributions', 'users'] });
    },
  });
  const registrationMutation = useMutation({
    mutationFn: async ({
      userId,
      status,
    }: {
      userId: string;
      status: Extract<ProfessionalRegistrationStatus, 'active' | 'rejected'>;
    }) => reviewProfessionalRegistration(await getAccessToken(), userId, status),
    onSuccess: async () => {
      setRoleDrafts({});
      await queryClient.invalidateQueries({ queryKey: ['contributions', 'users'] });
    },
  });
  const reviewMutation = useMutation({
    mutationFn: async ({
      suggestionId,
      decision,
    }: {
      suggestionId: string;
      decision: 'approved' | 'rejected';
    }) => reviewPhotoSuggestion(await getAccessToken(), suggestionId, decision),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['contributions', 'pending-photo-suggestions'] }),
        queryClient.invalidateQueries({ queryKey: ['contributions', 'my-photo-suggestions'] }),
        queryClient.invalidateQueries({ queryKey: ['species-image'] }),
      ]);
    },
  });
  const saveContentMutation = useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: string | null;
      input: EditorialContentInput;
    }) => {
      const token = await getAccessToken();
      return id
        ? updateEditorialContent(token, id, input)
        : createEditorialContent(token, input);
    },
    onSuccess: async () => {
      setCreatingContent(false);
      setEditingContent(null);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['contributions', 'editorial-content'] }),
        queryClient.invalidateQueries({ queryKey: ['editorial-collections'] }),
      ]);
    },
  });
  const deleteContentMutation = useMutation({
    mutationFn: async (id: string) => deleteEditorialContent(await getAccessToken(), id),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['contributions', 'editorial-content'] }),
        queryClient.invalidateQueries({ queryKey: ['editorial-collections'] }),
      ]);
    },
  });

  const contentFormOpen = creatingContent || editingContent !== null;

  function beginCreate() {
    setEditingContent(null);
    setCreatingContent(true);
    saveContentMutation.reset();
  }

  function beginEdit(content: ManagedEditorialContent) {
    setCreatingContent(false);
    setEditingContent(content);
    saveContentMutation.reset();
  }

  async function saveContent(input: EditorialContentInput) {
    await saveContentMutation.mutateAsync({ id: editingContent?.id ?? null, input });
  }

  function cancelContentForm() {
    setCreatingContent(false);
    setEditingContent(null);
    saveContentMutation.reset();
  }

  function confirmDeleteContent(content: ManagedEditorialContent) {
    if (!window.confirm(`Excluir “${content.title}” da publicação editorial?`)) return;
    deleteContentMutation.mutate(content.id);
  }

  return (
    <Page>
      <TopBar label="CONTRIBUIÇÕES" />
      <PageNavigation
        items={[
          { label: 'Catálogo', href: '/catalog' },
          { label: 'Contribuições' },
        ]}
        backHref="/profile"
        backLabel="Voltar ao perfil"
      />
      <Intro>
        <Eyebrow>Comunidade Biodex</Eyebrow>
        <Title>Contribuições</Title>
        <Description>
          Sugira imagens, crie percursos de descoberta e ajude a cuidar do conteúdo do atlas.
        </Description>
        {accountQuery.data && (
          <RolePill>
            <ShieldCheck size={14} aria-hidden="true" />
            {roleLabels[accountQuery.data.role]}
          </RolePill>
        )}
      </Intro>

      {accountQuery.isPending && <Status role="status">Conferindo seu nível de acesso…</Status>}
      {accountQuery.isError && (
        <ErrorMessage role="alert">
          Não foi possível carregar suas permissões. Atualize a página ou tente novamente.
        </ErrorMessage>
      )}
      {accountQuery.data && role && (
        <>
          {role === 'root' && (
            <Status>
              Seu acesso root é definido pela configuração segura do backend e não pode ser
              transferido pela interface.
            </Status>
          )}

          <Section>
            <SectionHeader>
              <div>
                <h2>Minhas sugestões de imagem</h2>
                <p>
                  As sugestões ficam pendentes até a revisão da equipe; elas não alteram a foto
                  em destaque sozinhas.
                </p>
              </div>
              {suggestionsQuery.data && (
                <Count>{suggestionsQuery.data.length} solicitações</Count>
              )}
            </SectionHeader>
            {suggestionsQuery.isPending && <Status role="status">Carregando suas solicitações…</Status>}
            {suggestionsQuery.isError && (
              <ErrorMessage role="alert">
                Não foi possível carregar suas sugestões de imagem.
              </ErrorMessage>
            )}
            {suggestionsQuery.data?.length === 0 && (
              <Status>
                Ainda não há solicitações. Abra a ficha de uma espécie e use “Sugerir como melhor
                foto” na imagem que você considera mais representativa.
              </Status>
            )}
            {suggestionsQuery.data && suggestionsQuery.data.length > 0 && (
              <Grid>
                {suggestionsQuery.data.map((suggestion) => (
                  <Card key={suggestion.id}>
                    <PhotoRow>
                      <img src={suggestion.photo.url} alt="" loading="lazy" />
                      <div>
                        <CardTitle>{suggestion.scientificName ?? suggestion.speciesId}</CardTitle>
                        <Muted>
                          {suggestion.photo.attribution} · {suggestion.photo.license} ·{' '}
                          {suggestion.photo.source}
                        </Muted>
                        <Muted>
                          Status: {suggestion.status === 'pending'
                            ? 'aguardando revisão'
                            : suggestion.status === 'approved'
                              ? 'aprovada'
                              : 'não selecionada'}
                        </Muted>
                      </div>
                    </PhotoRow>
                  </Card>
                ))}
              </Grid>
            )}
          </Section>

          {canManageEditorial(role) && (
            <Section>
              <SectionHeader>
                <div>
                  <h2>Conteúdo editorial</h2>
                  <p>
                    Coleções e trilhas são publicadas no atlas. Curadores podem editar apenas o
                    próprio conteúdo; admins podem removê-lo.
                  </p>
                </div>
                {role === 'curator' || role === 'root' ? (
                  <PrimaryButton type="button" onClick={beginCreate}>
                    Criar coleção ou trilha
                  </PrimaryButton>
                ) : null}
              </SectionHeader>
              {editorialQuery.isPending && <Status role="status">Carregando conteúdo editorial…</Status>}
              {editorialQuery.isError && (
                <ErrorMessage role="alert">
                  Não foi possível carregar o conteúdo editorial.
                </ErrorMessage>
              )}
              {contentFormOpen && (
                <EditorialContentForm
                  content={editingContent}
                  isSaving={saveContentMutation.isPending}
                  onCancel={cancelContentForm}
                  onSave={saveContent}
                />
              )}
              {saveContentMutation.isError && !contentFormOpen && (
                <ErrorMessage role="alert">
                  {saveContentMutation.error.message}
                </ErrorMessage>
              )}
              {deleteContentMutation.isError && (
                <ErrorMessage role="alert">
                  {deleteContentMutation.error.message}
                </ErrorMessage>
              )}
              {editorialQuery.data?.length === 0 && (
                <Status>Você ainda não tem conteúdo editorial nesta área.</Status>
              )}
              {editorialQuery.data && editorialQuery.data.length > 0 && (
                <Grid>
                  {editorialQuery.data.map((content) => {
                    const isTrail = content.steps.length > 0;
                    const canEdit = role === 'root'
                      || (role === 'curator' && content.ownerId === user?.id);
                    return (
                      <Card key={content.id}>
                        <CardTitle>{content.title}</CardTitle>
                        <Muted>{isTrail ? 'Trilha de descoberta' : 'Coleção editorial'}</Muted>
                        <Muted>
                          {content.speciesIds.length} espécies ·{' '}
                          {content.ownerId === user?.id
                            ? 'criada por você'
                            : content.ownerId ?? 'curadoria original'}
                        </Muted>
                        <ButtonRow>
                          {canEdit && (
                            <PrimaryButton
                              type="button"
                              onClick={() => beginEdit(content)}
                            >
                              <Pencil size={14} aria-hidden="true" />
                              Editar
                            </PrimaryButton>
                          )}
                          {isModerator(role) && (
                            <DangerButton
                              type="button"
                              disabled={deleteContentMutation.isPending}
                              onClick={() => confirmDeleteContent(content)}
                            >
                              <Trash2 size={14} aria-hidden="true" />
                              Excluir
                            </DangerButton>
                          )}
                        </ButtonRow>
                      </Card>
                    );
                  })}
                </Grid>
              )}
            </Section>
          )}

          {isModerator(role) && (
            <Section>
              <SectionHeader>
                <div>
                  <h2>Revisão de imagens</h2>
                  <p>Somente uma aprovação da equipe altera a foto em destaque da espécie.</p>
                </div>
                {pendingPhotosQuery.data && (
                  <Count>{pendingPhotosQuery.data.length} pendentes</Count>
                )}
              </SectionHeader>
              {pendingPhotosQuery.isPending && <Status role="status">Carregando fila de revisão…</Status>}
              {pendingPhotosQuery.isError && (
                <ErrorMessage role="alert">
                  Não foi possível carregar a fila de revisão.
                </ErrorMessage>
              )}
              {reviewMutation.isError && (
                <ErrorMessage role="alert">{reviewMutation.error.message}</ErrorMessage>
              )}
              {pendingPhotosQuery.data?.length === 0 && (
                <Status>Não há sugestões pendentes no momento.</Status>
              )}
              {pendingPhotosQuery.data && pendingPhotosQuery.data.length > 0 && (
                <Grid>
                  {pendingPhotosQuery.data.map((suggestion) => (
                    <Card key={suggestion.id}>
                      <PhotoRow>
                        <img src={suggestion.photo.url} alt="" loading="lazy" />
                        <div>
                          <CardTitle>{suggestion.scientificName ?? suggestion.speciesId}</CardTitle>
                          <Muted>
                            Sugerida por {suggestion.submittedBy} ·{' '}
                            {formatDate(suggestion.createdAt)}
                          </Muted>
                          <Muted>
                            {suggestion.photo.attribution} · {suggestion.photo.license} ·{' '}
                            {suggestion.photo.source}
                          </Muted>
                          <TextLink
                            href={suggestion.photo.referenceUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Ver origem da imagem
                          </TextLink>
                        </div>
                      </PhotoRow>
                      <ButtonRow>
                        <PrimaryButton
                          type="button"
                          disabled={reviewMutation.isPending}
                          onClick={() => reviewMutation.mutate({
                            suggestionId: suggestion.id,
                            decision: 'approved',
                          })}
                        >
                          <Check size={14} aria-hidden="true" />
                          Aprovar como melhor foto
                        </PrimaryButton>
                        <DangerButton
                          type="button"
                          disabled={reviewMutation.isPending}
                          onClick={() => reviewMutation.mutate({
                            suggestionId: suggestion.id,
                            decision: 'rejected',
                          })}
                        >
                          <X size={14} aria-hidden="true" />
                          Recusar
                        </DangerButton>
                      </ButtonRow>
                    </Card>
                  ))}
                </Grid>
              )}
            </Section>
          )}

          {isModerator(role) && (
            <Section>
              <SectionHeader>
                <div>
                  <h2>Usuários</h2>
                  <p>
                    Admins podem conceder curadoria. Apenas root pode conceder ou remover
                    permissões de admin.
                  </p>
                </div>
                {usersQuery.data && <Count>{usersQuery.data.length} contas</Count>}
              </SectionHeader>
              {usersQuery.isPending && <Status role="status">Carregando usuários…</Status>}
              {usersQuery.isError && (
                <ErrorMessage role="alert">Não foi possível carregar os usuários.</ErrorMessage>
              )}
              {roleMutation.isError && (
                <ErrorMessage role="alert">{roleMutation.error.message}</ErrorMessage>
              )}
              {registrationMutation.isError && (
                <ErrorMessage role="alert">{registrationMutation.error.message}</ErrorMessage>
              )}
              {usersQuery.data?.map((managedUser) => {
                const isSelf = managedUser.id === user?.id;
                const isRootUser = managedUser.role === 'root';
                const canChange = role === 'root'
                  ? !isSelf && !isRootUser
                  : managedUser.role === 'user';
                const draft = roleDrafts[managedUser.id] ?? managedUser.role as AssignableAccountRole;
                return (
                  <UserRow key={managedUser.id}>
                    <div>
                      <CardTitle>{managedUser.name || managedUser.email || 'Conta Biodex'}</CardTitle>
                      <Muted>{managedUser.email || managedUser.id}</Muted>
                      {managedUser.profession && <Muted>Profissão: {managedUser.profession}</Muted>}
                      {(managedUser.professionalCouncil || managedUser.professionalRegistrationNumber) && (
                        <Muted>
                          Registro: {managedUser.professionalCouncil} ·{' '}
                          {managedUser.professionalRegistrationNumber}
                        </Muted>
                      )}
                      <Muted>
                        Situação do registro:{' '}
                        {registrationStatusLabels[managedUser.professionalRegistrationStatus]}
                        {managedUser.registrationVerifiedAt
                          ? ` · conferido em ${formatDate(managedUser.registrationVerifiedAt)}`
                          : ''}
                      </Muted>
                      <Muted>Último acesso: {formatDate(managedUser.lastSeenAt)}</Muted>
                    </div>
                    <div className="role-control">
                      <RolePill>{roleLabels[managedUser.role]}</RolePill>
                    </div>
                    <RoleControl className="role-control">
                      {canChange ? (
                        <>
                          <Select
                            aria-label={`Nível de acesso de ${managedUser.name || managedUser.id}`}
                            value={draft}
                            disabled={roleMutation.isPending}
                            onChange={(event) => {
                              const value = event.target.value;
                              if (value === 'user' || value === 'curator' || value === 'admin') {
                                setRoleDrafts((current) => ({
                                  ...current,
                                  [managedUser.id]: value,
                                }));
                              }
                            }}
                          >
                            <option value="user">Usuário</option>
                            <option
                              value="curator"
                              disabled={managedUser.professionalRegistrationStatus !== 'active'}
                            >
                              Curador
                            </option>
                            {role === 'root' && <option value="admin">Admin</option>}
                          </Select>
                          <SecondaryButton
                            type="button"
                            disabled={
                              roleMutation.isPending
                              || draft === managedUser.role
                              || (role === 'admin' && draft !== 'curator')
                            }
                            onClick={() => roleMutation.mutate({
                              userId: managedUser.id,
                              nextRole: draft,
                            })}
                          >
                            Aplicar
                          </SecondaryButton>
                        </>
                      ) : (
                        <Muted>{isSelf ? 'Sua conta' : 'Sem ações disponíveis'}</Muted>
                      )}
                    </RoleControl>
                    {managedUser.professionalRegistrationStatus === 'pending'
                      && managedUser.professionalCouncil
                      && managedUser.professionalRegistrationNumber
                      && (
                        <div className="registration-review">
                          <Muted>
                            Confirme a situação atual do registro em uma fonte oficial antes de
                            aprovar.
                          </Muted>
                          <ButtonRow>
                            <PrimaryButton
                              type="button"
                              disabled={registrationMutation.isPending}
                              onClick={() => registrationMutation.mutate({
                                userId: managedUser.id,
                                status: 'active',
                              })}
                            >
                              <Check size={14} aria-hidden="true" />
                              Validar como ativo
                            </PrimaryButton>
                            <DangerButton
                              type="button"
                              disabled={registrationMutation.isPending}
                              onClick={() => registrationMutation.mutate({
                                userId: managedUser.id,
                                status: 'rejected',
                              })}
                            >
                              <X size={14} aria-hidden="true" />
                              Recusar
                            </DangerButton>
                          </ButtonRow>
                        </div>
                      )}
                  </UserRow>
                );
              })}
            </Section>
          )}
        </>
      )}
    </Page>
  );
}
