import { ArrowLeft } from 'lucide-react';
import { BackLink, Breadcrumb, Crumb, CrumbLink, CrumbList, CurrentCrumb } from './styles';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageNavigationProps {
  items: BreadcrumbItem[];
  backHref: string;
  backLabel: string;
  accentColor?: string;
}

export function PageNavigation({ items, backHref, backLabel, accentColor }: PageNavigationProps) {
  return (
    <Breadcrumb $accentColor={accentColor}>
      <BackLink href={backHref}>
        <ArrowLeft size={16} aria-hidden="true" />
        {backLabel}
      </BackLink>
      <CrumbList>
        {items.map((item, index) => (
          <Crumb key={`${item.label}-${index}`}>
            {index > 0 && <span aria-hidden="true">/</span>}
            {item.href && index < items.length - 1 ? (
              <CrumbLink href={item.href}>{item.label}</CrumbLink>
            ) : (
              <CurrentCrumb aria-current={index === items.length - 1 ? 'page' : undefined}>
                {item.label}
              </CurrentCrumb>
            )}
          </Crumb>
        ))}
      </CrumbList>
    </Breadcrumb>
  );
}
