// curl -s https://npm.reversehttp.com/preact,htm/preact,preact-router,@preact/signals-core,@preact/signals,preact/hooks,idb-keyval > preact-bundle.js
import { html, render, useEffect, useSignal } from './preact-bundle.js';

function parseDate(value) {
  const input = String(value ?? '').trim();
  const match = input.match(/^(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?$/);
  if (!match) {
    throw new Error(`Unsupported date: "${input}". Use YYYY, YYYY-MM, or YYYY-MM-DD.`);
  }
  const year = Number(match[1]);
  const month = Number(match[2] ?? 1);
  const day = Number(match[3] ?? 1);
  // setUTCFullYear preserves years 0–99 instead of interpreting them as 1900–1999.
  const result = new Date(0);
  result.setUTCFullYear(year, month - 1, day);
  if (!Number.isFinite(result.getTime()) || result.getUTCFullYear() !== year ||
      result.getUTCMonth() !== month - 1 || result.getUTCDate() !== day) {
    throw new Error(`Invalid date: "${input}".`);
  }
  return result.getTime();
}

function readEvents(data) {
  if (!Array.isArray(data)) throw new Error('data.json must contain a list of events.');
  return data.map((event, index) => {
    if (!event || typeof event.name !== 'string' || !event.name.trim()) {
      throw new Error(`Event ${index + 1} needs a name.`);
    }
    const start = parseDate(event.start);
    const end = event.end == null ? start : parseDate(event.end);
    if (end < start) throw new Error(`"${event.name}" ends before it starts.`);
    return { ...event, startTime: start, endTime: end };
  }).sort((a, b) => a.startTime - b.startTime);
}

function Timeline({ events }) {
  const tooltip = useSignal(null);
  const showTooltip = (event, target) => {
    const bounds = target.currentTarget.getBoundingClientRect();
    tooltip.value = {
      event,
      left: Math.max(8, Math.min(target.clientX ?? bounds.left, window.innerWidth - 268)),
      top: Math.max(8, Math.min((target.clientY ?? bounds.bottom) + 16, window.innerHeight - 140)),
    };
  };
  const hideTooltip = () => { tooltip.value = null; };
  if (!events.length) return html`<p>No events in data.json.</p>`;

  const first = Math.min(...events.map(event => event.startTime));
  const last = Math.max(...events.map(event => event.endTime));
  const span = last - first || 86400000;
  const min = first - span * 0.04;
  const max = last + span * 0.04;
  const width = 1000, left = 40, right = 40, top = 70, rowHeight = 48;
  const height = top + events.length * rowHeight + 20;
  const x = time => left + (time - min) / (max - min) * (width - left - right);
  const yearLabel = year => String(year).padStart(4, '0');
  const dateLabel = time => {
    const date = new Date(time);
    return date.toISOString().slice(0, 10);
  };
  const ticks = [];
  if (span >= 365 * 86400000) {
    const firstYear = new Date(first).getUTCFullYear();
    const lastYear = new Date(last).getUTCFullYear();
    const roughStep = Math.max(1, (lastYear - firstYear) / 6);
    const magnitude = 10 ** Math.floor(Math.log10(roughStep));
    const step = [1, 2, 5, 10].find(n => n * magnitude >= roughStep) * magnitude;
    for (let year = Math.ceil(firstYear / step) * step; year <= lastYear; year += step) {
      ticks.push({ time: parseDate(yearLabel(year)), label: yearLabel(year) });
    }
  } else {
    for (let i = 0; i <= 4; i++) {
      const time = first + span * i / 4;
      ticks.push({ time, label: dateLabel(time) });
    }
  }

  return html`
    <div class="timeline" tabindex="0" role="region" aria-label="Event timeline, scroll horizontally to explore" onScroll=${hideTooltip}>
      <svg viewBox=${`0 0 ${width} ${height}`} role="img" aria-labelledby="timeline-title timeline-description">
        <title id="timeline-title">Historical events timeline</title>
        <desc id="timeline-description">Events in chronological order. Each bar spans its event's start and end dates.</desc>
        <line class="axis" x1=${left} x2=${width - right} y1="40" y2="40" />
        ${ticks.map(tick => html`
          <g key=${tick.time}>
            <line class="grid" x1=${x(tick.time)} x2=${x(tick.time)} y1="40" y2=${height - 20} />
            <text class="tick" x=${x(tick.time)} y="26" text-anchor="middle">${tick.label}</text>
          </g>
        `)}
        ${events.map((event, index) => {
          const y = top + index * rowHeight;
          const barX = x(event.startTime);
          const barWidth = Math.max(3, x(event.endTime) - barX);
          const label = `${event.name}${event.place ? ` — ${event.place}` : ''}`;
          return html`
            <g key=${index} tabindex="0" role="group"
              aria-label=${`${event.name}: ${event.start} – ${event.end ?? event.start}`}
              aria-describedby=${tooltip.value?.event === event ? 'event-tooltip' : undefined}
              onPointerEnter=${target => showTooltip(event, target)}
              onPointerLeave=${hideTooltip}
              onFocus=${target => showTooltip(event, target)}
              onBlur=${hideTooltip}
              onKeyDown=${target => { if (target.key === 'Escape') hideTooltip(); }}>
              <rect class="event-bar" x=${barX} y=${y} width=${barWidth} height="24" rx="4" />
              <foreignObject x=${barX + 4} y=${y} width=${Math.max(0, barWidth - 8)} height="24">
                <div xmlns="http://www.w3.org/1999/xhtml" class="event-label">${label}</div>
              </foreignObject>
            </g>
          `;
        })}
      </svg>
      ${tooltip.value && html`
        <div id="event-tooltip" class="event-tooltip" role="tooltip"
          style=${{ left: tooltip.value.left, top: tooltip.value.top }}>
          <strong class="tooltip-name">${tooltip.value.event.name}</strong>
          <dl class="tooltip-dates">
            <dt>Start</dt><dd>${tooltip.value.event.start}</dd>
            <dt>End</dt><dd>${tooltip.value.event.end ?? tooltip.value.event.start}</dd>
          </dl>
        </div>
      `}
    </div>
  `;
}

function App() {
  const events = useSignal(null);
  const error = useSignal('');

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const response = await fetch('./data.json', { signal: controller.signal, cache: 'no-store' });
        if (!response.ok) throw new Error(`Could not load data.json (HTTP ${response.status}).`);
        events.value = readEvents(await response.json());
      } catch (cause) {
        if (cause.name !== 'AbortError') error.value = cause.message;
      }
    }
    load();
    return () => controller.abort();
  }, []);

  return html`
    <main>
      <a href="/">home</a>
      <h1>Human history</h1>
      <a href="./data.json">View data</a>
      ${error.value ? html`<p class="status error" role="alert">${error.value}</p>`
        : events.value === null ? html`<p class="status" role="status">Loading events…</p>`
        : html`<${Timeline} events=${events.value} />`}
    </main>
  `;
}

render(html`<${App} />`, document.getElementById('app'));
