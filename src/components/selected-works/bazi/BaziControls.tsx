import React, { type CSSProperties, useId } from "react";
import {
  BAZI_UI_DEMO_DISCLAIMER,
  ELEMENT_COLORS,
} from "../../selectedWorksData";
import { elementByGlyph, glyphPinyin } from "./ganzhi";

type BaziButtonProps = React.PropsWithChildren<{
  className?: string;
  style?: CSSProperties;
  ariaLabel?: string;
}> &
  Pick<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    | "onClick"
    | "type"
    | "disabled"
    | "onPointerDown"
    | "onPointerMove"
    | "onPointerUp"
    | "onPointerLeave"
    | "onPointerCancel"
    | "onKeyDown"
  >;

export function BaziPressableButton({
  children,
  className = "",
  style,
  ariaLabel,
  type = "button",
  onClick,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerLeave,
  onPointerCancel,
  onKeyDown,
  disabled,
}: BaziButtonProps) {
  // A sample value is content, not a button that silently does nothing.
  if (!onClick && !onPointerDown && !onKeyDown) {
    return (
      <span
        className={`bazi-static-value ${className}`}
        style={style}
        role={ariaLabel ? "group" : undefined}
        aria-label={ariaLabel}
      >
        {children}
      </span>
    );
  }
  return (
    <button
      type={type}
      className={`bazi-pressable ${className}`}
      style={style}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onClick}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerLeave}
      onPointerCancel={onPointerCancel}
      onKeyDown={onKeyDown}
    >
      {children}
    </button>
  );
}

export function BaziDemoDisclaimer() {
  return <p className="bazi-demo-disclaimer">{BAZI_UI_DEMO_DISCLAIMER}</p>;
}

export function GanzhiButtonLabel({
  glyph,
  showPinyin,
  glyphClassName,
  pinyinClassName,
}: {
  glyph: string;
  showPinyin?: boolean;
  glyphClassName?: string;
  pinyinClassName?: string;
}) {
  if (!glyph) return null;
  const pinyin = glyphPinyin(glyph);
  if (!showPinyin || !pinyin)
    return <span className={glyphClassName}>{glyph}</span>;
  return (
    <span className="inline-flex flex-col items-center justify-center gap-1">
      <span className={pinyinClassName}>({pinyin})</span>
      <span className={glyphClassName}>{glyph}</span>
    </span>
  );
}

export type GlyphSquareProps = {
  glyph: string;
  showPinyin?: boolean;
  className?: string;
  style?: CSSProperties;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  pressed?: boolean;
  ariaLabel?: string;
} & React.Attributes;

export function GlyphSquare({
  glyph,
  showPinyin,
  className,
  style,
  onClick,
  pressed,
  ariaLabel,
}: GlyphSquareProps) {
  const element = glyph ? elementByGlyph(glyph) : null;
  return (
    <BaziPressableButton
      ariaLabel={ariaLabel}
      className={`bazi-glyph-square ${className ?? ""}`}
      style={{
        backgroundColor: element
          ? ELEMENT_COLORS[element]
          : "var(--bazi-secondary-background)",
        color: element
          ? "var(--bazi-main-foreground)"
          : "var(--bazi-foreground)",
        ...(pressed
          ? {
              transform: "translate(var(--bazi-press-x), var(--bazi-press-y))",
              boxShadow: "none",
            }
          : undefined),
        ...style,
      }}
      onClick={onClick}
    >
      {glyph ? (
        <GanzhiButtonLabel
          glyph={glyph}
          showPinyin={showPinyin}
          glyphClassName="bazi-glyph-text"
          pinyinClassName="bazi-pinyin-text"
        />
      ) : null}
    </BaziPressableButton>
  );
}

export function NativeSelect({
  value,
  options,
  placeholder,
  onChange,
}: {
  value: string;
  options: string[];
  placeholder: string;
  onChange: (value: string) => void;
}) {
  const id = useId();
  return (
    <label className="bazi-field-label" htmlFor={id}>
      {placeholder === "Min" ? "Minute" : placeholder}
      <span className="bazi-native-select-wrap">
        <select
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="bazi-input-field bazi-input-select bazi-native-select"
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <span
          aria-hidden="true"
          className="bazi-select-chevron bazi-icon-glyph bazi-chevron-glyph"
        />
      </span>
    </label>
  );
}
