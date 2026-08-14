# Learn DeepSeek Harness

[English](README.md) · [简体中文](README.zh-CN.md) · [日本語](README.ja.md)

> [Borealbit](https://github.com/borealbit) による、独立したプロジェクトベースの学習リソースです。本プロジェクトは DeepSeek の公式プロジェクトではなく、DeepSeek による承認・推奨・保守を受けていません。

[DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) の安全な初回実行から、実運用を意識したプラグイン、ワークフロー、エージェントシステムの構築までを学びます。

## 現在の状態

**基盤整備・カリキュラム設計段階**

DeepSeek Harness は現在 Developer Preview であり、互換性を破る変更が導入される可能性があります。そのため、本コースは一度きりの録画教材ではなく、バージョン管理と継続的な検証を前提に運営します。

## このコースの特徴

- **プロジェクトベース：** 各トラックで動作する成果物を作成します。
- **一次情報重視：** 技術的な説明は公式コードまたは公式ドキュメントに紐づけます。
- **バージョン明記：** 各レッスンに検証済みの上流リビジョンを記録します。
- **安全性を重視：** 承認、サンドボックス、シークレット、外部プラグインの審査を中核に置きます。
- **多言語対応：** 英語版を正本とし、中国語版と日本語版は同じモジュール構成に従います。

## 対象読者

- DeepSeek Harness を実際のプロジェクトで評価したい開発者
- プロンプト利用から Agent Engineering へ進みたい AI Coding ユーザー
- Plugin、Skill、MCP、ワークフローの開発者
- 社内自動化を再利用可能な形にしたい技術者・創業者
- 権限管理、追跡可能性、再現可能な評価を必要とするチーム

## 修了時にできること

1. DeepSeek Harness を安全にインストール・設定する。
2. Model、Agent、Harness の関係を説明する。
3. Standard、Code、Minimal、Creator の各モードを使い分ける。
4. ホスト型・カスタム・互換プロバイダーを設定する。
5. Plugin、Tool、Skill、MCP の適切な選択を行う。
6. ネイティブ DSH プラグインを開発・テスト・パッケージ化する。
7. Hook、Session、Subagent、Workflow、承認処理を組み合わせる。
8. エージェントを追跡・評価・デバッグし、上流変更に追従する。
9. 最終課題 **Release Readiness Agent** を完成させる。

## カリキュラム

| # | モジュール | トラック | 状態 |
|---:|---|---|---|
| 00 | クイックスタート：最初の安全なタスクまで | オペレーター | 予定 |
| 01 | Agent = Model + Harness | オペレーター | 予定 |
| 02 | プラグインアーキテクチャを理解する | オペレーター | 予定 |
| 03 | 4つのランタイムモードを使い分ける | オペレーター | 予定 |
| 04 | Model、Provider、Workspace、Session | オペレーター | 予定 |
| 05 | 安全な Agentic Coding ワークフロー | ビルダー | 予定 |
| 06 | Plugin、Tool、Skill、MCP の選択 | ビルダー | 予定 |
| 07 | 最初の DSH プラグインを作る | ビルダー | 予定 |
| 08 | Hook、Context、Session Engineering | ビルダー | 予定 |
| 09 | Subagent、Workflow、自動化 | プロダクション | 予定 |
| 10 | トレース、評価、障害復旧 | プロダクション | 予定 |
| 11 | パッケージ化、公開、保守 | プロダクション | 予定 |
| 12 | 最終課題：Release Readiness Agent | キャップストーン | 予定 |

詳細な学習目標、レッスン構成、成果物は [英語版シラバス](SYLLABUS.md) を参照してください。

## リポジトリ構成

| パス | 用途 |
|---|---|
| `course/en/` | 正本となる英語コース |
| `course/zh-CN/` | 簡体字中国語版 |
| `course/ja/` | 日本語版 |
| `projects/` | 実行可能な演習と最終課題 |
| `plugins/` | コース内で作成する DSH プラグイン |
| `resources/` | 公式資料と判断ガイド |
| `templates/` | 再利用可能な教材テンプレート |
| `docs/` | 構成、バージョン方針、編集ルール |

詳細は [docs/STRUCTURE.md](docs/STRUCTURE.md)、翻訳状況は [日本語コース入口](course/ja/README.md) を参照してください。

## 独立性と商標

「DeepSeek」および関連する名称・商標は、それぞれの権利者に帰属します。本リポジトリでは、学習対象となるオープンソースソフトウェアを特定する目的でのみ名称を使用します。
