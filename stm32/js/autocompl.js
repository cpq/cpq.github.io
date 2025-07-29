import { html, useSignal, useEffect } from "./bundle.js";
import { Input } from "./controls.js";

export function AutoComplete({ value, oninput, options, ...rest }) {
  const sigInput = useSignal(value || "");
  const sigIsOpen = useSignal(false);
  const sigSelected = useSignal(0);

  const handleInputEvent = (ev) => {
    sigInput.value = ev.target.value;
    sigIsOpen.value = !!ev.target.value;
    sigSelected.value = 0;
    oninput && oninput(ev);
  };
  const handleBlurEvent = (ev) => (sigIsOpen.value = false);

  const handleSuggestionClick = (data) => {
    sigInput.value = data;
    sigIsOpen.value = false;
    oninput && oninput({target:{value: data}});
  };

  const currentSuggestions = options.filter((s) =>
    s.toLowerCase().includes(sigInput.value.toLowerCase()),
  );
  const autoscroll = () => {
    const element = document.querySelector(".autocomplete .active");
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const handleKeypressEvent = (ev) => {
    if (!sigIsOpen.value) return;
    switch (ev.keyCode) {
      case 13: {
        sigIsOpen.value = false;
        sigInput.value = currentSuggestions[sigSelected.value];
        sigSelected.value = 0;
        oninput && oninput({target:{value: sigInput.value}});
        break;
      }
      case 40: {
        const idx = sigSelected.value + 1;
        sigSelected.value = idx >= currentSuggestions.length ? 0 : idx;
        autoscroll();
        break;
      }
      case 38: {
        const idx = sigSelected.value - 1;
        sigSelected.value = idx < 0 ? currentSuggestions.length - 1 : idx;
        autoscroll();
        break;
      }
    }
  };

  useEffect(() => {
    sigInput.value = value;
  }, [value]);

  return html`<div class="relative">
    <${Input}
      value=${sigInput.value}
      autocomplete="off"
      onInput=${handleInputEvent}
      onKeyDown=${handleKeypressEvent}
      onBlur=${handleBlurEvent}
      ...${rest}
    />
    <div class="px-1 w-full max-h-32 overflow-auto bg-white text-black absolute autocomplete ${sigIsOpen.value ? "" : "hidden"}"
        style="display: ${sigIsOpen.value ? "block" : "none"}">
      ${currentSuggestions.map((text, i) => html`<div
          class="cursor-pointer ${i === sigSelected.value ? "active bg-gray-200" : ""}"
          onmousedown=${() => handleSuggestionClick(text)}>${text}<//>`)}
    <//>
  <//>`;
}
