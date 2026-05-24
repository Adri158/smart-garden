console.log("Global JS Loaded");

window.deviceOnline = false;

window.setOnline = function () {

  window.deviceOnline = true;

  
  const pill = document.getElementById("espStatus");
  if (pill) {
    pill.style.background   = "rgba(34,197,94,0.1)";
    pill.style.borderColor  = "rgba(34,197,94,0.3)";
    pill.style.color        = "#22c55e";

    const dot   = pill.querySelector(".esp-dot");
    const label = pill.querySelector(".esp-label");

    if (dot)   dot.style.background  = "#22c55e";
    if (label) label.textContent     = "ONLINE";
  }

  
  const inline = document.getElementById("espStatusInline");
  if (inline) {
    inline.textContent  = "ONLINE";
    inline.style.color  = "#22c55e";
  }

};

window.setOffline = function () {

  window.deviceOnline = false;

  
  const pill = document.getElementById("espStatus");
  if (pill) {
    pill.style.background   = "rgba(239,68,68,0.1)";
    pill.style.borderColor  = "rgba(239,68,68,0.3)";
    pill.style.color        = "#ef4444";

    const dot   = pill.querySelector(".esp-dot");
    const label = pill.querySelector(".esp-label");

    if (dot)   dot.style.background  = "#ef4444";
    if (label) label.textContent     = "OFFLINE";
  }

  
  const inline = document.getElementById("espStatusInline");
  if (inline) {
    inline.textContent  = "OFFLINE";
    inline.style.color  = "#ef4444";
  }

};

window.toggleMenu = function () {

  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("overlay");

  if (!sidebar || !overlay) return;

  sidebar.classList.toggle("active");
  overlay.classList.toggle("active");

};

document.addEventListener("DOMContentLoaded", function () {

  const pill = document.getElementById("espStatus");
  if (!pill) return;

  pill.style.background   = "rgba(148,163,184,0.08)";
  pill.style.borderColor  = "rgba(148,163,184,0.2)";
  pill.style.color        = "#94a3b8";

  const dot   = pill.querySelector(".esp-dot");
  const label = pill.querySelector(".esp-label");

  if (dot)   dot.style.background  = "#94a3b8";
  if (label) label.textContent     = "CHECKING";

});

window.toggleCdd = function (id) {
  const el = document.getElementById(id);
  if (!el) return;
  const isOpen = el.classList.contains('open');
  document.querySelectorAll('.cdd.open').forEach(d => d.classList.remove('open'));
  if (!isOpen) el.classList.add('open');
};

window.selectCdd = function (id, item) {
  const el = document.getElementById(id);
  if (!el) return;
  const value = item.dataset.value;
  const name  = item.dataset.name;

  el.querySelector('input[type=hidden]').value = value;
  el.querySelector('.cdd-label').textContent   = name;
  const idSpan = el.querySelector('.cdd-id');
  if (idSpan) idSpan.textContent = value;

  el.querySelectorAll('.cdd-item').forEach(i => i.classList.remove('active'));
  item.classList.add('active');
  el.classList.remove('open');

  if (typeof window._onDeviceSelect === 'function') window._onDeviceSelect(value);
};

document.addEventListener('click', (e) => {
  if (!e.target.closest('.cdd')) {
    document.querySelectorAll('.cdd.open').forEach(d => d.classList.remove('open'));
  }
});
