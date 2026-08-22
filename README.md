# mioku-plugin-sekai

初音未来·世界计划（Project Sekai / PJSK）辅助插件：**角色 / 卡牌 / 乐曲 / 活动 / 卡池查询** 与 **模拟抽卡**

## 功能

| 类别    | 说明                                           |
|-------|----------------------------------------------|
| 角色查询  | 全部角色一览、角色详情（生日/身高/学校/爱好/CV/组合/简介）            |
| 卡牌查询  | 稀有度/属性/技能/综合力/实装时间/卡面（通常+特训后），支持中文/日文/英文名与卡号 |
| 乐曲查询  | 作者/作词/作曲/编曲/演唱者/全部难度谱面（EZ~AP 等级与 Note 数）/曲封  |
| 活动查询  | 当前进行中活动、最近 N 期列表                             |
| 卡池查询  | 当前卡池概率（普通+保底）与 UP 卡池                         |
| 模拟抽卡  | 按当前卡池真实概率抽取，十连第 10 发保底，结果渲染为卡面网格图            |
| AI 工具 | 上述查询与抽卡全部提供为 AI Skill `sekai` 的工具            |

## 命令

| 命令                            | 说明              |
|-------------------------------|-----------------|
| `pj帮助`                        | 查看帮助            |
| `pj角色列表`                      | 全部角色一览          |
| `pj角色 <名称/id>`                | 角色详情            |
| `pj卡 <卡名/角色名/卡号>`             | 卡牌查询            |
| `pj曲 <曲名>`                    | 乐曲与全难度谱面        |
| `pj活动 [数字]`                   | 当前活动；加数字看最近 N 期 |
| `pj卡池`                        | 当前卡池（概率/UP）     |
| `pj抽卡 [次数]` / `pj十连` / `pj单抽` | 模拟抽卡            |
| `pj数据更新`                      | 刷新数据缓存（管理员）     |

前缀为 `pj`，也支持 `pjsk` / `sekai` / `世界计划`

## AI 工具（skill: `sekai`）

`character_info` / `card_info` / `music_info` / `event_info` / `gacha_info` / `simulate_gacha`。
在聊天中直接问「初音未来世界计划的 XX 卡怎么样」「帮我抽一发 pjsk」即可触发。

## 配置

见 [config.md](./config.md)（WebUI 可视化配置）：数据缓存 TTL、抽卡默认次数/上限、
特训卡面开关、图片宽度、CDN 偏好等。配置文件位于 `config/sekai/base.json`。

## 数据说明

- 首次查询会拉取 master 数据并构建本地压缩索引（约 80MB 原始数据 → 数 MB 索引），回复可能较慢
  缓存在 `data/sekai/cache/`，默认 12 小时过期，可用 `pj数据更新` 手动刷新
- 卡面：`https://storage.sekai.best/sekai-jp-assets/character/member/{assetbundleName}/card_normal.webp`（及 `card_after_training.webp`）。
- 翻译表（zh-CN）来自 sekai-i18n，默认缓存 7 天

## License

MIT
