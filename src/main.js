import "./style.css";

document.querySelector("#app").innerHTML = `
  <main class="layout">
    <h1>Prototype is running</h1>
    <p>Edit <code>src/main.js</code> or <code>src/style.css</code> and save—Vite will hot-reload.</p>
    <button type="button" id="demo">Click me</button>
    <p id="msg" class="msg" aria-live="polite"></p>
  </main>
`;

const btn = document.querySelector("#demo");
const msg = document.querySelector("#msg");
let n = 0;
btn?.addEventListener("click", () => {
  n += 1;
  msg.textContent = `Clicked ${n} time${n === 1 ? "" : "s"}.`;
});
