# Spec Sync: 運用ガイド

## 概要

`.kiro/specs/` を feature spec の唯一の正本（source of truth）とし、`docs/specs/` はその read-only ミラーとして自動生成される。

## 仕組み

1. `.kiro/specs/` 配下の `.md` ファイルが保存されると、Kiro Hook がトリガーされる
2. Hook は `scripts/sync-specs.sh` を実行する
3. スクリプトが `.kiro/specs/` → `docs/specs/` へ片方向同期を行う
4. `docs/specs/` の各ファイル先頭に read-only 注記が自動挿入される

## 同期対象ファイル

- `requirements.md`
- `design.md`
- `tasks.md`

対象の変更は `scripts/sync-specs.sh` 内の `SYNC_FILES` 配列を編集する。

## 運用ルール

- spec の編集は必ず `.kiro/specs/` で行う
- `docs/specs/` は直接編集しない（先頭の注記で警告される）
- `docs/` 配下の設計文書・プロダクト文書（`docs/specs/` 以外）は従来通り直接編集可能
- 削除同期は未実装。不要になった `docs/specs/` のファイルは手動で削除する

## 手動同期

Hook が動作しない場合や一括同期したい場合:

```bash
bash scripts/sync-specs.sh
```
