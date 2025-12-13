#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const prompts = require('prompts');
const chalk = require('chalk');
const validate = require('validate-npm-package-name');

// 解析命令行参数
function parseArgs() {
  const args = process.argv.slice(2);
  const result = {
    projectName: null,
    template: null,
    interactive: true
  };
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--template' && i + 1 < args.length) {
      result.template = args[i + 1];
      i++; // 跳过下一个参数
    } else if (!arg.startsWith('--') && !result.projectName) {
      result.projectName = arg;
    }
  }
  
  // 如果提供了项目名称，则进入非交互模式
  if (result.projectName) {
    result.interactive = false;
  }
  
  return result;
}

async function main() {
  console.log(chalk.cyan('\n🚀 欢迎使用 Uni.app 模板生成器\n'));
  
  // 解析命令行参数
  const cliArgs = parseArgs();
  
  let response = {};
  
  if (cliArgs.interactive) {
    // 交互模式 - 原有流程
    response = await prompts([
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
          { title: '基础模板-uViewPro', value: 'base-uViewPro' },
          { title: '基础模板-wotui', value: 'base-wotui' },
          { title: '基础模板-uniui', value: 'base-uniui' },
        ]
      }
    ]);
  } else {
    // 命令行模式
    response.projectName = cliArgs.projectName;
    response.template = cliArgs.template || 'base-uViewPro'; // 默认模板
    
    // 验证项目名称
    const validation = validate(response.projectName);
    if (!validation.validForNewPackages) {
      console.error(chalk.red(`❌ 无效的项目名称: ${(validation.errors || validation.warnings || []).join(', ')}`));
      process.exit(1);
    }
    
    // 检查目录是否存在
    if (fs.existsSync(path.resolve(process.cwd(), response.projectName))) {
      console.error(chalk.red(`❌ 目录 "${response.projectName}" 已存在`));
      process.exit(1);
    }
    
    // 验证模板是否存在
    const templatePath = path.join(__dirname, 'template', response.template);
    if (!await fs.pathExists(templatePath)) {
      console.error(chalk.red(`❌ 模板 "${response.template}" 不存在`));
      process.exit(1);
    }
  }

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