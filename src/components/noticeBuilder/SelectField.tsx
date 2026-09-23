import React from "react";
import { Select } from "../ui";

export type SelectOption = { id: string; label: string };

type SelectFieldProps = {
  value: string | null;
  onValueChange: (value: string | null) => void;
  options: readonly SelectOption[];
  ariaLabel: string;
  placeholder: string;
  required?: boolean;
};

/** Styled single-choice dropdown used by the notice builder. */
const SelectField = ({ value, onValueChange, options, ariaLabel, placeholder, required }: SelectFieldProps) => (
  <Select.Root value={value} onValueChange={(next) => onValueChange((next as string | null) ?? null)} required={required}>
    <Select.Trigger className="select-trigger" aria-label={ariaLabel}>
      <Select.Value placeholder={placeholder} />
      <Select.Icon className="select-icon">
        <span aria-hidden="true">▾</span>
      </Select.Icon>
    </Select.Trigger>
    <Select.Portal>
      <Select.Positioner className="select-positioner">
        <Select.Popup className="select-popup">
          <Select.List className="select-list">
            {options.map((option) => (
              <Select.Item key={option.id} value={option.id} className="select-item">
                <Select.ItemText>{option.label}</Select.ItemText>
                <Select.ItemIndicator className="select-item-indicator">✓</Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.List>
        </Select.Popup>
      </Select.Positioner>
    </Select.Portal>
  </Select.Root>
);

export default SelectField;
