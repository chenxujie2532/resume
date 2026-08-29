# 陈旭杰 · 个人简历（静态站点发布包）

零依赖纯静态站点，无需构建。三张图片已在 `assets/`，Google Fonts 已做非阻塞降级（大陆网络不影响打开）。

## 发布到 GitHub Pages（推荐，10 分钟）

1. 登录 [github.com](https://github.com) → 右上角 **+** → **New repository**
   - 名称建议：`resume`（或 `my-resume`）
   - 选择 **Public** → 点击 **Create repository**
2. 在新仓库页面点击 **uploading an existing file** 链接
3. 把本文件夹里的 **全部内容**（index.html、css、js、assets、.nojekyll、README.md）拖入上传区
4. 点击 **Commit changes** 等待上传完成
5. 进入仓库 **Settings → Pages**：
   - Source 选择 **Deploy from a branch**
   - Branch 选择 **main** + **/(root)** → **Save**
6. 等 1~2 分钟，页面顶部会出现访问地址：
   `https://<你的用户名>.github.io/resume/`

以后更新内容：仓库里点开对应文件 → 铅笔图标编辑 → Commit，1 分钟后自动生效。

## 备选：腾讯云 EdgeOne Pages（国内 CDN 更快）

1. 打开 [EdgeOne Pages 控制台](https://console.cloud.tencent.com/edgeone/pages)（需腾讯云账号+实名）
2. **创建项目 → 直接上传** → 上传 `简历网站-发布包.zip`
3. 部署完成后在「项目设置」查看访问链接
4. 注意：免费版默认域名的公开访问链接需要从控制台「预览」按钮获取（链接定期轮换）；绑定自定义域名需域名完成 ICP 备案

## 备选：Gitee Pages

Gitee Pages 服务已于 2024 年 7 月停止新部署，**不可用**，请勿选择。
