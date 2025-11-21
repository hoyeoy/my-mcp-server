# api/sheet.py

import os
import json
import gspread
from oauth2client.service_account import ServiceAccountCredentials
from flask import Flask, jsonify

app = Flask(__name__)

# 고정할 스프레드시트 ID와 시트 이름
SPREADSHEET_ID = "1mLu3DIwf3Lsv85mb2LYPziPoFqRhlLCj1WeoJIUGeLE"          # ← 여기만 바꾸세요 (URL에서 /d/ 뒤에 있는 긴 문자열)
WORKSHEET_NAME = "Sheet1"                     # ← 필요하면 시트 이름 바꾸세요

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

# 기존 루트 + 새 라우트 추가
@app.route("/")
def get_sheet_root():
    return jsonify({"message": "API is running! Use /api/keyword for data."})

@app.route("/api/keyword", methods=["GET"])
def get_sheet():
    try:
        sheet = get_client().open_by_key(SPREADSHEET_ID).worksheet(WORKSHEET_NAME)
        values = sheet.get_all_values() 

        return jsonify({
            "data": values,
            "rows": len(values),
            "columns": len(values[0]) if values else 0
         }), 200, {'Content-Type': 'application/json; charset=utf-8'}

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Vercel용 export
export = app