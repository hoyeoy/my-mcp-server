# api/read_sheet.py

import json
import os
import gspread
from oauth2client.service_account import ServiceAccountCredentials
from flask import Flask, request, jsonify

# Flask 앱 생성 (Vercel이 자동으로 인식함)
app = Flask(__name__)

def load_credentials():
    service_account_json = os.environ.get("GOOGLE_SERVICE_ACCOUNT_JSON")
    if not service_account_json:
        raise ValueError("GOOGLE_SERVICE_ACCOUNT_JSON 환경변수가 설정되지 않았습니다.")

    creds_dict = json.loads(service_account_json)
    scope = [
        "https://spreadsheets.google.com/feeds",
        "https://www.googleapis.com/auth/spreadsheets",
        "https://www.googleapis.com/auth/drive"
    ]
    return ServiceAccountCredentials.from_json_keyfile_dict(creds_dict, scope)

# 전역으로 클라이언트 캐싱 (콜드 스타트 시 재사용)
client = None

def get_gspread_client():
    global client
    if client is None:
        client = gspread.authorize(load_credentials())
    return client

@app.route("/")
def handler():
    sheet_url = request.args.get("url")
    sheet_name = request.args.get("name")

    if not sheet_url or not sheet_name:
        return jsonify({"error": "url과 name 파라미터가 필요합니다."}), 400

    try:
        sheet = get_gspread_client().open_by_url(sheet_url).worksheet(sheet_name)
        values = sheet.get_all_values()

        return jsonify({
            "data": values,
            "row_count": len(values),
            "col_count": len(values[0]) if values else 0
        })

    except Exception as e:
        # 디버깅을 위해 실제 에러 메시지 반환 (운영 시에는 보안상 숨기는 게 좋음)
        return jsonify({"error": str(e)}), 500

# Vercel이 이 파일을 엔트리포인트로 인식하도록 함
# Flask 앱을 export
export = app