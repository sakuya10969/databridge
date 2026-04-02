# アーキテクチャ

## 全体構成

```
┌─────────────────┐     HTTP/REST     ┌─────────────────┐
│   client (React  │ ◄──────────────► │  server (FastAPI) │
│   Router SSR)    │   /api/v1/*      │                   │
└─────────────────┘                   └────────┬──────────┘
                                               │
                                      ┌────────▼──────────┐
                                      │   PostgreSQL       │
                                      │  (staging + 本番)   │
                                      └───────────────────┘
```

## フロントエンド: FSD（Feature-Sliced Design）変則構成

React Router frameworkモードに最適化したFSD構成を採用する。
`app/` がルートディレクトリであり、`src/` は使用しない。

### レイヤー構成

```
app/
  routes/          最上位エントリ（loader / action / コンポーネント）
  providers/       QueryClient等のプロバイダ
  layouts/         レイアウトコンポーネント
  widgets/         UIブロック（複数feature/entityの組み合わせ）
  features/        機能単位の実装（hooks / api / types）
  entities/        ドメインモデル・型定義
  shared/          共通ユーティリティ・UI・API
  components/ui/   shadcn/ui自動生成コンポーネント
```

### 依存方向（上位→下位のみ）

```
routes → widgets → features → entities → shared
routes → features（直接参照も可）
routes → shared
```

- 同一レイヤー間の依存は禁止
- feature間・widget間・entity間の直接importは禁止

### routesの役割

各ルートファイルは画面のエントリポイントとする。

- `loader`: サーバーサイドデータ取得（TanStack Queryと併用）
- `action`: フォーム送信・ミューテーション
- デフォルトエクスポート: UIコンポーネント（widgets/featuresを組み立て）

### featuresの構成パターン

```
features/{feature-name}/
  hooks/           カスタムフック
  api/             API呼び出し関数
  types.ts         型定義
```

feature内のネストは最大2階層まで。

### 状態管理方針

- サーバー状態: TanStack Query
- ローカル状態: React useState
- グローバル状態管理ライブラリは導入しない

## バックエンド: クリーンアーキテクチャ

4層構成とし、全ての依存はdomain層（最内層）に向かう。依存性の逆転（DIP）を適用する。

### レイヤー構成

```
server/app/
  presentation/    FastAPIルータ・リクエスト/レスポンススキーマ（最外層）
  application/     ユースケース・サービス層
  domain/          エンティティ・ビジネスロジック・インターフェース定義（最内層）
  infrastructure/  DB・パーサー・バリデータ・staging管理（domain層インターフェースの実装）
```

### 依存方向

```
presentation → application → domain ← infrastructure
```

- domain層が中心。全ての層がdomain層に依存する
- application層はdomain層のインターフェース（ABC）に依存し、具象実装を知らない
- infrastructure層はdomain層のインターフェースを実装する
- presentation層はFastAPIのDependsでinfrastructureの具象をapplicationに注入する

### 各層の責務

#### domain（最内層・依存なし）

- エンティティ定義（ImportJob, ColumnMapping, Template, ImportError, AuditLog）
- ステータスenum
- リポジトリインターフェース（ABC）: `IJobRepository`, `ITemplateRepository`, `IErrorRepository`, `IAuditRepository`
- パーサーインターフェース（ABC）: `IFileParser`
- バリデータインターフェース（ABC）: `IDataValidator`
- ドメイン例外（DomainError, ParseError, ValidationError）
- 外部ライブラリへの依存を一切持たない

#### application（domain層のみに依存）

- ユースケース単位のサービスクラス
- `JobService`: アップロード・パース・バリデーション・取り込み・再実行
- `TemplateService`: テンプレートCRUD
- `AuditService`: 監査ログ記録
- コンストラクタでdomain層のインターフェースを受け取る（具象を知らない）

#### infrastructure（domain層のインターフェースを実装）

- `database/`: SQLAlchemyセッション・テーブルモデル
- `repositories/`: domain層の `IXxxRepository` を実装するリポジトリ具象クラス
- `parser/`: domain層の `IFileParser` を実装するCSV/xlsxパーサー（pandas + openpyxl）
- `validator/`: domain層の `IDataValidator` を実装するpanderaバリデータ
- `staging/`: stagingテーブル管理・本番反映
- `config.py`: pydantic-settings設定

#### presentation（最外層・DI組み立て）

- FastAPI APIRouterによるエンドポイント定義
- Pydanticモデルによるリクエスト/レスポンス型定義
- 例外ハンドラによる統一エラーレスポンス
- FastAPIのDependsでinfrastructure具象 → application サービスへの依存注入を組み立てる

### Excel/CSV処理パイプライン

```
ファイル受信
  → parser/ でDataFrame化（openpyxl: シート情報, pandas: DataFrame変換）
  → validator/ でバリデーション（pandera: スキーマ検証）
  → staging/ でstaging投入 → 本番反映
```

### 非同期処理（MVP）

- I/Oバウンド: FastAPIのasync/await
- CPUバウンド（パース・バリデーション）: `run_in_executor` でスレッドプール
- ジョブ進捗: フロントからのポーリング（TanStack Query refetchInterval）
