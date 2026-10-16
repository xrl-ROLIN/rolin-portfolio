# Rolin Portfolio 项目交接说明

更新日期：2026-10-16

## 项目入口

- 线上网站：https://rolin-portfolio.pages.dev/
- GitHub 仓库：https://github.com/xrl-ROLIN/rolin-portfolio
- 默认分支：`main`
- 部署平台：Cloudflare Pages
- 部署方式：推送到 `main` 后自动部署，无单独构建步骤

网站链接只能用于查看成品。继续修改和部署时，需要本地项目文件或 GitHub 仓库写入权限。查看流量、域名和 Cloudflare 配置时，还需要单独登录原 Cloudflare 账户。

不要在仓库或交接文档中保存 GitHub 密码、Cloudflare 密码、访问令牌或其他凭据。

## 给新账号的启动提示

可以把下面这段话直接发给新的开发助手：

> 请继续维护我的个人作品集网站。代码仓库是 `https://github.com/xrl-ROLIN/rolin-portfolio`，线上地址是 `https://rolin-portfolio.pages.dev/`。请先完整阅读仓库中的 `README.md`，检查当前 `main` 分支和工作区状态，再修改代码。必须保留所有图片和视频的原始比例，禁止裁切或拉伸；未经我明确允许，不得改动已经确认的 Hover、滚轮、点击推进、品牌导览和页面转场交互。修改后先本地验证，再提交并推送到 `main`，最后确认 Cloudflare Pages 已部署新缓存版本。

如果新账号可以直接操作这台电脑，应让它选择当前项目文件夹，而不是重新下载不完整的网页文件。

## 页面与文件

| 页面 | 主要文件 | 说明 |
|---|---|---|
| 首页与开场 | `index.html`、`styles.css`、`script.js` | 开场逐帧动画、滚轮和点击推进、作品分类目录 |
| Campaign / Illustration / 3D & AIGC 目录 | `work.html`、`work.css`、`work.js` | 作品长页、媒体流、视频生命周期、分类转场 |
| Brand & Packaging 详情 | `brand-project.html`、`brand-project.css`、`brand-project.js` | 连续纵向品牌作品流和入口导览 |
| AIGC 详情 | `aigc-project.html`、`aigc-project.css` | AIGC 超长项目页 |
| About | `about.html`、`about.css`、`about-interaction.js` | 个人介绍与粒子互动 |
| 全局导航 | `global-nav.css` | 多页面共用导航样式 |
| 正式媒体 | `assets/` | 网站实际发布的图片、视频、字体和动画 |

项目是原生 HTML、CSS、JavaScript，没有打包器，也没有 `npm build`。

## 视觉与交互约束

这些规则已经由用户确认，修改前必须获得明确许可：

- 所有图片、GIF 和视频必须保持原始长宽比，禁止裁切、拉伸或用固定容器强制变形。
- AIGC 环形画廊的 Hover 放大保留为 `scale(1.18)`。
- 首页开场支持滚轮连续推进，也支持鼠标左键逐步推进。点击每次增加 `4%`，约 25 次完成开场，不能一键快速播放完。
- 首页目录卡片点击、Skip、触摸操作和原有滚轮行为必须保留。
- 品牌详情页顺序固定为：BinGo → 朴真香水（StillWood）→ Logo 字体设计 → LKK。
- 从品牌一级页进入详情时，保留约 2–3 秒的顺序导览；用户滚轮、触摸或其他手动操作可立即中断。
- 页面转场不得使用会截断画面的圆形遮罩或其他裁切方式。
- 品牌目录页保持极简，不恢复已删除的顶部辅助导航文字。
- 不得在未获得用户许可时弱化或删除已确认的 Hover、滚动、点击和转场效果。

## 性能约束

- 优先使用 WebP 和压缩后的 MP4；普通大图尽量控制在 300KB–1MB。
- 超长图或 5K 作品图可放宽到约 1–2MB，但仍应检查肉眼画质。
- 不直接加载 8K–10K 原图；页面展示通常使用约 5K 的高质量 WebP。
- 图片使用真实 `width`、`height` 或 `aspect-ratio` 预留空间。
- 长页视频保持 `preload="none"`，接近视口时加载，离屏后暂停并释放资源。
- 保留 `content-visibility`、懒加载、按需 RAF 和后台暂停逻辑。
- 不要重新引入永久空闲运行的 `requestAnimationFrame`。
- 压缩素材前先制作候选并比较尺寸、分辨率、帧率、时长和画质；没有明显收益时不要替换。

## 当前状态

- Campaign 标题当前为 `EOY-Live Fest Draft`。
- 首页点击推进脚本缓存版本为 `script.js?v=16`。
- Campaign / Work 脚本缓存版本为 `work.js?v=106`。
- Brand 脚本缓存版本为 `brand-project.js?v=19`。
- 已替换并优化 LIVE MOMENT、AI TOOL BUILDING、BinGo 狗狗图及 AIGC 长图。
- 首页、Campaign、Brand、AIGC 和 About 均已做过实际加载验证。

修改 JS、CSS 或已被 CDN 缓存的媒体后，应同步增加引用后的 `?v=` 版本号，避免用户继续看到旧文件。

## 本地验证

在项目根目录启动静态服务器：

```bash
python3 -m http.server 4173
```

常用检查：

```bash
git status --short
git diff --check
node --check script.js
node --check work.js
node --check brand-project.js
node --check about-interaction.js
```

至少检查以下页面：

- `http://localhost:4173/`
- `http://localhost:4173/work.html?category=campaign`
- `http://localhost:4173/work.html?category=illustration`
- `http://localhost:4173/work.html?category=three-d-aigc`
- `http://localhost:4173/brand-project.html?project=bingo`
- `http://localhost:4173/about.html`

验证重点包括图片比例、Hover、滚轮、点击推进、品牌导览、视频恢复、返回导航和移动端布局。

## 提交与部署

确认本地结果后：

```bash
git add <实际修改的文件>
git commit -m "简洁描述本次修改"
git push origin main
```

Cloudflare Pages 通常会在推送后自动部署。部署完成后，打开线上 HTML 和带新版本号的 JS 或媒体地址，确认新内容已经生效。不要只依据 Git 推送成功判断部署完成。

如果新的 GitHub 账号需要直接推送，应由仓库所有者将它添加为仓库协作者，或把仓库转移到新账号。仅提供公开仓库链接通常只有读取权限，不能推送。

## 账户迁移

建议准备以下访问权限：

1. 新 GitHub 账号拥有 `xrl-ROLIN/rolin-portfolio` 的写入权限。
2. 新账号在这台电脑上能够访问完整项目文件夹。
3. 如需查看流量或修改 Cloudflare 设置，再单独授权 Cloudflare 账户。

如果只是继续写代码并通过 GitHub 自动部署，通常不需要每次登录 Cloudflare；拥有仓库写入权限并推送到 `main` 即可。Cloudflare 登录主要用于查看 Web Analytics、部署记录、域名和项目设置。
