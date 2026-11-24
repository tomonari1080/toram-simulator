// --- 計算データ ---
const W_DATA = {
  "片手剣": { atk:{s:2,d:2,i:0,a:0}, matk:{s:0,i:3,d:1,a:0}, aspd:{b:100,s:0.2,a:4.2,d:0,i:0}, stab:{s:0.025,d:0.075,a:0} },
  "両手剣": { atk:{s:3,d:1,i:0,a:0}, matk:{s:0,i:3,d:1,a:0}, aspd:{b:50,s:0.2,a:2.1,d:0,i:0}, stab:{d:0.1,s:0,a:0} },
  "双剣":   { atk:{s:1,d:2,i:0,a:1}, matk:{s:0,i:3,d:1,a:0}, aspd:{b:100,s:0.2,a:4.2,d:0,i:0}, stab:{s:0.025,d:0.075,a:0} },
  "弓":     { atk:{s:1,d:3,i:0,a:0}, matk:{s:0,i:3,d:1,a:0}, aspd:{b:75,d:0.2,a:3.1,s:0,i:0}, stab:{s:0.05,d:0.05,a:0} },
  "自動弓": { atk:{s:0,d:4,i:0,a:0}, matk:{s:0,i:3,d:1,a:0}, aspd:{b:30,d:0.2,a:2.2,s:0,i:0}, stab:{s:0.05,d:0,a:0} },
  "杖":     { atk:{s:3,d:0,i:1,a:0}, matk:{s:0,i:4,d:1,a:0}, aspd:{b:60,a:1.8,i:0.2,s:0,d:0}, stab:{s:0.05,d:0,a:0} },
  "魔導具": { atk:{s:0,d:0,i:2,a:2}, matk:{s:0,i:4,d:1,a:0}, aspd:{b:90,a:4,i:0.2,s:0,d:0}, stab:{d:0.1,s:0,a:0} },
  "手甲":   { atk:{s:0,d:0.5,i:0,a:2}, matk:{s:0,i:4,d:1,a:0}, aspd:{b:120,s:0.1,d:0.1,a:4.6,i:0}, stab:{d:0.025,s:0,a:0} },
  "旋風槍": { atk:{s:2.5,d:0,i:0,a:1.5}, matk:{s:0,i:2,d:1,a:1}, aspd:{b:25,s:0.2,a:3.5,d:0,i:0}, stab:{s:0.05,d:0,a:0.05} },
  "抜刀剣": { atk:{s:1.5,d:2.5,i:0,a:0}, matk:{s:0,i:1.5,d:1,a:0}, aspd:{b:200,s:0.3,a:3.9,d:0,i:0}, stab:{s:0.075,d:0.025,a:0} },
  "素手":   { atk:{s:1,d:0,i:0,a:0}, matk:{s:0,i:3,d:1,a:0}, aspd:{b:1000,a:9.6,s:0,d:0,i:0}, stab:{a:1/3,s:0,d:0} }
};

// 数値取得用ヘルパー
function getP(propsArr, baseP, key) {
  let s = 0;
  for (let i = 0; i < propsArr.length; i++) {
    const v = propsArr[i][key];
    if (typeof v === 'number') s += v;
  }
  return s + (typeof baseP[key] === 'number' ? baseP[key] : 0);
}

// 文字列取得用ヘルパー（属性用）
function getStrP(propsArr, baseP, key) {
  for (let p of propsArr) {
    if (typeof p[key] === 'string') return p[key];
  }
  if (typeof baseP[key] === 'string') return baseP[key];
  return "";
}

/**
 * トーラムオンライン厳密仕様に基づくダメージ・期待値算出エンジン
 * ※演算順序および Math.floor() のタイミングは一切改変禁止
 */
function calculateBuild(c, props, sub, baseP, ignoreAspdReq = false) {
  const sumV = (key) => getP(props, baseP, key);

  // 属性・弱点判定の取得
  c.welem = getStrP(props, baseP, "メイン武器の属性") || "無";
  const wkMap = {"火":"水","水":"風","風":"地","地":"火","光":"闇","闇":"光"};
  c.isWeak = (c.welem !== "無" && wkMap[c.eElem] === c.welem)
    || (c.wt === "双剣" && c.subElem && c.subElem !== "無" && wkMap[c.eElem] === c.subElem);

  // --- ステータス計算 ---
  const T_STR = Math.floor(c.str * (1 + sumV("STR+〇%")/100)) + sumV("STR+〇");
  const T_DEX = Math.floor(c.dex * (1 + sumV("DEX+〇%")/100)) + sumV("DEX+〇");
  const T_INT = Math.floor(c.int * (1 + sumV("INT+〇%")/100)) + sumV("INT+〇");
  const T_AGI = Math.floor(c.agi * (1 + sumV("AGI+〇%")/100)) + sumV("AGI+〇");
  const T_VIT = Math.floor(c.vit * (1 + sumV("VIT+〇%")/100)) + sumV("VIT+〇");

  // 行動速度計算
  const wd = W_DATA[c.wt];
  const sAspd = T_STR*wd.aspd.s + T_DEX*wd.aspd.d + T_INT*wd.aspd.i + T_AGI*wd.aspd.a;
  let tAspd = Math.floor((c.lv + sAspd + wd.aspd.b) * (1 + sumV("攻撃速度+〇%")/100)) + sumV("攻撃速度+〇");
  if(c.bt === "軽量化") tAspd = Math.floor(tAspd * 1.5);
  if(c.bt === "重量化") tAspd = Math.floor(tAspd * 0.5);
  if(c.subType === "盾") tAspd = Math.floor(tAspd * 0.5);

  let actionSpeed = Math.min(50, Math.max(0, Math.floor((tAspd - 1000) / 180)) + sumV("行動速度+〇%"));
  if (!ignoreAspdReq && c.reqAspd > 0 && actionSpeed < c.reqAspd) return null;

  // 武器ATK
  let wAtkBase = c.wt==="手甲" ? Math.floor(c.watk * (1 + Math.min(50, 5*c.knLv)/100)) : c.watk;
  if(c.wt==="弓" && c.subType==="矢") wAtkBase += (sub.p["武器ATK"]||0);
  if(c.wt==="自動弓" && c.subType==="矢") wAtkBase += Math.floor((sub.p["武器ATK"]||0)/2);
  
  let tWAtk = Math.floor(wAtkBase * (1 + (c.wref*c.wref)/100) + c.wref) + Math.floor(wAtkBase * sumV("武器ATK+〇%")/100) + sumV("武器ATK+〇");
  let tWMatk = (c.wt==="杖"||c.wt==="魔導具") ? tWAtk : (c.wt==="手甲" ? Math.floor(tWAtk/2) : 0);

  // ステータスATK/MATK
  const sAtk = T_STR*wd.atk.s + T_DEX*wd.atk.d + T_INT*wd.atk.i + T_AGI*wd.atk.a;
  const sMatk = T_STR*wd.matk.s + T_DEX*wd.matk.d + T_INT*wd.matk.i + T_AGI*wd.matk.a;

  let F_ATK = Math.floor((c.lv + tWAtk + sAtk) * (1 + sumV("ATK+〇%")/100)) + sumV("ATK+〇");
  let F_MATK = Math.floor((c.lv + tWMatk + sMatk) * (1 + sumV("MATK+〇%")/100)) + sumV("MATK+〇");

  if(c.subType==="手甲") F_MATK = Math.floor(F_MATK * 0.85);
  if(c.subType==="魔導具") F_ATK = Math.floor(F_ATK * 0.85);

  let refStat = 0;
  if(c.refSk === "atk") refStat = F_ATK;
  else if(c.refSk === "matk") refStat = F_MATK;
  else if(c.refSk === "watk") refStat = Math.floor(F_ATK/4) + Math.floor(F_MATK*3/4);
  else if(c.refSk === "datk") {
    const subWAtkBase = c.subAtk || 0;
    const subRef = c.subRef || 0;
    const tSubWAtk = Math.floor(subWAtkBase * (1 + (subRef * subRef) / 200) + subRef) + Math.floor(subWAtkBase * sumV("武器ATK+〇%") / 100) + sumV("武器ATK+〇");
    const sSubAtk = T_STR * 1 + T_AGI * 3;
    const SUB_ATK = Math.floor((c.lv + tSubWAtk + sSubAtk) * (1 + sumV("ATK+〇%") / 100)) + sumV("ATK+〇");
    const sSubStab = T_STR * 0.06 + T_AGI * 0.04;
    const subStab = Math.max(0, Math.min(100, Math.floor((c.subStab || 0) / 2 + sSubStab) + sumV("安定率+〇%")));
    refStat = F_ATK + Math.floor(SUB_ATK * subStab / 100);
  }
  else refStat = F_ATK;

  let wStabBase = c.wstab;
  if(c.wt==="弓" && c.subType==="矢") wStabBase += (sub.p["安定率"]||0);
  if(c.wt==="自動弓" && c.subType==="矢") wStabBase += Math.floor((sub.p["安定率"]||0)/2);
  
  const sStab = T_STR * wd.stab.s + T_DEX * wd.stab.d + T_AGI * wd.stab.a;
  let pStab = Math.max(0, Math.min(100, Math.floor(wStabBase + sStab) + sumV("安定率+〇%")));
  let mStabMin = Math.max(0, Math.min(90, Math.floor((pStab+100)/2)));
  let mStabMax = Math.max(100, Math.min(110, 100 + Math.floor((pStab-80)/2)));
  let effStab = c.isMag ? (mStabMin + mStabMax)/2 : pStab;

  let pCr = Math.floor(Math.floor(25 + c.crt/3.4) * (1 + sumV("クリティカル率+〇%")/100)) + sumV("クリティカル率+〇");
  if(c.wt==="双剣") pCr = Math.floor(pCr * 0.4);
  
  let mCr = 0;
  if(c.isMag) {
    if(c.eWeak) mCr += Math.floor(pCr/2);
    mCr += Math.floor(pCr * c.sbLv / 40);
    if(c.welem==="無") mCr += Math.floor(pCr/4);
  }
  let fCr = Math.max(0, Math.min(100, (c.isMag ? mCr : pCr) - c.eCres));

  let pCd = Math.floor((150 + Math.max(T_STR/5, (T_STR+T_AGI)/10)) * (1 + sumV("クリティカルダメージ+〇%")/100)) + sumV("クリティカルダメージ+〇");
  if(pCd > 300) pCd = 300 + Math.floor((pCd-300)/2);
  let fCd = c.isMag ? Math.floor(100 + (pCd-100) * (20 + c.sbLv)/40) : pCd;

  let elemP = sumV("属性有利+〇%") + (sumV(c.eElem+"属性にダメージ+〇%")||0);
  if(c.isMag) {
    if(c.wt!=="杖" && c.wt!=="魔導具") elemP += (c.isWeak ? 25 + Math.floor(c.int/10) : 0);
    else elemP += (c.welem!=="無" ? Math.floor(c.int/10) : 0) + (c.isWeak ? 25 : 0);
  } else {
    if(c.isWeak) elemP += 25;
  }
  if(c.eWeak) elemP += 25;

  let defBase = c.isMag ? c.eMdef : c.eDef;
  if(c.eBrk) defBase = Math.ceil(defBase * 0.5);
  defBase = Math.max(0, defBase - c.eNight);
  let pierce = Math.min(100, sumV(c.isMag ? "魔法貫通+〇%" : "物理貫通+〇%"));
  let effDef = Math.floor(defBase * (1 - pierce/100));

  let passSum = sumV("パッシブ倍率+〇%");
  let braveSum = sumV("ブレイブオーラ倍率+〇%");

  let dmg = refStat + c.lv - c.eLv;
  dmg = Math.floor(dmg * (1 - c.eRes/100));
  dmg = Math.floor(dmg * (1 - c.eWres/100));
  dmg = Math.floor(dmg - effDef);
  dmg = Math.max(1, dmg);
  if(c.unsh) dmg += sumV("抜刀攻撃+〇");
  dmg += c.flat;
  dmg = Math.floor(dmg * (1 + elemP/100));
  dmg = Math.floor(dmg * c.mult/100);
  if(c.unsh) dmg = Math.floor(dmg * (1 + sumV("抜刀攻撃+〇%")/100));
  dmg = Math.floor(dmg * c.pror/100);
  
  let distP = c.dist==="short" ? sumV("近距離の威力+〇%") : sumV("遠距離の威力+〇%");
  dmg = Math.floor(dmg * (1 + distP/100));
  dmg = Math.floor(dmg * c.combo/100);
  dmg = Math.floor(dmg * (1 + passSum/100));
  dmg = Math.floor(dmg * (1 + braveSum/100));

  const GUARANTEED_HIT = {
    "片手剣": 25, "両手剣": 15, "双剣": 25, "弓": 10, "自動弓": 5,
    "杖": 30, "魔導具": 10, "手甲": 10, "旋風槍": 20, "抜刀剣": 30, "素手": 50
  };
  let hitRate = 100, grazeRate = 0, missRate = 0;
  let exp = 0;

  if (c.isMag) {
    let wAvg = dmg * (1 + (effStab/100))/2;
    let cAvg = (dmg * fCd/100) * (1 + (effStab/100))/2;
    exp = Math.floor(cAvg * (fCr/100) + wAvg * (1 - fCr/100));
  } else {
    const pHit = Math.floor((c.lv + T_DEX) * (1 + sumV("命中+〇%")/100)) + sumV("命中+〇");
    const rawAcc = 100 + Math.floor((pHit - (c.eFlee || 0)) / 3) + Math.floor((c.skMp || 0) / 10) + sumV("絶対命中+〇%");
    const acc = Math.max(0, Math.min(100, rawAcc));
    const gHit = GUARANTEED_HIT[c.wt] !== undefined ? GUARANTEED_HIT[c.wt] : 25;
    const nonCritGraze = Math.max(0, gHit - acc);
    const nonCritMiss = Math.max(0, 100 - acc - nonCritGraze);

    const crRatio = fCr / 100;
    hitRate = acc;
    grazeRate = Math.round((crRatio * (100 - acc) + (1 - crRatio) * nonCritGraze) * 10) / 10;
    missRate = Math.round(((1 - crRatio) * nonCritMiss) * 10) / 10;

    const gStab = Math.floor(effStab / 2);
    const wAvg = dmg * (1 + (effStab/100))/2;
    const wGrazeAvg = dmg * (1 + (gStab/100))/2;
    const wExp = wAvg * (acc / 100) + wGrazeAvg * (nonCritGraze / 100);

    const cAvg = (dmg * fCd/100) * (1 + (effStab/100))/2;
    const cGrazeAvg = (dmg * fCd/100) * (1 + (gStab/100))/2;
    const cExp = cAvg * (acc / 100) + cGrazeAvg * ((100 - acc) / 100);

    exp = Math.floor(cExp * crRatio + wExp * (1 - crRatio));
  }

  return {
    exp,
    fAtk: F_ATK,
    fMatk: F_MATK,
    fCr,
    fCd,
    stab: effStab,
    aspd: actionSpeed,
    tAspd,
    pierce,
    elemP,
    hitRate,
    grazeRate,
    missRate,
    min: Math.floor(dmg * (effStab / 100) * (fCd / 100)),
    max: Math.floor(dmg * (fCd / 100)),
    weaponAttr: c.welem
  };
}
