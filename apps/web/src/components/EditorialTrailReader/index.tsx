import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, RotateCcw } from 'lucide-react';
import type { EditorialTrailStep } from '../../collections/types';
import type { Species } from '../../types/species';
import { SaveSpeciesButton } from '../SaveSpeciesButton';
import { SpeciesCard } from '../SpeciesCard';
import {
  CompleteMessage,
  Navigation,
  NavigationButton,
  NavigationStatus,
  ProgressFill,
  ProgressHeader,
  ProgressTrack,
  Reader,
  SaveAction,
  SourceLink,
  SpeciesPanel,
  Status,
  StepArticle,
  StepCopy,
  StepEyebrow,
  StepHeading,
  StepNarrative,
} from './styles';

interface EditorialTrailReaderProps {
  steps: EditorialTrailStep[];
  species: Species[];
  isSpeciesLoading: boolean;
}

export function EditorialTrailReader({
  steps,
  species,
  isSpeciesLoading,
}: EditorialTrailReaderProps) {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [completed, setCompleted] = useState(false);
  const speciesById = useMemo(
    () => new Map(species.map((item) => [item.documentId, item])),
    [species],
  );
  const activeStep = steps[activeStepIndex];

  if (!activeStep) return null;

  const activeSpecies = speciesById.get(activeStep.speciesId);
  const progress = ((activeStepIndex + 1) / steps.length) * 100;

  function goToPreviousStep() {
    setCompleted(false);
    setActiveStepIndex((current) => Math.max(0, current - 1));
  }

  function goToNextStep() {
    if (activeStepIndex === steps.length - 1) {
      setCompleted(true);
      return;
    }

    setCompleted(false);
    setActiveStepIndex((current) => current + 1);
  }

  function restartTrail() {
    setActiveStepIndex(0);
    setCompleted(false);
  }

  return (
    <Reader aria-label="Leitura da trilha de descoberta">
      <ProgressHeader>
        <span>Seu percurso</span>
        <NavigationStatus aria-live="polite">
          Passo {activeStepIndex + 1} de {steps.length}
        </NavigationStatus>
      </ProgressHeader>
      <ProgressTrack
        role="progressbar"
        aria-label="Progresso da trilha"
        aria-valuemin={1}
        aria-valuemax={steps.length}
        aria-valuenow={activeStepIndex + 1}
        aria-valuetext={`Passo ${activeStepIndex + 1} de ${steps.length}`}
      >
        <ProgressFill $progress={progress} />
      </ProgressTrack>

      <StepArticle>
        <StepCopy aria-live="polite">
          <StepEyebrow>PASSO {String(activeStepIndex + 1).padStart(2, '0')}</StepEyebrow>
          <StepHeading>{activeStep.title}</StepHeading>
          <StepNarrative>{activeStep.narrative}</StepNarrative>
          <SourceLink
            href={activeStep.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Fonte: {activeStep.sourceLabel} <span aria-hidden="true">↗</span>
          </SourceLink>
        </StepCopy>

        <SpeciesPanel>
          {isSpeciesLoading ? (
            <Status role="status">Carregando espécie…</Status>
          ) : activeSpecies ? (
            <>
              <SpeciesCard species={activeSpecies} />
              <SaveAction>
                <span>Guardar esta espécie</span>
                <SaveSpeciesButton species={activeSpecies} />
              </SaveAction>
            </>
          ) : (
            <Status role="alert">Não foi possível carregar a espécie deste passo.</Status>
          )}
        </SpeciesPanel>
      </StepArticle>

      {completed && (
        <CompleteMessage role="status">
          <div>
            <strong>Trilha concluída.</strong>
            <span>Continue explorando ou volte a qualquer passo para rever a história.</span>
          </div>
          <a href="/#trilhas">Explorar outras trilhas</a>
        </CompleteMessage>
      )}

      <Navigation>
        <NavigationButton
          type="button"
          $secondary
          disabled={activeStepIndex === 0}
          onClick={goToPreviousStep}
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Anterior
        </NavigationButton>
        {completed ? (
          <NavigationButton type="button" onClick={restartTrail}>
            <RotateCcw size={16} aria-hidden="true" />
            Refazer trilha
          </NavigationButton>
        ) : (
          <NavigationButton type="button" onClick={goToNextStep}>
            {activeStepIndex === steps.length - 1 ? 'Concluir trilha' : 'Próximo passo'}
            {activeStepIndex === steps.length - 1
              ? <Check size={16} aria-hidden="true" />
              : <ArrowRight size={16} aria-hidden="true" />}
          </NavigationButton>
        )}
      </Navigation>
    </Reader>
  );
}
