#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const prompts = require('prompts');
const chalk = require('chalk');
const validate = require('validate-npm-package-name');

async function main() {
  console.log(chalk.cyan('\n🚀 欢迎使用 Uni.app 模板生成器\n'));
  
  const response = await prompts([
    {
      type: 'text',
      name: 'projectName',
      message: '请输入项目名称:',
      initial: 'my-uni-app',
      validate: name => {
        const validation = validate(name);
        if (!validation.validForNewPackages) {
          return `无效的项目名称: ${(validation.errors || validation.warnings || []).join(', ')}`;
        }
        if (fs.existsSync(path.resolve(process.cwd(), name))) {
          return `目录 "${name}" 已存在`;
        }
        return true;
      }
    },
    {
      type: 'select',
      name: 'template',
      message: '请选择模板:',
      choices: [
        { title: '基础模板-wotui', value: 'base-wotui' },
        { title: '基础模板-uniui', value: 'base-uniui' },
      ]
    }
  ]);

  if (!response.projectName) {
    console.log(chalk.yellow('❌ 已取消创建项目'));
    return;
  }

  const projectPath = path.resolve(process.cwd(), response.projectName);
  
  // 复制模板文件
  console.log(chalk.blue('📁 正在创建项目...'));
  
  try {
    // 复制基础模板
    await fs.copy(
      path.join(__dirname, 'template', response.template),
      projectPath
    );
    
    // 更新 package.json 中的项目名称
    const packageJsonPath = path.join(projectPath, 'package.json');
    if (await fs.pathExists(packageJsonPath)) {
      const packageJson = await fs.readJson(packageJsonPath);
      packageJson.name = response.projectName;
      await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
    }
    
    console.log(chalk.green(`✅ 项目创建成功: ${response.projectName}`));
    
    // 安装依赖
    if (response.install) {
      console.log(chalk.blue('📦 正在安装依赖...'));
      const { execSync } = require('child_process');
      execSync('npm install', { 
        cwd: projectPath, 
        stdio: 'inherit' 
      });
      console.log(chalk.green('✅ 依赖安装完成'));
    }
    
    console.log(chalk.cyan('\n🎉 接下来:'));
    console.log(chalk.white(`  cd ${response.projectName}`));
    if (!response.install) {
      console.log(chalk.white('  pnpm i'));
    }
    console.log(chalk.white('  pnpm dev:h5\n'));
    
  } catch (error) {
    console.error(chalk.red('❌ 创建项目时出错:'), error);
    // 清理已创建的文件
    if (await fs.pathExists(projectPath)) {
      await fs.remove(projectPath);
    }
  }
}

main().catch(console.error);