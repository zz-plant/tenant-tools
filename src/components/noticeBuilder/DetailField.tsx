import React from "react";
import { Input } from "../ui";
import { fieldDefinitions } from "../../data/noticeData";
import { detailCharacterLimit } from "../../lib/submissions";
import { detailWarningThreshold, evidenceSafetyChecklist, factualTagOptions, freeTextSafetyNote } from "./constants";
import type { IssueFieldKey } from "./logic";

type FieldDefinition = { label: string; type?: string; placeholder?: string };

type DetailFieldProps = {
  fieldKey: IssueFieldKey;
  value: string;
  onChange: (value: string) => void;
  onTagClick: (tag: string) => void;
};

/** One issue detail input with its length limit, safety note, and quick-fact tags. */
const DetailField = ({ fieldKey, value, onChange, onTagClick }: DetailFieldProps) => {
  const field: FieldDefinition | undefined = fieldDefinitions[fieldKey];
  if (!field) {
    return null;
  }
  const isAttachmentField = fieldKey === "attachment";
  const trimmedLength = value.trim().length;
  const isTextField = !field.type;
  const tags = isTextField ? factualTagOptions[fieldKey] : undefined;
  const showLimitWarning = isTextField && trimmedLength >= detailWarningThreshold;
  const limitText = isTextField
    ? `Limit: ${detailCharacterLimit} characters${trimmedLength > 0 ? ` (${trimmedLength}/${detailCharacterLimit})` : "."}`
    : "";
  const helperText = isTextField ? `${limitText} ${freeTextSafetyNote}` : "";
  const helperId = isTextField ? `detail-${fieldKey}-helper` : undefined;
  return (
    <label>
      {field.label}
      {isAttachmentField && (
        <div className="evidence-warning" role="note">
          <p className="evidence-warning-title">Evidence safety check</p>
          <ul className="evidence-warning-list">
            {evidenceSafetyChecklist.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}
      <Input
        className="input"
        type={field.type || "text"}
        value={value}
        onChange={(event) => onChange(event.currentTarget.value)}
        placeholder={field.placeholder}
        maxLength={isTextField ? detailCharacterLimit : undefined}
        aria-describedby={helperId}
      />
      {tags && (
        <div className="fact-tags" aria-label={`${field.label} quick facts`}>
          <p className="helper">Quick facts:</p>
          <div className="fact-tag-row">
            {tags.map((tag) => (
              <button
                key={tag}
                className="fact-tag"
                type="button"
                onClick={() => onTagClick(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}
      {isTextField && (
        <p className={`helper${showLimitWarning ? " helper-warning" : ""}`} id={helperId}>
          {helperText}
          {trimmedLength > detailCharacterLimit && " Extra text is removed when saving."}
        </p>
      )}
    </label>
  );
};

export default DetailField;
