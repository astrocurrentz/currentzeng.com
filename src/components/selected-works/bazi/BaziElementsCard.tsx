import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import GlitchText from '../../GlitchText';
import { BAZI_ELEMENT_DISTRIBUTION } from '../../selectedWorksData';

type DonutDatum = {
  fill: string;
  key: string;
  name: string;
  value: number;
};

function polarPoint(center: number, radius: number, angleDeg: number) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;

  return {
    x: center + radius * Math.cos(angleRad),
    y: center + radius * Math.sin(angleRad),
  };
}

function describeDonutArc(
  center: number,
  innerRadius: number,
  outerRadius: number,
  startAngle: number,
  endAngle: number,
) {
  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
  const outerStart = polarPoint(center, outerRadius, startAngle);
  const outerEnd = polarPoint(center, outerRadius, endAngle);
  const innerEnd = polarPoint(center, innerRadius, endAngle);
  const innerStart = polarPoint(center, innerRadius, startAngle);

  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerStart.x} ${innerStart.y}`,
    'Z',
  ].join(' ');
}

export function ElementsDistributionCard({ captionGlitchSignal }: { captionGlitchSignal?: number | string }) {
  const [pressedElementKey, setPressedElementKey] = useState<string | null>(null);
  const [selectedElementKey, setSelectedElementKey] = useState<string>('wood');
  const [donutRotation, setDonutRotation] = useState(0);
  const [donutInteraction, setDonutInteraction] = useState<'idle' | 'dragging' | 'settling'>('idle');
  const donutRef = useRef<HTMLDivElement | null>(null);
  const spinStateRef = useRef<{ pointerId: number; startAngle: number; startRotation: number; moved: boolean } | null>(null);
  const settleTimeoutRef = useRef<number | null>(null);

  const chartData: DonutDatum[] = useMemo(() => (
    BAZI_ELEMENT_DISTRIBUTION.map((item) => ({
      key: item.key,
      name: item.labelEn,
      value: item.value,
      fill: item.color,
    }))
  ), []);
  const donutSegments = useMemo(() => {
    const total = chartData.reduce((sum, entry) => sum + entry.value, 0);

    return chartData.map((entry, index) => {
      const startAngle = chartData
        .slice(0, index)
        .reduce(
          (sum, previousEntry) =>
            sum + (total > 0 ? (previousEntry.value / total) * 360 : 0),
          0,
      );
      const angle = total > 0 ? (entry.value / total) * 360 : 0;
      const endAngle = startAngle + angle;

      return {
        ...entry,
        path: describeDonutArc(50, 26.5, 45.5, startAngle, endAngle),
      };
    });
  }, [chartData]);

  const selectedElement = chartData.find((entry) => entry.key === selectedElementKey) ?? chartData[0];

  const clearSettleTimeout = useCallback(() => {
    if (settleTimeoutRef.current !== null) {
      window.clearTimeout(settleTimeoutRef.current);
      settleTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      clearSettleTimeout();
    };
  }, [clearSettleTimeout]);

  const angleFromPointer = useCallback((clientX: number, clientY: number, rect: DOMRect): number => {
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    return (Math.atan2(clientY - centerY, clientX - centerX) * 180) / Math.PI + 90;
  }, []);

  const normalizeAngle = useCallback((angle: number) => {
    let normalized = angle;
    while (normalized > 180) normalized -= 360;
    while (normalized < -180) normalized += 360;
    return normalized;
  }, []);

  const angleToSectorIndex = useCallback((angleDeg: number) => {
    const total = chartData.reduce((sum, entry) => sum + entry.value, 0);
    if (total <= 0) return 0;

    const angle = ((angleDeg % 360) + 360) % 360;
    let cumulative = 0;

    for (let index = 0; index < chartData.length; index += 1) {
      cumulative += ((chartData[index]?.value ?? 0) / total) * 360;
      if (angle < cumulative) return index;
    }

    return chartData.length - 1;
  }, [chartData]);

  const onPointerDown = (event: React.PointerEvent) => {
    event.preventDefault();
    const rect = donutRef.current?.getBoundingClientRect();
    if (!rect) return;

    const angle = angleFromPointer(event.clientX, event.clientY, rect);
    const logicalAngle = angle - donutRotation;
    const sectorIndex = angleToSectorIndex(logicalAngle);
    setPressedElementKey(chartData[sectorIndex]?.key ?? null);

    clearSettleTimeout();
    spinStateRef.current = {
      pointerId: event.pointerId,
      startAngle: angle,
      startRotation: donutRotation,
      moved: false,
    };

    setDonutInteraction('dragging');
    donutRef.current?.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent) => {
    const drag = spinStateRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    const rect = donutRef.current?.getBoundingClientRect();
    if (!rect) return;

    const angle = angleFromPointer(event.clientX, event.clientY, rect);
    const delta = normalizeAngle(angle - drag.startAngle);

    if (Math.abs(delta) > 3) {
      drag.moved = true;
      setPressedElementKey(null);
    }

    setDonutRotation(drag.startRotation + delta);
  };

  const finishPointerByClientPosition = useCallback((pointerId: number, clientX: number, clientY: number) => {
    const drag = spinStateRef.current;
    if (!drag || drag.pointerId !== pointerId) return;

    if (donutRef.current?.hasPointerCapture(pointerId)) {
      donutRef.current.releasePointerCapture(pointerId);
    }
    spinStateRef.current = null;

    if (drag.moved) {
      setPressedElementKey(null);
      setDonutInteraction('settling');
      setDonutRotation(0);
      clearSettleTimeout();
      settleTimeoutRef.current = window.setTimeout(() => {
        setDonutInteraction('idle');
        settleTimeoutRef.current = null;
      }, 500);
      return;
    }

    setDonutInteraction('idle');
    const rect = donutRef.current?.getBoundingClientRect();
    if (!rect) {
      setPressedElementKey(null);
      return;
    }

    const angle = angleFromPointer(clientX, clientY, rect);
    const finalRotation = drag.startRotation + normalizeAngle(angle - drag.startAngle);
    const sectorIndex = angleToSectorIndex(angle - finalRotation);
    const target = chartData[sectorIndex];

    if (target) {
      setSelectedElementKey(target.key);
    }

    setPressedElementKey(null);
  }, [angleFromPointer, angleToSectorIndex, chartData, clearSettleTimeout, normalizeAngle]);

  const finishPointer = (event: React.PointerEvent) => {
    finishPointerByClientPosition(event.pointerId, event.clientX, event.clientY);
  };

  useEffect(() => {
    const handleGlobalPointerRelease = (event: PointerEvent) => {
      finishPointerByClientPosition(event.pointerId, event.clientX, event.clientY);
    };

    window.addEventListener('pointerup', handleGlobalPointerRelease);
    window.addEventListener('pointercancel', handleGlobalPointerRelease);

    return () => {
      window.removeEventListener('pointerup', handleGlobalPointerRelease);
      window.removeEventListener('pointercancel', handleGlobalPointerRelease);
    };
  }, [finishPointerByClientPosition]);

  return (
    <article className="bazi-card bazi-section-card bazi-elements-card">
      <h3 className="bazi-card-title bazi-card-title-left">Element Distribution</h3>
      <GlitchText
        text="Spin donut"
        tag="p"
        wrapToWidth={false}
        scrambleOnMount={false}
        scrambleSignal={captionGlitchSignal}
        className="bazi-card-caption"
      />

      <div
        ref={donutRef}
        className="bazi-elements-donut-wrap"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={finishPointer}
        onPointerCancel={finishPointer}
      >
        <div
          className="bazi-elements-donut-inner"
          style={{
            transform: `rotate(${donutRotation}deg)`,
            transition: donutInteraction === 'settling' ? 'transform 500ms cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none',
          }}
        >
          <svg
            aria-label="Element distribution donut"
            className="bazi-elements-pie"
            role="img"
            viewBox="0 0 100 100"
          >
            {donutSegments.map((entry) => (
              <path
                d={entry.path}
                fill={entry.fill}
                key={entry.key}
                stroke="var(--bazi-border)"
                strokeLinejoin="round"
                strokeWidth={1.1}
                style={{
                  cursor: 'pointer',
                  transform:
                    pressedElementKey === entry.key
                      ? 'translate(1.1px, 1.1px)'
                      : undefined,
                  transition: 'transform 100ms ease-out',
                }}
              />
            ))}
          </svg>
        </div>
      </div>

      <span className="bazi-elements-selected" aria-hidden>
        {selectedElement?.name}
      </span>
    </article>
  );
}
