/*
 * 六道菜的记谱数据。
 *
 * 一步包含：什么时候开始（at，按分钟）、持续多久（minutes）、
 * 手在做什么（action），以及这一步里各种味道的强度（taste，0–1）。
 *
 * 这里的强度混合了一个事实和一个决定，两者分开记：
 *   note 字段写的是这一步真实发生的感官现象，例如"苦味会晚一些才被尝到"。
 *   数值本身是我的记谱选择，不是实测数据，也不是食品科学结论。
 * 每一项都可以被推翻，推翻之后曲线会跟着变，这正是作品的用法。
 *
 * removeIf 用于说明某种做法下这一步根本不存在，例如白灼没有"热油"。
 * techniques 列出这道菜讲得通的做法：糖的焦化需要锅，白灼讲不出焦糖洋葱，
 * 所以那种组合不放进选择里，而不是让用户看一条平到底的曲线。
 */

export const RECIPES = [
  {
    id: 'garlic-greens',
    name: '蒜蓉炒青菜',
    line: '先热油，再下蒜，最后大火翻两下。',
    techniques: ['stir', 'blanch', 'steam'],
    steps: [
      {
        id: 'prep', at: 0, minutes: 3, action: '择洗切好',
        note: '还没有味道，只有准备。',
        taste: { aroma: 0.12 }
      },
      {
        id: 'heat-oil', at: 3, minutes: 0.8, action: '热油', removeIf: ['blanch', 'steam'],
        note: '油面开始动，这一步只留下触感。',
        taste: { fat: 0.62, aroma: 0.15 }
      },
      {
        id: 'garlic', at: 3.8, minutes: 0.6, action: '下蒜末爆香',
        note: '香气在这一步冲到最高，但它比咸味先过去。',
        taste: { aroma: 0.9, fat: 0.5, salt: 0.12 }
      },
      {
        id: 'sear', at: 4.4, minutes: 1, action: '大火快炒',
        note: '咸和鲜几乎同时到达，这也是全曲最亮的一秒。',
        taste: { salt: 0.78, umami: 0.5, aroma: 0.4, fat: 0.3 }
      },
      {
        id: 'season', at: 5.4, minutes: 0.6, action: '二次调味',
        note: '盐在关火后又补了一次，这是第二下。',
        taste: { salt: 0.42, umami: 0.35 }
      }
    ]
  },
  {
    id: 'caramel-onion',
    name: '焦糖洋葱',
    line: '四十分钟里，糖一直往上走。',
    techniques: ['stir', 'braise', 'steam'],
    steps: [
      {
        id: 'slice', at: 0, minutes: 5, action: '切片',
        note: '切开的瞬间就有刺激性气味，但那不是甜。',
        taste: { aroma: 0.3 }
      },
      {
        id: 'oil', at: 5, minutes: 1, action: '下油铺底',
        note: '整段烹饪的低音底从这里开始，一直不断。',
        taste: { fat: 0.7 }
      },
      {
        id: 'sweat', at: 6, minutes: 10, action: '中火出水（10 分钟）',
        note: '这一步几乎没有味道，只是把水赶出去。',
        taste: { sugar: 0.2, umami: 0.25, fat: 0.55, aroma: 0.3 }
      },
      {
        id: 'caramel-1', at: 16, minutes: 12, action: '转小火（12 分钟）',
        note: '糖开始被尝到，但离焦化还有一段。',
        taste: { sugar: 0.55, umami: 0.4, fat: 0.45, aroma: 0.35 }
      },
      {
        id: 'caramel-2', at: 28, minutes: 12, action: '继续炒到深褐（12 分钟）',
        note: '焦化的苦是延迟出现的，所以第二层会比第一层晚。',
        taste: { sugar: 0.88, umami: 0.58, fat: 0.35, aroma: 0.45 }
      },
      {
        id: 'finish', at: 40, minutes: 1.5, action: '加盐收味',
        note: '一点盐，把整段的甜推出来。',
        taste: { salt: 0.45, sugar: 0.3, umami: 0.4 }
      }
    ]
  },
  {
    id: 'tomato-egg',
    name: '番茄炒蛋',
    line: '蛋先出锅，酸甜最后才合到一起。',
    techniques: ['stir', 'braise', 'steam'],
    steps: [
      {
        id: 'beat', at: 0, minutes: 3, action: '打蛋切番茄',
        note: '两种味道这时还分开待着。',
        taste: { aroma: 0.12 }
      },
      {
        id: 'egg', at: 3, minutes: 1.2, action: '热油炒蛋，盛出',
        note: '蛋把油吸走，这一段是全曲最厚的地方。',
        taste: { fat: 0.6, aroma: 0.3, umami: 0.25 }
      },
      {
        id: 'tomato', at: 4.2, minutes: 3, action: '下番茄，炒出汁',
        note: '酸在最前面，刺一下就走。',
        taste: { acid: 0.85, umami: 0.35, aroma: 0.3 }
      },
      {
        id: 'sugar-salt', at: 7.2, minutes: 1, action: '加糖、加盐',
        note: '糖被尝到时，酸已经过去一半了。',
        taste: { sugar: 0.5, salt: 0.55, umami: 0.3 }
      },
      {
        id: 'thicken', at: 8.2, minutes: 1.5, action: '回蛋收汁',
        note: '稠化把前面几层糊在一起，层次开始不清楚。',
        taste: { starch: 0.45, umami: 0.45, salt: 0.25, sugar: 0.25, acid: 0.15 }
      }
    ]
  },
  {
    id: 'blanched-greens',
    name: '白灼菜心',
    line: '水开、下菜、起锅，几乎不加油。',
    techniques: ['blanch', 'stir', 'steam'],
    steps: [
      {
        id: 'wash', at: 0, minutes: 2, action: '洗菜烧水',
        note: '只有水声。',
        taste: {}
      },
      {
        id: 'boil-salt', at: 2, minutes: 1, action: '水开加盐',
        note: '盐落进水里，很快就散开。',
        taste: { salt: 0.35 }
      },
      {
        id: 'poach', at: 3, minutes: 1.5, action: '下菜心汆烫',
        note: '鲜味在这一步上来，但它本来就很淡。',
        taste: { umami: 0.5, aroma: 0.25 }
      },
      {
        id: 'dress', at: 4.5, minutes: 0.6, action: '淋一点油和生抽',
        note: '油只淋一次，所以低音只出现很短的一段。',
        taste: { fat: 0.42, salt: 0.3, umami: 0.3 }
      }
    ]
  },
  {
    id: 'chicken-soup',
    name: '清炖鸡汤',
    line: '两小时里只有鲜在慢慢变浓。',
    techniques: ['braise', 'steam', 'stir'],
    steps: [
      {
        id: 'blanch', at: 0, minutes: 5, action: '焯水去血沫',
        note: '腥气被倒掉，这一步没有留下味道。',
        taste: { aroma: 0.15 }
      },
      {
        id: 'simmer-1', at: 5, minutes: 30, action: '小火（前 30 分钟）',
        note: '鲜开始积累，但每一刻都很低。',
        taste: { umami: 0.45, fat: 0.3, aroma: 0.2 }
      },
      {
        id: 'simmer-2', at: 35, minutes: 60, action: '小火（中间 60 分钟）',
        note: '鲜在这段变成贯穿全程的中音。',
        taste: { umami: 0.68, fat: 0.42, aroma: 0.25 }
      },
      {
        id: 'simmer-3', at: 95, minutes: 25, action: '小火（最后 25 分钟）',
        note: '胶质出来一点，口感变圆。',
        taste: { umami: 0.75, starch: 0.28, fat: 0.38, aroma: 0.2 }
      },
      {
        id: 'season', at: 120, minutes: 1, action: '最后放盐',
        note: '盐在这里才出现；之前的两小时里，它是不存在的。',
        taste: { salt: 0.4, umami: 0.35 }
      }
    ]
  },
  {
    id: 'mapo-tofu',
    name: '麻婆豆腐',
    line: '麻不是味道，是一段持续的震颤。',
    techniques: ['stir', 'braise', 'steam'],
    steps: [
      {
        id: 'tofu', at: 0, minutes: 3, action: '豆腐切块焯水',
        note: '先让豆腐站住，别碎。',
        taste: { umami: 0.15 }
      },
      {
        id: 'meat', at: 3, minutes: 2, action: '炒肉末',
        note: '第一层油脂和咸一起上来。',
        taste: { fat: 0.5, umami: 0.45, salt: 0.25, aroma: 0.3 }
      },
      {
        id: 'paste', at: 5, minutes: 2, action: '下豆瓣酱炒出红油',
        note: '辣和咸最重的一段，也是全曲最响的地方。',
        taste: { salt: 0.88, aroma: 0.6, fat: 0.65, sugar: 0.28, umami: 0.4, numbing: 0.15 }
      },
      {
        id: 'broth', at: 7, minutes: 3, action: '加汤下豆腐',
        note: '汤把咸冲淡，鲜在这时补上来。',
        taste: { umami: 0.7, salt: 0.45, fat: 0.45, starch: 0.3 }
      },
      {
        id: 'thicken', at: 10, minutes: 2, action: '分次勾芡',
        note: '芡把味道挂住，麻也跟着挂住了。',
        taste: { starch: 0.8, salt: 0.4, umami: 0.5, numbing: 0.45 }
      },
      {
        id: 'pepper', at: 12, minutes: 0.6, action: '撒花椒粉',
        note: '花椒粉最后撒，所以麻味几乎全部落在结尾。',
        taste: { numbing: 0.95, aroma: 0.45, salt: 0.1 }
      }
    ]
  }
];

export const RECIPE_BY_ID = Object.fromEntries(RECIPES.map(recipe => [recipe.id, recipe]));
