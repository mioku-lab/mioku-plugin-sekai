---
title: 世界计划插件配置
description: 配置 mioku-plugin-sekai 的数据源缓存、模拟抽卡参数与图片渲染选项。
fields:
  - key: base.server
    label: 数据区服
    type: select
    description: 数据源区服，第一版仅支持 jp（日服 master 数据最全，中文翻译来自社区 i18n 仓库）。
    options:
      - value: jp
        label: 日服（默认）

  - key: base.dataTtlHours
    label: 主数据缓存时长（小时）
    type: number
    description: 卡牌/卡池等大表缓存的过期时间；过期后下次查询会自动重新拉取（首次拉取较慢，之后走本地压缩缓存）。
    placeholder: 12

  - key: base.i18nTtlHours
    label: 中文翻译缓存时长（小时）
    type: number
    description: 中文翻译表（角色/卡牌/乐曲/活动名）的缓存过期时间。
    placeholder: 168

  - key: base.preferCdn
    label: 优先使用 CDN
    type: switch
    description: 优先走 jsdelivr CDN 读取小文件 master 数据；大文件（cards/gachas）自动回退 raw.githubusercontent.com。请求失败或超时会自动尝试备用源。

  - key: base.proxyBase
    label: GitHub 代理前缀
    type: text
    description: 所有 master/i18n 请求优先走该代理（如 https://gh-proxy.com），失败自动回退 CDN/raw.github。留空则禁用代理直连。

  - key: base.preloadOnStart
    label: 启动时后台预加载数据
    type: switch
    description: 机器人启动后在后台预拉取世界计划数据（有本地缓存时为秒级读取），避免首次查询时长时间等待。

  - key: base.defaultPulls
    label: 默认抽卡次数
    type: number
    description: 发送 pj抽卡 未指定次数时的默认抽卡数。
    placeholder: 10

  - key: base.maxPulls
    label: 单次抽卡上限
    type: number
    description: 单次模拟抽卡的最大次数，超出自动截断。
    placeholder: 300

  - key: base.showTrained
    label: 展示特训后卡面
    type: switch
    description: 抽卡结果与卡池页面中，有特训卡面的卡牌是否展示特训后立绘。

  - key: base.imageWidth
    label: 渲染图片宽度
    type: number
    description: 查询结果图片的渲染宽度（像素），越大图片越清晰。
    placeholder: 900
---

```mioku-fields
keys:
  - base.server
  - base.dataTtlHours
  - base.i18nTtlHours
  - base.preferCdn
  - base.proxyBase
  - base.preloadOnStart
  - base.defaultPulls
  - base.maxPulls
  - base.showTrained
  - base.imageWidth
```
