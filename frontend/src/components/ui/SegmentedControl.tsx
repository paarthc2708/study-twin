interface SegmentedControlOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentedControlOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

export function SegmentedControl<T extends string>({ options, value, onChange }: SegmentedControlProps<T>) {
  return (
    <div className="flex bg-surface-container-low rounded-lg p-unit border border-outline-variant/20">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`flex-1 px-md py-sm rounded-md text-label-sm font-label-sm transition-all duration-200 ${
            value === option.value
              ? 'bg-primary text-on-primary font-bold'
              : 'text-on-surface-variant hover:text-primary'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
