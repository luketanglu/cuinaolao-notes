# 小红书「脆奶酪」VOC 看板

可公开部署的纯静态网页，无第三方依赖、无需构建。

## 本地预览

在本目录运行：

```bash
python3 -m http.server 4173
```

然后打开 `http://localhost:4173`。

## 部署

### Vercel

1. 将本目录提交到 GitHub 仓库。
2. 在 Vercel 选择 **Add New Project** 并导入仓库。
3. Framework Preset 选择 **Other**。
4. Build Command 留空，Output Directory 填 `.`。
5. 点击 Deploy。

### Netlify

直接将整个文件夹拖到 Netlify Drop，即可获得公开链接。

### GitHub Pages

将文件推送到仓库后，在仓库 **Settings → Pages** 中选择从根目录部署。

## 文件

- `index.html`：页面结构和看板内容
- `styles.css`：响应式样式
- `app.js`：切换交互、图表和数据
- `content-data.js`：41 篇笔记的正文与互动字段
- `assets/images/`：100 张笔记原图，随网页一同部署

首页“全部笔记内容”展示全部 41 篇，每页 10 篇；点击列表行可查看正文原文、全部配图，以及全部评论（含楼中楼回复）。

数据来源：`/Users/Zhuanz/Downloads/xiaohongshu-脆奶酪/`
