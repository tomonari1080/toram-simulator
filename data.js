// --- プロパティ入力用 全Key リスト ---
const RAW_KEYS = "武器ATK+〇,武器ATK+〇%,ATK+〇,ATK+〇%,MATK+〇,MATK+〇%,STR+〇,STR+〇%,AGI+〇,AGI+〇%,DEX+〇,DEX+〇%,INT+〇,INT+〇%,クリティカル率+〇,クリティカル率+〇%,クリティカルダメージ+〇,クリティカルダメージ+〇%,安定率+〇%,物理貫通+〇%,魔法貫通+〇%,抜刀攻撃+〇,抜刀攻撃+〇%,無属性にダメージ+〇%,火属性にダメージ+〇%,水属性にダメージ+〇%,地属性にダメージ+〇%,風属性にダメージ+〇%,闇属性にダメージ+〇%,光属性にダメージ+〇%,近距離の威力+〇%,遠距離の威力+〇%,最大HP+〇,最大MP+〇,最大HP+〇%,HP自然回復+〇,MP自然回復+〇,HP自然回復+〇%,MP自然回復+〇%,攻撃MP回復+〇,攻撃MP回復+〇%,物理追撃+〇%,魔法追撃+〇%,DEF+〇,MDEF+〇,DEF+〇%,MDEF+〇%,物理耐性+〇%,魔法耐性+〇%,異常耐性+〇%,物理バリア+〇,魔法バリア+〇,割合バリア+〇%,バリア速度+〇%,ヘイト+〇%,命中+〇,命中+〇%,絶対命中+〇%,回避+〇,回避+〇%,絶対回避+〇%,攻撃速度+〇,詠唱速度+〇,攻撃速度+〇%,詠唱速度+〇%,行動速度+〇%,道具速度+〇s,復帰短縮+〇%,火耐性+〇%,水耐性+〇%,風耐性+〇%,地耐性+〇%,光耐性+〇%,闇耐性+〇%,無耐性+〇%,Guard回復+〇%,Guard力+〇%,Avoid回復+〇%,先読み+〇%,防御崩し+〇%,ダメージ反射+〇%,反動ダメージ+〇%,無敵手当て+〇s,突進軽減+〇%,直線軽減+〇%,範囲軽減+〇%,周囲軽減+〇%,射刃軽減+〇%,弾丸軽減+〇%,隕石軽減+〇%,痛床軽減+〇%,ATKアップ(AGI)+〇%,ATKアップ(VIT)+〇%,ATKアップ(STR)+〇%,ATKアップ(INT)+〇%,ATKアップ(DEX)+〇%,MATKアップ(AGI)+〇%,MATKアップ(VIT)+〇%,MATKアップ(STR)+〇%,MATKアップ(INT)+〇%,MATKアップ(DEX)+〇%,ドロップ率+〇%,獲得EXP+〇%,ペット獲得EXP+〇%,ジェムの粉末ドロップ量+〇%,メイン武器ATK,メイン武器安定率,サブ武器ATK,サブ武器安定率,敵Level,敵DEF,敵物理耐性,敵MDEF,敵魔法耐性,パッシブ倍率+〇%,ブレイブオーラ倍率+〇%,慣れ(通常)%,慣れ(魔法)%,慣れ(物理)%,コンボ倍率%,VIT+〇,VIT+〇%,属性有利+〇%,装備DEF,敵FLEE,スキル固定値,スキル倍率,スキルHIT数,移動速度+〇%,スキル倍率加算(サブ武器%),スキル倍率加算(補正後STR%),スキル倍率加算(補正後AGI%),スキル倍率加算(補正後DEX%),スキル倍率加算(補正後INT%),スキル倍率加算(補正後VIT%),スキル倍率加算(基礎STR%),スキル倍率加算(基礎AGI%),スキル倍率加算(基礎DEX%),スキル倍率加算(基礎INT%),スキル倍率加算(基礎VIT%),武器ATK+〇%(スキル),効果時間(秒),効果時間(分),味方HP回復回数,味方HP回復間隔(秒),味方HP回復値,味方MP回復回数,味方MP回復間隔(秒),味方MP回復値,回数制限,クリティカル耐性+〇,安定率+〇%(スキル),スキル倍率加算(メイン武器%),スキル固定値加算(サブ武器%),スキル固定値加算(補正後AGI%),スキル固定値加算(補正後DEX%),スキル固定値加算(補正後VIT%),スキル固定値加算(基礎INT%),物理貫通加算(基礎DEX%),スキル倍率加算(補正後STR% MaxOnly),スキル倍率加算(補正後AGI% MaxOnly),スキル倍率加算(補正後INT% MaxOnly),スキル倍率加算(定数 MaxOnly),DEFレベル依存上昇+〇%,MDEFレベル依存上昇+〇%,状態異常時に被ダメ軽減+〇%,DEFレベル依存上昇(2)+〇%,MDEFレベル依存上昇(2)+〇%,ノックバック距離軽減+〇%,非ガード時に確率で物理ダメージ軽減+〇%,パリィ発動確率+〇%,スキルの消費MP,過負荷カウント上限,過負荷カウント下限,被ダメ軽減+〇%,効果終了時に残バフ数MP回復+〇,被弾時にMP回復+〇%(攻撃MP回復依存),恐怖付与確率+〇%,敵def低下(上限Normal50%、エターナルナイトメア),敵mdef低下(上限Normal50%、エターナルナイトメア),HP消費行動(〇秒ごと),クリティカル加算(基礎STR)+〇%,破壊付与確率+〇%,鈍足付与確率+〇%,暗闇付与確率+〇%,脱力付与確率+〇%,沈黙付与確率+〇%,眩暈付与確率+〇%,発火付与確率+〇%,凍結付与確率+〇%,停止付与確率+〇%,猛毒付与確率+〇%,転倒付与確率+〇%,怯み付与確率+〇%,獲得素材ポイント下限増加+〇,合成基礎値+〇,消費MP(その他),MPの回復,クールタイム(ミラージュステップ),戦闘時のMP自然回復量+〇%,戦闘時のHP自然回復量+〇%,効果範囲+〇m,応急手当の時間短縮+〇%,総攻撃MP回復+〇%,発動時に確率で恐怖を解除+〇%,発動時に確率で衰弱を解除+〇%,爆発軽減+〇%,クールタイム(クイックローダー),発動時にMP回復+〇,猛毒確率加算(サブ武器%),HP回復加算(基礎DEX%),ヘイト発生値+〇,HPレベル依存上昇+〇%,割合ダメージ軽減+〇%,猛毒100%に必要なサブATK(クリティカル),猛毒(+1)100%に必要なサブATK(クリティカル),猛毒(+2)100%に必要なサブATK(クリティカル),付与するベノムインジェクトバフ回数,消費MP(割合),吸引軽減+〇%,通常慣れ変動,物理慣れ変動,魔法慣れ変動,追加日,必要食物ポイント,消費MP,最小射程,最大射程,通常攻撃の威力+〇,付与停止(怯み),付与停止(転倒),付与停止(気絶),スキル1HIT目,スキル2HIT目,スキル3HIT目,スキル4HIT目,スキル5HIT目,抜刀攻撃,有利属性,抜刀スキル,スミス作成武器,スミス作成防具,消費MP半減,効果時間不定,確定クリティカル,弱点魔法の場合にクリティカルチャンス付与,過負荷カウント上限緩和,過負荷カウント下限緩和,動作時に無敵付与,画竜点睛強化カウント付与,画竜点睛強化カウント倍増,モノノフスキル限定,ブレードスキル限定,天流乱星スタック消費数の緩和,天流乱星強化,必中属性,トレード不能,次スキルの消費スキル半減,ナイフコンバット状態付与,効果終了時にデコイシューターの自動発動,素材加工可能,染色保存可能,装備合成可能,通常攻撃時に射程内まで素早く移動,抜刀剣スキル時に射程内まで素早く移動,攻撃範囲強化,貯め時間をやや減少,貯め時間を減少,チャージングによる時短あり,チャージングによる時短なし,分身の生成,HPが少ないときに異常耐性増加,スキル詠唱中でもAvoid可能,命中時に部位破壊を延長,HP回復(最大HP×20%+3000)(ヒール),戦闘不能短縮(ヒール),HP回復(最大HP×30%+5000)(ハイネスヒール),HP回復(最大HP×10%+300)(ぷちヒール),歌スキルの再開,MP回復(歌スキル中),通常攻撃が届かない時に魔法弾で攻撃,マジックスキルを使うたびに詠唱時間短縮,MP持続回復(25+補正後INT×10%),自分の状態異常回復,スキル攻撃成功時に確率でMP回復,連続使用はMP消費0(通常慣れ),射程は通常攻撃と同じ,効果中はガード可能,Guard回復%(VIT/10),ジャストガード時に行動不能状態異常を無効,ハイドアタックも同時発動,スキル攻撃に属性を2つ付与可能,発動時にHP消費,猛毒付与クリティカル時2倍,猛毒付与Graze時1/2倍,ベノムインジェクト強化(重ね掛け可能),ブーメランが手元に戻るとMP100回復,ブーメランがないとスキルが空振り,最も離れている仲間を回復,HP回復(他メンバ含む最大HP×4%+500)(ヒールショット),HP消費量5%(最低100),メンバー数に応じて物理バリアを獲得,次に使用する通常攻撃を強化,前線維持強化(魔法バリアも付与),クロスファイアのチャージを1回増加して発動,ジャストガード時に鬼力付与,味方の戦闘不能で発動,ランページ強化(倍率2倍)(オーガスラッシュ),バーサーク強化(安定率)(オーガスラッシュ),効果中はスキルモーション時に行動不能無効,効果中はHP回復(消費MP^2/100),弱点攻撃時に最大HP1%を回復する回復バリアを取得(重複可能),通常攻撃に猛毒を付与,ボールコエヌビアをすべて討伐すると属性変化,旋身番撃ちの印が付いた対象には足元に発射,マジックスキル限定,チャージ量の増加(マジックカノン),100%以上のチャージ時はGuard貫通の確率を追加(マジックカノン),最後に使用したマジックスキルを再発動,消費MPが足りない場合はHPを消費,足元に結界を配置(術式結界),結界HPまでダメージを確率で肩代わり(術式結界),結界内は詠唱怯みを無効(術式結界),結界内はMPヘイトを軽減(術式結界),結界内は術式/バーストの詠唱軽減カウントの増加量を上昇(術式結界),結界内は術式/フィナウの詠唱時間を短縮(術式結界),結界内はカダルエレクシオの過負荷100%を一度だけ99%にする(術式結界),結界HPは結界内でMP回復を実施することで回復(術式結界),発動距離に関わらず近接威力の対象,鍛冶屋品,ドロップ品,クエスト品,トレード可能,情報は間違っている可能性があります,エリアバフ,パーティーバフ,最大ATK/MATK者にバフ,景品交換品,アイテムボックス,攻撃距離(シャイニングクロス),天流乱星スタック数(斬納),HP消費行動回数(ソウルハント),コンボ深度(ドラゴニックチャージ),攻撃距離(ドラゴニックチャージ),巻き込んだ敵の数(ツインバスターブレード),チャージ回数全体(クロスファイア),チャージ回数(クロスファイア),チャージ回数(サブクロスファイア),チャージ率(1HIT目マジックカノン),チャージ率(1HIT目魔道具マジックカノン),チャージ率(1HIT目杖マジックカノン),チャージ率(2HIT目マジックカノン),チャージ率(2HIT目魔道具マジックカノン),チャージ率(2HIT目杖マジックカノン),チャージ率(3HIT目マジックカノン),チャージ率(3HIT目魔道具マジックカノン),チャージ率(3HIT目杖マジックカノン),チャージ率(4HIT目マジックカノン),チャージ率(4HIT目魔道具マジックカノン),チャージ率(4HIT目杖マジックカノン),チャージ率(5HIT目マジックカノン),チャージ率(5HIT目魔道具マジックカノン),チャージ率(5HIT目杖マジックカノン),神罰スタック数(ネメシス),天流乱星スタック数(天流乱星),破壊付与時(天上天下無双斬り),怪力乱心バフ(天上天下無双斬り),ゴッドハンドバフ×チャージ数(ゴリアステイクショット),ゴッドハンドバフ数(ゲイザーシュート),気絶付与時(シールドキャノン),ボス難易度(通常),破壊付与時(画竜点睛),怪力乱心バフ(画竜点睛),スタック数(画竜点睛),天流乱星スタック数(斬維),現在HP%(抜打先之先),敵出血(シャットアウト両手剣),敵出血(シャットアウト片手剣),敵出血(シャットアウト双剣),恐怖付与時(ソウルハント),距離(ゲイザーシュート),停止付与時(ハイレインスナイプ),ヘイト(フリンチナイフ),HIT数(ガトリングナイフ),ボルト切れ時(自動弓コンクェスター),自身発火時(コンクェスター),敵暗闇時(スナイピング),鈍足付与時(メーバショット),麻痺付与時(パライズショット),印の強化回数(旋身番撃ち),暗闇付与時(スモークダスト),脱力付与時(アームブレイク),トラップ変化時(パラボラキャノン),発動状態(ツインストーム),HIT回数(Max1HIT),HIT回数(Max3HIT),HIT回数(Max5HIT),HIT回数(Max6HIT),HIT回数(1発目術式/フォール),HIT回数(2発目術式/フォール),HIT回数(3発目術式/フォール),部位破壊[胴体](ギュルダー),部位破壊[尻尾](ギュルダー),部位破壊数(オキュラシーネ),部位破壊[胴体](オキュラシーネ),敵HP(ガルドゴーレム),敵HP(イグネウス),部位破壊数(ミミューガ),時間経過[20秒ごと](ビルロッシュ),ヘイト持ちとの距離(ガラムーワ),状態異常(グラウス),状態異常(ケシュピオン),状態異常(アミューバマキナ),状態異常(ペリプラスティ),状態異常(ゴールド・ジャン),状態異常(オニクマムシ),状態異常(血塗られた結晶),状態異常(アルマイト),状態異常(ブラーミス),ボール数(ドミナレドル),敵HP(高難易度アルタダール),敵色(ドン・プロフンド),状態異常(バテュード),敵HP(轟竜ボビナリー),難易度(シアカラード),状態異常(シアカラードブラック),難易度(アイトリーベ),敵HP(アイトリーベブラック),難易度(ジャンドゥ),難易度(ガルナッシュ),敵HPと状態異常(ガルナッシュブラック),難易度(ミエリ),難易度(ブローカーゴブリン),難易度(ゼルゾナ),難易度(アマルゴン),敵FLEE(ゼルゾナ),敵FLEE(アマルゴン),難易度(ペルルラージ),時間経過(ペルルラージ250),敵HP(ペルルラージコーヒー),敵の状態(ハンマーダウン),巻き込んだ敵の数(クリーヴアタック),ハンマーダウンスタック数(ストームブレイザー),鬼力スタック数(オーガスラッシュ),鬼力スタック数爆発(オーガスラッシュ),敵の猛毒状態(ベノムスナッチ),奪い取った猛毒(デスリセプション),死毒の回数(デスリセプション死毒),残っているボールコエヌビアの数(ヒュミーダ水),残っているボールコエヌビアの数(ヒュミーダ闇),形態(ルトセーザ),発動前のMP(フューネヴィンデ),HIT回数(Max55HIT),オーラブレイドのSLv(バスターブレード),メイン武器の属性,サブ武器の属性,スキルの属性,敵の属性,アイテム種類,スキル参照ステータス,スキル慣れ,スキル近距離有効,スキル遠距離有効,スキルロングレンジ有効,エネミータイプ,敵Avoid可能性,分身通常攻撃によるMP回復,分身の移動,コンボ威力無効,スキル範囲攻撃,強化前クリスタ,追加イベント名,関連スキル,関連クリスタ,ストーリー章名";
const PROP_KEYS = RAW_KEYS.split(",");

// --- DB & CSV Reader ---
const DB = {
  sub: [],
  add: [],
  spec: [],
  crysta: [],
  food: [],
  guildFood: [],
  registlet: [],
  boss: [],
  avatar: [],
  itemBuff: [],
  passive: [],
  active: [],
  trait: [],
  weaponPreset: [],
  bodyPreset: []
};

// キー表記ゆれ正規化: 記号の「○」(U+25CB) を漢数字の「〇」(U+3007) に統一して calc.js の参照キーと一致させる
function normalizePropKey(key) {
  return key ? key.trim().replace(/○/g, "〇") : "";
}

// ダブルクォート内のカンマに対応したCSV行パーサー
function splitCSVLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

function parseTanaife(csv, defType) {
  if (!csv) return [];
  const lines = csv.split(/\r?\n/);
  const items = [];
  let cur = null;
  const h = splitCSVLine(lines[0]);
  const idxT = h.indexOf("タイトル");
  const idxType = h.indexOf("種類");
  const idxL = h.indexOf("装備制限");
  const idxK = h.findIndex(col => col.trim().toLowerCase() === "key");
  const idxV = h.findIndex(col => col.trim().toLowerCase() === "value");

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const cols = splitCSVLine(lines[i]);
    if (cols.length < 3) continue;
    const title = cols[idxT]?.trim();
    const rowType = idxType >= 0 ? cols[idxType]?.trim() : "";
    const rowLimit = idxL >= 0 ? cols[idxL]?.trim() : "";
    const key = normalizePropKey(cols[idxK]);
    const val = cols[idxV]?.trim();

    if (title) {
      if (cur) items.push(cur);
      const resolvedType = (defType === "サブ武器" && rowLimit) ? rowLimit : (rowType || defType);
      cur = {
        name: title,
        type: resolvedType,
        category: rowType || defType,
        limit: rowLimit || "",
        rel: [title],
        p: {}
      };
    }
    if (cur && key) {
      if (key === "関連クリスタ") {
        const rels = val.split(",").map(s => s.trim()).filter(Boolean);
        rels.forEach(r => {
          if (!cur.rel.includes(r)) cur.rel.push(r);
        });
        if (!cur.rel.includes(cur.name)) cur.rel.push(cur.name);
      } else {
        const numVal = Number(val);
        const parsedVal = !isNaN(numVal) && val !== "" ? ((cur.p[key] || 0) + numVal) : val;
        cur.p[key] = parsedVal;
        if (key === "サブ武器ATK" && typeof parsedVal === "number") {
          cur.p["武器ATK"] = (cur.p["武器ATK"] || 0) + numVal;
        }
        if (key === "サブ武器安定率" && typeof parsedVal === "number") {
          cur.p["安定率"] = (cur.p["安定率"] || 0) + numVal;
        }
      }
    }
  }
  if (cur) items.push(cur);
  return items;
}

/**
 * 料理・ギルド飯CSVパーサー
 * フォーマット: タイトル,種類,Key,lv1,lv2,lv3,lv4,lv5,lv6,lv7,lv8,lv9,lv10
 */
function parseFoodCSV(csv) {
  const foods = [];
  const guildFoods = [];
  if (!csv) return { foods, guildFoods };

  const lines = csv.split(/\r?\n/);
  const h = splitCSVLine(lines[0]).map(s => s.trim());
  const idxT = h.indexOf("タイトル");
  const idxType = h.indexOf("種類");
  const idxK = h.findIndex(col => col.toLowerCase() === "key");
  const lvIndices = [];
  for (let lv = 1; lv <= 10; lv++) {
    lvIndices.push(h.findIndex(col => col.toLowerCase() === `lv${lv}`));
  }

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const cols = splitCSVLine(lines[i]);
    if (cols.length < 4) continue;
    const title = cols[idxT]?.trim();
    const type = cols[idxType]?.trim();
    const key = normalizePropKey(cols[idxK]);
    if (!title || !key) continue;

    const levels = lvIndices.map(idx => (idx >= 0 ? (Number(cols[idx]?.trim()) || 0) : 0));
    const item = {
      name: title,
      type: type || "料理",
      key,
      levels
    };

    if (type === "ギルド飯") {
      guildFoods.push(item);
    } else {
      foods.push(item);
    }
  }

  return { foods, guildFoods };
}

/**
 * レジスタレットCSVパーサー
 * フォーマット: タイトル,種類,key,Value
 */
function parseRegistletCSV(csv) {
  const list = [];
  if (!csv) return list;

  const lines = csv.split(/\r?\n/);
  const h = splitCSVLine(lines[0]).map(s => s.trim());
  const idxT = h.indexOf("タイトル");
  const idxType = h.indexOf("種類");
  const idxK = h.findIndex(col => col.toLowerCase() === "key");
  const idxV = h.findIndex(col => col.toLowerCase() === "value");

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const cols = splitCSVLine(lines[i]);
    if (cols.length < 4) continue;
    const title = cols[idxT]?.trim();
    const type = cols[idxType]?.trim() || "レジスタレット";
    const key = normalizePropKey(cols[idxK]);
    const val = Number(cols[idxV]?.trim()) || 0;
    if (!title || !key) continue;

    list.push({
      name: title,
      type,
      key,
      value: val
    });
  }

  return list;
}

/**
 * ボスデータCSV/TSVパーサー
 * フォーマット: ボス名,エネミータイプ,属性,HP,DEF,MDEF,FLEE,物理耐性,魔法耐性,クリティカル耐性,武器耐性,value(,Lv)
 * ※記載されている各数値はすべて難易度「Normal（1倍）」基準
 */
function parseBossCSV(text) {
  const list = [];
  if (!text) return list;

  const lines = text.split(/\r?\n/);
  const delimiter = lines[0].includes("\t") && !lines[0].includes(",") ? "\t" : ",";
  const splitLine = (line) => (delimiter === "\t" ? line.split("\t") : splitCSVLine(line));

  const h = splitLine(lines[0]).map(s => s.trim());
  const idxName = h.indexOf("ボス名");
  const idxType = h.indexOf("エネミータイプ");
  const idxElem = h.indexOf("属性");
  const idxHp   = h.indexOf("HP");
  const idxDef  = h.indexOf("DEF");
  const idxMdef = h.indexOf("MDEF");
  const idxFlee = h.indexOf("FLEE");
  const idxPres = h.indexOf("物理耐性");
  const idxMres = h.indexOf("魔法耐性");
  const idxCres = h.indexOf("クリティカル耐性");
  const idxWres = h.indexOf("武器耐性");
  const idxLv   = h.findIndex(col => col === "Lv" || col === "敵Lv" || col === "レベル" || col === "Level");

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const cols = splitLine(lines[i]);
    if (cols.length < 4) continue;
    const name = cols[idxName]?.trim();
    if (!name) continue;

    const rawHp = idxHp >= 0 ? cols[idxHp]?.trim() : "";
    const numHp = Number(rawHp);
    const hp = (rawHp !== "" && rawHp !== "-" && !isNaN(numHp)) ? numHp : null;

    const rawLv = idxLv >= 0 ? cols[idxLv]?.trim() : "";
    const numLv = Number(rawLv);
    const lv = (rawLv !== "" && !isNaN(numLv) && numLv > 0) ? numLv : null;

    list.push({
      name,
      enemyType: (idxType >= 0 ? cols[idxType]?.trim() : "") || "ボス",
      elem:      (idxElem >= 0 ? cols[idxElem]?.trim() : "") || "無",
      hp,
      rawHp:     rawHp || "-",
      def:       idxDef  >= 0 ? (Number(cols[idxDef]?.trim())  || 0) : 0,
      mdef:      idxMdef >= 0 ? (Number(cols[idxMdef]?.trim()) || 0) : 0,
      flee:      idxFlee >= 0 ? (Number(cols[idxFlee]?.trim()) || 0) : 0,
      physRes:   idxPres >= 0 ? (Number(cols[idxPres]?.trim()) || 0) : 0,
      magRes:    idxMres >= 0 ? (Number(cols[idxMres]?.trim()) || 0) : 0,
      critRes:   idxCres >= 0 ? (Number(cols[idxCres]?.trim()) || 0) : 0,
      weapRes:   idxWres >= 0 ? (Number(cols[idxWres]?.trim()) || 0) : 0,
      lv
    });
  }

  return list;
}

// 難易度別ステータス補正倍率（エネミータイプが「ボス」の時のみ適用）
const BOSS_DIFFICULTY_MULTS = {
  Easy:     { hp: 0.1, def: 0.1, mdef: 0.1, flee: 0.1 },
  Normal:   { hp: 1,   def: 1,   mdef: 1,   flee: 1   },
  Hard:     { hp: 2,   def: 2,   mdef: 2,   flee: 2   },
  Lunatic:  { hp: 5,   def: 4,   mdef: 4,   flee: 4   },
  Ultimate: { hp: 10,  def: 6,   mdef: 6,   flee: 6   }
};

/**
 * ボスデータと選択された難易度から補正後ステータスを算出する
 * - エネミータイプが「ボス」以外（FB、ギルドレイドなど）の場合は常に1倍（Normal）
 * - 倍率計算で小数点以下が発生した場合はすべて Math.floor で切り捨て整数化
 * - 属性・物理耐性・魔法耐性・クリティカル耐性・武器耐性は難易度による変動なし
 */
function calcBossStats(boss, difficulty = "Normal") {
  if (!boss) return null;
  const isStandardBoss = boss.enemyType === "ボス";
  const effDiff = isStandardBoss && BOSS_DIFFICULTY_MULTS[difficulty] ? difficulty : "Normal";
  const mult = isStandardBoss ? (BOSS_DIFFICULTY_MULTS[effDiff] || BOSS_DIFFICULTY_MULTS.Normal) : BOSS_DIFFICULTY_MULTS.Normal;

  const finalHp = boss.hp !== null ? Math.floor(boss.hp * mult.hp) : null;
  const finalDef = Math.floor(boss.def * mult.def);
  const finalMdef = Math.floor(boss.mdef * mult.mdef);
  const finalFlee = Math.floor(boss.flee * mult.flee);

  return {
    name: boss.name,
    enemyType: boss.enemyType,
    isStandardBoss,
    difficulty: effDiff,
    elem: boss.elem,
    hp: finalHp,
    hpDisplay: finalHp !== null ? finalHp.toLocaleString() : (boss.rawHp || "-"),
    def: finalDef,
    mdef: finalMdef,
    flee: finalFlee,
    physRes: boss.physRes,
    magRes: boss.magRes,
    critRes: boss.critRes,
    weapRes: boss.weapRes,
    lv: boss.lv
  };
}

/**
 * おしゃれ装備の同部位内重複チェック用識別キーを生成する
 * - key が「ヘイト+〇%」かつ value > 0 → 「ヘイト+〇%_plus」
 * - key が「ヘイト+〇%」かつ value < 0 → 「ヘイト+〇%_minus」
 * - それ以外のすべての項目 → 「keyそのまま」
 */
function getAvatarConflictKey(rawKey, value) {
  if (!rawKey) return "";
  if (rawKey === "ヘイト+〇%" && value > 0) return "ヘイト+〇%_plus";
  if (rawKey === "ヘイト+〇%" && value < 0) return "ヘイト+〇%_minus";
  return rawKey;
}

// おしゃれ・アイテムバフCSV内のキー(ASPD+〇、火属性に有利+〇%等)を calc.js の計算参照キー(攻撃速度+〇、火属性にダメージ+〇%等)に変換する
function mapAvatarKeyForCalc(rawKey) {
  const aliasMap = {
    "ASPD+〇": "攻撃速度+〇",
    "ASPD+〇%": "攻撃速度+〇%",
    "CSPD+〇": "詠唱速度+〇",
    "CSPD+〇%": "詠唱速度+〇%",
    "物理追撃〇%": "物理追撃+〇%",
    "魔法追撃〇%": "魔法追撃+〇%",
    "ダメージ反射〇%": "ダメージ反射+〇%",
    "火属性に有利+〇%": "火属性にダメージ+〇%",
    "水属性に有利+〇%": "水属性にダメージ+〇%",
    "風属性に有利+〇%": "風属性にダメージ+〇%",
    "地属性に有利+〇%": "地属性にダメージ+〇%",
    "光属性に有利+〇%": "光属性にダメージ+〇%",
    "闇属性に有利+〇%": "闇属性にダメージ+〇%",
    "無属性に有利+〇%": "無属性にダメージ+〇%",
    "火有利+〇%": "火属性にダメージ+〇%",
    "水有利+〇%": "水属性にダメージ+〇%",
    "風有利+〇%": "風属性にダメージ+〇%",
    "地有利+〇%": "地属性にダメージ+〇%",
    "光有利+〇%": "光属性にダメージ+〇%",
    "闇有利+〇%": "闇属性にダメージ+〇%",
    "無有利+〇%": "無属性にダメージ+〇%",
    "魔法対属性+〇%": "属性有利+〇%"
  };
  return aliasMap[rawKey] || rawKey;
}

/**
 * おしゃれ装備データCSVパーサー
 * フォーマット: タイトル,種類,key,value
 * 「種類」が「おしゃれ」の項目を抽出する
 */
function parseAvatarCSV(csv) {
  const list = [];
  if (!csv) return list;

  const lines = csv.split(/\r?\n/);
  const h = splitCSVLine(lines[0]).map(s => s.trim());
  const idxT = h.indexOf("タイトル");
  const idxType = h.indexOf("種類");
  const idxK = h.findIndex(col => col.toLowerCase() === "key");
  const idxV = h.findIndex(col => col.toLowerCase() === "value");

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const cols = splitCSVLine(lines[i]);
    if (cols.length < 4) continue;
    const title = cols[idxT]?.trim();
    const type = cols[idxType]?.trim();
    const rawKey = normalizePropKey(cols[idxK]);
    const val = Number(cols[idxV]?.trim());
    if (!title || type !== "おしゃれ" || !rawKey || isNaN(val)) continue;

    list.push({
      name: title,
      type,
      rawKey,
      calcKey: mapAvatarKeyForCalc(rawKey),
      value: val,
      conflictKey: getAvatarConflictKey(rawKey, val)
    });
  }

  return list;
}

/**
 * アイテムバフデータCSVパーサー
 * フォーマット: タイトル,カテゴリ,key,value (複数行で1アイテムを構成)
 * ※同じカテゴリのアイテムは重複不可
 */
function parseItemBuffCSV(csv) {
  const items = [];
  if (!csv) return items;

  const lines = csv.split(/\r?\n/);
  const h = splitCSVLine(lines[0]).map(s => s.trim());
  const idxT = h.indexOf("タイトル");
  const idxCat = h.findIndex(col => col === "カテゴリ" || col === "カテゴリー" || col === "種類");
  const idxK = h.findIndex(col => col.toLowerCase() === "key");
  const idxV = h.findIndex(col => col.toLowerCase() === "value");

  let cur = null;
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const cols = splitCSVLine(lines[i]);
    if (cols.length < 2) continue;
    const title = idxT >= 0 ? cols[idxT]?.trim() : "";
    const cat = idxCat >= 0 ? cols[idxCat]?.trim() : "";
    const rawKey = idxK >= 0 ? normalizePropKey(cols[idxK]) : "";
    const rawVal = idxV >= 0 ? cols[idxV]?.trim() : "";

    if (title) {
      if (cur) items.push(cur);
      cur = {
        name: title,
        category: cat || "その他",
        p: {},
        effects: []
      };
    }

    if (cur && rawKey && rawVal !== "") {
      const numVal = Number(rawVal);
      if (!isNaN(numVal)) {
        const calcKey = mapAvatarKeyForCalc(rawKey);
        cur.p[calcKey] = (cur.p[calcKey] || 0) + numVal;
        cur.effects.push({ rawKey, calcKey, val: numVal });
      }
    }
  }
  if (cur) items.push(cur);
  return items;
}

/**
 * パッシブ・バフスキルの数式評価エンジン
 * SLv, Lv, およびスキル固有パラメータ(スタック数, 補正後STR/DEX等)をバインドして評価する
 */
function evalPassiveFormula(expr, slv, playerLv, extraVars = {}) {
  if (expr === undefined || expr === null) return null;
  const s = String(expr).trim();
  if (!s) return null;
  const directNum = Number(s);
  if (!isNaN(directNum)) return directNum;

  try {
    const varNames = Object.keys(extraVars);
    const varVals = varNames.map(k => extraVars[k]);
    const fn = new Function(
      "SLv", "Lv", "floor", "ceil", "max", "min",
      ...varNames,
      `"use strict"; return (${s});`
    );
    const val = fn(slv, playerLv, Math.floor, Math.ceil, Math.max, Math.min, ...varVals);
    if (typeof val === "number" && !isNaN(val)) {
      return Math.floor(val);
    }
  } catch (e) {
    console.warn("Skill formula eval failed:", s, e);
  }
  return null;
}

/**
 * パッシブ・バフスキルの「制限」カラム判定
 */
function isPassiveRestrictionMet(limitStr, wType, subType) {
  if (!limitStr || !limitStr.trim()) return true;
  const isDualSword = wType === "双剣" || (wType === "片手剣" && subType === "片手剣");

  const checkToken = (token) => {
    const t = token.trim();
    if (!t) return true;
    if (t.includes("+")) {
      return t.split("+").every(part => checkToken(part));
    }
    switch (t) {
      case "サブ武器なし":
        return subType === "なし" && wType !== "双剣";
      case "盾なし":
        return subType !== "盾";
      case "盾":
        return subType === "盾";
      case "短剣":
        return subType === "短剣";
      case "忍術巻物":
      case "巻物":
        return subType === "巻物";
      case "矢":
        return subType === "矢";
      case "片手剣":
        return wType === "片手剣" || isDualSword;
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
      case "メイン魔道具":
      case "メイン魔導具":
        return wType === "魔導具";
      case "魔道具":
      case "魔導具":
        return wType === "魔導具" || subType === "魔導具";
      case "手甲":
        return wType === "手甲" || subType === "手甲";
      case "メイン素手":
      case "素手":
        return wType === "素手";
      case "旋風槍":
        return wType === "旋風槍";
      case "抜刀剣":
        return wType === "抜刀剣";
      default:
        return wType === t || subType === t;
    }
  };

  const orTokens = limitStr.split(/[、,]/);
  return orTokens.some(tok => checkToken(tok));
}

/**
 * パッシブ・バフスキルデータCSVパーサー
 * フォーマット: タイトル,種類,Key,Value,制限
 */
function parsePassiveCSV(csv, defaultType = "パッシブ") {
  const skills = [];
  if (!csv) return skills;

  const lines = csv.split(/\r?\n/);
  const h = splitCSVLine(lines[0]).map(s => s.trim());
  const idxT = h.indexOf("タイトル");
  const idxType = h.indexOf("種類");
  const idxK = h.findIndex(col => col.toLowerCase() === "key");
  const idxV = h.findIndex(col => col.toLowerCase() === "value");
  const idxL = h.indexOf("制限");

  let cur = null;
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const cols = splitCSVLine(lines[i]);
    if (cols.length < 3) continue;
    const title = idxT >= 0 ? cols[idxT]?.trim() : "";
    if (title === "タイトル") continue; // 途中の重複ヘッダー行をスキップ
    const type = idxType >= 0 ? cols[idxType]?.trim() : defaultType;
    const rawKey = idxK >= 0 ? normalizePropKey(cols[idxK]) : "";
    const expr = idxV >= 0 ? cols[idxV]?.trim() : "";
    const limit = idxL >= 0 ? cols[idxL]?.trim() : "";

    if (title) {
      if (cur) skills.push(cur);
      cur = {
        name: title,
        type: type || defaultType,
        rows: []
      };
    }

    if (cur && rawKey) {
      cur.rows.push({
        rawKey,
        calcKey: mapAvatarKeyForCalc(rawKey),
        expr,
        limit
      });
    }
  }
  if (cur) skills.push(cur);
  return skills;
}

/**
 * 特性の数式評価エンジン
 * Tier, STR, INT, TEC, pow, および 〇〇スタック数 をバインドして評価する
 */
function evalTraitFormula(expr, tier, baseStats = {}, stackVars = {}) {
  if (expr === undefined || expr === null) return null;
  const s = String(expr).trim();
  if (!s) return null;
  const directNum = Number(s);
  if (!isNaN(directNum)) return directNum;

  try {
    const vars = {
      Tier: tier,
      STR: baseStats.str || 0,
      INT: baseStats.int || 0,
      TEC: baseStats.tec || 0,
      floor: Math.floor,
      ceil: Math.ceil,
      max: Math.max,
      min: Math.min,
      pow: Math.pow,
      ...stackVars
    };
    const varNames = Object.keys(vars);
    const varVals = varNames.map(k => vars[k]);
    const fn = new Function(...varNames, `"use strict"; return (${s});`);
    const val = fn(...varVals);
    if (typeof val === "number" && !isNaN(val)) {
      return Math.floor(val);
    }
    if (typeof val === "string") {
      return val;
    }
  } catch (e) {
    console.warn("Trait formula eval failed:", s, e);
  }
  return null;
}

/**
 * 特性データCSVパーサー
 * フォーマット: タイトル,種類,Key,Value,制限
 */
function parseTraitCSV(csv) {
  const traits = [];
  if (!csv) return traits;

  const lines = csv.split(/\r?\n/);
  const h = splitCSVLine(lines[0]).map(s => s.trim());
  const idxT = h.indexOf("タイトル");
  const idxType = h.indexOf("種類");
  const idxK = h.findIndex(col => col.toLowerCase() === "key");
  const idxV = h.findIndex(col => col.toLowerCase() === "value");

  let cur = null;
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const cols = splitCSVLine(lines[i]);
    if (cols.length < 3) continue;
    const title = idxT >= 0 ? cols[idxT]?.trim() : "";
    if (title === "タイトル") continue;
    const type = idxType >= 0 ? cols[idxType]?.trim() : "特性";
    const rawKey = idxK >= 0 ? normalizePropKey(cols[idxK]) : "";
    const expr = idxV >= 0 ? cols[idxV]?.trim() : "";

    if (title) {
      if (cur) traits.push(cur);
      cur = {
        name: title,
        type: type || "特性",
        rows: [],
        stackVars: []
      };
    }

    if (cur && rawKey) {
      const matches = expr.match(/[^\d\s\+\-\*\/\(\)\,\.\?\:\=\!\<\>\"]+スタック数/g) || [];
      matches.forEach(sv => {
        if (!cur.stackVars.includes(sv)) cur.stackVars.push(sv);
      });
      cur.rows.push({
        rawKey,
        calcKey: mapAvatarKeyForCalc(rawKey),
        expr
      });
    }
  }
  if (cur) traits.push(cur);
  return traits;
}

// Googleスプレッドシート「ウェブに公開 (CSV)」URL定義
/**
 * 武器プロパティプリセットCSVパーサー
 * フォーマット: タイトル,カテゴリ,key,value,推奨武器
 */
function parseWeaponPresetCSV(csv) {
  const presets = [];
  if (!csv) return presets;

  const lines = csv.split(/\r?\n/);
  const h = splitCSVLine(lines[0]).map(s => s.trim());
  const idxT = h.indexOf("タイトル");
  const idxCat = h.indexOf("カテゴリ");
  const idxK = h.findIndex(col => col.toLowerCase() === "key");
  const idxV = h.findIndex(col => col.toLowerCase() === "value");
  const idxRec = h.indexOf("推奨武器");

  let cur = null;
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const cols = splitCSVLine(lines[i]);
    if (cols.length < 3) continue;
    const title = idxT >= 0 ? cols[idxT]?.trim() : "";
    if (title === "タイトル") continue;
    const category = idxCat >= 0 ? cols[idxCat]?.trim() : "武器プロパティ";
    const key = idxK >= 0 ? normalizePropKey(cols[idxK]) : "";
    let val = idxV >= 0 ? cols[idxV]?.trim() : "";
    const rec = idxRec >= 0 ? cols[idxRec]?.trim() : "";

    if (title) {
      if (cur) presets.push(cur);
      cur = {
        name: title,
        category: category || "武器プロパティ",
        recommended: rec || "",
        rows: []
      };
    }

    if (cur && key && val !== "") {
      if (key === "メイン武器の属性") {
        val = val.replace(/属性$/, "").trim();
      }
      cur.rows.push({ key, value: val });
    }
  }
  if (cur) presets.push(cur);
  return presets;
}

// 第1優先でこの公開URLから最新データを直接フェッチし、オフライン等の場合のみローカルCSVにフォールバックします
const SHEET_CSV_URLS = {
  sub:       "https://docs.google.com/spreadsheets/d/e/2PACX-1vSJPZt5SzeQm6blK695DybKCuWyw8rjrMP0lqZKRPkX8wGMbZD9HcXiO2poZCpZtAk-iuc4TmYnbzFG/pub?gid=139079656&single=true&output=csv",
  add:       "https://docs.google.com/spreadsheets/d/e/2PACX-1vSJPZt5SzeQm6blK695DybKCuWyw8rjrMP0lqZKRPkX8wGMbZD9HcXiO2poZCpZtAk-iuc4TmYnbzFG/pub?gid=1222030577&single=true&output=csv",
  spec:      "https://docs.google.com/spreadsheets/d/e/2PACX-1vSJPZt5SzeQm6blK695DybKCuWyw8rjrMP0lqZKRPkX8wGMbZD9HcXiO2poZCpZtAk-iuc4TmYnbzFG/pub?gid=1751976404&single=true&output=csv",
  crysta:    "https://docs.google.com/spreadsheets/d/e/2PACX-1vSJPZt5SzeQm6blK695DybKCuWyw8rjrMP0lqZKRPkX8wGMbZD9HcXiO2poZCpZtAk-iuc4TmYnbzFG/pub?gid=1583938243&single=true&output=csv",
  food:      "https://docs.google.com/spreadsheets/d/e/2PACX-1vSJPZt5SzeQm6blK695DybKCuWyw8rjrMP0lqZKRPkX8wGMbZD9HcXiO2poZCpZtAk-iuc4TmYnbzFG/pub?gid=1320439759&single=true&output=csv",
  registlet: "https://docs.google.com/spreadsheets/d/e/2PACX-1vSJPZt5SzeQm6blK695DybKCuWyw8rjrMP0lqZKRPkX8wGMbZD9HcXiO2poZCpZtAk-iuc4TmYnbzFG/pub?gid=1738990022&single=true&output=csv",
  boss:      "https://docs.google.com/spreadsheets/d/e/2PACX-1vSJPZt5SzeQm6blK695DybKCuWyw8rjrMP0lqZKRPkX8wGMbZD9HcXiO2poZCpZtAk-iuc4TmYnbzFG/pub?gid=1741817545&single=true&output=csv",
  avatar:    "https://docs.google.com/spreadsheets/d/e/2PACX-1vSJPZt5SzeQm6blK695DybKCuWyw8rjrMP0lqZKRPkX8wGMbZD9HcXiO2poZCpZtAk-iuc4TmYnbzFG/pub?gid=870422740&single=true&output=csv",
  item:      "https://docs.google.com/spreadsheets/d/e/2PACX-1vSJPZt5SzeQm6blK695DybKCuWyw8rjrMP0lqZKRPkX8wGMbZD9HcXiO2poZCpZtAk-iuc4TmYnbzFG/pub?gid=561056226&single=true&output=csv",
  passive:   "https://docs.google.com/spreadsheets/d/e/2PACX-1vSJPZt5SzeQm6blK695DybKCuWyw8rjrMP0lqZKRPkX8wGMbZD9HcXiO2poZCpZtAk-iuc4TmYnbzFG/pub?gid=703621081&single=true&output=csv",
  active:    "https://docs.google.com/spreadsheets/d/e/2PACX-1vSJPZt5SzeQm6blK695DybKCuWyw8rjrMP0lqZKRPkX8wGMbZD9HcXiO2poZCpZtAk-iuc4TmYnbzFG/pub?gid=495807070&single=true&output=csv",
  trait:     "https://docs.google.com/spreadsheets/d/e/2PACX-1vSJPZt5SzeQm6blK695DybKCuWyw8rjrMP0lqZKRPkX8wGMbZD9HcXiO2poZCpZtAk-iuc4TmYnbzFG/pub?gid=969180393&single=true&output=csv",
  weaponPreset: "https://docs.google.com/spreadsheets/d/e/2PACX-1vSJPZt5SzeQm6blK695DybKCuWyw8rjrMP0lqZKRPkX8wGMbZD9HcXiO2poZCpZtAk-iuc4TmYnbzFG/pub?gid=1997832774&single=true&output=csv",
  bodyPreset:   "https://docs.google.com/spreadsheets/d/e/2PACX-1vSJPZt5SzeQm6blK695DybKCuWyw8rjrMP0lqZKRPkX8wGMbZD9HcXiO2poZCpZtAk-iuc4TmYnbzFG/pub?gid=813887336&single=true&output=csv"
};

// 指定した候補パス群から最初に見つかったCSVをfetchする
async function fetchCSVWithFallback(paths) {
  for (const path of paths) {
    try {
      const isRemote = /^https?:\/\//i.test(path);
      const res = await fetch(path, { cache: "no-cache" });
      if (res.ok) {
        const text = await res.text();
        if (text && text.trim().length > 0) {
          return { text, isRemote, url: path };
        }
      }
    } catch (_) {
      // 次の候補パスを試行
    }
  }
  throw new Error(`CSVファイルの読み込みに失敗しました: ${paths[0]}`);
}

// 全CSVデータを自動フェッチしてDBに格納する
async function loadAllCSVData() {
  const [rSub, rAdd, rSpec, rCrys, rFood, rReg, rBoss, rAvatar, rItem, rPassive, rActive, rTrait, rWeaponPreset, rBodyPreset] = await Promise.all([
    fetchCSVWithFallback([SHEET_CSV_URLS.sub]),
    fetchCSVWithFallback([SHEET_CSV_URLS.add]),
    fetchCSVWithFallback([SHEET_CSV_URLS.spec]),
    fetchCSVWithFallback([SHEET_CSV_URLS.crysta]),
    fetchCSVWithFallback([SHEET_CSV_URLS.food]),
    fetchCSVWithFallback([SHEET_CSV_URLS.registlet]),
    fetchCSVWithFallback([SHEET_CSV_URLS.boss]),
    fetchCSVWithFallback([SHEET_CSV_URLS.avatar]),
    fetchCSVWithFallback([SHEET_CSV_URLS.item]),
    fetchCSVWithFallback([SHEET_CSV_URLS.passive]),
    fetchCSVWithFallback([SHEET_CSV_URLS.active]),
    fetchCSVWithFallback([SHEET_CSV_URLS.trait]),
    fetchCSVWithFallback([SHEET_CSV_URLS.weaponPreset]),
    fetchCSVWithFallback([SHEET_CSV_URLS.bodyPreset])
  ]);

  DB.sub = parseTanaife(rSub.text, "サブ武器");
  DB.add = parseTanaife(rAdd.text, "追加装備");
  DB.spec = parseTanaife(rSpec.text, "特殊装備");
  DB.crysta = parseTanaife(rCrys.text, "ノーマルクリスタ");

  const parsedFood = parseFoodCSV(rFood.text);
  DB.food = parsedFood.foods;
  DB.guildFood = parsedFood.guildFoods;
  DB.registlet = parseRegistletCSV(rReg.text);
  DB.boss = parseBossCSV(rBoss.text);
  DB.avatar = parseAvatarCSV(rAvatar.text);
  DB.itemBuff = parseItemBuffCSV(rItem.text);
  DB.passive = parsePassiveCSV(rPassive.text, "パッシブ");
  DB.active = parsePassiveCSV(rActive.text, "バフ");
  DB.trait = parseTraitCSV(rTrait.text);
  DB.weaponPreset = parseWeaponPresetCSV(rWeaponPreset.text);
  DB.bodyPreset = parseWeaponPresetCSV(rBodyPreset.text);

  const allResults = [rSub, rAdd, rSpec, rCrys, rFood, rReg, rBoss, rAvatar, rItem, rPassive, rActive, rTrait, rWeaponPreset, rBodyPreset];
  const remoteCount = allResults.filter(r => r.isRemote).length;

  return {
    subCount: DB.sub.length,
    addCount: DB.add.length,
    specCount: DB.spec.length,
    crystaCount: DB.crysta.length,
    foodCount: DB.food.length,
    guildFoodCount: DB.guildFood.length,
    registletCount: DB.registlet.length,
    bossCount: DB.boss.length,
    avatarCount: DB.avatar.length,
    itemBuffCount: DB.itemBuff.length,
    passiveCount: DB.passive.length,
    activeCount: DB.active.length,
    traitCount: DB.trait.length,
    weaponPresetCount: DB.weaponPreset.length,
    bodyPresetCount: DB.bodyPreset.length,
    remoteCount,
    totalSources: allResults.length
  };
}
