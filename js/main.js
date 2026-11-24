// --- UI制御・イベントリスナー・Web Worker連携 ---

let searchWorker = null;
const MAX_FOOD_SLOTS = 5;

function v(id) {
  const el = document.getElementById(id);
  return el ? (Number(el.value) || 0) : 0;
}

function s(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : "";
}

// プロパティ行の追加
function addPropRow(containerId, defaultKey = "", defaultVal = "0") {
  const container = document.getElementById(containerId);
  if (!container) return;
  const div = document.createElement("div");
  div.className = "prop-row";
  const keys = (defaultKey && !PROP_KEYS.includes(defaultKey))
    ? [defaultKey, ...PROP_KEYS]
    : PROP_KEYS;
  const opts = keys.map(
    k => `<option value="${k}"${k === defaultKey ? " selected" : ""}>${k}</option>`
  ).join("");
  div.innerHTML = `<select class="prop-key">${opts}</select><input type="text" class="prop-val" value="${defaultVal}"><button type="button" class="btn-del-prop">×</button>`;
  const delBtn = div.querySelector(".btn-del-prop");
  delBtn.addEventListener("click", () => {
    div.remove();
    syncManualEquipStatus();
    if (containerId === "prop-sub") syncPropSubToSubElem();
  });
  const keySelect = div.querySelector(".prop-key");
  keySelect.addEventListener("change", () => {
    syncManualEquipStatus();
    if (containerId === "prop-sub") syncPropSubToSubElem();
  });
  const valInput = div.querySelector(".prop-val");
  valInput.addEventListener("input", () => {
    syncManualEquipStatus();
    if (containerId === "prop-sub") syncPropSubToSubElem();
  });
  container.appendChild(div);
  syncManualEquipStatus();
  if (containerId === "prop-sub") syncPropSubToSubElem();
}

// 枠内のプロパティを抽出し、文字列・数値を仕分ける関数
function getPropSum(containerId) {
  const sum = {};
  const container = document.getElementById(containerId);
  if (!container) return sum;
  const rows = container.querySelectorAll(".prop-row");
  rows.forEach(r => {
    const k = r.querySelector(".prop-key").value;
    const val = r.querySelector(".prop-val").value.trim();
    const numVal = Number(val);
    if (!isNaN(numVal) && val !== "") {
      sum[k] = (sum[k] || 0) + numVal;
    } else if (val !== "") {
      sum[k] = val; // "火" などの文字列を保持
    }
  });
  return sum;
}

// 効果表示テキスト生成 (例: "STR+〇", 30 -> "STR+30" / "ヘイト+〇%", -100 -> "ヘイト-100%")
function formatEffectLabel(key, val) {
  if (!key) return "";
  if (key.includes("+〇")) {
    const sign = val >= 0 ? `+${val}` : `${val}`;
    return key.replace("+〇", sign);
  }
  return `${key}: ${val}`;
}

// --- 料理プリセットUI (最大5枠・同一タイトル重複禁止) ---
function renderFoodPresets() {
  const container = document.getElementById("food-presets");
  if (!container) return;

  // 既存の選択状態を保持
  const prevSelections = [];
  container.querySelectorAll(".food-slot-row").forEach(row => {
    const sel = row.querySelector(".food-select");
    const lv = row.querySelector(".food-lv");
    prevSelections.push({
      name: sel ? sel.value : "",
      lv: lv ? Number(lv.value) || 10 : 10
    });
  });

  container.innerHTML = "";
  const lvOpts = [];
  for (let l = 10; l >= 1; l--) {
    lvOpts.push(`<option value="${l}">Lv${l}</option>`);
  }

  for (let i = 0; i < MAX_FOOD_SLOTS; i++) {
    const row = document.createElement("div");
    row.className = "food-slot-row";
    row.innerHTML = `
      <span class="food-slot-num">枠${i + 1}</span>
      <select class="food-select" data-slot="${i}" aria-label="料理 枠${i + 1}">
        <option value="">-- 料理なし --</option>
      </select>
      <select class="food-lv" data-slot="${i}" aria-label="料理 枠${i + 1} レベル">
        ${lvOpts.join("")}
      </select>
    `;
    const selEl = row.querySelector(".food-select");
    const lvEl = row.querySelector(".food-lv");
    if (prevSelections[i]) {
      lvEl.value = String(prevSelections[i].lv);
    }
    selEl.addEventListener("change", syncFoodSelectOptions);
    lvEl.addEventListener("change", syncFoodSelectOptions);
    container.appendChild(row);
  }

  // オプションの構築と初期選択復元
  const selects = container.querySelectorAll(".food-select");
  selects.forEach((sel, idx) => {
    const prevName = prevSelections[idx]?.name || "";
    DB.food.forEach(f => {
      const opt = document.createElement("option");
      opt.value = f.name;
      opt.textContent = `${f.name} (${formatEffectLabel(f.key, f.levels[9])})`;
      if (f.name === prevName) opt.selected = true;
      sel.appendChild(opt);
    });
  });

  syncFoodSelectOptions();
}

// 同一タイトルの料理を他枠で選択不可にし、選択中Lvに応じた効果量をラベルに反映する
function syncFoodSelectOptions() {
  const container = document.getElementById("food-presets");
  if (!container) return;
  const rows = container.querySelectorAll(".food-slot-row");

  // 枠順に重複チェック（万一同じタイトルが入っていたら後続枠を解除）
  const usedTitles = new Set();
  rows.forEach(row => {
    const sel = row.querySelector(".food-select");
    if (!sel) return;
    if (sel.value && usedTitles.has(sel.value)) {
      sel.value = "";
    }
    if (sel.value) {
      usedTitles.add(sel.value);
    }
  });

  // 各枠のプルダウン項目を更新（他枠で選択済みの料理を disabled 化＆Lv別の効果表示を更新）
  rows.forEach(row => {
    const sel = row.querySelector(".food-select");
    const lvEl = row.querySelector(".food-lv");
    if (!sel || !lvEl) return;

    const currentVal = sel.value;
    const lv = Math.max(1, Math.min(10, Number(lvEl.value) || 10));
    lvEl.disabled = !currentVal;

    Array.from(sel.options).forEach(opt => {
      if (!opt.value) return;
      const foodObj = DB.food.find(f => f.name === opt.value);
      if (!foodObj) return;
      const valAtLv = foodObj.levels[lv - 1] ?? foodObj.levels[9];
      const effectText = formatEffectLabel(foodObj.key, valAtLv);
      const isUsedElsewhere = opt.value !== currentVal && usedTitles.has(opt.value);
      opt.disabled = isUsedElsewhere;
      opt.textContent = isUsedElsewhere
        ? `${foodObj.name} (${effectText}) [選択済]`
        : `${foodObj.name} (${effectText})`;
    });
  });
}

// 選択された5枠の料理からプロパティ合計を取得（重複排除・最大5つ厳守）
function getFoodPresetSum() {
  const sum = {};
  const container = document.getElementById("food-presets");
  if (!container) return sum;
  const seen = new Set();
  const rows = container.querySelectorAll(".food-slot-row");

  rows.forEach(row => {
    if (seen.size >= MAX_FOOD_SLOTS) return;
    const sel = row.querySelector(".food-select");
    const lvEl = row.querySelector(".food-lv");
    const name = sel ? sel.value : "";
    if (!name || seen.has(name)) return;

    const foodObj = DB.food.find(f => f.name === name);
    if (!foodObj) return;
    seen.add(name);

    const lv = Math.max(1, Math.min(10, Number(lvEl?.value) || 10));
    const bonus = foodObj.levels[lv - 1] || 0;
    sum[foodObj.key] = (sum[foodObj.key] || 0) + bonus;
  });

  return sum;
}

// --- ギルド飯プリセットUI ---
function renderGuildFoodPresets() {
  const container = document.getElementById("guild-food-presets");
  if (!container) return;
  container.innerHTML = "";

  DB.guildFood.forEach((gf, idx) => {
    const row = document.createElement("div");
    row.className = "guild-food-row";
    const opts = [`<option value="0">なし (OFF)</option>`];
    for (let l = 10; l >= 1; l--) {
      const val = gf.levels[l - 1];
      opts.push(`<option value="${l}">Lv${l} (${formatEffectLabel(gf.key, val)})</option>`);
    }
    row.innerHTML = `
      <span class="guild-food-label">${gf.name}</span>
      <select class="guild-food-lv" data-name="${gf.name}" aria-label="${gf.name} レベル">
        ${opts.join("")}
      </select>
    `;
    container.appendChild(row);
  });
}

function getGuildFoodPresetSum() {
  const sum = {};
  const container = document.getElementById("guild-food-presets");
  if (!container) return sum;

  container.querySelectorAll(".guild-food-lv").forEach(sel => {
    const lv = Number(sel.value) || 0;
    if (lv < 1 || lv > 10) return;
    const name = sel.getAttribute("data-name");
    const gf = DB.guildFood.find(x => x.name === name);
    if (!gf) return;
    const bonus = gf.levels[lv - 1] || 0;
    sum[gf.key] = (sum[gf.key] || 0) + bonus;
  });

  return sum;
}

// --- レジスタレットプリセットUI ---
function renderRegistletPresets() {
  const container = document.getElementById("registlet-presets");
  if (!container) return;

  const prevChecked = new Set();
  container.querySelectorAll("input[type='checkbox']:checked").forEach(cb => {
    prevChecked.add(cb.value);
  });

  container.innerHTML = "";
  DB.registlet.forEach(reg => {
    const label = document.createElement("label");
    const isChecked = prevChecked.has(reg.name);
    label.className = `reg-check-item${isChecked ? " checked" : ""}`;
    label.innerHTML = `
      <input type="checkbox" class="reg-checkbox" value="${reg.name}"${isChecked ? " checked" : ""}>
      <span>${reg.name}</span>
      <span class="reg-check-meta">${formatEffectLabel(reg.key, reg.value)}</span>
    `;
    const cb = label.querySelector("input");
    cb.addEventListener("change", () => {
      label.classList.toggle("checked", cb.checked);
    });
    container.appendChild(label);
  });
}

function getRegistletPresetSum() {
  const sum = {};
  const container = document.getElementById("registlet-presets");
  if (!container) return sum;

  container.querySelectorAll(".reg-checkbox:checked").forEach(cb => {
    const reg = DB.registlet.find(x => x.name === cb.value);
    if (!reg) return;
    sum[reg.key] = (sum[reg.key] || 0) + reg.value;
  });

  return sum;
}

// --- おしゃれ装備プリセットUI (3部位 × 各3スロット・同部位内key重複禁止・ヘイト±別枠対応) ---
const AVATAR_PARTS = [
  { id: "acc",    label: "追加装飾品" },
  { id: "top",    label: "上衣" },
  { id: "bottom", label: "下衣" }
];
const AVATAR_SLOTS_PER_PART = 3;

function formatAvatarGroupLabel(conflictKey) {
  if (conflictKey === "ヘイト+〇%_plus") return "ヘイト+〇% (プラス)";
  if (conflictKey === "ヘイト+〇%_minus") return "ヘイト+〇% (マイナス)";
  return conflictKey;
}

function renderAvatarPresets() {
  const container = document.getElementById("avatar-presets");
  if (!container) return;

  // 既存の選択状態を保持
  const prevSelections = {};
  AVATAR_PARTS.forEach(part => {
    prevSelections[part.id] = [];
    for (let s = 0; s < AVATAR_SLOTS_PER_PART; s++) {
      const sel = container.querySelector(`select[data-avatar-part="${part.id}"][data-avatar-slot="${s}"]`);
      prevSelections[part.id].push(sel ? sel.value : "");
    }
  });

  // conflictKey ごとに項目をグループ化
  const groups = new Map();
  DB.avatar.forEach(item => {
    if (!groups.has(item.conflictKey)) {
      groups.set(item.conflictKey, []);
    }
    groups.get(item.conflictKey).push(item);
  });

  container.innerHTML = "";

  AVATAR_PARTS.forEach(part => {
    const card = document.createElement("div");
    card.className = "avatar-part-card";
    card.setAttribute("data-part-card", part.id);

    const header = document.createElement("div");
    header.className = "avatar-part-title";
    header.innerHTML = `<span>${part.label}</span><span style="font-size:0.72rem; color:var(--muted); font-weight:600;">3スロット</span>`;
    card.appendChild(header);

    for (let s = 0; s < AVATAR_SLOTS_PER_PART; s++) {
      const row = document.createElement("div");
      row.className = "avatar-slot-row";

      const labelSpan = document.createElement("span");
      labelSpan.className = "avatar-slot-num";
      labelSpan.textContent = `第${s + 1}プロパ`;

      const select = document.createElement("select");
      select.className = "avatar-select";
      select.setAttribute("data-avatar-part", part.id);
      select.setAttribute("data-avatar-slot", String(s));
      select.setAttribute("aria-label", `${part.label} 第${s + 1}プロパティ`);

      const emptyOpt = document.createElement("option");
      emptyOpt.value = "";
      emptyOpt.textContent = "-- なし --";
      select.appendChild(emptyOpt);

      const prevVal = prevSelections[part.id]?.[s] || "";

      groups.forEach((items, conflictKey) => {
        const optgroup = document.createElement("optgroup");
        const baseGroupLabel = formatAvatarGroupLabel(conflictKey);
        optgroup.label = baseGroupLabel;
        optgroup.setAttribute("data-conflict-key", conflictKey);
        optgroup.setAttribute("data-base-label", baseGroupLabel);

        items.forEach(item => {
          const opt = document.createElement("option");
          opt.value = item.name;
          opt.textContent = item.name;
          opt.setAttribute("data-conflict-key", item.conflictKey);
          if (item.name === prevVal) opt.selected = true;
          optgroup.appendChild(opt);
        });

        select.appendChild(optgroup);
      });

      select.addEventListener("change", () => syncAvatarPartOptions(part.id));

      row.appendChild(labelSpan);
      row.appendChild(select);
      card.appendChild(row);
    }

    container.appendChild(card);
    syncAvatarPartOptions(part.id);
  });
}

/**
 * 同じ部位（追加装飾品 / 上衣 / 下衣）内の3スロットで同一「識別キー（conflictKey）」の重複選択を防止する
 * ※異なる部位間は独立しているため同じkeyでも選択可能
 * ※「ヘイト+〇%_plus」と「ヘイト+〇%_minus」は別識別キーのため同部位内で同時選択可能
 */
function syncAvatarPartOptions(partId) {
  const container = document.getElementById("avatar-presets");
  if (!container) return;

  const selects = Array.from(container.querySelectorAll(`select[data-avatar-part="${partId}"]`));
  const itemByName = new Map(DB.avatar.map(it => [it.name, it]));

  // スロット順に使用中の識別キーを収集（万一同一部位内で重複していた場合は後続スロットを解除）
  const usedConflictKeys = new Map(); // conflictKey -> slotIndex
  selects.forEach((sel, slotIdx) => {
    const item = itemByName.get(sel.value);
    if (!item) return;
    if (usedConflictKeys.has(item.conflictKey)) {
      sel.value = "";
    } else {
      usedConflictKeys.set(item.conflictKey, slotIdx);
    }
  });

  // 各スロットの選択肢について、他スロットで使用中の識別キーを持つグループ・項目を非活性化
  selects.forEach((sel, slotIdx) => {
    const optgroups = sel.querySelectorAll("optgroup");
    optgroups.forEach(og => {
      const cKey = og.getAttribute("data-conflict-key");
      const baseLabel = og.getAttribute("data-base-label") || cKey;
      const usedBySlot = usedConflictKeys.get(cKey);
      const isConflict = usedBySlot !== undefined && usedBySlot !== slotIdx;

      og.disabled = isConflict;
      og.label = isConflict ? `${baseLabel} [第${usedBySlot + 1}プロパで同系統選択済]` : baseLabel;

      const opts = og.querySelectorAll("option");
      opts.forEach(opt => {
        opt.disabled = isConflict;
      });
    });
  });
}

// 3部位 × 3スロットのおしゃれ装備プロパティ合計を算出（同部位内の識別キー重複排除を保証）
function getAvatarPresetSum() {
  const sum = {};
  const container = document.getElementById("avatar-presets");
  if (!container) return sum;

  const itemByName = new Map(DB.avatar.map(it => [it.name, it]));

  AVATAR_PARTS.forEach(part => {
    const seenConflictsInPart = new Set();
    const selects = container.querySelectorAll(`select[data-avatar-part="${part.id}"]`);
    selects.forEach(sel => {
      const item = itemByName.get(sel.value);
      if (!item) return;
      if (seenConflictsInPart.has(item.conflictKey)) return;
      seenConflictsInPart.add(item.conflictKey);

      sum[item.calcKey] = (sum[item.calcKey] || 0) + item.value;
    });
  });

  return sum;
}

// --- 特性プリセットUI (メイン武器・体装備 各1枠) ---
const TRAIT_PARTS = [
  { id: "main", label: "メイン武器" },
  { id: "body", label: "体装備" }
];

function getTraitPlayerBaseStats() {
  const num = (id) => parseInt(document.getElementById(id)?.value || "0", 10) || 0;
  return {
    str: num("p-str"),
    int: num("p-int"),
    tec: num("p-tec")
  };
}

function getTraitRowDisplayText(row, val) {
  if (val === null || val === undefined || val === 0 || val === "") return "";
  if (row.rawKey === "付与停止") {
    return `付与停止(${val})`;
  }
  if (typeof val === "number") {
    const sign = val > 0 ? "+" : "";
    if (row.rawKey.includes("〇")) {
      return row.rawKey.replace("+〇", `${sign}${val}`).replace("〇", String(val));
    }
    return `${row.rawKey} ${sign}${val}`;
  }
  return `${row.rawKey}: ${val}`;
}

function getTraitStackMax(trait, varName, tier, baseStats) {
  if (!trait || !trait.rows) return null;
  const escaped = varName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`min\\(\\s*${escaped}\\s*,`);
  for (const row of trait.rows) {
    const m = re.exec(row.expr);
    if (!m) continue;
    let start = m.index + m[0].length;
    let depth = 1;
    let end = start;
    while (end < row.expr.length && depth > 0) {
      const ch = row.expr[end];
      if (ch === "(") depth++;
      else if (ch === ")") depth--;
      if (depth > 0) end++;
    }
    if (depth === 0) {
      const maxExpr = row.expr.slice(start, end).trim();
      const maxVal = evalTraitFormula(maxExpr, tier, baseStats, {});
      if (typeof maxVal === "number" && !Number.isNaN(maxVal)) {
        return Math.max(0, maxVal);
      }
    }
  }
  return null;
}

function syncTraitTierOptions(partId) {
  const select = document.getElementById(`trait-select-${partId}`);
  const tierSel = document.getElementById(`trait-tier-${partId}`);
  if (!select || !tierSel) return;

  const isStatusStop = select.value === "付与停止";
  const prevVal = parseInt(tierSel.value, 10) || 5;
  const targetOptions = isStatusStop
    ? [
        { val: 3, label: "Tier 3 (気絶)" },
        { val: 2, label: "Tier 2 (転倒)" },
        { val: 1, label: "Tier 1 (怯み)" }
      ]
    : [5, 4, 3, 2, 1].map(t => ({ val: t, label: `Tier ${t}` }));

  const currentValues = Array.from(tierSel.options).map(o => `${o.value}:${o.textContent}`);
  const nextValues = targetOptions.map(o => `${o.val}:${o.label}`);
  if (currentValues.join("|") === nextValues.join("|")) return;

  tierSel.innerHTML = "";
  targetOptions.forEach(o => {
    const opt = document.createElement("option");
    opt.value = String(o.val);
    opt.textContent = o.label;
    tierSel.appendChild(opt);
  });

  if (isStatusStop) {
    tierSel.value = String(prevVal >= 1 && prevVal <= 3 ? prevVal : 3);
  } else {
    tierSel.value = String(prevVal >= 1 && prevVal <= 5 ? prevVal : 5);
  }
}

function renderTraitPresets() {
  const container = document.getElementById("trait-presets");
  if (!container) return;
  container.innerHTML = "";

  const grid = document.createElement("div");
  grid.className = "trait-parts-grid";

  TRAIT_PARTS.forEach(part => {
    const card = document.createElement("div");
    card.className = "trait-card";
    card.dataset.part = part.id;

    const title = document.createElement("div");
    title.className = "trait-card-title";
    title.textContent = part.label;
    card.appendChild(title);

    const controls = document.createElement("div");
    controls.className = "trait-controls";

    const select = document.createElement("select");
    select.className = "trait-select";
    select.id = `trait-select-${part.id}`;
    const emptyOpt = document.createElement("option");
    emptyOpt.value = "";
    emptyOpt.textContent = "-- なし --";
    select.appendChild(emptyOpt);

    (DB.trait || []).forEach(tr => {
      const opt = document.createElement("option");
      opt.value = tr.name;
      opt.textContent = tr.name;
      select.appendChild(opt);
    });

    const tierSel = document.createElement("select");
    tierSel.className = "trait-tier";
    tierSel.id = `trait-tier-${part.id}`;
    [5, 4, 3, 2, 1].forEach(t => {
      const opt = document.createElement("option");
      opt.value = String(t);
      opt.textContent = `Tier ${t}`;
      if (t === 5) opt.selected = true;
      tierSel.appendChild(opt);
    });

    controls.appendChild(select);
    controls.appendChild(tierSel);
    card.appendChild(controls);

    const stackArea = document.createElement("div");
    stackArea.className = "trait-stack-area";
    stackArea.id = `trait-stacks-${part.id}`;
    card.appendChild(stackArea);

    const meta = document.createElement("div");
    meta.className = "trait-meta";
    meta.id = `trait-meta-${part.id}`;
    card.appendChild(meta);

    select.addEventListener("change", () => {
      syncTraitTierOptions(part.id);
      renderTraitStackInputs(part.id);
      syncTraitsUI();
    });
    tierSel.addEventListener("change", () => syncTraitsUI());

    grid.appendChild(card);
  });

  container.appendChild(grid);
  syncTraitsUI();
}

function renderTraitStackInputs(partId) {
  const stackArea = document.getElementById(`trait-stacks-${partId}`);
  const select = document.getElementById(`trait-select-${partId}`);
  if (!stackArea || !select) return;

  stackArea.innerHTML = "";
  const trait = (DB.trait || []).find(t => t.name === select.value);
  if (!trait || !trait.stackVars || trait.stackVars.length === 0) return;

  trait.stackVars.forEach(varName => {
    const row = document.createElement("div");
    row.className = "trait-stack-row";

    const label = document.createElement("label");
    label.textContent = varName;
    const input = document.createElement("input");
    input.type = "number";
    input.min = "0";
    input.value = "0";
    input.className = "trait-stack-input";
    input.dataset.varName = varName;
    input.addEventListener("input", () => syncTraitsUI());

    row.appendChild(label);
    row.appendChild(input);
    stackArea.appendChild(row);
  });
}

function getTraitStackValues(partId) {
  const stackArea = document.getElementById(`trait-stacks-${partId}`);
  const vars = {};
  if (!stackArea) return vars;
  stackArea.querySelectorAll(".trait-stack-input").forEach(inp => {
    const k = inp.dataset.varName;
    if (k) vars[k] = parseFloat(inp.value) || 0;
  });
  return vars;
}

function syncTraitsUI() {
  const baseStats = getTraitPlayerBaseStats();
  TRAIT_PARTS.forEach(part => {
    syncTraitTierOptions(part.id);
    const select = document.getElementById(`trait-select-${part.id}`);
    const tierSel = document.getElementById(`trait-tier-${part.id}`);
    const stackArea = document.getElementById(`trait-stacks-${part.id}`);
    const meta = document.getElementById(`trait-meta-${part.id}`);
    if (!select || !tierSel || !meta) return;

    const trait = (DB.trait || []).find(t => t.name === select.value);
    if (!trait) {
      meta.textContent = "";
      return;
    }

    const tier = parseInt(tierSel.value, 10) || (select.value === "付与停止" ? 3 : 5);
    if (stackArea) {
      stackArea.querySelectorAll(".trait-stack-row").forEach(rowEl => {
        const lbl = rowEl.querySelector("label");
        const inp = rowEl.querySelector(".trait-stack-input");
        if (!lbl || !inp) return;
        const varName = inp.dataset.varName;
        const maxStack = getTraitStackMax(trait, varName, tier, baseStats);
        if (maxStack !== null) {
          inp.max = String(maxStack);
          lbl.textContent = `${varName} (最大${maxStack})`;
          const cur = parseFloat(inp.value);
          if (!Number.isNaN(cur) && cur > maxStack) {
            inp.value = String(maxStack);
          }
        } else {
          inp.removeAttribute("max");
          lbl.textContent = varName;
        }
      });
    }

    const stackVars = getTraitStackValues(part.id);
    const parts = [];
    trait.rows.forEach(row => {
      const val = evalTraitFormula(row.expr, tier, baseStats, stackVars);
      const text = getTraitRowDisplayText(row, val);
      if (text) parts.push(text);
    });
    meta.textContent = parts.join(" / ");
  });
}

function getTraitPresetSum() {
  const sum = {};
  const baseStats = getTraitPlayerBaseStats();

  TRAIT_PARTS.forEach(part => {
    const select = document.getElementById(`trait-select-${part.id}`);
    const tierSel = document.getElementById(`trait-tier-${part.id}`);
    if (!select || !tierSel || !select.value) return;

    const trait = (DB.trait || []).find(t => t.name === select.value);
    if (!trait) return;

    const tier = parseInt(tierSel.value, 10) || 5;
    const stackVars = getTraitStackValues(part.id);
    trait.rows.forEach(row => {
      if (!row.calcKey) return;
      const val = evalTraitFormula(row.expr, tier, baseStats, stackVars);
      if (typeof val === "number" && !Number.isNaN(val) && val !== 0) {
        sum[row.calcKey] = (sum[row.calcKey] || 0) + val;
      }
    });
  });

  return sum;
}

// --- アイテムバフプリセットUI (同一カテゴリは1枠＝重複不可) ---
const ITEM_CATEGORY_PRIORITY = [
  "攻撃速度", "詠唱速度", "攻撃力", "魔法力", "属性強化",
  "命中", "回避", "HP増加", "MP増加",
  "物理防御", "魔法防御", "属性防御",
  "HP回復（継続）", "MP回復（継続）", "予防"
];

function formatItemEffectsSummary(item) {
  if (!item || !item.effects || item.effects.length === 0) return "";
  return item.effects.map(ef => formatEffectLabel(ef.rawKey, ef.val)).join(" / ");
}

function renderItemBuffPresets() {
  const container = document.getElementById("item-buff-presets");
  if (!container) return;

  // 既存の選択状態を保持
  const prevByCat = {};
  container.querySelectorAll("select[data-item-cat]").forEach(sel => {
    prevByCat[sel.getAttribute("data-item-cat")] = sel.value;
  });

  // カテゴリごとにグループ化
  const catMap = new Map();
  DB.itemBuff.forEach(item => {
    if (!catMap.has(item.category)) {
      catMap.set(item.category, []);
    }
    catMap.get(item.category).push(item);
  });

  // 優先順＋CSV順でカテゴリをソート
  const categories = Array.from(catMap.keys()).sort((a, b) => {
    const ia = ITEM_CATEGORY_PRIORITY.indexOf(a);
    const ib = ITEM_CATEGORY_PRIORITY.indexOf(b);
    if (ia >= 0 && ib >= 0) return ia - ib;
    if (ia >= 0) return -1;
    if (ib >= 0) return 1;
    return 0;
  });

  container.innerHTML = "";

  categories.forEach(cat => {
    const items = catMap.get(cat) || [];
    const row = document.createElement("div");
    row.className = "item-buff-row";

    const label = document.createElement("label");
    label.className = "item-buff-cat";
    label.textContent = cat;

    const select = document.createElement("select");
    select.className = "item-buff-select";
    select.setAttribute("data-item-cat", cat);
    select.setAttribute("aria-label", `アイテムバフ ${cat}`);

    const emptyOpt = document.createElement("option");
    emptyOpt.value = "";
    emptyOpt.textContent = "-- なし --";
    select.appendChild(emptyOpt);

    const prevName = prevByCat[cat] || "";
    items.forEach(item => {
      const opt = document.createElement("option");
      opt.value = item.name;
      const effText = formatItemEffectsSummary(item);
      opt.textContent = effText ? `${item.name} (${effText})` : item.name;
      if (item.name === prevName) opt.selected = true;
      select.appendChild(opt);
    });

    row.appendChild(label);
    row.appendChild(select);
    container.appendChild(row);
  });
}

// 各カテゴリから最大1つずつ選択されたアイテムバフのプロパティ合計を取得（同一カテゴリ重複不可）
function getItemBuffPresetSum() {
  const sum = {};
  const container = document.getElementById("item-buff-presets");
  if (!container) return sum;

  const seenCategories = new Set();
  container.querySelectorAll("select[data-item-cat]").forEach(sel => {
    const cat = sel.getAttribute("data-item-cat");
    const name = sel.value;
    if (!cat || !name || seenCategories.has(cat)) return;

    const item = DB.itemBuff.find(it => it.name === name && it.category === cat);
    if (!item) return;
    seenCategories.add(cat);

    for (const k in item.p) {
      if (typeof item.p[k] === "number") {
        sum[k] = (sum[k] || 0) + item.p[k];
      }
    }
  });

  return sum;
}

// --- パッシブ・バフスキル共通 数式変数コンテキスト & UI制御 ---
const SKILL_EXTRA_PARAM_DEFS = {
  "キャストマスタリ": [
    { varName: "習得ウィザードスキル数", label: "ウィザード数", type: "number", min: 0, max: 20, defaultVal: 4 },
    { varName: "ウィザードスキル合計SLv", label: "合計SLv", type: "number", min: 0, max: 200, defaultVal: 40 }
  ],
  "神速の捌手": [
    { varName: "神速の捌手スタック数", label: "スタック", type: "select", options: [1, 2, 3], defaultVal: 3 }
  ],
  "セイバーオーラ": [
    { varName: "セイバーオーラスタック数", label: "スタック", type: "select", options: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], defaultVal: 10 }
  ],
  "チェインキャスト": [
    { varName: "チェインキャストスタック数", label: "スタック", type: "select", options: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], defaultVal: 5 }
  ],
  "シュツルムリーパーバフ": [
    { varName: "後退移動距離", label: "移動距離m", type: "number", min: 0, max: 9, defaultVal: 9 }
  ],
  "オーバーリミット": [
    { varName: "魔術の導SLv", label: "魔術の導SLv", type: "select", options: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], defaultVal: 10 }
  ],
  "急速チャージ": [
    { varName: "チャージングMP回復量", label: "MP回復量", type: "number", min: 0, max: 2000, defaultVal: 1500 }
  ]
};

function getPassiveSkillSLv(skillName) {
  const container = document.getElementById("passive-presets");
  if (!container) return 0;
  const box = container.querySelector(`.passive-item[data-skill-name="${skillName}"]`);
  if (!box) return 0;
  const cb = box.querySelector(".passive-cb");
  const sel = box.querySelector(".passive-slv");
  if (!cb || !cb.checked) return 0;
  return Number(sel?.value) || 0;
}

function getSkillExtraVars(box, wType, subType) {
  const vars = {
    "ブレードマスタリSLv": getPassiveSkillSLv("ブレードマスタリ"),
    "ハルバードマスタリSLv": getPassiveSkillSLv("ハルバードマスタリ"),
    "盾精錬値": subType === "盾" ? v("sub-ref") : 0,
    "補正後STR": v("p-str") || 0,
    "補正後DEX": v("p-dex") || 0,
    "魔法貫通": 20,
    "クリティカル率": 100
  };
  if (box) {
    box.querySelectorAll("[data-extra-var]").forEach(el => {
      const k = el.getAttribute("data-extra-var");
      vars[k] = Number(el.value) || 0;
    });
  }
  return vars;
}

function computeSkillEffects(skill, slv, playerLv, wType, subType, extraVars) {
  const propMap = {};
  const labels = [];
  if (!skill || !skill.rows || slv <= 0) return { propMap, labels, hasMatchingRow: false };

  let hasMatchingRow = false;
  skill.rows.forEach(row => {
    if (!isPassiveRestrictionMet(row.limit, wType, subType)) return;
    hasMatchingRow = true;
    if (!row.expr) return;
    const val = evalPassiveFormula(row.expr, slv, playerLv, extraVars);
    if (val !== null) {
      propMap[row.calcKey] = (propMap[row.calcKey] || 0) + val;
    }
  });

  for (const k in propMap) {
    labels.push(formatEffectLabel(k, propMap[k]));
  }
  return { propMap, labels, hasMatchingRow };
}

function renderSkillPresetList(containerId, skillList, onSyncCallback) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // 既存のチェック状態・SLv・追加パラメータを保持
  const prevState = {};
  container.querySelectorAll(".passive-item").forEach(box => {
    const name = box.getAttribute("data-skill-name");
    const cb = box.querySelector(".passive-cb");
    const sel = box.querySelector(".passive-slv");
    const extras = {};
    box.querySelectorAll("[data-extra-var]").forEach(el => {
      extras[el.getAttribute("data-extra-var")] = el.value;
    });
    if (name) {
      prevState[name] = {
        checked: cb ? cb.checked : false,
        slv: sel ? (Number(sel.value) || 10) : 10,
        extras
      };
    }
  });

  container.innerHTML = "";
  const lvOpts = [];
  for (let l = 10; l >= 1; l--) {
    lvOpts.push(`<option value="${l}">Lv${l}</option>`);
  }

  skillList.forEach(skill => {
    const prev = prevState[skill.name] || { checked: false, slv: 10, extras: {} };
    const box = document.createElement("div");
    box.className = `passive-item${prev.checked ? " active" : ""}`;
    box.setAttribute("data-skill-name", skill.name);

    const extraDefs = SKILL_EXTRA_PARAM_DEFS[skill.name] || [];
    const extraHtml = extraDefs.map(def => {
      const savedVal = prev.extras[def.varName] !== undefined ? prev.extras[def.varName] : String(def.defaultVal);
      if (def.type === "select") {
        const opts = def.options.map(o => `<option value="${o}"${String(o) === savedVal ? " selected" : ""}>${o}</option>`).join("");
        return `<div class="skill-extra-row"><span>${def.label}</span><select data-extra-var="${def.varName}"${prev.checked ? "" : " disabled"}>${opts}</select></div>`;
      }
      return `<div class="skill-extra-row"><span>${def.label}</span><input type="number" data-extra-var="${def.varName}" min="${def.min}" max="${def.max}" value="${savedVal}"${prev.checked ? "" : " disabled"}></div>`;
    }).join("");

    box.innerHTML = `
      <div class="passive-top">
        <label class="passive-label">
          <input type="checkbox" class="passive-cb" value="${skill.name}"${prev.checked ? " checked" : ""}>
          <span>${skill.name}</span>
        </label>
        <select class="passive-slv" aria-label="${skill.name} SLv"${prev.checked ? "" : " disabled"}>
          ${lvOpts.join("")}
        </select>
      </div>
      ${extraHtml}
      <div class="passive-meta"></div>
    `;

    const cb = box.querySelector(".passive-cb");
    const sel = box.querySelector(".passive-slv");
    sel.value = String(prev.slv);

    cb.addEventListener("change", () => {
      sel.disabled = !cb.checked;
      box.querySelectorAll("[data-extra-var]").forEach(el => {
        el.disabled = !cb.checked;
      });
      box.classList.toggle("active", cb.checked);
      onSyncCallback();
    });
    sel.addEventListener("change", onSyncCallback);
    box.querySelectorAll("[data-extra-var]").forEach(el => {
      el.addEventListener("input", onSyncCallback);
      el.addEventListener("change", onSyncCallback);
    });

    container.appendChild(box);
  });

  onSyncCallback();
}

function renderPassivePresets() {
  renderSkillPresetList("passive-presets", DB.passive, syncPassivePresetsUI);
}

function renderActivePresets() {
  renderSkillPresetList("active-presets", DB.active, syncActivePresetsUI);
}

function syncSkillExclusiveState(container, skillList) {
  if (!container) return;
  const checkedNames = new Set();
  container.querySelectorAll(".passive-item").forEach(box => {
    const cb = box.querySelector(".passive-cb");
    const name = box.getAttribute("data-skill-name");
    if (cb && cb.checked && name) checkedNames.add(name);
  });

  container.querySelectorAll(".passive-item").forEach(box => {
    const name = box.getAttribute("data-skill-name");
    const skill = (skillList || []).find(x => x.name === name);
    const cb = box.querySelector(".passive-cb");
    if (!skill || !cb) return;

    const conflictWith = (skill.rel || []).find(r => r !== name && checkedNames.has(r));
    const isBlocked = !cb.checked && Boolean(conflictWith);
    cb.disabled = isBlocked;
    if (isBlocked) {
      box.classList.add("disabled-weapon");
      box.title = `「${conflictWith}」と同時選択できません`;
    } else {
      box.title = "";
    }
  });
}

// 現在のメイン武器・サブ武器・プレイヤーLvに応じてパッシブスキルの有効性と効果量表示を更新する
function syncPassivePresetsUI() {
  const container = document.getElementById("passive-presets");
  if (!container) return;

  const wType = s("w-type") || "両手剣";
  const subType = s("sub-type") || "なし";
  const playerLv = v("p-lv") || 330;

  container.querySelectorAll(".passive-item").forEach(box => {
    const name = box.getAttribute("data-skill-name");
    const skill = DB.passive.find(x => x.name === name);
    if (!skill) return;

    const cb = box.querySelector(".passive-cb");
    const sel = box.querySelector(".passive-slv");
    const meta = box.querySelector(".passive-meta");
    const slv = Number(sel?.value) || 10;
    const extraVars = getSkillExtraVars(box, wType, subType);

    const { labels, hasMatchingRow } = computeSkillEffects(skill, slv, playerLv, wType, subType, extraVars);
    box.classList.toggle("disabled-weapon", !hasMatchingRow);

    if (meta) {
      meta.textContent = labels.join(" / ");
    }

    if (name === "スペルバースト") {
      const sbInput = document.getElementById("slv-spellb");
      if (sbInput && cb) {
        sbInput.value = cb.checked && hasMatchingRow ? slv : 0;
      }
    }
  });

  syncSkillExclusiveState(container, DB.passive);

  // パッシブのSLvに依存するバフスキルも追従更新
  syncActivePresetsUI();
}

// 現在のメイン武器・サブ武器・各種ステータスに応じてバフスキルの有効性と効果量表示を更新する
function syncActivePresetsUI() {
  const container = document.getElementById("active-presets");
  if (!container) return;

  const wType = s("w-type") || "両手剣";
  const subType = s("sub-type") || "なし";
  const playerLv = v("p-lv") || 330;

  container.querySelectorAll(".passive-item").forEach(box => {
    const name = box.getAttribute("data-skill-name");
    const skill = DB.active.find(x => x.name === name);
    if (!skill) return;

    const cb = box.querySelector(".passive-cb");
    const sel = box.querySelector(".passive-slv");
    const meta = box.querySelector(".passive-meta");
    const slv = Number(sel?.value) || 10;
    const extraVars = getSkillExtraVars(box, wType, subType);

    const { labels, hasMatchingRow } = computeSkillEffects(skill, slv, playerLv, wType, subType, extraVars);
    box.classList.toggle("disabled-weapon", !hasMatchingRow);

    if (meta) {
      meta.textContent = labels.join(" / ");
    }

    // 破壊者はスキル・敵情報の「破壊者+化勁 SLv合算」(#slv-knuckle)とも連動
    if (name === "破壊者") {
      const knInput = document.getElementById("slv-knuckle");
      if (knInput && cb) {
        knInput.value = cb.checked && hasMatchingRow ? slv : 0;
      }
    }
  });

  syncSkillExclusiveState(container, DB.active);
}

function getSkillPresetSum(containerId, skillList) {
  const sum = {};
  const container = document.getElementById(containerId);
  if (!container) return sum;

  const wType = s("w-type") || "両手剣";
  const subType = s("sub-type") || "なし";
  const playerLv = v("p-lv") || 330;

  container.querySelectorAll(".passive-item").forEach(box => {
    const name = box.getAttribute("data-skill-name");
    const cb = box.querySelector(".passive-cb");
    const sel = box.querySelector(".passive-slv");
    if (!name || !cb || !cb.checked) return;

    const skill = skillList.find(x => x.name === name);
    if (!skill) return;
    const slv = Math.max(1, Math.min(10, Number(sel?.value) || 10));
    const extraVars = getSkillExtraVars(box, wType, subType);
    const { propMap, hasMatchingRow } = computeSkillEffects(skill, slv, playerLv, wType, subType, extraVars);
    if (!hasMatchingRow) return;

    for (const k in propMap) {
      if (typeof propMap[k] === "number") {
        sum[k] = (sum[k] || 0) + propMap[k];
      }
    }
  });

  return sum;
}

function getPassivePresetSum() {
  return getSkillPresetSum("passive-presets", DB.passive);
}

function getActivePresetSum() {
  return getSkillPresetSum("active-presets", DB.active);
}

// 手入力装備枠（サブ武器・追加装備・特殊装備）が有効かどうかを判定する
function getManualEquipState(slotKey) {
  const map = {
    sub:  { nameId: "custom-name-sub",  propId: "prop-sub",  defaultLabel: "手入力サブ武器" },
    add:  { nameId: "custom-name-add",  propId: "prop-add",  defaultLabel: "手入力追加装備" },
    spec: { nameId: "custom-name-spec", propId: "prop-spec", defaultLabel: "手入力特殊装備" }
  };
  const cfg = map[slotKey] || map.spec;

  const customName = s(cfg.nameId);
  const container = document.getElementById(cfg.propId);
  const rowCount = container ? container.querySelectorAll(".prop-row").length : 0;
  const p = getPropSum(cfg.propId);

  const active = customName !== "" || rowCount > 0;
  return {
    active,
    name: customName || cfg.defaultLabel,
    p
  };
}

// サブ武器・追加装備・特殊装備の手入力状態に応じてカード表示を同期
function syncManualEquipStatus() {
  const configs = [
    { key: "sub",  cardId: "card-manual-sub"  },
    { key: "add",  cardId: "card-manual-add"  },
    { key: "spec", cardId: "card-manual-spec" }
  ];

  configs.forEach(({ key, cardId }) => {
    const state = getManualEquipState(key);
    const card = document.getElementById(cardId);
    if (card) {
      card.classList.toggle("manual-active", state.active);
    }
  });
}

// メイン武器 × サブ武器 装備可能マトリクス
const ALLOWED_SUB_WEAPONS = {
  "片手剣": ["なし", "盾", "短剣", "矢", "魔導具", "手甲", "片手剣", "巻物"],
  "両手剣": ["なし"],
  "弓":     ["なし", "矢", "抜刀剣"],
  "自動弓": ["なし", "盾", "短剣", "矢", "魔導具", "手甲"],
  "杖":     ["なし", "盾", "短剣", "矢", "魔導具", "手甲", "巻物"],
  "魔導具": ["なし", "巻物"],
  "手甲":   ["なし", "盾", "短剣", "矢", "魔導具"],
  "旋風槍": ["なし", "短剣", "矢"],
  "抜刀剣": ["なし", "短剣", "巻物"],
  "素手":   ["なし", "盾", "短剣", "矢", "魔導具", "手甲", "巻物"]
};

const SUB_OPTION_LABELS = {
  "なし": "なし",
  "盾": "盾",
  "短剣": "短剣",
  "矢": "矢",
  "魔導具": "魔導具",
  "手甲": "手甲",
  "片手剣": "片手剣",
  "抜刀剣": "抜刀剣",
  "巻物": "忍術巻物"
};

const SUB_PROP_ENABLED_TYPES = ["盾", "短剣", "巻物", "矢"];

// 11周年の祝武器 基礎ATK・安定率マスタ
const DEFAULT_WEAPON_BASE_STATS = {
  "片手剣": { atk: 730,  stab: 80 },
  "両手剣": { atk: 1095, stab: 70 },
  "弓":     { atk: 438,  stab: 60 },
  "自動弓": { atk: 584,  stab: 50 },
  "杖":     { atk: 730,  stab: 60 },
  "魔導具": { atk: 365,  stab: 70 },
  "手甲":   { atk: 511,  stab: 90 },
  "旋風槍": { atk: 1168, stab: 60 },
  "抜刀剣": { atk: 292,  stab: 70 },
  "素手":   { atk: 0,    stab: 0  }
};

// メイン武器種を変更した際に基礎ATKと安定率を11周年祝武器の基礎値に更新する
function applyMainWeaponDefaultStats() {
  const wType = s("w-type");
  const base = DEFAULT_WEAPON_BASE_STATS[wType];
  if (!base) return;
  const atkEl = document.getElementById("w-atk");
  const stabEl = document.getElementById("w-stab");
  if (atkEl) atkEl.value = base.atk;
  if (stabEl) stabEl.value = base.stab;
}

// メイン武器に応じて選択可能なサブ武器を制限する
function syncSubWeaponOptions() {
  const wType = s("w-type") || "両手剣";
  const subSelect = document.getElementById("sub-type");
  const subPresetSelect = document.getElementById("sub-preset-select");
  if (!subSelect) return;

  const allowed = ALLOWED_SUB_WEAPONS[wType] || ["なし"];

  Array.from(subSelect.options).forEach(opt => {
    const baseLabel = SUB_OPTION_LABELS[opt.value] || opt.value;
    const isOk = allowed.includes(opt.value);
    opt.disabled = !isOk;
    opt.textContent = baseLabel;
  });

  if (!allowed.includes(subSelect.value)) {
    subSelect.value = allowed[0] || "なし";
  }

  const curSub = subSelect.value;
  const hasProps = SUB_PROP_ENABLED_TYPES.includes(curSub);

  const subPresetClear = document.getElementById("btn-clear-preset-sub");
  if (subPresetSelect) {
    const prevVal = subPresetSelect.value;
    const filteredSubs = hasProps
      ? DB.sub.filter(it => it.type === curSub || it.limit === curSub)
      : [];
    PRESET_OPTION_STORE.sub = filteredSubs.map(it => ({ value: it.name, badge: it.type || "", isRec: false }));
    subPresetSelect.disabled = !hasProps;
    subPresetSelect.placeholder = hasProps ? "検索・選択（空で自動探索）" : "-";
    if (subPresetClear) subPresetClear.disabled = !hasProps;
    if (!(hasProps && prevVal && filteredSubs.some(it => it.name === prevVal))) {
      subPresetSelect.value = "";
    }
  }

  const isSubSword = curSub === "片手剣";
  document.querySelectorAll(".sub-sword-only").forEach(el => {
    el.style.display = isSubSword ? "" : "none";
  });
  if (isSubSword) {
    syncSubElemToPropSub();
  }

  syncPassivePresetsUI();
  renderWeaponPresetOptions();
  renderBodyPresetOptions();
}

let isSyncingSubElem = false;

function syncSubElemToPropSub() {
  if (isSyncingSubElem) return;
  if (s("sub-type") !== "片手剣") return;
  const propSub = document.getElementById("prop-sub");
  if (!propSub) return;

  isSyncingSubElem = true;
  try {
    const elem = s("sub-elem") || "無";
    const elemRows = Array.from(propSub.querySelectorAll(".prop-row"))
      .filter(r => r.querySelector(".prop-key")?.value === "サブ武器の属性");

    if (elem === "無") {
      elemRows.forEach(r => r.remove());
      syncManualEquipStatus();
    } else if (elemRows.length > 0) {
      const valInput = elemRows[0].querySelector(".prop-val");
      if (valInput) valInput.value = elem;
      for (let i = 1; i < elemRows.length; i++) elemRows[i].remove();
      syncManualEquipStatus();
    } else {
      addPropRow("prop-sub", "サブ武器の属性", elem);
    }
  } finally {
    isSyncingSubElem = false;
  }
}

function syncPropSubToSubElem() {
  if (isSyncingSubElem) return;
  if (s("sub-type") !== "片手剣") return;
  const propSub = document.getElementById("prop-sub");
  const subElemEl = document.getElementById("sub-elem");
  if (!propSub || !subElemEl) return;

  isSyncingSubElem = true;
  try {
    const validElems = new Set(["無", "火", "水", "風", "地", "光", "闇"]);
    const elemRow = Array.from(propSub.querySelectorAll(".prop-row"))
      .find(r => r.querySelector(".prop-key")?.value === "サブ武器の属性");
    if (!elemRow) {
      subElemEl.value = "無";
      return;
    }
    const rawVal = (elemRow.querySelector(".prop-val")?.value || "").trim().replace(/属性$/, "");
    if (validElems.has(rawVal)) {
      subElemEl.value = rawVal;
    }
  } finally {
    isSyncingSubElem = false;
  }
}

const PRESET_OPTION_STORE = {
  main: [],
  sub: [],
  body: [],
  add: [],
  spec: []
};

function renderDBEquipPresetOptions(storeKey, list) {
  PRESET_OPTION_STORE[storeKey] = (list || []).map(it => ({
    value: it.name,
    badge: "",
    isRec: false
  }));
}

function applyDBEquipPreset(presetName, list, propContainerId, customNameId) {
  const propEl = document.getElementById(propContainerId);
  const nameInput = document.getElementById(customNameId);
  if (!propEl) return;

  const trimmed = (presetName || "").trim();
  if (!trimmed) {
    propEl.innerHTML = "";
    if (nameInput) nameInput.value = "";
    syncManualEquipStatus();
    return;
  }

  const item = (list || []).find(it => it.name === trimmed);
  if (!item) return;

  const wType = s("w-type") || "両手剣";
  const subType = s("sub-type") || "なし";
  const bType = s("b-type") || "通常";
  const resolved = resolveEquipItemProps(item, wType, subType, bType);

  propEl.innerHTML = "";
  Object.entries(resolved.p || {}).forEach(([k, val]) => {
    addPropRow(propContainerId, k, String(val));
  });
  if (nameInput) {
    nameInput.value = resolved.name;
  }
  syncManualEquipStatus();
}

function isWeaponPresetRecommended(recStr, wType, subType) {
  if (!recStr) return false;
  const tokens = recStr.split(/[、,]/).map(t => t.trim()).filter(Boolean);
  return tokens.some(tok => {
    const normalized = tok.replace(/魔道具/g, "魔導具");
    if (normalized.includes("+")) {
      const [mainReq, subReq] = normalized.split("+").map(x => x.trim().replace(/^メイン/, ""));
      return wType === mainReq && subType === subReq;
    }
    const req = normalized.replace(/^メイン/, "");
    return wType === req;
  });
}

function renderEquipPresetOptions(storeKey, list) {
  const wType = s("w-type") || "両手剣";
  const subType = s("sub-type") || "なし";
  const items = list || [];

  const recommended = [];
  const others = [];
  items.forEach(p => {
    if (isWeaponPresetRecommended(p.recommended, wType, subType)) {
      recommended.push({ value: p.name, badge: "★ 推奨", isRec: true });
    } else {
      others.push({ value: p.name, badge: p.recommended || "", isRec: false });
    }
  });

  PRESET_OPTION_STORE[storeKey] = [...recommended, ...others];
}

function renderWeaponPresetOptions() {
  renderEquipPresetOptions("main", DB.weaponPreset);
}

function renderBodyPresetOptions() {
  renderEquipPresetOptions("body", DB.bodyPreset);
}

function applyEquipPreset(presetName, list, propContainerId, customNameId) {
  if (!presetName) return;
  const preset = (list || []).find(p => p.name === presetName);
  if (!preset) return;

  const propEl = document.getElementById(propContainerId);
  if (!propEl) return;
  propEl.innerHTML = "";
  preset.rows.forEach(row => {
    addPropRow(propContainerId, row.key, row.value);
  });

  const nameInput = document.getElementById(customNameId);
  if (nameInput && !nameInput.value.trim()) {
    nameInput.value = preset.name;
  }
  syncManualEquipStatus();
}

function applyWeaponPreset(presetName) {
  applyEquipPreset(presetName, DB.weaponPreset, "prop-main", "custom-name-main");
}

function applyBodyPreset(presetName) {
  applyEquipPreset(presetName, DB.bodyPreset, "prop-body", "custom-name-body");
}

function syncSlotInputs() {
  const pairs = [
    { sel: "slot-main", c1: "fix-main-c1", c2: "fix-main-c2" },
    { sel: "slot-body", c1: "fix-body-c1", c2: "fix-body-c2" },
    { sel: "slot-add",  c1: "fix-add-c1",  c2: "fix-add-c2" },
    { sel: "slot-spec", c1: "fix-spec-c1", c2: "fix-spec-c2" }
  ];
  pairs.forEach(({ sel, c1, c2 }) => {
    const count = v(sel);
    const in1 = document.getElementById(c1);
    const in2 = document.getElementById(c2);
    if (in1) {
      in1.disabled = count < 1;
      if (count < 1) in1.value = "";
    }
    if (in2) {
      in2.disabled = count < 2;
      if (count < 2) in2.value = "";
    }
  });
}

// --- ボスプリセット ＆ 難易度別ステータス補正UI制御 ---
let lastSelectedBossName = "";

function renderBossPresets() {
  const dl = document.getElementById("dl-boss");
  if (!dl) return;

  dl.innerHTML = DB.boss
    .map(b => `<option value="${b.name}">${b.enemyType} / ${b.elem}属性 / DEF:${b.def} / MDEF:${b.mdef}</option>`)
    .join("");

  syncBossDifficultyAndStats(false);
}

function syncBossDifficultyAndStats(resetToNormal = false) {
  const bossInput = document.getElementById("boss-select");
  const diffSelect = document.getElementById("boss-diff");
  const typeDisplay = document.getElementById("e-type-display");
  if (!bossInput || !diffSelect) return;

  const bossName = bossInput.value.trim();
  if (!bossName) {
    lastSelectedBossName = "";
    diffSelect.disabled = true;
    diffSelect.value = "Normal";
    if (typeDisplay) typeDisplay.value = "-";
    return;
  }

  const boss = DB.boss.find(b => b.name === bossName);
  if (!boss) return;

  const isNewBoss = lastSelectedBossName !== boss.name;
  lastSelectedBossName = boss.name;

  const isStandardBoss = boss.enemyType === "ボス";
  if (typeDisplay) typeDisplay.value = boss.enemyType;

  if (isStandardBoss) {
    diffSelect.disabled = false;
    if (resetToNormal && isNewBoss) {
      diffSelect.value = "Normal";
    }
  } else {
    diffSelect.disabled = true;
    diffSelect.value = "Normal";
  }

  const stats = calcBossStats(boss, diffSelect.value);
  if (!stats) return;

  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.value = val;
  };

  setVal("e-elem", stats.elem);
  setVal("e-hp",   stats.hpDisplay);
  setVal("e-def",  stats.def);
  setVal("e-mdef", stats.mdef);
  setVal("e-flee", stats.flee);
  setVal("e-pres", stats.physRes);
  setVal("e-mres", stats.magRes);
  setVal("e-cres", stats.critRes);
  setVal("e-wres", stats.weapRes);
  if (stats.lv !== null) {
    setVal("e-lv", stats.lv);
  }
}

// Datalistの候補を構築
function populateDatalists() {
  const fillDl = (id, arr) => {
    const dl = document.getElementById(id);
    if (!dl) return;
    dl.innerHTML = arr.map(it => `<option value="${it.name}">`).join("");
  };

  renderDBEquipPresetOptions("add", DB.add);
  renderDBEquipPresetOptions("spec", DB.spec);

  fillDl("dl-crys-main", DB.crysta.filter(c => c.type === "武器クリスタ" || c.type === "ノーマルクリスタ"));
  fillDl("dl-crys-body", DB.crysta.filter(c => c.type === "体クリスタ" || c.type === "ノーマルクリスタ"));
  fillDl("dl-crys-add",  DB.crysta.filter(c => c.type === "追加クリスタ" || c.type === "ノーマルクリスタ"));
  fillDl("dl-crys-spec", DB.crysta.filter(c => c.type === "特殊クリスタ" || c.type === "ノーマルクリスタ"));

  syncSubWeaponOptions();
}

// CSVデータの自動読み込み処理
async function handleLoadCSV() {
  const msg = document.getElementById("load-msg");
  const badges = {
    sub:     document.getElementById("badge-sub"),
    add:     document.getElementById("badge-add"),
    spec:    document.getElementById("badge-spec"),
    crys:    document.getElementById("badge-crys"),
    food:    document.getElementById("badge-food"),
    reg:     document.getElementById("badge-reg"),
    boss:    document.getElementById("badge-boss"),
    avatar:  document.getElementById("badge-avatar"),
    item:    document.getElementById("badge-item"),
    passive: document.getElementById("badge-passive"),
    active:  document.getElementById("badge-active"),
    trait:   document.getElementById("badge-trait")
  };

  if (msg) {
    msg.innerText = "データ読み込み中...";
    msg.style.color = "var(--muted)";
  }

  try {
    const counts = await loadAllCSVData();
    populateDatalists();
    renderFoodPresets();
    renderGuildFoodPresets();
    renderRegistletPresets();
    renderBossPresets();
    renderAvatarPresets();
    renderItemBuffPresets();
    renderPassivePresets();
    renderActivePresets();
    renderTraitPresets();
    renderWeaponPresetOptions();
    renderBodyPresetOptions();

    if (badges.sub)     { badges.sub.textContent     = `サブ: ${counts.subCount}`;  badges.sub.className     = "csv-badge loaded"; }
    if (badges.add)     { badges.add.textContent     = `追加: ${counts.addCount}`;  badges.add.className     = "csv-badge loaded"; }
    if (badges.spec)    { badges.spec.textContent    = `特殊: ${counts.specCount}`; badges.spec.className    = "csv-badge loaded"; }
    if (badges.crys)    { badges.crys.textContent    = `◇: ${counts.crystaCount}`; badges.crys.className    = "csv-badge loaded"; }
    if (badges.food)    { badges.food.textContent    = `料理: ${counts.foodCount}`; badges.food.className    = "csv-badge loaded"; }
    if (badges.reg)     { badges.reg.textContent     = `レジスタレット: ${counts.registletCount}`; badges.reg.className = "csv-badge loaded"; }
    if (badges.boss)    { badges.boss.textContent    = `ボス: ${counts.bossCount}`; badges.boss.className    = "csv-badge loaded"; }
    if (badges.avatar)  { badges.avatar.textContent  = `おしゃれ: ${counts.avatarCount}`; badges.avatar.className = "csv-badge loaded"; }
    if (badges.item)    { badges.item.textContent    = `アイテム: ${counts.itemBuffCount}`; badges.item.className = "csv-badge loaded"; }
    if (badges.passive) { badges.passive.textContent = `パッシブ: ${counts.passiveCount}`; badges.passive.className = "csv-badge loaded"; }
    if (badges.active)  { badges.active.textContent  = `バフ: ${counts.activeCount}`; badges.active.className = "csv-badge loaded"; }
    if (badges.trait)   { badges.trait.textContent   = `特性: ${counts.traitCount}`; badges.trait.className = "csv-badge loaded"; }

    if (msg) {
      msg.innerText = "データ読み込み完了";
      msg.style.color = "var(--success)";
    }
  } catch (err) {
    console.error(err);
    Object.values(badges).forEach(b => { if (b) b.className = "csv-badge error"; });
    if (msg) {
      msg.innerText = `エラー: ${err.message}`;
      msg.style.color = "var(--danger)";
    }
  }
}

// クリスタ表示用HTMLヘルパー
function renderCrystaChips(crystaNames, slotCount) {
  if (slotCount <= 0) {
    return `<div class="crysta-chips"><span class="crysta-chip empty">スロットなし</span></div>`;
  }
  const chips = [];
  for (let i = 0; i < slotCount; i++) {
    const name = crystaNames && crystaNames[i] ? crystaNames[i] : "なし";
    const isEmpty = name === "なし";
    chips.push(`<span class="crysta-chip${isEmpty ? " empty" : ""}">Slot ${i + 1}: ${name}</span>`);
  }
  return `<div class="crysta-chips">${chips.join("")}</div>`;
}

// 探索結果の描画
function renderResults(payload, slots, customEquip, c, baseSources) {
  const { top, rankings, checked, elapsedMs } = payload;
  const resultsArea = document.getElementById("results-area");

  if (!top || top.exp <= 0) {
    const reqAspd = v("req-aspd");
    const msg = reqAspd > 0
      ? `行動速度${reqAspd}%を満たす装備の組み合わせが見つかりませんでした。<br><span style="font-size:0.85rem; color:var(--text);">速度バフ（神速の捌手・テラスピードポーション・体装備軽量化等）を追加するか、「行動速度目標」を「無視する(火力優先)」に変更してください。</span>`
      : `条件を満たすビルドが見つかりません。`;
    resultsArea.innerHTML = `<div class="result-card" style="border-color:var(--danger); color:var(--danger);">${msg}</div>`;
    return;
  }

  const mainTitle = customEquip.mainName
    ? `${customEquip.mainName} <span style="font-size:0.78rem; color:var(--muted); font-weight:400;">(ATK ${v("w-atk")} / +${v("w-ref")})</span>`
    : `基礎ATK ${v("w-atk")} / +${v("w-ref")}`;

  const bodyTitle = customEquip.bodyName
    ? `${customEquip.bodyName} <span style="font-size:0.78rem; color:var(--muted); font-weight:400;">(DEF ${v("b-def")} / +${v("b-ref")})</span>`
    : `基礎DEF ${v("b-def")} / +${v("b-ref")}`;

  const runnerUpsHtml = rankings && rankings.length > 1 ? `
    <details style="margin-top: 12px; background: var(--bg);">
      <summary>上位候補ビルド (#2 〜 #${rankings.length})</summary>
      <div class="panel-body ranking-list">
        ${rankings.slice(1).map((b, idx) => `
          <div class="ranking-item">
            <div class="ranking-item-head">
              <span>#${idx + 2} 期待値: ${b.exp.toLocaleString()}</span>
              <span style="color:var(--muted); font-weight:400;">クリダメ: ${b.min.toLocaleString()} 〜 ${b.max.toLocaleString()} (行動速度: ${b.aspd}%)</span>
            </div>
            <div>
              <b>サブ:</b> ${b.sub || "なし"} ／ <b>追加:</b> ${b.add} (${b.addCrysta.join(", ") || "なし"}) ／ <b>特殊:</b> ${b.spec} (${b.specCrysta.join(", ") || "なし"})<br>
              <b>武器◇:</b> ${b.mainCrysta.join(", ") || "なし"} ／ <b>体◇:</b> ${b.bodyCrysta.join(", ") || "なし"}
            </div>
          </div>
        `).join("")}
      </div>
    </details>
  ` : "";

  resultsArea.innerHTML = `
    <div class="result-card">
      <div class="result-header">
        <div>
          <h3 class="result-exp">期待値: ${top.exp.toLocaleString()}</h3>
          <p class="result-sub-dmg">クリティカルダメージ: <b>${top.min.toLocaleString()}</b> 〜 <b>${top.max.toLocaleString()}</b></p>
        </div>
        <div class="result-meta">
          <div>${checked.toLocaleString()} 通り (${elapsedMs} ms)</div>
        </div>
      </div>

      <div class="build-grid">
        <div class="equip-slot-card">
          <div class="equip-slot-label">メイン武器 (${s("w-type") === "片手剣" && s("sub-type") === "片手剣" ? "双剣" : s("w-type")})</div>
          <div class="equip-slot-name">${mainTitle}</div>
          ${renderCrystaChips(top.mainCrysta, slots.main)}
        </div>

        <div class="equip-slot-card">
          <div class="equip-slot-label">サブ武器 (${s("sub-type")})</div>
          <div class="equip-slot-name">${top.sub || "なし"}</div>
          <div class="crysta-chips"><span class="crysta-chip empty">-</span></div>
        </div>

        <div class="equip-slot-card">
          <div class="equip-slot-label">体装備 (${s("b-type")})</div>
          <div class="equip-slot-name">${bodyTitle}</div>
          ${renderCrystaChips(top.bodyCrysta, slots.body)}
        </div>

        <div class="equip-slot-card">
          <div class="equip-slot-label">追加装備</div>
          <div class="equip-slot-name">${top.add}</div>
          ${renderCrystaChips(top.addCrysta, slots.add)}
        </div>

        <div class="equip-slot-card">
          <div class="equip-slot-label">特殊装備</div>
          <div class="equip-slot-name">${top.spec}</div>
          ${renderCrystaChips(top.specCrysta, slots.spec)}
        </div>
      </div>

      <div class="stat-pills">
        <span class="stat-pill">ATK: <b>${top.fAtk.toLocaleString()}</b></span>
        <span class="stat-pill">MATK: <b>${top.fMatk.toLocaleString()}</b></span>
        <span class="stat-pill">武器属性: <b>${top.weaponAttr}</b></span>
        <span class="stat-pill">行動速度: <b>${top.aspd}%</b> (ASPD ${top.tAspd})</span>
        <span class="stat-pill">クリティカル率: <b>${top.fCr}%</b></span>
        <span class="stat-pill">クリティカルダメージ: <b>${top.fCd}%</b></span>
        <span class="stat-pill">安定率: <b>${top.stab}%</b></span>
        <span class="stat-pill">貫通: <b>${top.pierce}%</b></span>
        <span class="stat-pill">属性補正合計: <b>+${top.elemP}%</b></span>
      </div>

      <details class="stat-detail-section" open>
        <summary>#1 最終ステータス詳細（項目をクリックで内訳表示）</summary>
        <div class="panel-body" id="top-detailed-stats-body"></div>
      </details>

      ${runnerUpsHtml}
    </div>
  `;

  if (c && baseSources) {
    renderDetailedStatsPanel(c, top, baseSources);
  }
}

function buildDetailedStatusReport(c, top, baseSources) {
  const eq = top.equipSources || {};
  const allSources = [
    ...baseSources,
    { name: `メイン武器クリスタ (${eq.mainCrysta?.label || "なし"})`, p: eq.mainCrysta?.p || {} },
    { name: `サブ武器 (${eq.sub?.name || top.sub || "なし"})`, p: eq.sub?.p || {} },
    { name: `体装備クリスタ (${eq.bodyCrysta?.label || "なし"})`, p: eq.bodyCrysta?.p || {} },
    { name: `追加装備 (${eq.add?.name || top.add || "-"})`, p: eq.add?.p || {} },
    { name: `追加装備クリスタ (${eq.addCrysta?.label || "なし"})`, p: eq.addCrysta?.p || {} },
    { name: `特殊装備 (${eq.spec?.name || top.spec || "-"})`, p: eq.spec?.p || {} },
    { name: `特殊装備クリスタ (${eq.specCrysta?.label || "なし"})`, p: eq.specCrysta?.p || {} }
  ];

  const sumV = (key) => {
    let total = 0;
    allSources.forEach(src => {
      const val = src.p?.[key];
      if (typeof val === "number") total += val;
    });
    return total;
  };

  const collectSources = (keys, extraRows = []) => {
    const rows = [...extraRows];
    allSources.forEach(src => {
      const parts = [];
      keys.forEach(k => {
        const val = src.p?.[k];
        if (typeof val === "number" && val !== 0) {
          parts.push(formatEffectLabel(k, val));
        } else if (typeof val === "string" && val !== "") {
          parts.push(`${k}: ${val}`);
        }
      });
      if (parts.length > 0) {
        rows.push({ sourceName: src.name, detail: parts.join(" / ") });
      }
    });
    return rows;
  };

  const T_STR = Math.floor(c.str * (1 + sumV("STR+〇%") / 100)) + sumV("STR+〇");
  const T_DEX = Math.floor(c.dex * (1 + sumV("DEX+〇%") / 100)) + sumV("DEX+〇");
  const T_INT = Math.floor(c.int * (1 + sumV("INT+〇%") / 100)) + sumV("INT+〇");
  const T_AGI = Math.floor(c.agi * (1 + sumV("AGI+〇%") / 100)) + sumV("AGI+〇");
  const T_VIT = Math.floor(c.vit * (1 + sumV("VIT+〇%") / 100)) + sumV("VIT+〇");

  const maxHP = Math.floor(Math.floor(93 + (T_VIT + 22.41) * c.lv / 3) * (1 + sumV("最大HP+〇%") / 100)) + sumV("最大HP+〇");
  const maxMP = Math.floor(Math.floor(c.lv + 99 + c.tec + T_INT / 10) * (1 + sumV("最大MP+〇%") / 100)) + sumV("最大MP+〇");
  const ampr = Math.floor(Math.floor(10 + maxMP / 100) * (1 + sumV("攻撃MP回復+〇%") / 100)) + sumV("攻撃MP回復+〇");

  const subP = eq.sub?.p || {};
  let wAtkBase = c.wt === "手甲" ? Math.floor(c.watk * (1 + Math.min(50, 5 * c.knLv) / 100)) : c.watk;
  if (c.wt === "弓" && c.subType === "矢") wAtkBase += (subP["武器ATK"] || 0);
  if (c.wt === "自動弓" && c.subType === "矢") wAtkBase += Math.floor((subP["武器ATK"] || 0) / 2);
  const tWAtk = Math.floor(wAtkBase * (1 + (c.wref * c.wref) / 100) + c.wref) + Math.floor(wAtkBase * sumV("武器ATK+〇%") / 100) + sumV("武器ATK+〇");

  const wd = (typeof W_DATA !== "undefined" && W_DATA[c.wt]) ? W_DATA[c.wt] : { stab: { s: 0, d: 0, a: 0 } };
  let wStabBase = c.wstab;
  if (c.wt === "弓" && c.subType === "矢") wStabBase += (subP["安定率"] || 0);
  if (c.wt === "自動弓" && c.subType === "矢") wStabBase += Math.floor((subP["安定率"] || 0) / 2);
  const sStab = T_STR * wd.stab.s + T_DEX * wd.stab.d + T_AGI * wd.stab.a;
  const pStab = Math.max(0, Math.min(100, Math.floor(wStabBase + sStab) + sumV("安定率+〇%")));
  const mStabMin = Math.max(0, Math.min(90, Math.floor((pStab + 100) / 2)));
  const mStabMax = Math.max(100, Math.min(110, 100 + Math.floor((pStab - 80) / 2)));

  const pHit = Math.floor((c.lv + T_DEX) * (1 + sumV("命中+〇%") / 100)) + sumV("命中+〇");
  const rawPCr = Math.floor(Math.floor(25 + c.crt / 3.4) * (1 + sumV("クリティカル率+〇%") / 100)) + sumV("クリティカル率+〇");
  const pCr = c.wt === "双剣" ? Math.floor(rawPCr * 0.4) : rawPCr;

  let pCd = Math.floor((150 + Math.max(T_STR / 5, (T_STR + T_AGI) / 10)) * (1 + sumV("クリティカルダメージ+〇%") / 100)) + sumV("クリティカルダメージ+〇");
  if (pCd > 300) pCd = 300 + Math.floor((pCd - 300) / 2);

  let mCr = 0;
  if (c.eWeak) mCr += Math.floor(pCr / 2);
  mCr += Math.floor(pCr * c.sbLv / 40);
  if ((top.weaponAttr || "無") === "無") mCr += Math.floor(pCr / 4);
  const mCd = Math.floor(100 + (pCd - 100) * (20 + c.sbLv) / 40);

  const tCspd = Math.floor(Math.floor(c.lv + T_DEX * 2.94 + T_AGI * 1.16) * (1 + sumV("詠唱速度+〇%") / 100)) + sumV("詠唱速度+〇");
  const physPierce = Math.min(100, sumV("物理貫通+〇%"));
  const magPierce = Math.min(100, sumV("魔法貫通+〇%"));
  const shortDmg = sumV("近距離の威力+〇%");
  const longDmg = sumV("遠距離の威力+〇%");
  const unshFlat = sumV("抜刀攻撃+〇");
  const unshPct = sumV("抜刀攻撃+〇%");

  const elemList = ["火", "水", "風", "地", "光", "闇", "無"];
  const commonElemAdv = sumV("属性有利+〇%");
  const elemSummary = elemList.map(el => `${el}+${commonElemAdv + sumV(`${el}属性にダメージ+〇%`)}%`).join(" / ");

  return [
    {
      id: "base-stats",
      wide: true,
      label: "補正後ステータス",
      valueText: `STR ${T_STR} / DEX ${T_DEX} / INT ${T_INT} / AGI ${T_AGI} / VIT ${T_VIT} (CRT ${c.crt} / TEC ${c.tec} / MEN ${c.men} / LUK ${c.luk})`,
      note: "基礎値 × (1 + %) + 固定値",
      rows: collectSources(
        ["STR+〇", "STR+〇%", "DEX+〇", "DEX+〇%", "INT+〇", "INT+〇%", "AGI+〇", "AGI+〇%", "VIT+〇", "VIT+〇%"],
        [{ sourceName: "基礎ステータス", detail: `STR ${c.str} / DEX ${c.dex} / INT ${c.int} / AGI ${c.agi} / VIT ${c.vit}` }]
      )
    },
    {
      id: "hp",
      label: "HP",
      valueText: maxHP.toLocaleString(),
      note: `基礎 ${Math.floor(93 + (T_VIT + 22.41) * c.lv / 3).toLocaleString()} / HP+${sumV("最大HP+〇%")}% / +${sumV("最大HP+〇")}`,
      rows: collectSources(
        ["最大HP+〇%", "最大HP+〇", "VIT+〇%", "VIT+〇"],
        [{ sourceName: "基礎計算 (Lv & 補正後VIT)", detail: `${Math.floor(93 + (T_VIT + 22.41) * c.lv / 3).toLocaleString()}` }]
      )
    },
    {
      id: "mp",
      label: "MP",
      valueText: maxMP.toLocaleString(),
      note: `基礎 ${Math.floor(c.lv + 99 + c.tec + T_INT / 10).toLocaleString()} / MP+${sumV("最大MP+〇%")}% / +${sumV("最大MP+〇")}`,
      rows: collectSources(
        ["最大MP+〇%", "最大MP+〇", "INT+〇%", "INT+〇"],
        [{ sourceName: "基礎計算 (Lv & TEC & 補正後INT)", detail: `${Math.floor(c.lv + 99 + c.tec + T_INT / 10).toLocaleString()}` }]
      )
    },
    {
      id: "ampr",
      label: "攻撃MP回復",
      valueText: String(ampr),
      note: `基礎 ${Math.floor(10 + maxMP / 100)} / +${sumV("攻撃MP回復+〇%")}% / +${sumV("攻撃MP回復+〇")}`,
      rows: collectSources(
        ["攻撃MP回復+〇%", "攻撃MP回復+〇", "最大MP+〇%", "最大MP+〇"],
        [{ sourceName: "基礎計算 (10 + 最大MP/100)", detail: `${Math.floor(10 + maxMP / 100)}` }]
      )
    },
    {
      id: "watk",
      label: "武器ATK",
      valueText: tWAtk.toLocaleString(),
      note: `基礎 ${wAtkBase} / 精錬+${c.wref} / +${sumV("武器ATK+〇%")}% / +${sumV("武器ATK+〇")}`,
      rows: collectSources(
        ["武器ATK+〇%", "武器ATK+〇", "武器ATK", "サブ武器ATK"],
        [{ sourceName: "メイン武器基礎ATK・精錬", detail: `基礎 ${c.watk} / 精錬 +${c.wref}` }]
      )
    },
    {
      id: "stab",
      label: "安定率",
      valueText: c.isMag ? `${pStab}% (魔法 ${mStabMin}〜${mStabMax}%)` : `${pStab}%`,
      note: `武器基礎 ${c.wstab}% + ステータス由来 ${sStab.toFixed(1)}% / プロパ +${sumV("安定率+〇%")}%`,
      rows: collectSources(
        ["安定率+〇%", "安定率", "サブ武器安定率", "STR+〇%", "STR+〇", "DEX+〇%", "DEX+〇", "AGI+〇%", "AGI+〇"],
        [
          { sourceName: "メイン武器安定率", detail: `${c.wstab}%` },
          { sourceName: "ステータス由来安定率", detail: `+${sStab.toFixed(1)}% (武器+ステ合計切り捨て後: ${Math.floor(wStabBase + sStab)}%)` }
        ]
      )
    },
    {
      id: "atk",
      label: "ATK",
      valueText: top.fAtk.toLocaleString(),
      note: `総武器ATK ${tWAtk} / ATK+${sumV("ATK+〇%")}% / +${sumV("ATK+〇")}`,
      rows: collectSources(
        ["ATK+〇%", "ATK+〇", "武器ATK+〇%", "武器ATK+〇", "STR+〇%", "STR+〇", "DEX+〇%", "DEX+〇", "AGI+〇%", "AGI+〇", "INT+〇%", "INT+〇"],
        [{ sourceName: "基礎 (Lv + 総武器ATK + ステータスATK)", detail: `Lv ${c.lv} + 総武器ATK ${tWAtk}` }]
      )
    },
    {
      id: "phys-pierce",
      label: "物理貫通",
      valueText: `${physPierce}%`,
      note: `合計 ${sumV("物理貫通+〇%")}% (上限100%)`,
      rows: collectSources(["物理貫通+〇%"])
    },
    {
      id: "matk",
      label: "MATK",
      valueText: top.fMatk.toLocaleString(),
      note: `MATK+${sumV("MATK+〇%")}% / +${sumV("MATK+〇")}`,
      rows: collectSources(
        ["MATK+〇%", "MATK+〇", "武器ATK+〇%", "武器ATK+〇", "INT+〇%", "INT+〇", "DEX+〇%", "DEX+〇", "STR+〇%", "STR+〇"],
        [{ sourceName: "基礎Lv / 武器MATK / ステータスMATK", detail: `Lv ${c.lv}` }]
      )
    },
    {
      id: "mag-pierce",
      label: "魔法貫通",
      valueText: `${magPierce}%`,
      note: `合計 ${sumV("魔法貫通+〇%")}% (上限100%)`,
      rows: collectSources(["魔法貫通+〇%"])
    },
    {
      id: "hit",
      label: "命中",
      valueText: pHit.toLocaleString(),
      note: `基礎 ${c.lv + T_DEX} / 命中+${sumV("命中+〇%")}% / +${sumV("命中+〇")} / 絶対命中+${sumV("絶対命中+〇%")}%`,
      rows: collectSources(
        ["命中+〇%", "命中+〇", "絶対命中+〇%", "DEX+〇%", "DEX+〇"],
        [{ sourceName: "基礎計算 (Lv + 補正後DEX)", detail: `${c.lv + T_DEX}` }]
      )
    },
    {
      id: "pcr",
      label: "物理クリティカル率",
      valueText: `${pCr}`,
      note: c.wt === "双剣" ? `双剣-60%適用 (適用前 ${rawPCr})` : `基礎 ${Math.floor(25 + c.crt / 3.4)} / +${sumV("クリティカル率+〇%")}% / +${sumV("クリティカル率+〇")}`,
      rows: collectSources(
        ["クリティカル率+〇%", "クリティカル率+〇"],
        [{ sourceName: "基礎 (25 + CRT/3.4)", detail: `${Math.floor(25 + c.crt / 3.4)}` }]
      )
    },
    {
      id: "pcd",
      label: "物理クリティカルダメージ",
      valueText: `${pCd}%`,
      note: `基礎 ${Math.floor(150 + Math.max(T_STR / 5, (T_STR + T_AGI) / 10))}% / +${sumV("クリティカルダメージ+〇%")}% / +${sumV("クリティカルダメージ+〇")}`,
      rows: collectSources(
        ["クリティカルダメージ+〇%", "クリティカルダメージ+〇", "STR+〇%", "STR+〇", "AGI+〇%", "AGI+〇"],
        [{ sourceName: "基礎計算 (150 + 補正後STR/AGI依存)", detail: `${Math.floor(150 + Math.max(T_STR / 5, (T_STR + T_AGI) / 10))}%` }]
      )
    },
    {
      id: "mcr",
      label: "魔法クリティカル率",
      valueText: `${mCr}`,
      note: `衰弱弱点 ${c.eWeak ? Math.floor(pCr / 2) : 0} + スペルバースト(${c.sbLv}) ${Math.floor(pCr * c.sbLv / 40)} + 無属性 ${(top.weaponAttr || "無") === "無" ? Math.floor(pCr / 4) : 0}`,
      rows: collectSources(
        ["クリティカル率+〇%", "クリティカル率+〇"],
        [
          { sourceName: "物理クリティカル率", detail: `${pCr}` },
          { sourceName: "スペルバースト / 衰弱 / 無属性補正", detail: `+${mCr}` }
        ]
      )
    },
    {
      id: "mcd",
      label: "魔法クリティカルダメージ",
      valueText: `${mCd}%`,
      note: `100 + (物理CD ${pCd}% - 100) × (20 + SB ${c.sbLv}) / 40`,
      rows: collectSources(
        ["クリティカルダメージ+〇%", "クリティカルダメージ+〇"],
        [{ sourceName: "物理CDからの変換", detail: `物理CD ${pCd}% → 魔法CD ${mCd}%` }]
      )
    },
    {
      id: "aspd",
      label: "攻撃速度",
      valueText: top.tAspd.toLocaleString(),
      note: `ASPD+${sumV("攻撃速度+〇%")}% / +${sumV("攻撃速度+〇")} / 体:${c.bt} / サブ:${c.subType}`,
      rows: collectSources(
        ["攻撃速度+〇%", "攻撃速度+〇", "AGI+〇%", "AGI+〇", "DEX+〇%", "DEX+〇", "STR+〇%", "STR+〇"],
        [{ sourceName: "装甲/サブ補正", detail: `体:${c.bt} / サブ:${c.subType}` }]
      )
    },
    {
      id: "action-speed",
      label: "行動速度",
      valueText: `${top.aspd}%`,
      note: `ASPD由来 ${Math.max(0, Math.floor((top.tAspd - 1000) / 180))}% + 行動速度+${sumV("行動速度+〇%")}% (上限50%)`,
      rows: collectSources(
        ["行動速度+〇%", "攻撃速度+〇%", "攻撃速度+〇"],
        [{ sourceName: "ASPD (${top.tAspd}) 由来", detail: `+${Math.max(0, Math.floor((top.tAspd - 1000) / 180))}%` }]
      )
    },
    {
      id: "cspd",
      label: "詠唱速度",
      valueText: tCspd.toLocaleString(),
      note: `基礎 ${Math.floor(c.lv + T_DEX * 2.94 + T_AGI * 1.16)} / +${sumV("詠唱速度+〇%")}% / +${sumV("詠唱速度+〇")}`,
      rows: collectSources(
        ["詠唱速度+〇%", "詠唱速度+〇", "DEX+〇%", "DEX+〇", "AGI+〇%", "AGI+〇"],
        [{ sourceName: "基礎計算 (Lv + DEX×2.94 + AGI×1.16)", detail: `${Math.floor(c.lv + T_DEX * 2.94 + T_AGI * 1.16)}` }]
      )
    },
    {
      id: "short-dmg",
      label: "近距離の威力",
      valueText: `${shortDmg >= 0 ? "+" : ""}${shortDmg}%`,
      note: "7m以下で適用",
      rows: collectSources(["近距離の威力+〇%"])
    },
    {
      id: "long-dmg",
      label: "遠距離の威力",
      valueText: `${longDmg >= 0 ? "+" : ""}${longDmg}%`,
      note: "8m以上で適用",
      rows: collectSources(["遠距離の威力+〇%"])
    },
    {
      id: "unsh-flat",
      label: "抜刀攻撃の威力補正",
      valueText: `${unshFlat >= 0 ? "+" : ""}${unshFlat}`,
      note: "抜刀判定あり時に加算",
      rows: collectSources(["抜刀攻撃+〇"])
    },
    {
      id: "unsh-pct",
      label: "抜刀攻撃の威力倍率",
      valueText: `${unshPct >= 0 ? "+" : ""}${unshPct}%`,
      note: "抜刀判定あり時に乗算",
      rows: collectSources(["抜刀攻撃+〇%"])
    },
    {
      id: "elem-adv",
      wide: true,
      label: "各属性有利",
      valueText: elemSummary,
      note: `対${c.eElem}属性の実適用補正合計: +${top.elemP}%`,
      rows: collectSources([
        "属性有利+〇%", "火属性にダメージ+〇%", "水属性にダメージ+〇%",
        "風属性にダメージ+〇%", "地属性にダメージ+〇%", "光属性にダメージ+〇%",
        "闇属性にダメージ+〇%", "無属性にダメージ+〇%", "メイン武器の属性", "サブ武器の属性"
      ])
    }
  ];
}

function renderDetailedStatsPanel(c, top, baseSources) {
  const container = document.getElementById("top-detailed-stats-body");
  if (!container) return;

  const items = buildDetailedStatusReport(c, top, baseSources);
  let selectedId = items[0]?.id || "atk";

  const draw = () => {
    const activeItem = items.find(it => it.id === selectedId) || items[0];
    const rowsHtml = activeItem.rows.length > 0
      ? activeItem.rows.map(r => `
          <div class="stat-breakdown-row">
            <span class="stat-breakdown-src">${r.sourceName}</span>
            <span class="stat-breakdown-effect">${r.detail}</span>
          </div>
        `).join("")
      : `<div style="font-size:0.8rem; color:var(--muted); padding:4px 0;">該当する装備・バフからの補正はありません。</div>`;

    container.innerHTML = `
      <div class="stat-detail-grid">
        ${items.map(it => `
          <button type="button" class="stat-detail-item${it.wide ? " wide" : ""}${it.id === selectedId ? " active" : ""}" data-stat-id="${it.id}">
            <div class="stat-detail-label">${it.label}</div>
            <div class="stat-detail-val">${it.valueText}</div>
          </button>
        `).join("")}
      </div>
      <div class="stat-breakdown-box">
        <div class="stat-breakdown-head">
          <div class="stat-breakdown-title">${activeItem.label} の内訳（合計: ${activeItem.valueText}）</div>
          <div class="stat-breakdown-note">${activeItem.note}</div>
        </div>
        <div class="stat-breakdown-list">${rowsHtml}</div>
      </div>
    `;

    container.querySelectorAll(".stat-detail-item").forEach(btn => {
      btn.addEventListener("click", () => {
        selectedId = btn.dataset.statId;
        draw();
      });
    });
  };

  draw();
}

// プロパティ辞書へのマージヘルパー
function mergeIntoBaseP(target, src) {
  if (!src) return;
  for (const k in src) {
    if (typeof src[k] === "number") {
      target[k] = (target[k] || 0) + src[k];
    } else if (src[k] !== "") {
      target[k] = src[k];
    }
  }
}

// 最強ビルド計算開始（Web Worker実行）
function startCalculation() {
  const customEquip = {
    mainName: s("custom-name-main"),
    bodyName: s("custom-name-body"),
    sub: getManualEquipState("sub"),
    add: getManualEquipState("add"),
    spec: getManualEquipState("spec")
  };

  if ((!customEquip.add.active && DB.add.length === 0) || (!customEquip.spec.active && DB.spec.length === 0)) {
    alert("データがまだ読み込まれていません。");
    return;
  }

  const isMag = s("sk-type") === "mag";
  const rawWType = s("w-type");
  const rawSubType = s("sub-type");
  const effectiveWType = (rawWType === "片手剣" && rawSubType === "片手剣") ? "双剣" : rawWType;
  const c = {
    lv: v("p-lv"), str: v("p-str"), dex: v("p-dex"), int: v("p-int"), agi: v("p-agi"),
    vit: v("p-vit"), crt: v("p-crt"), tec: v("p-tec"), men: v("p-men"), luk: v("p-luk"),
    wt: effectiveWType, watk: v("w-atk"), wref: v("w-ref"), wstab: v("w-stab"),
    subType: rawSubType, subRef: v("sub-ref"), subAtk: v("sub-atk"), subStab: v("sub-stab"), subElem: s("sub-elem"),
    bt: s("b-type"), bref: v("b-ref"),
    refSk: s("sk-ref"), isMag, mult: v("sk-mult"), flat: v("sk-flat"),
    unsh: v("sk-unsh") === 1, dist: s("sk-dist"),
    combo: v("sk-combo"), pror: v("sk-proration"), skMp: v("sk-mp"), sbLv: v("slv-spellb"), knLv: v("slv-knuckle"),
    eLv: v("e-lv"), eDef: v("e-def"), eMdef: v("e-mdef"), eFlee: v("e-flee"),
    eRes: isMag ? v("e-mres") : v("e-pres"),
    eWres: v("e-wres"), eCres: v("e-cres"),
    eElem: s("e-elem"), eBrk: v("e-break") === 1, eNight: v("e-nightmare"),
    eWeak: v("e-weaken") === 1, reqAspd: v("req-aspd")
  };

  const buffContainers = [
    { id: "prop-main", label: customEquip.mainName ? `メイン武器 (${customEquip.mainName})` : "メイン武器プロパティ" },
    { id: "prop-body", label: customEquip.bodyName ? `体装備 (${customEquip.bodyName})` : "体装備プロパティ" },
    { id: "prop-food", label: "料理 (手入力)" },
    { id: "prop-guild", label: "ギルド飯 (手入力)" },
    { id: "prop-registlet", label: "レジスタレット (手入力)" },
    { id: "prop-avatar", label: "おしゃれ装備 (手入力)" },
    { id: "prop-item", label: "アイテムバフ (手入力)" },
    { id: "prop-passive", label: "パッシブスキル (手入力)" },
    { id: "prop-active", label: "バフスキル (手入力)" },
    { id: "prop-area", label: "エリアバフ" }
  ];
  const baseP = {};
  const baseSources = [];
  buffContainers.forEach(({ id, label }) => {
    const p = getPropSum(id);
    mergeIntoBaseP(baseP, p);
    if (Object.keys(p).length > 0) baseSources.push({ name: label, p });
  });

  const presetSources = [
    { name: "料理", p: getFoodPresetSum() },
    { name: "ギルド飯", p: getGuildFoodPresetSum() },
    { name: "レジスタレット", p: getRegistletPresetSum() },
    { name: "おしゃれ装備", p: getAvatarPresetSum() },
    { name: "アイテムバフ", p: getItemBuffPresetSum() },
    { name: "パッシブスキル", p: getPassivePresetSum() },
    { name: "バフスキル", p: getActivePresetSum() },
    { name: "特性", p: getTraitPresetSum() }
  ];
  presetSources.forEach(src => {
    mergeIntoBaseP(baseP, src.p);
    if (Object.keys(src.p || {}).length > 0) baseSources.push(src);
  });

  const slots = {
    main: v("slot-main"),
    body: v("slot-body"),
    add:  v("slot-add"),
    spec: v("slot-spec")
  };

  const fixed = {
    sub: "",
    add: "",
    spec: "",
    mainC1: s("fix-main-c1"),
    mainC2: s("fix-main-c2"),
    bodyC1: s("fix-body-c1"),
    bodyC2: s("fix-body-c2"),
    addC1:  s("fix-add-c1"),
    addC2:  s("fix-add-c2"),
    specC1: s("fix-spec-c1"),
    specC2: s("fix-spec-c2")
  };

  if (searchWorker) {
    searchWorker.terminate();
  }
  searchWorker = new Worker("js/worker.js");

  const btnCalc = document.getElementById("btn-calc");
  const progBox = document.getElementById("worker-progress");
  const progBar = document.getElementById("progress-bar");
  const progText = document.getElementById("progress-text");
  const progBest = document.getElementById("progress-best");

  btnCalc.disabled = true;
  btnCalc.innerHTML = `<span class="btn-spinner" aria-hidden="true"></span><span>計算中...</span>`;
  progBox.classList.add("active");
  progBar.style.width = "4%";
  progText.textContent = "探索中...";
  progBest.textContent = "";

  searchWorker.onmessage = (e) => {
    const data = e.data;
    if (data.type === "progress") {
      progBar.style.width = `${data.percent}%`;
      progText.textContent = `${data.phase || "探索中"} (${data.percent}%)`;
      const btnLabel = btnCalc.querySelector("span:last-child");
      if (btnLabel) btnLabel.textContent = `計算中... (${data.percent}%)`;
      if (data.bestExp > 0) {
        progBest.textContent = `期待値: ${data.bestExp.toLocaleString()}`;
      }
    } else if (data.type === "error") {
      btnCalc.disabled = false;
      btnCalc.textContent = "計算する";
      progBox.classList.remove("active");
      document.getElementById("results-area").innerHTML = `
        <div class="result-card" style="border-color:var(--danger); color:var(--danger);">${data.message}</div>
      `;
    } else if (data.type === "done") {
      btnCalc.disabled = false;
      btnCalc.textContent = "計算する";
      progBar.style.width = "100%";
      setTimeout(() => progBox.classList.remove("active"), 250);
      renderResults(data, slots, customEquip, c, baseSources);
    }
  };

  searchWorker.onerror = (err) => {
    console.error("Worker error:", err);
    btnCalc.disabled = false;
    btnCalc.textContent = "計算する";
    progBox.classList.remove("active");
    document.getElementById("results-area").innerHTML = `
      <div class="result-card" style="border-color:var(--danger); color:var(--danger);">Web Worker実行中にエラーが発生しました: ${err.message || "不明なエラー"}</div>
    `;
  };

  const excludeImpracticalCrysta = Boolean(document.getElementById("exclude-impractical-crysta")?.checked);
  searchWorker.postMessage({ c, baseP, db: DB, fixed, slots, customEquip, excludeImpracticalCrysta });
}

// 初期化
window.addEventListener("DOMContentLoaded", () => {
  // 初期プロパティ入力行の配置（メイン武器・体装備のみ初期2行）
  addPropRow("prop-main");
  addPropRow("prop-main");
  addPropRow("prop-body");
  addPropRow("prop-body");

  // 手入力装備名欄の入力イベント登録
  ["custom-name-sub", "custom-name-add", "custom-name-spec"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("input", syncManualEquipStatus);
  });
  syncManualEquipStatus();

  // メイン武器・サブ武器・プレイヤーLvの連動イベント登録
  const wTypeEl = document.getElementById("w-type");
  if (wTypeEl) {
    wTypeEl.addEventListener("change", () => {
      applyMainWeaponDefaultStats();
      syncSubWeaponOptions();
    });
  }
  const subTypeEl = document.getElementById("sub-type");
  if (subTypeEl) {
    subTypeEl.addEventListener("change", syncSubWeaponOptions);
  }
  const subElemEl = document.getElementById("sub-elem");
  if (subElemEl) {
    subElemEl.addEventListener("change", syncSubElemToPropSub);
  }
  const bindSearchPreset = (inputId, dropdownId, clearBtnId, storeKey, onApply, onClear) => {
    const el = document.getElementById(inputId);
    const dd = document.getElementById(dropdownId);
    const btn = document.getElementById(clearBtnId);
    if (!el || !dd) return;

    const renderList = (query) => {
      const options = PRESET_OPTION_STORE[storeKey] || [];
      const terms = (query || "").trim().toLowerCase().split(/\s+/).filter(Boolean);
      const filtered = terms.length === 0
        ? options
        : options.filter(opt => {
            const hay = `${opt.value} ${opt.badge}`.toLowerCase();
            return terms.every(t => hay.includes(t));
          });

      if (filtered.length === 0) {
        dd.innerHTML = `<div class="searchable-empty">該当する候補がありません</div>`;
      } else {
        dd.innerHTML = filtered.slice(0, 80).map(opt => {
          const badgeHtml = opt.badge
            ? `<span class="searchable-option-badge${opt.isRec ? "" : " sub"}">${opt.badge}</span>`
            : "";
          return `<button type="button" class="searchable-option" data-val="${opt.value.replace(/"/g, "&quot;")}"><span>${opt.value}</span>${badgeHtml}</button>`;
        }).join("");

        dd.querySelectorAll(".searchable-option").forEach(optBtn => {
          optBtn.addEventListener("mousedown", (e) => {
            e.preventDefault();
            const val = optBtn.getAttribute("data-val") || "";
            el.value = val;
            dd.classList.remove("open");
            onApply(val);
          });
        });
      }
      dd.classList.add("open");
    };

    el.addEventListener("focus", () => {
      const options = PRESET_OPTION_STORE[storeKey] || [];
      const isExactSelected = options.some(o => o.value === el.value.trim());
      renderList(isExactSelected ? "" : el.value);
    });

    el.addEventListener("input", () => {
      renderList(el.value);
      if (el.value.trim() === "" && onClear) {
        onClear();
      }
    });

    el.addEventListener("blur", () => {
      setTimeout(() => dd.classList.remove("open"), 120);
    });

    el.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        dd.classList.remove("open");
      } else if (e.key === "Enter") {
        const firstOpt = dd.querySelector(".searchable-option");
        if (dd.classList.contains("open") && firstOpt) {
          e.preventDefault();
          const val = firstOpt.getAttribute("data-val") || "";
          el.value = val;
          dd.classList.remove("open");
          onApply(val);
        }
      }
    });

    if (btn) {
      btn.addEventListener("click", () => {
        el.value = "";
        dd.classList.remove("open");
        if (onClear) onClear();
        el.focus();
      });
    }
  };
  bindSearchPreset("weapon-preset-select", "dropdown-preset-main", "btn-clear-preset-main", "main",
    (val) => applyWeaponPreset(val));
  bindSearchPreset("sub-preset-select", "dropdown-preset-sub", "btn-clear-preset-sub", "sub",
    (val) => applyDBEquipPreset(val, DB.sub, "prop-sub", "custom-name-sub"),
    () => applyDBEquipPreset("", DB.sub, "prop-sub", "custom-name-sub"));
  bindSearchPreset("body-preset-select", "dropdown-preset-body", "btn-clear-preset-body", "body",
    (val) => applyBodyPreset(val));
  bindSearchPreset("add-preset-select", "dropdown-preset-add", "btn-clear-preset-add", "add",
    (val) => applyDBEquipPreset(val, DB.add, "prop-add", "custom-name-add"),
    () => applyDBEquipPreset("", DB.add, "prop-add", "custom-name-add"));
  bindSearchPreset("spec-preset-select", "dropdown-preset-spec", "btn-clear-preset-spec", "spec",
    (val) => applyDBEquipPreset(val, DB.spec, "prop-spec", "custom-name-spec"),
    () => applyDBEquipPreset("", DB.spec, "prop-spec", "custom-name-spec"));
  ["p-lv", "p-str", "p-dex", "sub-ref"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("input", syncPassivePresetsUI);
  });
  ["p-str", "p-int", "p-tec"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("input", syncTraitsUI);
  });
  applyMainWeaponDefaultStats();
  syncSubWeaponOptions();

  // スロット数変更イベントの登録
  ["slot-main", "slot-body", "slot-add", "slot-spec"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("change", syncSlotInputs);
  });
  syncSlotInputs();

  // ボス名前検索・難易度変更イベントの登録
  const bossSelectEl = document.getElementById("boss-select");
  if (bossSelectEl) {
    bossSelectEl.addEventListener("input", () => syncBossDifficultyAndStats(true));
    bossSelectEl.addEventListener("change", () => syncBossDifficultyAndStats(true));
  }
  const btnClearBoss = document.getElementById("btn-clear-boss");
  if (btnClearBoss && bossSelectEl) {
    btnClearBoss.addEventListener("click", () => {
      bossSelectEl.value = "";
      syncBossDifficultyAndStats(true);
      bossSelectEl.focus();
    });
  }
  const bossDiffEl = document.getElementById("boss-diff");
  if (bossDiffEl) {
    bossDiffEl.addEventListener("change", () => syncBossDifficultyAndStats(false));
  }

  // ボタンイベント登録
  const btnLoad = document.getElementById("btn-load");
  if (btnLoad) btnLoad.addEventListener("click", handleLoadCSV);

  const btnCalc = document.getElementById("btn-calc");
  if (btnCalc) btnCalc.addEventListener("click", startCalculation);

  // アプリ起動時に自動的に全CSVをFetch読み込み
  handleLoadCSV();
});
