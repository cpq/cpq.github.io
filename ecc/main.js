//  NOTE: API calls must start with 'api/' in order to serve the app at any URI

'use strict';
import { h, render, useState, useEffect, useRef, html, Router } from  './bundle.js';
import { Icons, Login, Setting, Button, Stat, tipColors, Colored, Notification, Pagination } from './components.js';

function Chart({a, b, p}) {
  const fs = 6;  // font size
  const ss = 25;  // square size
  const ls = 30; // left space
  const bs = 30; // bottom space
  const h = ss * p + bs; // Graph height
  const w = ss * p + ls; // Graph width
  const range = (start, size, step) => Array.from({length: size}, (_, i) => i * (step || 1) + start);
  const oncurve = (x, y) => (x * x * x + a * x + b - y * y) % p == 0;
            
  return html`
  <div class="relative bg-white">
    <svg class="w-full" viewBox="0 0 ${w} ${h}">
      ${range(0, p).map(x => range(0, p).map(y => html`<circle cx=${ls+x*ss} cy=${bs+y*ss} r=${ss/5} class=${oncurve(x, y) ? 'fill-blue-400' : 'fill-slate-100'} />`))}
      ${range(0, p).map(i => html`
        <line x1=${ls} y1=${i*ss + bs} x2=${w} y2=${i*ss + bs} stroke-width=0.3 class="stroke-slate-500" stroke-dasharray="1,1" />
        <text x=0 y=${bs+i*ss+fs} class="text-[${fs}px] fill-slate-400">${i}<//>
        <line x1=${ls+i*ss} y1=${bs} x2=${ls+i*ss} y2=${h} stroke-width=0.3 class="stroke-slate-500" stroke-dasharray="1,1" />
        <text x=${ls+i*ss-fs} y=${bs - fs/2} class="text-[${fs}px] fill-slate-400">${i}<//>
      `)}
    <//>
<//>`;
};

const App = function({}) {
  const [a, setA] = useState(0);
  const [b, setB] = useState(7);
  const [p, setP] = useState(37);
  const cls = 'w-32 grid grid-cols-2 gap-2 my-1';
  return html`
<div class="min-h-screen bg-slate-100">
  <div class="p-5">
    <div>Curve: y<sup>3<//> = x<sup>2<//> + ax + b<//>
    <div class="flex gap-4">
      <${Setting} title="a" value=${a} setfn=${v => setA(v)} type="number" cls=${cls} />
      <${Setting} title="b" value=${b} setfn=${v => setB(v)} type="number" cls=${cls} />
      <${Setting} title="p" value=${p} setfn=${v => setP(v)} type="number" cls=${cls} />
    <//>
    <div>(x<sup>3<//> + ${a}x + ${b} - y<sup>3<//>) mod ${p} == 0<//>
    <${Chart} a=${a} b=${b} p=${p} />
  <//>
<//>`;
};

window.onload = () => render(h(App), document.body);
