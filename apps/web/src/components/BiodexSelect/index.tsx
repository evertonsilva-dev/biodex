import ReactSelect, { type StylesConfig } from 'react-select';
import styled from 'styled-components';

export interface BiodexSelectOption {
  value: string;
  label: string;
}

function createSelectStyles<IsMulti extends boolean>(): StylesConfig<BiodexSelectOption, IsMulti> {
  return {
    control: (base, state) => ({
      ...base,
      minHeight: '2.75rem',
      border: 'none',
      borderBottom: `1px solid var(--biodex-select-${state.isFocused ? 'green' : 'line'})`,
      borderRadius: 0,
      backgroundColor: 'transparent',
      boxShadow: 'none',
      cursor: 'pointer',
      ':hover': { borderColor: 'var(--biodex-select-green)' },
    }),
    valueContainer: (base) => ({ ...base, padding: '0 0.85rem', gap: '0.2rem' }),
    input: (base) => ({ ...base, color: 'var(--biodex-select-ink)', margin: 0 }),
    placeholder: (base) => ({ ...base, color: 'var(--biodex-select-muted)', margin: 0 }),
    singleValue: (base) => ({ ...base, color: 'var(--biodex-select-muted)' }),
    indicatorsContainer: (base) => ({ ...base, color: 'var(--biodex-select-muted)' }),
    indicatorSeparator: () => ({ display: 'none' }),
    dropdownIndicator: (base, state) => ({
      ...base,
      color: state.isFocused ? 'var(--biodex-select-green)' : 'var(--biodex-select-muted)',
    }),
    clearIndicator: (base) => ({ ...base, color: 'var(--biodex-select-muted)' }),
    menu: (base) => ({
      ...base,
      zIndex: 20,
      overflow: 'hidden',
      border: '1px solid var(--biodex-select-line)',
      borderRadius: '8px',
      backgroundColor: 'var(--biodex-select-paper)',
      boxShadow: '0 8px 24px #202b261a',
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? 'var(--biodex-select-green)'
        : state.isFocused
          ? 'var(--biodex-select-highlight)'
          : 'transparent',
      color: state.isSelected ? 'var(--biodex-select-paper)' : 'var(--biodex-select-ink)',
      cursor: 'pointer',
    }),
    noOptionsMessage: (base) => ({ ...base, color: 'var(--biodex-select-muted)' }),
    multiValue: (base) => ({
      ...base,
      borderRadius: '4px',
      backgroundColor: 'var(--biodex-select-highlight)',
      border: '1px solid var(--biodex-select-highlight-border)',
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: 'var(--biodex-select-green)',
      fontSize: '0.78rem',
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: 'var(--biodex-select-muted)',
      ':hover': {
        backgroundColor: 'var(--biodex-select-green)',
        color: 'var(--biodex-select-paper)',
      },
    }),
  };
}

const singleStyles = createSelectStyles<false>();
const multiStyles = createSelectStyles<true>();

const SelectContainer = styled.div`
  min-width: 0;
  width: 100%;
  --biodex-select-paper: ${({ theme }) => theme.colors.paper};
  --biodex-select-ink: ${({ theme }) => theme.colors.ink};
  --biodex-select-muted: ${({ theme }) => theme.colors.muted};
  --biodex-select-line: ${({ theme }) => theme.colors.line};
  --biodex-select-green: ${({ theme }) => theme.colors.green};
  --biodex-select-highlight: color-mix(in srgb, ${({ theme }) => theme.colors.green} 10%, ${({ theme }) => theme.colors.paper});
  --biodex-select-highlight-border: color-mix(in srgb, ${({ theme }) => theme.colors.green} 22%, ${({ theme }) => theme.colors.paper});
  font: inherit;
`;

interface BaseProps {
  id?: string;
  label: string;
  options: BiodexSelectOption[];
  placeholder: string;
  isDisabled?: boolean;
  isClearable?: boolean;
}

interface SingleSelectProps extends BaseProps {
  value: string;
  onChange(value: string): void;
}

interface MultiSelectProps extends BaseProps {
  value: string[];
  onChange(value: string[]): void;
  'aria-describedby'?: string;
}

export function BiodexSelect({
  id,
  label,
  options,
  placeholder,
  value,
  isDisabled,
  isClearable = true,
  onChange,
}: SingleSelectProps) {
  return (
    <SelectContainer>
      <ReactSelect<BiodexSelectOption, false>
        inputId={id}
        aria-label={label}
        classNamePrefix="biodex-select"
        options={options}
        value={options.find((option) => option.value === value) ?? null}
        placeholder={placeholder}
        isDisabled={isDisabled}
        isClearable={isClearable}
        styles={singleStyles}
        noOptionsMessage={() => 'Nenhuma opção encontrada'}
        onChange={(option) => onChange(option?.value ?? '')}
      />
    </SelectContainer>
  );
}

export function BiodexMultiSelect({
  id,
  label,
  options,
  placeholder,
  value,
  isDisabled,
  isClearable = true,
  onChange,
  'aria-describedby': ariaDescribedBy,
}: MultiSelectProps) {
  return (
    <SelectContainer>
      <ReactSelect<BiodexSelectOption, true>
        inputId={id}
        aria-label={label}
        aria-describedby={ariaDescribedBy}
        classNamePrefix="biodex-select"
        options={options}
        value={options.filter((option) => value.includes(option.value))}
        placeholder={placeholder}
        isDisabled={isDisabled}
        isMulti
        isClearable={isClearable}
        closeMenuOnSelect={false}
        hideSelectedOptions={false}
        styles={multiStyles}
        noOptionsMessage={() => 'Nenhuma opção encontrada'}
        onChange={(selected) => onChange(selected.map((option) => option.value))}
      />
    </SelectContainer>
  );
}
