# Learn DeepSeek Harness

[English](README.md) · [简体中文](README.zh-CN.md) · [日本語](README.ja.md)

> 这是由 [Borealbit](https://github.com/borealbit) 创建的独立、项目制学习资源。本项目不是 DeepSeek 官方项目，也未获得 DeepSeek 的背书或维护。

这套课程将带你学习如何使用和扩展 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)：从第一次安全运行，一直到生产级插件、工作流和 Agent 系统。

## 当前状态

**基础结构与课程设计阶段**

DeepSeek Harness 目前仍处于 Developer Preview，后续可能出现破坏性更新。因此，本项目会采用“版本化、持续验证”的方式维护课程，而不是一次录完后不再更新。

## 课程特点

- **项目驱动：** 每个学习阶段都要交付一个可以运行的成果。
- **来源可查：** 技术结论尽量链接到官方代码或文档。
- **版本明确：** 每节课记录实际验证过的上游版本或 commit。
- **安全优先：** 权限审批、沙箱、密钥和第三方插件审查属于核心内容。
- **多语言：** 英文是内容母版，中文和日文使用相同的章节编号与结构。

## 适合人群

- 希望在真实项目中评估 DeepSeek Harness 的开发者
- 想从“提示词使用”进阶到 Agent 工程的 AI Coding 用户
- Plugin、Skill、MCP 和工作流开发者
- 希望封装内部自动化能力的独立开发者与技术创业者
- 关注权限、可追踪性和评估体系的团队

## 完成课程后，你将能够

1. 安全安装和配置 DeepSeek Harness。
2. 解释 Model、Agent 与 Harness 之间的关系。
3. 正确选择 Standard、Code、Minimal 和 Creator 模式。
4. 配置官方、第三方以及自建模型服务。
5. 判断应该使用 Plugin、Tool、Skill 还是 MCP。
6. 开发、测试并打包一个原生 DSH 插件。
7. 组合 Hook、Session、Subagent、Workflow 与权限审批。
8. 对 Agent 进行追踪、评估、调试和升级维护。
9. 完成最终项目 **Release Readiness Agent（发布就绪检查 Agent）**。

## 课程目录

| # | 章节 | 学习路线 | 状态 |
|---:|---|---|---|
| 00 | 快速入门：从零到第一个安全任务 | 使用者 | 计划中 |
| 01 | Agent = Model + Harness | 使用者 | 计划中 |
| 02 | 理解插件化架构 | 使用者 | 计划中 |
| 03 | 掌握四种运行模式 | 使用者 | 计划中 |
| 04 | 模型、Provider、Workspace 与 Session | 使用者 | 计划中 |
| 05 | 安全的 Agentic Coding 工作流 | 开发者 | 计划中 |
| 06 | Plugin、Tool、Skill 与 MCP 的选择 | 开发者 | 计划中 |
| 07 | 开发第一个 DSH 插件 | 开发者 | 计划中 |
| 08 | Hook、Context 与 Session 工程 | 开发者 | 计划中 |
| 09 | Subagent、Workflow 与自动化 | 生产实践 | 计划中 |
| 10 | 追踪、评估与故障恢复 | 生产实践 | 计划中 |
| 11 | 打包、发布与长期维护 | 生产实践 | 计划中 |
| 12 | 大作业：Release Readiness Agent | 综合项目 | 计划中 |

完整的学习目标、课时和交付物请查看 [英文课程大纲](SYLLABUS.md)。

## 仓库目录

| 路径 | 用途 |
|---|---|
| `course/en/` | 英文内容母版 |
| `course/zh-CN/` | 简体中文版本 |
| `course/ja/` | 日文版本 |
| `projects/` | 可运行练习和最终项目 |
| `plugins/` | 课程中开发的 DSH 插件 |
| `resources/` | 官方资料与决策指南 |
| `templates/` | 课程和项目模板 |
| `docs/` | 目录规范、版本策略和编辑规则 |

详细结构请查看 [docs/STRUCTURE.md](docs/STRUCTURE.md)，翻译状态请查看 [中文课程入口](course/zh-CN/README.md)。

## 开始学习

1. 阅读 [完整课程大纲](SYLLABUS.md)。
2. 了解 [版本与验证策略](docs/VERSIONING.md)。
3. 进入 [中文课程目录](course/zh-CN/README.md)。
4. 查看 [项目路线图](ROADMAP.md)。

## 独立性与商标说明

“DeepSeek”等相关名称和商标归其各自权利人所有。本仓库仅为说明所教授的开源软件而使用相关名称。课程观点、示例和推荐均由 Borealbit 贡献者独立提供。
