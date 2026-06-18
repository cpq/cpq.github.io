import { h, html, render, useEffect, useRef, useSignal } from "./bundle.js";

import { ICONS } from "./icons.js";
export const Icon = ({ name, css, classes, ...rest}) => html`
  <svg viewBox="0 0 32 32" ...${rest} class=${classes}
  style="fill:none; stroke: currentColor; stroke-linecap: round; stroke-width: 2px;
  stroke-linejoin: round; width:1rem; height:1rem; ${css ?? ''}"
  dangerouslySetInnerHTML=${{ __html: ICONS[name] }} />`;

export const Input = ({ classes, ...rest }) => html`<input type="text" ...${rest}
  class="input outline outline-transparent text-slate-700 px-2 rounded-sm h-6 disabled:bg-stone-400 ${classes}" />`;

export const Select = ({ classes, options, value, ...rest }) => html`<select ...${rest}
class="select outline outline-transparent text-slate-700 px-1 rounded-sm h-6 disabled:bg-stone-400 ${classes}">
  ${options.map(x => Array.isArray(x) ? h('option', { value: x[0], selected: x[0] == value }, x[1]) : x)}
<//>`;

export function Button({title, onclick, disabled, ref, classes, icon, ...rest}) {
  const sigSpin = useSignal(false);
  const cb = function(ev) {
    const res = onclick ? onclick() : null;
    if (res && typeof (res.catch) === 'function') {
      sigSpin.value = true;
      res.finally(() => sigSpin.value = false);
    }
  };
  // const styles = 'bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-500';
  const styles = 'bg-teal-600 hover:bg-teal-700 disabled:bg-stone-500';
  return html`
<button type="button"
  class="relative inline-flex justify-center items-center rounded-sm px-2.5 py-0.5 font-semibold text-white shadow-sm ${styles} ${classes ?? ''}"
  ...${rest} ref=${ref} onclick=${cb} disabled=${disabled || sigSpin.value} >
  ${sigSpin.value ? html`
    <span
      aria-hidden="true"
      class="absolute inset-0 flex items-center justify-center"
    >
      <span class="h-3 w-3 rounded-full border-2 border-white/40 border-t-white animate-spin"><//>
    <//>
  ` : null}
  <span class="inline-flex items-center gap-2 ${sigSpin.value ? 'opacity-35' : ''}">
    <span class=${title ? '' : 'hidden'}>${title}<//>
    <${Icon} name=${icon} classes="${icon ? '' : 'hidden'}" />
  <//>
<//>`
};
