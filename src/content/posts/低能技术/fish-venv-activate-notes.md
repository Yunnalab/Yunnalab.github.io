---
title: " fish 无法识别 bash 指令 导致的连环问题"
description: "fish 无法识别 bash 的 activate 脚本，导致虚拟环境激活失败，记录原因与正确的 fish 用法。"
pubDatetime: 2026-08-16
tags: ["fish", "python", "venv", "nixos"]
---

## 发现问题

在 deepseek-harness 仓库里安装 Python SDK，按常规流程创建虚拟环境并激活：

```sh
python -m venv .venv
. .venv/bin/activate
python -m pip install deepseek-harness-sdk
```

然而，
第二条命令报错，第三条跟着失败：

```text
.venv/bin/activate (行 40): 'case' 不在 switch 块内
/run/current-system/sw/bin/python: No module named pip
```

## 分析问题

### 第一层

- `python -m venv .venv`正常执行，在当前目录创建名为 .venv 的虚拟环境
- `. .venv/bin/activate`为官方文档里给出的命令，但是这是激活bash脚本，而不是fish,**bash的语法绝不是fish的简单子集**，导致fish识别了错误的语法
  
- 再来看报错信息

```fish
.venv/bin/activate (行 40): 'case' 不在 switch 块内
case "$(uname)" in
^~~^
从源文件 .venv/bin/activate
.: 读取文件 '.venv/bin/activate' 时发生错误
```

- 在 fish 语法里 case 只能出现在 switch 块内，独立出现就是语法错误，但是在bash 里 case ... esac 是合法独立命令

### 第二层

- 看最后一行信息,报错来自`python -m pip install deepseek-harness-sdk`

```fish
/run/current-system/sw/bin/python: No module named pip
```

- 找不到pip，是因为指令想要从系统寻找pip，但因为nixos的系统里不会预装这个模块，这台机器也没有对pip进行显示安装。因此报错
- 但是实际上，如果上面拉入`.venv`环境成功，由于环境包含pip，即可成功，下文是上文延迟而已

## 解决问题

- 对于fish,应当使用`source .venv/bin/activate.fish`来激活`.venv`环境

```fish
source .venv/bin/activate.fish   # 关键：用 .fish 版本，而不是 . activate
python -m pip install deepseek-harness-sdk
python -c "import deepseek_harness; print(deepseek_harness.__file__)"  # 验证
```

不激活的等效做法（直接进入.venv执行）：

```fish
.venv/bin/python -m pip install deepseek-harness-sdk
```

### fish vs bash 关键区别速查（自用）

| 用法     | bash                         | fish                         |
| -------- | ---------------------------- | ---------------------------- |
| 变量赋值 | `x=1`（等号无空格）          | `set x 1`                    |
| 命令替换 | `$(cmd)`                     | `(cmd)`                      |
| 条件     | `if [ -f a ]; then ...; fi`  | `if test -f a; ...; end`     |
| for 循环 | `for i in ...; do ...; done` | `for i in ...; ...; end`     |
| 函数     | `foo() { ...; }`             | `function foo; ...; end`     |
| 导出变量 | `export FOO=1`               | `set -gx FOO 1`              |
| source   | `source f` 或 `. f`          | `source f`（不要用 `.`）     |
| 配置文件 | `~/.bashrc`                  | `~/.config/fish/config.fish` |

### 经验总结

- 脚本不规范，用时两行泪
