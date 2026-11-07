import { PageNavigation } from '../PageNavigation';
import type { BreadcrumbItem } from '../PageNavigation';
import { TopBar } from '../TopBar';
import {
  Copy,
  Eyebrow,
  Orbit,
  Page,
  Progress,
  ProgressTrack,
  Stage,
  Star,
  Title,
} from './styles';

interface LoadingScreenProps {
  label: string;
  items: BreadcrumbItem[];
  backHref: string;
  backLabel: string;
  title: string;
  description: string;
  busy?: boolean;
}

export function LoadingScreen({
  label,
  items,
  backHref,
  backLabel,
  title,
  description,
  busy = true,
}: LoadingScreenProps) {
  return (
    <Page aria-busy={busy}>
      <TopBar label={label} />
      <PageNavigation items={items} backHref={backHref} backLabel={backLabel} />
      <Stage role="status" aria-live="polite">
        <Orbit aria-hidden="true">
          <Star>✳</Star>
        </Orbit>
        <Copy>
          <Eyebrow>UM MOMENTO</Eyebrow>
          <Title>{title}</Title>
          <p>{description}</p>
        </Copy>
        <ProgressTrack aria-hidden="true">
          <Progress />
        </ProgressTrack>
      </Stage>
    </Page>
  );
}
