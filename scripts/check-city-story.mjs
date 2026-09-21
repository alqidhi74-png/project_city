// Browser regression checks using Node 22's WebSocket and a local Chromium.
// Start Vite first; run: node scripts/check-city-story.mjs
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import os from "node:os";
import { setTimeout as delay } from "node:timers/promises";

const base = process.env.TEST_URL || "http://127.0.0.1:5173";
const chrome = process.env.CHROME_PATH || [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "/usr/bin/chromium", "/usr/bin/google-chrome",
].find(existsSync);
assert(chrome, "Set CHROME_PATH to a Chromium executable");
const output = path.resolve("artifacts.local/city-story");
mkdirSync(output, { recursive: true });
const browser = spawn(chrome, ["--headless=new", "--no-first-run", "--no-default-browser-check",
  "--disable-extensions", "--disable-background-networking", "--disable-component-update",
  "--remote-debugging-port=9333", `--user-data-dir=${path.join(os.tmpdir(), `city-story-check-${Date.now()}`)}`,
  "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "about:blank"], { windowsHide: true, stdio: "ignore" });
let socket;
const errors = [];
try {
  let target;
  for (let i = 0; i < 80; i++) {
    try { target = (await (await fetch("http://127.0.0.1:9333/json/list")).json()).find(t => t.type === "page"); } catch { /* Starting Chromium. */ }
    if (target) break;
    await delay(250);
  }
  assert(target, "Chromium debugging endpoint did not start");
  socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
  let id = 0;
  const pending = new Map();
  socket.onmessage = ({ data }) => {
    const message = JSON.parse(data);
    if (message.id) {
      const request = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) request.reject(new Error(JSON.stringify(message.error)));
      else request.resolve(message.result);
    }
    if (message.method === "Runtime.exceptionThrown") errors.push(message.params.exceptionDetails.exception?.description || message.params.exceptionDetails.text);
    if (message.method === "Runtime.consoleAPICalled" && message.params.type === "error") {
      errors.push(message.params.args.map(a => a.value || a.description).join(" "));
    }
  };
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const requestId = ++id;
    pending.set(requestId, { resolve, reject });
    socket.send(JSON.stringify({ id: requestId, method, params }));
  });
  const evaluate = async (expression) => {
    const response = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
    if (response.exceptionDetails) throw new Error(response.exceptionDetails.exception?.description || response.exceptionDetails.text);
    return response.result.value;
  };
  const waitFor = async (expression, timeout = 20000) => {
    const until = Date.now() + timeout;
    while (Date.now() < until) {
      if (await evaluate(expression)) return;
      await delay(200);
    }
    throw new Error(`Timed out: ${expression}`);
  };
  const viewport = async (width, height) => {
    await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: false });
    await delay(600);
  };
  const shot = async (name) => {
    const { data } = await send("Page.captureScreenshot", { format: "png" });
    writeFileSync(path.join(output, `${name}.png`), Buffer.from(data, "base64"));
  };
  const scroll = async (chapter) => {
    await evaluate(`(() => {
      const root = document.querySelector('.city-story');
      const top = root.getBoundingClientRect().top + scrollY;
      window.scrollTo(0, top + (root.offsetHeight - innerHeight) * ${chapter / 5});
    })()`);
    await delay(1100);
  };
  const snapshot = () => evaluate(`(() => {
    const root = document.querySelector('.city-story');
    const trigger = window.__storyTriggers?.getById('city-3d-story');
    return { chapter: root.dataset.chapter, canvas: root.querySelectorAll('canvas').length,
      y: scrollY, rootTop: root.getBoundingClientRect().top, rootHeight: root.offsetHeight,
      timeline: trigger && { time: trigger.animation.time(), progress: trigger.progress, start: trigger.start, end: trigger.end },
      sticky: Math.round(root.querySelector('.city-story__stage').getBoundingClientRect().top),
      overflow: document.documentElement.scrollWidth > innerWidth,
      visible: [...root.querySelectorAll('.city-story__chapter')].filter(el => getComputedStyle(el).visibility !== 'hidden' && Number(getComputedStyle(el).opacity) > 0.01).length,
      accessible: [...root.querySelectorAll('.city-story__chapter')].filter(el => !el.inert).length };
  })()`);

  await send("Page.enable");
  await send("Runtime.enable");
  await send("Emulation.setHardwareConcurrencyOverride", { hardwareConcurrency: 8 });
  await send("Page.addScriptToEvaluateOnNewDocument", { source: `
    window.__cityDraws = 0;
    for (const method of ['drawElements', 'drawArrays', 'drawElementsInstanced', 'drawArraysInstanced']) {
      const original = WebGL2RenderingContext.prototype[method];
      WebGL2RenderingContext.prototype[method] = function (...args) { window.__cityDraws++; return original.apply(this, args); };
    }
  ` });
  await viewport(1440, 900);
  await send("Page.navigate", { url: base });
  await waitFor("document.querySelector('.city-story') && getComputedStyle(document.querySelector('.intro-screen')).visibility === 'hidden'", 45000);
  await scroll(0.35);
  await waitFor("document.querySelector('.city-story canvas') && window.__cityDraws > 0", 45000);
  await evaluate(`(async () => {
    const url = performance.getEntriesByType('resource').map(e => e.name).find(name => name.includes('/gsap_ScrollTrigger.js'));
    if (url) window.__storyTriggers = (await import(url)).ScrollTrigger;
  })()`);
  const names = ["vision", "neighbourhoods", "nature", "services", "future"];
  for (const i of [0, 1, 2, 3, 4, 3, 2, 1, 0]) {
    await scroll(i + 0.4);
    const state = await snapshot();
    assert.equal(state.chapter, names[i]);
    assert.equal(state.visible, 1);
    assert.equal(state.accessible, 1);
    assert.equal(state.sticky, 0);
    assert.equal(state.overflow, false);
    assert.equal(state.canvas, 1);
    if (i === 0 || i === 2 || i === 4) await shot(`desktop-${names[i]}`);
  }
  console.log("PASS desktop: all five chapters forward/backward, sticky, one canvas, no horizontal overflow");
  for (const progress of [4.7, 0.1, 3.4, 1.4, 4.5]) {
    await evaluate(`(() => { const r = document.querySelector('.city-story'); scrollTo(0, r.getBoundingClientRect().top + scrollY + (r.offsetHeight - innerHeight) * ${progress / 5}); })()`);
    await delay(65);
  }
  await delay(1200);
  assert.equal((await snapshot()).chapter, "future");
  console.log("PASS rapid scrolling settles on the correct chapter");
  await evaluate("document.querySelector('.floating-services').scrollIntoView()");
  await delay(1500);
  const draws = await evaluate("window.__cityDraws");
  await delay(900);
  assert.equal(await evaluate("window.__cityDraws"), draws, "WebGL must stop drawing offscreen");
  await scroll(2.4);
  assert((await evaluate("window.__cityDraws")) > draws);
  console.log("PASS rendering stops outside the scene and resumes on return");
  for (const [width, height] of [[834, 1112], [390, 844], [320, 700], [844, 390]]) {
    await viewport(width, height);
    await scroll(2.4);
    const state = await snapshot();
    console.log('Viewport', width, JSON.stringify(state));
    assert.equal(state.overflow, false, `horizontal overflow at ${width}px`);
    assert.equal(state.sticky, 0);
    assert.equal(state.chapter, "nature");
    assert.equal(state.visible, 1);
    await shot(`viewport-${width}`);
  }
  console.log("PASS tablet, mobile 390px/320px, landscape and live resizing");
  await viewport(1440, 900);
  await scroll(4.5);
  await evaluate("document.querySelector('.city-story__cta').focus()");
  assert.equal(await evaluate("document.activeElement.className"), "city-story__cta");
  await send("Input.dispatchKeyEvent", { type: "keyDown", key: "Enter", code: "Enter", windowsVirtualKeyCode: 13, text: "\r" });
  await send("Input.dispatchKeyEvent", { type: "keyUp", key: "Enter", code: "Enter", windowsVirtualKeyCode: 13 });
  await waitFor("location.pathname === '/interactive-map' && !document.querySelector('.city-story')");
  const remaining = await evaluate(`(async () => {
    const url = performance.getEntriesByType('resource').map(e => e.name).find(name => name.includes('/gsap_ScrollTrigger.js'));
    if (!url) return null;
    const { ScrollTrigger } = await import(url);
    return ScrollTrigger.getAll().length;
  })()`);
  if (remaining !== null) assert.equal(remaining, 0, "Home triggers must be cleaned up on navigation");
  console.log("PASS keyboard map link and ScrollTrigger cleanup on navigation");
  await evaluate("history.back()");
  await waitFor("document.querySelector('.city-story')");
  await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  await waitFor("document.querySelector('.city-story').dataset.reduced === 'true'");
  const reduced = await snapshot();
  assert.equal(reduced.canvas, 0);
  assert.equal(reduced.visible, 5);
  assert.equal(reduced.accessible, 5);
  await shot("reduced-motion");
  console.log("PASS reduced motion: static image, all five chapters readable, no canvas");
  await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "no-preference" }] });
  await send("Page.addScriptToEvaluateOnNewDocument", { source: `
    const getContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function(type, ...args) {
      return /webgl/.test(type) ? null : getContext.call(this, type, ...args);
    };
  ` });
  await send("Page.reload");
  await waitFor("document.querySelector('.city-story') && getComputedStyle(document.querySelector('.intro-screen')).visibility === 'hidden'", 45000);
  await scroll(3.4);
  assert.equal((await snapshot()).canvas, 0);
  assert.equal((await snapshot()).chapter, "services");
  assert(await evaluate("document.querySelector('.city-story__fallback').naturalWidth > 0"));
  await shot("no-webgl");
  console.log("PASS unavailable WebGL: image fallback and working chapter transitions");
  assert.deepEqual(errors, [], "Browser runtime/console errors");
  console.log(`PASS no console errors. Screenshots: ${output}`);
} finally {
  socket?.close();
  browser.kill();
}
