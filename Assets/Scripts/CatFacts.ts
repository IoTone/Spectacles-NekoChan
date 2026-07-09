/**
 * Local dataset of Japanese cat facts (日本の猫にまつわる豆知識).
 *
 * Theme: native Japanese cats (日本の在来猫) and cat islands (猫島).
 * All content is bundled with the Lens — no internet is required at runtime.
 *
 * Facts are written in natural Japanese and kept short so they fit inside the
 * thought bubble. When adding facts, keep them to roughly 45 full-width
 * characters or fewer, and make sure every glyph exists in the bundled font
 * subset (see Assets/Fonts). Re-run the font subsetting step after editing.
 */

/** Facts about native Japanese cats, breeds and folklore. */
const NATIVE_CAT_FACTS: string[] = [
  "ジャパニーズボブテイルは、丸まった短い尾を持つ日本古来の猫種です。",
  "ボブテイルの短い尾は突然変異によるもので、一匹ずつ形が異なります。",
  "日本の在来猫は、尾の短いものや「かぎ尻尾」が多いのが特徴です。",
  "かぎ尻尾の猫は、幸運を引っかけて来ると言って昔から親しまれています。",
  "三毛猫はほとんどがメスで、オスは数万匹に一匹ほどしか生まれません。",
  "珍しいオスの三毛猫は、幸運を招くとして昔の船乗りに大切にされました。",
  "猫は奈良時代、仏教の経典をネズミから守るため中国から伝わったとされます。",
  "日本の妖怪「猫又」は、長生きした猫が化けたものと伝えられています。",
  "招き猫は、右手で金運を、左手で人やお客を招くと言われる縁起物です。",
  "招き猫発祥の地とされる豪徳寺には、数多くの招き猫が奉納されています。",
  "浮世絵師の歌川国芳は大の愛猫家で、猫を描いた作品を多く残しました。",
  "夏目漱石の『吾輩は猫である』は、猫の目線で人間を描いた名作です。",
  "日本では古くから、猫は蚕をネズミから守る大切な家族とされてきました。",
]

/** Facts about Japan's cat islands (猫島). */
const CAT_ISLAND_FACTS: string[] = [
  "日本には、猫がたくさん暮らす「猫島」と呼ばれる島がいくつもあります。",
  "宮城県の田代島は、人より猫が多いことで知られる有名な猫島です。",
  "田代島には、豊漁を願って祀られた「猫神社」と呼ばれるお社があります。",
  "愛媛県の青島は、猫の数が人の何倍にもなる小さな猫島として有名です。",
  "猫島の猫たちは、もともと漁網をかじるネズミを退治するために飼われました。",
  "福岡県の相島は、猫好きが世界中から訪れる猫島として知られています。",
  "神奈川県の江の島も、多くの猫が気ままに暮らす島として親しまれています。",
  "岡山県の真鍋島は、のんびり過ごす猫たちに出会える静かな猫島です。",
  "多くの猫島には商店が少なく、猫たちはゆったりと島時間を過ごしています。",
  "猫島の猫は、漁師さんに見守られながら島の暮らしに溶け込んでいます。",
]

/** All facts, combined. Order is irrelevant — the provider picks at random. */
export const CAT_FACTS: string[] = [...NATIVE_CAT_FACTS, ...CAT_ISLAND_FACTS]
