# api/sheet.py

import os
import json
import gspread
from oauth2client.service_account import ServiceAccountCredentials
from flask import Flask, jsonify
import unicodedata


app = Flask(__name__)
app.config["JSON_AS_ASCII"] = False

# 고정할 스프레드시트 ID와 시트 이름
SPREADSHEET_ID = "1mLu3DIwf3Lsv85mb2LYPziPoFqRhlLCj1WeoJIUGeLE"          # URL에서 /d/ 뒤에 있는 긴 문자열
WORKSHEET_NAME = "Sheet1"                     # Sheet1: 포트폴리오 모니터링 

# -----------------------------
# 유틸 함수: 한글 정규화 + 제어문자 제거
# -----------------------------
def clean_korean_text(raw_text: str) -> str:
    """한글 인코딩 깨짐 방지 및 공백 제거"""
    if not isinstance(raw_text, str):
        return str(raw_text)
    text = unicodedata.normalize("NFC", raw_text)  # 조합형 통일
    text = text.replace("\u200b", "")              # 제로폭 공백 제거
    text = text.strip()                            # 앞뒤 공백 제거
    return text

def clean_sheet_values(values):
    """2차원 배열로 받은 구글시트 데이터를 정제"""
    clean_data = []
    for row in values:
        clean_row = [clean_korean_text(cell) for cell in row]
        clean_data.append(clean_row)
    return clean_data

def remove_empty_rows(data):
    return [row for row in data if any(cell.strip() for cell in row)]

# -----------------------------
# 구글 인증 로직
# -----------------------------

def load_credentials():
    service_account_json = os.environ.get("GOOGLE_SERVICE_ACCOUNT_JSON")
    if not service_account_json:
        raise ValueError("GOOGLE_SERVICE_ACCOUNT_JSON 환경변수가 없습니다.")
    creds_dict = json.loads(service_account_json)
    scope = [
        "https://spreadsheets.google.com/feeds",
        "https://www.googleapis.com/auth/spreadsheets",
        "https://www.googleapis.com/auth/drive"
    ]
    return ServiceAccountCredentials.from_json_keyfile_dict(creds_dict, scope)

# 전역 클라이언트 (콜드스타트 이후 재사용)
_client = None

def get_client():
    global _client
    if _client is None:
        _client = gspread.authorize(load_credentials())
    return _client

# -----------------------------
# 라우트
# -----------------------------
# 기존 루트 + 새 라우트 추가
@app.route("/")
def get_sheet_root():
    return jsonify({"message": "API is running! Use /api/keyword for data."})

@app.route("/api/keyword", methods=["GET"])
def get_sheet():
    try:
        sheet = get_client().open_by_key(SPREADSHEET_ID).worksheet(WORKSHEET_NAME)
        values = sheet.get_all_values() 
        cleaned_values = clean_sheet_values(values)  # 한글 정제 추가
        filtered_values = remove_empty_rows(cleaned_values)


        return jsonify({
            "data": filtered_values,
            "rows": len(filtered_values),
            "columns": len(filtered_values[0]) if filtered_values else 0
         }), 200, {'Content-Type': 'application/json; charset=utf-8'}

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# -----------------------------
# Vercel export
# -----------------------------
export = app