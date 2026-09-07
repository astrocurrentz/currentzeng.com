import React from 'react';
import {
  ALMANAC_ENERGY_COLORS,
  ALMANAC_ENERGY_LABELS,
  ELEMENT_COLORS,
  GENERAL_ALMANAC_DEMO,
  type AlmanacEnergyKey,
} from '../../selectedWorksData';
import { clamp } from '../shared';
import { BaziPressableButton, GlyphSquare } from './BaziControls';
import { ALMANAC_MAX_INDEX, ALMANAC_MIN_INDEX } from './constants';
import { elementByGlyph } from './ganzhi';

function ArrowIcon({ direction }: { direction: 'left' | 'right' }) {
  return (
    <span
      aria-hidden="true"
      className={`bazi-icon-glyph bazi-arrow-glyph bazi-arrow-${direction}`}
    />
  );
}

function TimeIcon({ isNight }: { isNight: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`bazi-icon-glyph bazi-time-glyph ${isNight ? 'is-night' : 'is-day'}`}
    />
  );
}

function AlmanacEnergyBars({ entry }: { entry: (typeof GENERAL_ALMANAC_DEMO)[number] }) {
  return (
    <div className="bazi-energy-bars">
      {entry.energy.map((item) => {
        const key = item.key as AlmanacEnergyKey;
        const color = ALMANAC_ENERGY_COLORS[key];
        const label = ALMANAC_ENERGY_LABELS[key];

        return (
          <div key={`energy-row-${entry.date}-${item.key}`} className="bazi-energy-row">
            <div className="bazi-energy-row-head">
              <span>{label}</span>
              <span>{item.score}</span>
            </div>
            <div className="bazi-energy-track">
              <span
                className="bazi-energy-fill"
                style={{
                  width: `${Math.max(0, Math.min(100, item.score))}%`,
                  backgroundColor: color,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function GeneralAlmanacCard({
  index,
  setIndex,
}: {
  index: number;
  setIndex: (next: number) => void;
}) {
  const entry = GENERAL_ALMANAC_DEMO[index] ?? GENERAL_ALMANAC_DEMO[0];
  const sixWordsStem = [entry.sixWords.year.stem, entry.sixWords.month.stem, entry.sixWords.day.stem];
  const sixWordsBranch = [entry.sixWords.year.branch, entry.sixWords.month.branch, entry.sixWords.day.branch];

  const timeIsNight = (() => {
    const [from] = entry.lucky.timeRange.split('-');
    const hour = Number(from?.split(':')[0] ?? '0');
    return hour >= 18 || hour < 6;
  })();

  return (
    <article className="bazi-card bazi-section-card bazi-almanac-card" data-bazi-update-glitch="almanac-card">
      <div className="bazi-almanac-top-row">
        <p className="bazi-almanac-date">Date:{entry.date.replace(/-/g, '/')}</p>

      </div>

      <div className="bazi-almanac-two-col">
        <div className="bazi-card bazi-almanac-inner-card">
          <h4>Lucky Insights</h4>
          <div className="bazi-lucky-grid">
            <BaziPressableButton className="bazi-lucky-cell number" ariaLabel="Lucky number">
              {entry.lucky.number}
            </BaziPressableButton>
            <span className="bazi-lucky-cell" style={{ backgroundColor: entry.lucky.colorHex }} role="img" aria-label={`Lucky color: ${entry.lucky.colorNameZh}`} />
            <BaziPressableButton
              className="bazi-lucky-cell direction"
              style={{ backgroundColor: ELEMENT_COLORS[elementByGlyph(entry.lucky.directionBranch)] }}
              ariaLabel="Lucky direction"
            >
              <span className="bazi-lucky-arrow">↗</span>
              <span className="bazi-lucky-glyph">{entry.lucky.directionBranch}</span>
            </BaziPressableButton>
            <BaziPressableButton className="bazi-lucky-cell time" ariaLabel="Lucky time range">
              <TimeIcon isNight={timeIsNight} />
              <span>{entry.lucky.timeRange}</span>
            </BaziPressableButton>
          </div>
        </div>

        <div className="bazi-card bazi-almanac-inner-card">
          <h4>Energy Index</h4>
          <AlmanacEnergyBars entry={entry} />
        </div>
      </div>

      <div className="bazi-card bazi-almanac-inner-card bazi-six-glyphs-card">
        <h4>Six characters for this date</h4>
        <div className="bazi-six-glyphs-layout">
          <BaziPressableButton
            className="bazi-chip bazi-nav-icon"
            onClick={() => {
              setIndex(clamp(index - 1, ALMANAC_MIN_INDEX, ALMANAC_MAX_INDEX));
            }}
            disabled={index === ALMANAC_MIN_INDEX}
            ariaLabel="Previous day"
          >
            <ArrowIcon direction="left" />
          </BaziPressableButton>

          <div className="bazi-six-glyph-grid">
            {sixWordsStem.map((glyph, idx) => (
              <GlyphSquare key={`six-stem-${entry.date}-${idx}`} glyph={glyph} showPinyin />
            ))}
            {sixWordsBranch.map((glyph, idx) => (
              <GlyphSquare key={`six-branch-${entry.date}-${idx}`} glyph={glyph} showPinyin />
            ))}
          </div>

          <BaziPressableButton
            className="bazi-chip bazi-nav-icon"
            onClick={() => {
              setIndex(clamp(index + 1, ALMANAC_MIN_INDEX, ALMANAC_MAX_INDEX));
            }}
            disabled={index === ALMANAC_MAX_INDEX}
            ariaLabel="Next day"
          >
            <ArrowIcon direction="right" />
          </BaziPressableButton>
        </div>
      </div>
    </article>
  );
}
