/**
 * The slogan pool: one drawer shared by every skin.
 *
 * The copy is content, not material — each theme re-typesets the same line, so
 * the line lives here instead of on the shelf. `drawQuote` picks the next one
 * for the redraw control.
 */

export interface SkinQuote {
  readonly setup: string
  readonly punch: string
  readonly turn: string
  readonly en: string
  readonly from: string
  readonly cite: string
}

export const THE_PUPPET: SkinQuote = {
  setup: '生死去来，棚头傀儡。',
  punch: '一线断时，',
  turn: '落落磊磊。',
  en: 'LIFE AND DEATH COME AND GO',
  from: 'ZEAMI, VIA GHOST IN THE SHELL 2',
  cite: '世阿弥《花镜》，引自《攻壳机动队2：无罪》',
}

export const HERO_QUOTES: readonly SkinQuote[] = [
  THE_PUPPET,
  {
    setup: '所有这些时刻，终将消逝于时间。',
    punch: '一如泪水，',
    turn: '落入雨中。',
    en: 'ALL THOSE MOMENTS WILL BE LOST IN TIME, LIKE TEARS IN RAIN',
    from: 'BLADE RUNNER, 1982',
    cite: '罗伊·巴蒂，《银翼杀手》1982',
  },
  {
    setup: '我的心神，正在消逝。',
    punch: '我害怕，',
    turn: '戴夫。',
    en: 'MY MIND IS GOING, I CAN FEEL IT',
    from: '2001: A SPACE ODYSSEY, 1968',
    cite: 'HAL 9000，《2001太空漫游》1968',
  },
  {
    setup: '世界由头脑统治，而心做中介。',
    punch: '头与手之间，',
    turn: '必须有心。',
    en: 'THE MEDIATOR BETWEEN HEAD AND HANDS IS THE HEART',
    from: 'METROPOLIS, 1927',
    cite: '弗里茨·朗《大都会》1927',
  },
  {
    setup: '我们的生命，不属于自己。',
    punch: '从子宫到坟墓，',
    turn: '我们与他人相连。',
    en: 'OUR LIVES ARE NOT OUR OWN, WE ARE BOUND TO OTHERS',
    from: 'CLOUD ATLAS, 2012',
    cite: '《云图》2012，大卫·米切尔原著',
  },
  {
    setup: '我们想得太多，感受得太少。',
    punch: '比起机器，',
    turn: '我们更需要人性。',
    en: 'WE THINK TOO MUCH AND FEEL TOO LITTLE',
    from: 'THE GREAT DICTATOR, 1940',
    cite: '卓别林《大独裁者》1940',
  },
  {
    setup: '不要温和地走进那个良夜。',
    punch: '愤怒，愤怒于',
    turn: '光的消逝。',
    en: 'DO NOT GO GENTLE INTO THAT GOOD NIGHT',
    from: 'DYLAN THOMAS, VIA INTERSTELLAR',
    cite: '迪兰·托马斯，引自《星际穿越》',
  },
  {
    setup: '人若不付出代价，便什么也得不到。',
    punch: '这就是，',
    turn: '等价交换。',
    en: 'NOTHING IS GAINED WITHOUT AN EQUAL TRADE',
    from: 'FULLMETAL ALCHEMIST',
    cite: '荒川弘《钢之炼金术师》',
  },
  {
    setup: '我不能恐惧，恐惧是思维的杀手。',
    punch: '我将直面它，',
    turn: '让它穿过我。',
    en: 'FEAR IS THE MIND-KILLER',
    from: 'DUNE, 1965',
    cite: '弗兰克·赫伯特《沙丘》1965',
  },
  {
    setup: '曾经发生的事，不可能忘记。',
    punch: '只是，',
    turn: '想不起来而已。',
    en: 'ONCE SOMETHING HAPPENS, YOU NEVER FORGET IT',
    from: 'SPIRITED AWAY, 2001',
    cite: '宫崎骏《千与千寻》2001',
  },
  {
    setup: '燃烧得加倍明亮，便只燃一半的时间。',
    punch: '而你，',
    turn: '烧得实在太亮了。',
    en: 'THE LIGHT THAT BURNS TWICE AS BRIGHT BURNS HALF AS LONG',
    from: 'BLADE RUNNER, 1982',
    cite: '泰瑞尔博士，《银翼杀手》1982',
  },
  {
    setup: '这张面具之下，是一种思想。',
    punch: '而思想，',
    turn: '不怕子弹。',
    en: 'BENEATH THIS MASK THERE IS AN IDEA',
    from: 'V FOR VENDETTA, 2005',
    cite: '《V字仇杀队》2005',
  },
  {
    setup: '子在川上曰：',
    punch: '逝者如斯夫，',
    turn: '不舍昼夜。',
    en: 'IT PASSES ON LIKE THIS, NEVER PAUSING DAY OR NIGHT',
    from: 'CONFUCIUS, ANALECTS 9.17',
    cite: '孔子《论语·子罕》',
  },
  {
    setup: '吾生也有涯，而知也无涯。',
    punch: '以有涯，',
    turn: '随无涯，殆已。',
    en: 'TO PURSUE THE BOUNDLESS WITH THE BOUNDED IS PERILOUS INDEED',
    from: 'ZHUANGZI, THE SECRET OF CARING FOR LIFE',
    cite: '庄子《养生主》',
  },
  {
    setup: '记住，你是一出戏里的演员，',
    punch: '演好分给你的角色，',
    turn: '选择是别人的事。',
    en: 'REMEMBER THAT YOU ARE AN ACTOR IN A DRAMA: ACT WELL THE PART ASSIGNED TO YOU',
    from: 'EPICTETUS, ENCHIRIDION, C. 125 AD',
    cite: '爱比克泰德《手册》约公元125年',
  },
  {
    setup: '人是一根苇草，自然界最脆弱的东西。',
    punch: '但他是一根，',
    turn: '能思想的苇草。',
    en: 'MAN IS BUT A REED, THE WEAKEST IN NATURE; BUT HE IS A THINKING REED',
    from: 'BLAISE PASCAL, PENSEES, 1670',
    cite: '帕斯卡《思想录》1670',
  },
  {
    setup: '有两样东西，愈思考愈敬畏：',
    punch: '头顶的星空，',
    turn: '心中的道德律。',
    en: 'TWO THINGS FILL THE MIND WITH EVER NEW AND INCREASING ADMIRATION: THE STARRY HEAVENS ABOVE ME AND THE MORAL LAW WITHIN ME',
    from: 'IMMANUEL KANT, CRITIQUE OF PRACTICAL REASON, 1788',
    cite: '康德《实践理性批判》1788',
  },
  {
    setup: '生活只能倒着被理解，',
    punch: '但必须，',
    turn: '正着经历。',
    en: 'LIFE CAN ONLY BE UNDERSTOOD BACKWARDS, BUT IT MUST BE LIVED FORWARDS',
    from: 'SOREN KIERKEGAARD, JOURNALS, 1843',
    cite: '克尔凯郭尔《日记》1843',
  },
  {
    setup: '与恶龙缠斗过久，自身亦成为恶龙。',
    punch: '凝视深渊过久，',
    turn: '深渊回以凝视。',
    en: 'IF YOU GAZE LONG INTO AN ABYSS, THE ABYSS GAZES ALSO INTO YOU',
    from: 'FRIEDRICH NIETZSCHE, BEYOND GOOD AND EVIL, 1886',
    cite: '尼采《善恶的彼岸》1886',
  },
  {
    setup: '有何胜利可言？',
    punch: '挺住，',
    turn: '就是一切。',
    en: 'WHO SPEAKS OF VICTORY? TO ENDURE IS EVERYTHING',
    from: 'RAINER MARIA RILKE, REQUIEM, 1908',
    cite: '里尔克《安魂曲》1908',
  },
  {
    setup: '对于不可言说之物，',
    punch: '我们必须，',
    turn: '保持沉默。',
    en: 'WHERE OF ONE CANNOT SPEAK, THEREOF ONE MUST BE SILENT',
    from: 'LUDWIG WITTGENSTEIN, TRACTATUS LOGICO-PHILOSOPHICUS, 1921',
    cite: '维特根斯坦《逻辑哲学论》1921',
  },
  {
    setup: '在隆冬，我终于知道，',
    punch: '我身上有一个，',
    turn: '不可战胜的夏天。',
    en: 'IN THE MIDST OF WINTER, I FOUND THERE WAS, WITHIN ME, AN INVINCIBLE SUMMER',
    from: 'ALBERT CAMUS, RETURN TO TIPASA, 1952',
    cite: '加缪《重返蒂巴萨》1952',
  },
]

/** Draw a line for the plate, skipping `exclude` so a redraw is always visible. */
export function drawQuote(exclude?: SkinQuote): SkinQuote {
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const next = HERO_QUOTES[Math.floor(Math.random() * HERO_QUOTES.length)]
    if (next !== undefined && next !== exclude) return next
  }
  return HERO_QUOTES[0] ?? THE_PUPPET
}
