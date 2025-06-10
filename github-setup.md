# GitHub仓库设置说明

## 步骤1：在GitHub网站创建仓库

1. 访问 https://github.com
2. 登录你的账户 (276970789)
3. 点击右上角 "+" -> "New repository"
4. 填写信息：
   - Repository name: `planflow-desktop`
   - Description: `PlanFlow - 智能日程管理桌面软件`
   - 选择 Public
   - 不要勾选任何初始化选项

## 步骤2：连接本地仓库到GitHub

创建仓库后，复制仓库URL，然后在命令行执行：

```bash
# 添加远程仓库（替换YOUR_USERNAME为你的GitHub用户名）
git remote add origin https://github.com/YOUR_USERNAME/planflow-desktop.git

# 推送代码到GitHub
git branch -M main
git push -u origin main
```

## 步骤3：验证上传

访问你的GitHub仓库页面，确认所有文件都已上传成功。

## 注意事项

- 确保你的GitHub账户已经设置好
- 如果推送时需要认证，可能需要使用Personal Access Token
- 第一次推送可能需要输入GitHub用户名和密码/token 