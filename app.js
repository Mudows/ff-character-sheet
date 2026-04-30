/* ============================================================
   SHAMUTANTI — FICHA DE AVENTURA  |  app.js
   ============================================================ */

const STORAGE_KEY = 'shamutanti_v5';

const DEFAULT_STATE = () => ({
  type: 'guerreiro',
  classLocked: false,
  habI: '', habA: '',
  eneI: '', eneA: '',
  sorI: '', sorA: '',
  ouro: 20,
  provisoes: 2,
  equip: '',
  bonus: '',
  notas: '',
  mapa: '',
  history: []
});

let S = DEFAULT_STATE();
let C = {};
let pendingAutoClass  = null;
let pendingManualClass = null;

const d6    = () => Math.floor(Math.random() * 6) + 1;
const roll2 = () => d6() + d6();

/* ── Tabs ── */
function showTab(t) {
  $('.tab-content').addClass('hidden');
  $(`#tab-${t}`).removeClass('hidden');
  $('.nb').removeClass('tab-active');
  $(`.nb[data-tab="${t}"]`).addClass('tab-active');
}

/* ── Overlay helpers ── */
function openOverlay(id)  { $(`#${id}`).show(); }
function closeOverlay(id) { $(`#${id}`).hide(); }

/* ── "Novo personagem" button ── */
function newCharacter() {
  openOverlay('modal-newchar');
}

function confirmNewCharacter() {
  closeOverlay('modal-newchar');
  S = DEFAULT_STATE();
  try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
  applyStateToUI();
  showTab('personagem');
  gotoIdle();
  openOverlay('modal-start');
}

/* ── Start modal: manual vs auto ── */
function chooseManual() {
  closeOverlay('modal-start');
  // Sheet is now open, user fills manually; class selector button visible
}

function chooseAuto() {
  closeOverlay('modal-start');
  pendingAutoClass = null;
  $('#ac-btn-g, #ac-btn-m').removeClass('selected');
  $('#ac-btn-confirm').prop('disabled', true).text('Confirmar');
  openOverlay('modal-autoclass');
}

/* ── Auto class modal ── */
function selectAutoClass(t) {
  pendingAutoClass = t;
  $('#ac-btn-g').toggleClass('selected', t === 'guerreiro');
  $('#ac-btn-m').toggleClass('selected', t === 'mago');
  const label = t === 'guerreiro' ? 'Guerreiro' : 'Mago';
  $('#ac-btn-confirm').prop('disabled', false).text(`Confirmar como ${label}`);
}

function confirmAutoClass() {
  if (!pendingAutoClass) return;
  S.type = pendingAutoClass;
  const isMago = S.type === 'mago';
  const h = d6() + (isMago ? 4 : 6);
  const e = d6() + d6() + 12;
  const s = d6() + 6;
  S.habI = S.habA = h;
  S.eneI = S.eneA = e;
  S.sorI = S.sorA = s;
  S.classLocked = true;
  closeOverlay('modal-autoclass');
  applyStateToUI();
  saveData();
}

function cancelAutoClass() {
  closeOverlay('modal-autoclass');
  openOverlay('modal-start');
}

/* ── Manual class modal ── */
function openClassModal() {
  pendingManualClass = null;
  $('#co-btn-g, #co-btn-m').removeClass('selected');
  $('#co-btn-confirm').prop('disabled', true);
  openOverlay('modal-classonly');
}

function selectManualClass(t) {
  pendingManualClass = t;
  $('#co-btn-g').toggleClass('selected', t === 'guerreiro');
  $('#co-btn-m').toggleClass('selected', t === 'mago');
  $('#co-btn-confirm').prop('disabled', false);
}

function confirmManualClass() {
  if (!pendingManualClass) return;
  S.type = pendingManualClass;
  S.classLocked = true;
  closeOverlay('modal-classonly');
  applyStateToUI();
  saveData();
}

/* ── Attrs card header ── */
function updateAttrsHeader() {
  const label = S.type === 'guerreiro' ? 'Guerreiro' : 'Mago';
  if (S.classLocked) {
    $('#attrs-header-label').text(`Atributos — ${label}`);
    $('#btn-choose-class').addClass('hidden');
  } else {
    $('#attrs-header-label').text('Atributos');
    $('#btn-choose-class').removeClass('hidden');
  }
}

/* ── Field helpers ── */
const sf = (id, v) => $(`#${id}`).val(v);
const gf = (id)    => $(`#${id}`).val();

function readFields() {
  S.habI = gf('hab-i'); S.habA = gf('hab-a');
  S.eneI = gf('ene-i'); S.eneA = gf('ene-a');
  S.sorI = gf('sor-i'); S.sorA = gf('sor-a');
  S.ouro      = gf('ouro');
  S.provisoes = gf('provisoes');
  S.equip     = gf('equip');
  S.bonus     = gf('bonus');
  S.notas     = gf('notas');
  S.mapa      = gf('mapa');
}

/* ── Persistence ── */
function saveData() {
  readFields();
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(S)); } catch (e) {}
}

function applyStateToUI() {
  sf('hab-i', S.habI || ''); sf('hab-a', S.habA || '');
  sf('ene-i', S.eneI || ''); sf('ene-a', S.eneA || '');
  sf('sor-i', S.sorI || ''); sf('sor-a', S.sorA || '');
  sf('ouro',      S.ouro      ?? 20);
  sf('provisoes', S.provisoes ?? 2);
  $('#equip').val(S.equip || '');
  $('#bonus').val(S.bonus || '');
  $('#notas').val(S.notas || '');
  $('#mapa').val(S.mapa   || '');
  updateAttrsHeader();
  renderMboxGrid();
}

function exportJSON() {
  readFields();
  const blob = new Blob([JSON.stringify(S, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'shamutanti_personagem.json';
  a.click();
}

function importJSON(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    try {
      const parsed = JSON.parse(ev.target.result);
      if (!parsed.type) return alert('JSON inválido.');
      // Migrate old saves: 'locked' → 'classLocked'
      if (parsed.locked !== undefined && parsed.classLocked === undefined) {
        parsed.classLocked = parsed.locked;
        delete parsed.locked;
      }
      S = parsed;
      applyStateToUI();
      saveData();
    } catch {
      alert('Erro ao importar o arquivo.');
    }
  };
  reader.readAsText(file);
}

/* ── Combat navigation ── */
function gotoIdle() {
  $('#view-idle').show();
  $('#view-setup, #view-active').hide();
}

function gotoSetup() {
  $('#c-name, #c-hab, #c-ene').val('');
  $('#view-setup').show();
  $('#view-idle, #view-active').hide();
}

/* ── Combat start ── */
function startCombat(auto) {
  const name    = gf('c-name').trim() || 'Monstro';
  const hab     = parseInt(gf('c-hab')) || 7;
  const ene     = parseInt(gf('c-ene')) || 6;
  const heroEne = parseInt(gf('ene-a')) || 20;

  C = { name, hab, eneI: ene, eneCur: ene, heroEneCur: heroEne,
        round: 0, log: [], auto, finished: false, pendingLuck: null };

  $('#ct-title').text(`Herói vs ${name}`);
  $('#ct-mname').text(name);
  $('#auto-ctrl').toggle(auto);
  $('#manual-ctrl').toggle(!auto);
  $('#end-ctrl, #luck-zone').hide();
  $('#ct-log').empty();

  $('#view-active').show();
  $('#view-idle, #view-setup').hide();

  updateDisplay();
  addLog('sys', `Combate iniciado! Herói (ENE:${heroEne}) vs ${name} (HAB:${hab} ENE:${ene})`);
}

/* ── Combat display ── */
function updateDisplay() {
  $('#ct-hval').text(C.heroEneCur);
  $('#ct-mval').text(C.eneCur);
  $('#ct-hero').toggleClass('dead', C.heroEneCur <= 0);
  $('#ct-mon').toggleClass('dead', C.eneCur <= 0);
}

function addLog(type, msg) {
  C.log.push({ type, msg });
  const entry = $('<div>').addClass(`le ${type}`).text(msg);
  $('#ct-log').append(entry);
  $('#ct-log').scrollTop($('#ct-log')[0].scrollHeight);
}

/* ── Auto combat round ── */
function doRound() {
  if (C.finished || C.pendingLuck) return;
  C.round++;
  const heroHab = parseInt(gf('hab-a')) || 10;
  const ha = roll2() + heroHab;
  const ma = roll2() + C.hab;
  addLog('sys', `Rodada ${C.round} — Herói ${ha} vs ${C.name} ${ma}`);

  if (ha > ma) {
    C.pendingLuck = { winner: 'hero' };
    addLog('hero', 'Herói vence a rodada! Dano base: 2. Testar Sorte para causar 4?');
    $('#luck-desc').text(`Herói venceu: Testar Sorte para causar 4 de dano (em vez de 2). Sorte atual: ${gf('sor-a') || '?'}`);
    $('#luck-zone').show();
  } else if (ma > ha) {
    C.pendingLuck = { winner: 'monster' };
    addLog('mon', `${C.name} vence a rodada! Dano base: 2. Testar Sorte para reduzir para 1?`);
    $('#luck-desc').text(`${C.name} venceu: Testar Sorte para receber apenas 1 de dano (em vez de 2). Sorte atual: ${gf('sor-a') || '?'}`);
    $('#luck-zone').show();
  } else {
    addLog('sys', 'Empate! Nenhum dano nesta rodada.');
  }
  updateDisplay();
}

/* ── Luck test ── */
function applyLuck(test) {
  if (!C.pendingLuck || C.finished) return;
  const pl = C.pendingLuck;
  C.pendingLuck = null;
  $('#luck-zone').hide();

  if (test) {
    const sorA  = parseInt(gf('sor-a')) || 8;
    const r     = roll2();
    const lucky = r <= sorA;
    const newSor = Math.max(1, sorA - 1);
    sf('sor-a', newSor);
    S.sorA = newSor;
    saveData();

    if (pl.winner === 'hero') {
      const dmg = lucky ? 4 : 2;
      C.eneCur = Math.max(0, C.eneCur - dmg);
      addLog(lucky ? 'hero' : 'mon',
        `Sorte (${r}/${sorA}): ${lucky ? `SORTUDO! 4 de dano ao ${C.name}.` : 'AZARADO! Apenas 2 de dano.'} ${C.name} ENE: ${C.eneCur}`);
    } else {
      const dmg = lucky ? 1 : 2;
      C.heroEneCur = Math.max(0, C.heroEneCur - dmg);
      sf('ene-a', C.heroEneCur); S.eneA = C.heroEneCur; saveData();
      addLog(lucky ? 'hero' : 'mon',
        `Sorte (${r}/${sorA}): ${lucky ? 'SORTUDO! Apenas 1 de dano recebido.' : 'AZARADO! 2 de dano recebido.'} Herói ENE: ${C.heroEneCur}`);
    }
  } else {
    if (pl.winner === 'hero') {
      C.eneCur = Math.max(0, C.eneCur - 2);
      addLog('hero', `Dano aplicado: 2. ${C.name} ENE: ${C.eneCur}`);
    } else {
      C.heroEneCur = Math.max(0, C.heroEneCur - 2);
      sf('ene-a', C.heroEneCur); S.eneA = C.heroEneCur; saveData();
      addLog('mon', `Dano recebido: 2. Herói ENE: ${C.heroEneCur}`);
    }
  }
  updateDisplay();
  checkEnd();
}

/* ── Manual round ── */
function doManualRound() {
  if (C.finished) return;
  C.round++;
  const hd = parseInt(gf('m-hdmg')) || 0;
  const md = parseInt(gf('m-mdmg')) || 0;
  C.heroEneCur = Math.max(0, C.heroEneCur - hd);
  C.eneCur     = Math.max(0, C.eneCur     - md);
  sf('ene-a', C.heroEneCur); S.eneA = C.heroEneCur; saveData();
  addLog('sys', `Rodada ${C.round}: Herói -${hd} | ${C.name} -${md} ENE`);
  $('#m-hdmg, #m-mdmg').val(0);
  updateDisplay();
  checkEnd();
}

/* ── Combat end ── */
function checkEnd() {
  if (C.eneCur <= 0)          endCombat('vitoria');
  else if (C.heroEneCur <= 0) endCombat('derrota');
}

function endCombat(result) {
  if (C.finished) return;
  C.finished = true; C.result = result;
  const msgs  = { vitoria: `Vitória! ${C.name} derrotado!`, derrota: 'Derrota. O herói caiu.', fuga: 'Combate encerrado.' };
  const types = { vitoria: 'hero', derrota: 'mon', fuga: 'sys' };
  addLog(types[result] || 'sys', msgs[result]);
  $('#auto-ctrl, #manual-ctrl, #luck-zone').hide();
  $('#end-ctrl').show();
}

function finalizeCombat() {
  const entry = {
    id: Date.now(), name: C.name, hab: C.hab, eneI: C.eneI,
    rounds: C.round, result: C.result, log: C.log.slice(),
    date: new Date().toLocaleString('pt-BR')
  };
  if (!S.history) S.history = [];
  S.history.unshift(entry);
  saveData();
  renderMboxGrid();
  gotoIdle();
}

/* ── Monster boxes ── */
function renderMboxGrid() {
  const $grid = $('#mbox-grid').empty();
  if (!S.history || !S.history.length) {
    $grid.append($('<div>').addClass('mbox-empty').text('Nenhum combate registrado ainda.'));
    return;
  }
  const labels  = { vitoria: 'Vitória', derrota: 'Derrota', fuga: 'Encerrado' };
  const classes = { vitoria: 'win',     derrota: 'loss',    fuga: 'fuga'      };

  S.history.forEach((h, i) => {
    const $log = $('<div>').addClass('mbox-log').attr('id', `mbl-${i}`)
      .append(h.log.map(l => $('<div>').addClass(`le ${l.type}`).text(l.msg)));
    const $status = $('<span>').addClass(`mbox-status ${classes[h.result] || ''}`).text(labels[h.result] || h.result);
    const $header = $('<div>').addClass('mbox-hdr')
      .append($('<div>').addClass('mbox-name').text(h.name))
      .append($('<div>').addClass('mbox-meta').text(`HAB ${h.hab} | ENE inicial ${h.eneI} | ${h.rounds} rodadas | ${h.date}`))
      .append($status)
      .on('click', () => $log.toggleClass('open'));
    $('<div>').addClass('mbox').append($header, $log).appendTo($grid);
  });
}

/* ── Init ── */
$(function () {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      S = JSON.parse(saved);
      if (S.locked !== undefined && S.classLocked === undefined) {
        S.classLocked = S.locked;
        delete S.locked;
      }
      applyStateToUI();
    } else {
      renderMboxGrid();
      openOverlay('modal-start');
    }
  } catch (e) {
    renderMboxGrid();
    openOverlay('modal-start');
  }
  showTab('personagem');
});
