// Web Worker: 総当たり探索エンジン (サブ・追加・特殊 ＋ 4部位クリスタ0〜2スロ)
importScripts('./calc.js');

/**
 * 2つのクリスタが同一または同系統（関連クリスタ）かどうかを判定する
 * CSVの「関連クリスタ」カラムのリスト内に互いの名前が含まれているもの、
 * または共通の進化系統を持つものは重複装備不可として除外する
 */
function isRelatedCrysta(c1, c2) {
  if (!c1 || !c2) return false;
  if (c1.name === "なし" || c2.name === "なし") return false;
  if (c1.name === c2.name) return true;
  const rel1 = c1.rel || [c1.name];
  const rel2 = c2.rel || [c2.name];
  if (rel1.includes(c2.name) || rel2.includes(c1.name)) return true;
  for (let i = 0; i < rel1.length; i++) {
    if (rel2.includes(rel1[i])) return true;
  }
  return false;
}

/**
 * 2つのプロパティオブジェクトを事前合成する（数値は加算、文字列は優先保持）
 */
function mergeProps(p1, p2) {
  const out = {};
  if (p1) {
    for (const k in p1) out[k] = p1[k];
  }
  if (p2) {
    for (const k in p2) {
      if (typeof p2[k] === "number") {
        out[k] = (typeof out[k] === "number" ? out[k] : 0) + p2[k];
      } else if (p2[k] !== "") {
        out[k] = p2[k];
      }
    }
  }
  return out;
}

/**
 * 火力・行動速度に一切寄与しないクリスタを事前除外して探索効率を高める
 */
const RELEVANT_CRYSTA_KEYS = [
  "武器ATK+〇", "武器ATK+〇%", "ATK+〇", "ATK+〇%", "MATK+〇", "MATK+〇%",
  "STR+〇", "STR+〇%", "AGI+〇", "AGI+〇%", "DEX+〇", "DEX+〇%", "INT+〇", "INT+〇%", "VIT+〇", "VIT+〇%",
  "クリティカル率+〇", "クリティカル率+〇%", "クリティカルダメージ+〇", "クリティカルダメージ+〇%",
  "安定率+〇%", "物理貫通+〇%", "魔法貫通+〇%", "抜刀攻撃+〇", "抜刀攻撃+〇%",
  "無属性にダメージ+〇%", "火属性にダメージ+〇%", "水属性にダメージ+〇%", "地属性にダメージ+〇%",
  "風属性にダメージ+〇%", "闇属性にダメージ+〇%", "光属性にダメージ+〇%", "属性有利+〇%",
  "近距離の威力+〇%", "遠距離の威力+〇%", "攻撃速度+〇", "攻撃速度+〇%", "行動速度+〇%",
  "命中+〇", "命中+〇%", "絶対命中+〇%"
];

function hasOffensiveContribution(item) {
  if (!item || !item.p) return false;
  for (let i = 0; i < RELEVANT_CRYSTA_KEYS.length; i++) {
    const v = item.p[RELEVANT_CRYSTA_KEYS[i]];
    if (typeof v === "number" && v > 0) return true;
  }
  return false;
}

/**
 * 各部位（メイン・体・追加・特殊）の有効な単体クリスタ候補を取得する
 */
function getEligibleCrystasForSlot(allCrystas, slotType) {
  const allowedTypes = {
    main: ["武器クリスタ", "ノーマルクリスタ"],
    body: ["体クリスタ", "ノーマルクリスタ"],
    add:  ["追加クリスタ", "ノーマルクリスタ"],
    spec: ["特殊クリスタ", "ノーマルクリスタ"]
  }[slotType] || ["ノーマルクリスタ"];

  return allCrystas.filter(c => allowedTypes.includes(c.type) && hasOffensiveContribution(c));
}

/**
 * 単体装備または単体クリスタを評価してスコア付けし、上位候補＋速度・クリ率・命中特化候補を抽出する
 */
function rankSingleCandidates(candidates, c, baseP, dummySub, maxKeep, isSub = false) {
  if (candidates.length <= maxKeep) return candidates;

  const scored = candidates.map(item => {
    const subObj = isSub ? item : dummySub;
    const props = isSub ? [item.p] : [dummySub.p, item.p];
    const res = calculateBuild({ ...c }, props, subObj, baseP, true);
    const exp = res ? res.exp : 0;
    const aspdVal = (item.p["行動速度+〇%"] || 0) * 200 + (item.p["攻撃速度+〇%"] || 0) * 15 + (item.p["攻撃速度+〇"] || 0) + (item.p["AGI+〇%"] || 0) * 10;
    const crVal = (item.p["クリティカル率+〇"] || 0) * 2 + (item.p["クリティカル率+〇%"] || 0);
    const pierceVal = (item.p[c.isMag ? "魔法貫通+〇%" : "物理貫通+〇%"] || 0);
    const hitVal = (item.p["絶対命中+〇%"] || 0) * 150 + (item.p["命中+〇%"] || 0) * 15 + (item.p["命中+〇"] || 0);
    return { item, exp, aspdVal, crVal, pierceVal, hitVal };
  });

  const picked = new Map();
  // 1. 期待値上位
  scored.sort((a, b) => b.exp - a.exp);
  const expQuota = Math.max(4, Math.floor(maxKeep * 0.65));
  for (let i = 0; i < scored.length && picked.size < expQuota; i++) {
    picked.set(scored[i].item.name, scored[i].item);
  }
  // 2. 行動速度要求がある場合は速度上位も確実に保持
  if (c.reqAspd > 0) {
    const byAspd = [...scored].sort((a, b) => b.aspdVal - a.aspdVal || b.exp - a.exp);
    const aspdQuota = Math.max(2, Math.floor(maxKeep * 0.2));
    let added = 0;
    for (let i = 0; i < byAspd.length && added < aspdQuota; i++) {
      if (byAspd[i].aspdVal > 0 && !picked.has(byAspd[i].item.name)) {
        picked.set(byAspd[i].item.name, byAspd[i].item);
        added++;
      }
    }
  }
  // 3. 物理スキル時は命中・絶対命中上位も補完
  if (!c.isMag) {
    const byHit = [...scored].sort((a, b) => b.hitVal - a.hitVal || b.exp - a.exp);
    const hitQuota = Math.max(2, Math.floor(maxKeep * 0.15));
    let added = 0;
    for (let i = 0; i < byHit.length && added < hitQuota && picked.size < maxKeep; i++) {
      if (byHit[i].hitVal > 0 && !picked.has(byHit[i].item.name)) {
        picked.set(byHit[i].item.name, byHit[i].item);
        added++;
      }
    }
  }
  // 4. 貫通・クリ率上位も補完
  const byPierce = [...scored].sort((a, b) => (b.pierceVal * 100 + b.crVal) - (a.pierceVal * 100 + a.crVal) || b.exp - a.exp);
  for (let i = 0; i < byPierce.length && picked.size < maxKeep; i++) {
    if (!picked.has(byPierce[i].item.name)) {
      picked.set(byPierce[i].item.name, byPierce[i].item);
    }
  }

  return Array.from(picked.values());
}

/**
 * 指定スロット数 (0, 1, 2) に応じたクリスタ組み合わせリストを生成する
 * 2スロットの場合は「関連クリスタ」重複チェックで同系統クリスタを厳密に除外する
 */
function buildCrystaSlotCombos(allCrystas, slotType, slotCount, fixedC1, fixedC2, c, baseP, dummySub, maxSinglePool = 42, maxComboKeep = 12) {
  const emptyCombo = { c1: "なし", c2: "なし", label: "なし", p: {} };
  if (slotCount <= 0) {
    return { Narrow: [emptyCombo], Full: [emptyCombo], rawPairsCount: 1, excludedRelatedCount: 0 };
  }

  const eligible = getEligibleCrystasForSlot(allCrystas, slotType);
  const findCrysta = (name) => allCrystas.find(x => x.name === name);

  if (slotCount === 1) {
    if (fixedC1) {
      const f1 = findCrysta(fixedC1);
      if (!f1) {
        return { Narrow: [], Full: [], rawPairsCount: 0, excludedRelatedCount: 0, conflictError: `指定されたクリスタ「${fixedC1}」が見つかりません。` };
      }
      const combo = { c1: f1.name, c2: "なし", label: f1.name, p: f1.p };
      return { Narrow: [combo], Full: [combo], rawPairsCount: 1, excludedRelatedCount: 0 };
    }
    const rankedSingles = rankSingleCandidates(eligible, c, baseP, dummySub, maxComboKeep * 3, false);
    const fullList = rankedSingles.map(x => ({ c1: x.name, c2: "なし", label: x.name, p: x.p }));
    fullList.push(emptyCombo);
    return {
      Narrow: fullList.slice(0, maxComboKeep),
      Full: fullList,
      rawPairsCount: eligible.length,
      excludedRelatedCount: 0
    };
  }

  // slotCount === 2
  const f1 = fixedC1 ? findCrysta(fixedC1) : null;
  const f2 = fixedC2 ? findCrysta(fixedC2) : null;

  if (fixedC1 && !f1) {
    return { Narrow: [], Full: [], rawPairsCount: 0, excludedRelatedCount: 0, conflictError: `指定されたクリスタ「${fixedC1}」が見つかりません。` };
  }
  if (fixedC2 && !f2) {
    return { Narrow: [], Full: [], rawPairsCount: 0, excludedRelatedCount: 0, conflictError: `指定されたクリスタ「${fixedC2}」が見つかりません。` };
  }

  if (f1 && f2) {
    if (isRelatedCrysta(f1, f2)) {
      return {
        Narrow: [],
        Full: [],
        rawPairsCount: 1,
        excludedRelatedCount: 1,
        conflictError: `「${f1.name}」と「${f2.name}」は同系統（関連クリスタ）のため同一部位に重複装備できません。`
      };
    }
    const combo = { c1: f1.name, c2: f2.name, label: `${f1.name} / ${f2.name}`, p: mergeProps(f1.p, f2.p) };
    return { Narrow: [combo], Full: [combo], rawPairsCount: 1, excludedRelatedCount: 0 };
  }

  // 単体上位プールを選出してから2スロペアを生成（関連クリスタ重複を厳密に除外）
  const pool = rankSingleCandidates(eligible, c, baseP, dummySub, maxSinglePool, false);
  if (f1 && !pool.some(x => x.name === f1.name)) pool.unshift(f1);
  if (f2 && !pool.some(x => x.name === f2.name)) pool.unshift(f2);

  const validPairs = [];
  let rawPairsChecked = 0;
  let excludedRelatedCount = 0;

  if (f1 || f2) {
    const fixedOne = f1 || f2;
    for (let i = 0; i < pool.length; i++) {
      const other = pool[i];
      rawPairsChecked++;
      if (isRelatedCrysta(fixedOne, other)) {
        excludedRelatedCount++;
        continue;
      }
      const mergedP = mergeProps(fixedOne.p, other.p);
      const res = calculateBuild({ ...c }, [dummySub.p, mergedP], dummySub, baseP, true);
      const exp = res ? res.exp : 0;
      const aspdVal = (mergedP["行動速度+〇%"] || 0) * 200 + (mergedP["攻撃速度+〇%"] || 0) * 15 + (mergedP["攻撃速度+〇"] || 0);
      validPairs.push({
        c1: fixedOne.name,
        c2: other.name,
        label: `${fixedOne.name} / ${other.name}`,
        p: mergedP,
        exp,
        aspdVal
      });
    }
  } else {
    for (let i = 0; i < pool.length; i++) {
      const cA = pool[i];
      for (let j = i + 1; j < pool.length; j++) {
        const cB = pool[j];
        rawPairsChecked++;
        // 【重要】関連クリスタ重複チェック
        if (isRelatedCrysta(cA, cB)) {
          excludedRelatedCount++;
          continue;
        }
        const mergedP = mergeProps(cA.p, cB.p);
        const res = calculateBuild({ ...c }, [dummySub.p, mergedP], dummySub, baseP, true);
        const exp = res ? res.exp : 0;
        const aspdVal = (mergedP["行動速度+〇%"] || 0) * 200 + (mergedP["攻撃速度+〇%"] || 0) * 15 + (mergedP["攻撃速度+〇"] || 0);
        validPairs.push({
          c1: cA.name,
          c2: cB.name,
          label: `${cA.name} / ${cB.name}`,
          p: mergedP,
          exp,
          aspdVal
        });
      }
    }
  }

  validPairs.sort((a, b) => b.exp - a.exp);

  // 狭域総当たり用リスト（期待値上位 ＋ 行動速度要求時は速度上位もブレンド）
  const narrowMap = new Map();
  const expLimit = c.reqAspd > 0 ? Math.max(3, Math.floor(maxComboKeep * 0.65)) : maxComboKeep;
  for (let i = 0; i < validPairs.length && narrowMap.size < expLimit; i++) {
    narrowMap.set(validPairs[i].label, validPairs[i]);
  }
  if (c.reqAspd > 0) {
    const byAspd = [...validPairs].sort((a, b) => b.aspdVal - a.aspdVal || b.exp - a.exp);
    for (let i = 0; i < byAspd.length && narrowMap.size < maxComboKeep; i++) {
      if (byAspd[i].aspdVal > 0 && !narrowMap.has(byAspd[i].label)) {
        narrowMap.set(byAspd[i].label, byAspd[i]);
      }
    }
  }
  for (let i = 0; i < validPairs.length && narrowMap.size < maxComboKeep; i++) {
    if (!narrowMap.has(validPairs[i].label)) {
      narrowMap.set(validPairs[i].label, validPairs[i]);
    }
  }

  const narrowList = Array.from(narrowMap.values());
  if (narrowList.length === 0) narrowList.push(emptyCombo);

  // 全スイープ用リスト（期待値上位120件＋速度上位30件）
  const fullMap = new Map();
  for (let i = 0; i < Math.min(120, validPairs.length); i++) {
    fullMap.set(validPairs[i].label, validPairs[i]);
  }
  if (c.reqAspd > 0) {
    const byAspd = [...validPairs].sort((a, b) => b.aspdVal - a.aspdVal || b.exp - a.exp);
    for (let i = 0; i < Math.min(35, byAspd.length); i++) {
      fullMap.set(byAspd[i].label, byAspd[i]);
    }
  }
  const fullList = Array.from(fullMap.values());
  if (fullList.length === 0) fullList.push(emptyCombo);

  return {
    Narrow: narrowList,
    Full: fullList,
    rawPairsCount: rawPairsChecked,
    excludedRelatedCount
  };
}

function isEquipRestrictionMet(limitStr, wType, subType, bType) {
  if (!limitStr || !limitStr.trim()) return true;
  const isDualSword = wType === "双剣" || (wType === "片手剣" && subType === "片手剣");

  const checkToken = (token) => {
    const t = token.trim();
    if (!t) return true;
    if (t.includes("+")) {
      return t.split("+").every(part => checkToken(part));
    }
    switch (t) {
      case "片手剣":
        return wType === "片手剣" && !isDualSword;
      case "両手剣":
        return wType === "両手剣";
      case "双剣":
        return isDualSword;
      case "弓":
        return wType === "弓";
      case "自動弓":
        return wType === "自動弓";
      case "杖":
        return wType === "杖";
      case "魔道具":
      case "魔導具":
        return wType === "魔導具" || subType === "魔導具";
      case "手甲":
        return wType === "手甲" || subType === "手甲";
      case "旋風槍":
        return wType === "旋風槍";
      case "抜刀剣":
        return wType === "抜刀剣" || subType === "抜刀剣";
      case "盾":
        return subType === "盾";
      case "短剣":
        return subType === "短剣";
      case "矢":
        return subType === "矢";
      case "忍術巻物":
      case "巻物":
        return subType === "巻物";
      case "軽鎧":
        return bType === "軽量化";
      case "重鎧":
        return bType === "重量化";
      default:
        return false;
    }
  };

  return limitStr.split(/[、,]/).some(tok => checkToken(tok));
}

function resolveEquipItemProps(item, wType, subType, bType) {
  if (!item || !item.condRows || item.condRows.length === 0) return item;
  const mergedP = { ...(item.p || {}) };
  item.condRows.forEach(row => {
    if (isEquipRestrictionMet(row.limit, wType, subType, bType)) {
      if (typeof row.val === "number") {
        mergedP[row.key] = (typeof mergedP[row.key] === "number" ? mergedP[row.key] : 0) + row.val;
      } else {
        mergedP[row.key] = row.val;
      }
    }
  });
  return { ...item, p: mergedP };
}

const IMPRACTICAL_CRYSTA_NAMES = new Set([
  "◇コロンデッド",
  "◇オロロコロン",
  "◇呪われたクリスタ",
  "◇真夏の情熱"
]);

self.onmessage = function (e) {
  const startTime = performance.now();
  const { c, baseP, db: rawDb, fixed, slots, customEquip, excludeImpracticalCrysta } = e.data;

  const fixedCrystaNames = new Set([
    fixed?.mainC1, fixed?.mainC2, fixed?.bodyC1, fixed?.bodyC2,
    fixed?.addC1, fixed?.addC2, fixed?.specC1, fixed?.specC2
  ].filter(Boolean));

  const resolveList = (arr) => (arr || []).map(it => resolveEquipItemProps(it, c.wt, c.subType, c.bt));
  const db = {
    sub: resolveList(rawDb.sub),
    add: resolveList(rawDb.add),
    spec: resolveList(rawDb.spec),
    crysta: resolveList(rawDb.crysta).filter(it =>
      !excludeImpracticalCrysta || fixedCrystaNames.has(it.name) || !IMPRACTICAL_CRYSTA_NAMES.has(it.name)
    )
  };

  const SUB_PROP_ENABLED_TYPES = ["盾", "短剣", "巻物", "矢"];
  const wkMap = { "火": "水", "水": "風", "風": "地", "地": "火", "光": "闇", "闇": "光" };

  // サブ武器種別とメイン武器種別の組み合わせに応じたプロパティ反映処理
  const prepareSubWeaponItem = (item) => {
    const pCopy = { ...item.p };
    if (c.subType === "片手剣") {
      const elem = pCopy["サブ武器の属性"];
      return { ...item, p: elem ? { "サブ武器の属性": elem } : {} };
    }
    if (c.subType === "矢") {
      if (c.wt === "弓" || c.wt === "自動弓") {
        // 弓・自動弓は矢の属性も反映（メイン武器にすでに弱点属性が付与されている場合はW属性仕様に基づき有利側を優先）
        const arrowElem = pCopy["サブ武器の属性"];
        const mainElem = baseP["メイン武器の属性"];
        if (arrowElem && arrowElem !== "無") {
          const mainHitsWeak = mainElem && mainElem !== "無" && wkMap[c.eElem] === mainElem;
          if (!mainHitsWeak) {
            pCopy["メイン武器の属性"] = arrowElem;
          }
        }
      } else {
        // 弓・自動弓以外の矢はサブ武器ATK・サブ武器安定率・属性は反映せず、それ以外のプロパ（○属性にダメージ+〇%等）のみ反映
        delete pCopy["武器ATK"];
        delete pCopy["サブ武器ATK"];
        delete pCopy["安定率"];
        delete pCopy["サブ武器安定率"];
        delete pCopy["サブ武器の属性"];
        delete pCopy["メイン武器の属性"];
      }
    }
    return { ...item, p: pCopy };
  };

  // 1. サブ・追加・特殊の候補準備（手入力装備がある部位はCSV自動探索から除外して固定）
  const getEquipCands = (list, fixedName, isSub, typeFilter, maxKeep, manualItem) => {
    if (manualItem && manualItem.active) {
      const customObj = { name: manualItem.name || "手入力装備", p: manualItem.p || {}, isCustom: true };
      const finalObj = isSub ? prepareSubWeaponItem(customObj) : customObj;
      return { Narrow: [finalObj], Full: [finalObj] };
    }
    if (isSub) {
      if (!SUB_PROP_ENABLED_TYPES.includes(typeFilter)) {
        const noneItem = { name: typeFilter, p: {} };
        return { Narrow: [noneItem], Full: [noneItem] };
      }
      if (fixedName) {
        const f = list.find(x => x.name === fixedName && (x.type === typeFilter || x.limit === typeFilter));
        if (!f) return { Narrow: [], Full: [] };
        const prepared = prepareSubWeaponItem(f);
        return { Narrow: [prepared], Full: [prepared] };
      }
      const filtered = list
        .filter(x => x.type === typeFilter || x.limit === typeFilter)
        .map(prepareSubWeaponItem);
      if (filtered.length === 0) {
        const dummy = { name: `${typeFilter}`, p: {} };
        return { Narrow: [dummy], Full: [dummy] };
      }
      const dummySub = filtered[0];
      const ranked = rankSingleCandidates(filtered, c, baseP, dummySub, list.length, true);
      return { Narrow: ranked.slice(0, maxKeep), Full: ranked };
    }
    if (fixedName) {
      const f = list.find(x => x.name === fixedName);
      return f ? { Narrow: [f], Full: [f] } : { Narrow: [], Full: [] };
    }
    const dummySub = { name: "なし", p: {} };
    const offensiveList = list.filter(hasOffensiveContribution);
    const sourceList = offensiveList.length > 0 ? offensiveList : list;
    const ranked = rankSingleCandidates(sourceList, c, baseP, dummySub, sourceList.length, false);
    return { Narrow: ranked.slice(0, maxKeep), Full: ranked };
  };

  // アクティブな変動枠数に応じて各枠の探索幅を動的調整
  const activeCrystaSlots = [slots.main, slots.body, slots.add, slots.spec].filter(s => s > 0).length;
  const equipNarrowSize = activeCrystaSlots >= 3 ? 6 : (activeCrystaSlots === 2 ? 10 : 18);
  const crystaNarrowSize = activeCrystaSlots >= 4 ? 5 : (activeCrystaSlots === 3 ? 7 : (activeCrystaSlots === 2 ? 12 : 25));

  const subCands  = getEquipCands(db.sub,  fixed.sub,  true,  c.subType, Math.min(equipNarrowSize, 6), customEquip?.sub);
  const addCands  = getEquipCands(db.add,  fixed.add,  false, "",        equipNarrowSize, customEquip?.add);
  const specCands = getEquipCands(db.spec, fixed.spec, false, "",        equipNarrowSize, customEquip?.spec);

  if (subCands.Narrow.length === 0 || addCands.Narrow.length === 0 || specCands.Narrow.length === 0) {
    self.postMessage({
      type: "error",
      message: "指定された固定装備がCSVデータ内に見つかりません。名前を確認してください。"
    });
    return;
  }

  const refSub = subCands.Narrow[0];

  // 2. 4部位クリスタ（0〜2スロ）候補ペア生成 ＆ 関連クリスタ重複除外
  const mainCrys = buildCrystaSlotCombos(db.crysta, "main", slots.main, fixed.mainC1, fixed.mainC2, c, baseP, refSub, 42, crystaNarrowSize);
  const bodyCrys = buildCrystaSlotCombos(db.crysta, "body", slots.body, fixed.bodyC1, fixed.bodyC2, c, baseP, refSub, 42, crystaNarrowSize);
  const addCrys  = buildCrystaSlotCombos(db.crysta, "add",  slots.add,  fixed.addC1,  fixed.addC2,  c, baseP, refSub, 42, crystaNarrowSize);
  const specCrys = buildCrystaSlotCombos(db.crysta, "spec", slots.spec, fixed.specC1, fixed.specC2, c, baseP, refSub, 42, crystaNarrowSize);

  for (const cr of [mainCrys, bodyCrys, addCrys, specCrys]) {
    if (cr.conflictError) {
      self.postMessage({ type: "error", message: cr.conflictError });
      return;
    }
  }

  const subArr = subCands.Narrow;
  const addArr = addCands.Narrow;
  const specArr = specCands.Narrow;
  const mArr = mainCrys.Narrow;
  const bArr = bodyCrys.Narrow;
  const aArr = addCrys.Narrow;
  const sArr = specCrys.Narrow;

  const gridTotal = subArr.length * addArr.length * specArr.length * mArr.length * bArr.length * aArr.length * sArr.length;
  let checked = 0;
  let top = { exp: 0 };
  const topBuilds = [];

  function recordBuild(res, sub, add, spec, mc, bc, ac, sc) {
    const entry = {
      ...res,
      sub: sub.name,
      add: add.name,
      spec: spec.name,
      mainCrysta: [mc.c1, mc.c2].filter(x => x && x !== "なし"),
      bodyCrysta: [bc.c1, bc.c2].filter(x => x && x !== "なし"),
      addCrysta:  [ac.c1, ac.c2].filter(x => x && x !== "なし"),
      specCrysta: [sc.c1, sc.c2].filter(x => x && x !== "なし"),
      _refs: { sub, add, spec, mc, bc, ac, sc }
    };
    if (entry.exp > top.exp) {
      top = entry;
    }
    const sig = `${entry.sub}|${entry.add}|${entry.spec}|${mc.label}|${bc.label}|${ac.label}|${sc.label}`;
    entry._sig = sig;
    if (topBuilds.length < 5 || entry.exp > topBuilds[topBuilds.length - 1].exp) {
      const existingIdx = topBuilds.findIndex(b => b._sig === sig);
      if (existingIdx >= 0) {
        if (entry.exp > topBuilds[existingIdx].exp) topBuilds[existingIdx] = entry;
      } else {
        topBuilds.push(entry);
      }
      topBuilds.sort((x, y) => y.exp - x.exp);
      if (topBuilds.length > 5) topBuilds.pop();
    }
  }

  const reportInterval = Math.max(2500, Math.floor(gridTotal / 40));

  // Phase 1: 7次元グリッド総当たり探索
  for (let iSub = 0; iSub < subArr.length; iSub++) {
    const sub = subArr[iSub];
    for (let iAdd = 0; iAdd < addArr.length; iAdd++) {
      const add = addArr[iAdd];
      for (let iSpec = 0; iSpec < specArr.length; iSpec++) {
        const spec = specArr[iSpec];
        const equipP = mergeProps(mergeProps(sub.p, add.p), spec.p);

        for (let iM = 0; iM < mArr.length; iM++) {
          const mc = mArr[iM];
          const pM = mergeProps(equipP, mc.p);

          for (let iB = 0; iB < bArr.length; iB++) {
            const bc = bArr[iB];
            const pMB = mergeProps(pM, bc.p);

            for (let iA = 0; iA < aArr.length; iA++) {
              const ac = aArr[iA];
              const pMBA = mergeProps(pMB, ac.p);

              for (let iS = 0; iS < sArr.length; iS++) {
                const sc = sArr[iS];
                checked++;

                const props = [pMBA, sc.p];
                const res = calculateBuild(c, props, sub, baseP, false);
                if (res && res.exp > 0) {
                  if (topBuilds.length < 5 || res.exp >= topBuilds[topBuilds.length - 1].exp) {
                    recordBuild(res, sub, add, spec, mc, bc, ac, sc);
                  }
                }

                if (checked % reportInterval === 0) {
                  self.postMessage({
                    type: "progress",
                    phase: "グリッド総当たり探索中",
                    percent: Math.min(88, Math.round((checked / gridTotal) * 88)),
                    checked,
                    total: gridTotal,
                    bestExp: top.exp
                  });
                }
              }
            }
          }
        }
      }
    }
  }

  // Phase 2: 全データベース対象・厳密座標最適化スイープ
  self.postMessage({
    type: "progress",
    phase: "全データ精密最適化中",
    percent: 92,
    checked,
    total: gridTotal,
    bestExp: top.exp
  });

  // 初期シードの準備（Phase 1の上位ビルド、または万一0件なら先頭候補をシード化）
  const seeds = topBuilds.length > 0
    ? topBuilds.slice(0, 2).map(b => ({ ...b._refs }))
    : [{
        sub: subCands.Full[0],
        add: addCands.Full[0],
        spec: specCands.Full[0],
        mc: mainCrys.Full[0],
        bc: bodyCrys.Full[0],
        ac: addCrys.Full[0],
        sc: specCrys.Full[0]
      }];

  for (const seed of seeds) {
    let cur = { ...seed };
    for (let pass = 0; pass < 3; pass++) {
      let improved = false;

      for (const cand of subCands.Full) {
        checked++;
        const props = [cand.p, cur.add.p, cur.spec.p, cur.mc.p, cur.bc.p, cur.ac.p, cur.sc.p];
        const res = calculateBuild(c, props, cand, baseP, false);
        if (res && res.exp > top.exp) {
          cur.sub = cand;
          recordBuild(res, cur.sub, cur.add, cur.spec, cur.mc, cur.bc, cur.ac, cur.sc);
          improved = true;
        }
      }
      for (const cand of addCands.Full) {
        checked++;
        const props = [cur.sub.p, cand.p, cur.spec.p, cur.mc.p, cur.bc.p, cur.ac.p, cur.sc.p];
        const res = calculateBuild(c, props, cur.sub, baseP, false);
        if (res && res.exp > top.exp) {
          cur.add = cand;
          recordBuild(res, cur.sub, cur.add, cur.spec, cur.mc, cur.bc, cur.ac, cur.sc);
          improved = true;
        }
      }
      for (const cand of specCands.Full) {
        checked++;
        const props = [cur.sub.p, cur.add.p, cand.p, cur.mc.p, cur.bc.p, cur.ac.p, cur.sc.p];
        const res = calculateBuild(c, props, cur.sub, baseP, false);
        if (res && res.exp > top.exp) {
          cur.spec = cand;
          recordBuild(res, cur.sub, cur.add, cur.spec, cur.mc, cur.bc, cur.ac, cur.sc);
          improved = true;
        }
      }
      for (const cand of mainCrys.Full) {
        checked++;
        const props = [cur.sub.p, cur.add.p, cur.spec.p, cand.p, cur.bc.p, cur.ac.p, cur.sc.p];
        const res = calculateBuild(c, props, cur.sub, baseP, false);
        if (res && res.exp > top.exp) {
          cur.mc = cand;
          recordBuild(res, cur.sub, cur.add, cur.spec, cur.mc, cur.bc, cur.ac, cur.sc);
          improved = true;
        }
      }
      for (const cand of bodyCrys.Full) {
        checked++;
        const props = [cur.sub.p, cur.add.p, cur.spec.p, cur.mc.p, cand.p, cur.ac.p, cur.sc.p];
        const res = calculateBuild(c, props, cur.sub, baseP, false);
        if (res && res.exp > top.exp) {
          cur.bc = cand;
          recordBuild(res, cur.sub, cur.add, cur.spec, cur.mc, cur.bc, cur.ac, cur.sc);
          improved = true;
        }
      }
      for (const cand of addCrys.Full) {
        checked++;
        const props = [cur.sub.p, cur.add.p, cur.spec.p, cur.mc.p, cur.bc.p, cand.p, cur.sc.p];
        const res = calculateBuild(c, props, cur.sub, baseP, false);
        if (res && res.exp > top.exp) {
          cur.ac = cand;
          recordBuild(res, cur.sub, cur.add, cur.spec, cur.mc, cur.bc, cur.ac, cur.sc);
          improved = true;
        }
      }
      for (const cand of specCrys.Full) {
        checked++;
        const props = [cur.sub.p, cur.add.p, cur.spec.p, cur.mc.p, cur.bc.p, cur.ac.p, cand.p];
        const res = calculateBuild(c, props, cur.sub, baseP, false);
        if (res && res.exp > top.exp) {
          cur.sc = cand;
          recordBuild(res, cur.sub, cur.add, cur.spec, cur.mc, cur.bc, cur.ac, cur.sc);
          improved = true;
        }
      }

      if (!improved) break;
    }
  }

  const cleanBuild = (b, includeSources = false) => {
    if (!b || !b.exp) return { exp: 0 };
    const copy = { ...b };
    if (includeSources && b._refs) {
      const r = b._refs;
      copy.equipSources = {
        sub: { name: r.sub?.name || "", p: r.sub?.p || {} },
        add: { name: r.add?.name || "", p: r.add?.p || {} },
        spec: { name: r.spec?.name || "", p: r.spec?.p || {} },
        mainCrysta: { label: r.mc?.label || "", p: r.mc?.p || {} },
        bodyCrysta: { label: r.bc?.label || "", p: r.bc?.p || {} },
        addCrysta:  { label: r.ac?.label || "", p: r.ac?.p || {} },
        specCrysta: { label: r.sc?.label || "", p: r.sc?.p || {} }
      };
    }
    delete copy._refs;
    delete copy._sig;
    return copy;
  };

  const elapsedMs = Math.round(performance.now() - startTime);
  const totalExcludedRelated =
    mainCrys.excludedRelatedCount +
    bodyCrys.excludedRelatedCount +
    addCrys.excludedRelatedCount +
    specCrys.excludedRelatedCount;

  self.postMessage({
    type: "done",
    top: cleanBuild(top, true),
    rankings: topBuilds.map(b => cleanBuild(b, false)),
    checked,
    elapsedMs,
    crystaPairsValidated: mainCrys.rawPairsCount + bodyCrys.rawPairsCount + addCrys.rawPairsCount + specCrys.rawPairsCount,
    excludedRelatedCount: totalExcludedRelated
  });
};
