"""サンプル受注データExcelファイル生成スクリプト。

Usage:
    uv run python server/scripts/generate_sample_excel.py
"""

import random

import numpy as np
import pandas as pd

SEED = 42
random.seed(SEED)
np.random.seed(SEED)

N = 100

categories = ["電子機器", "文房具", "食品", "衣料品", "家具", "日用品", "書籍"]
payment_methods = ["銀行振込", "クレジットカード", "代金引換", "口座振替", "コンビニ払い"]
payment_statuses = ["入金済", "未入金", "一部入金"]
shipping_statuses = ["出荷済", "未出荷", "出荷準備中", "配送中"]
prefectures = [
    "東京都", "大阪府", "愛知県", "北海道", "福岡県", "神奈川県",
    "埼玉県", "千葉県", "兵庫県", "京都府", "広島県", "宮城県",
]
products = [
    ("P001", "ノートPC", "電子機器", 89800),
    ("P002", "ワイヤレスマウス", "電子機器", 3200),
    ("P003", "USBメモリ 64GB", "電子機器", 1500),
    ("P004", "ボールペン 10本セット", "文房具", 800),
    ("P005", "A4コピー用紙 500枚", "文房具", 450),
    ("P006", "付箋セット", "文房具", 350),
    ("P007", "緑茶ティーバッグ 100P", "食品", 1200),
    ("P008", "インスタントコーヒー", "食品", 980),
    ("P009", "ビジネスシャツ", "衣料品", 4500),
    ("P010", "オフィスチェア", "家具", 29800),
    ("P011", "デスクライト", "家具", 5600),
    ("P012", "ハンドソープ詰替", "日用品", 280),
    ("P013", "技術書", "書籍", 3300),
    ("P014", "モニターアーム", "電子機器", 8900),
    ("P015", "ホワイトボードマーカー", "文房具", 600),
]
customers = [
    ("C001", "株式会社山田製作所"),
    ("C002", "田中商事株式会社"),
    ("C003", "鈴木電機工業"),
    ("C004", "佐藤食品株式会社"),
    ("C005", "高橋建設"),
    ("C006", "伊藤物産"),
    ("C007", "渡辺テクノロジー"),
    ("C008", "中村サービス"),
    ("C009", "小林工業株式会社"),
    ("C010", "加藤商店"),
]
remarks_pool = [
    "", "", "", "", "",  # 空を多めに
    "至急対応", "月末締め", "サンプル品同梱", "領収書必要",
    "時間指定あり", "2階事務所宛", "検品後納品", "",
]

# 受注日: 2025-01-01 ~ 2025-06-30
start_date = pd.Timestamp("2025-01-01")
end_date = pd.Timestamp("2025-06-30")
date_range_days = (end_date - start_date).days

rows = []
for i in range(N):
    order_id = f"ORD-{2025}{i + 1:04d}"
    order_date = start_date + pd.Timedelta(days=random.randint(0, date_range_days))

    cust_code, cust_name = random.choice(customers)
    prod_code, prod_name, category, unit_price = random.choice(products)
    quantity = random.randint(1, 50)
    amount = quantity * unit_price
    tax = int(amount * 0.1)
    total = amount + tax

    prefecture = random.choice(prefectures)
    payment = random.choice(payment_methods)
    payment_status = random.choice(payment_statuses)
    shipping = random.choice(shipping_statuses)

    # 納品予定日: 受注日+3~30日、一部None
    if random.random() < 0.85:
        delivery_date = order_date + pd.Timedelta(days=random.randint(3, 30))
    else:
        delivery_date = None

    remark = random.choice(remarks_pool)

    rows.append({
        "受注ID": order_id,
        "受注日": order_date.strftime("%Y-%m-%d"),
        "顧客コード": cust_code,
        "顧客名": cust_name,
        "商品コード": prod_code,
        "商品名": prod_name,
        "カテゴリ": category,
        "数量": quantity,
        "単価": unit_price,
        "金額": amount,
        "消費税": tax,
        "税込金額": total,
        "都道府県": prefecture,
        "支払方法": payment,
        "入金状況": payment_status,
        "出荷状況": shipping,
        "納品予定日": delivery_date.strftime("%Y-%m-%d") if delivery_date else None,
        "備考": remark if remark else None,
    })

df = pd.DataFrame(rows)
output_path = "sample_input.xlsx"
df.to_excel(output_path, index=False, sheet_name="受注データ", engine="openpyxl")
print(f"生成完了: {output_path} ({len(df)}行)")
