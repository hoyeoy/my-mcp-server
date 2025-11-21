import json
import os
import gspread
from oauth2client.service_account import ServiceAccountCredentials

def load_credentials():
    service_account_json = os.environ.get("GOOGLE_SERVICE_ACCOUNT_JSON")
    if not service_account_json:
        raise Exception("Service account JSON not found")

    creds_dict = json.loads(service_account_json)
    scope = [
        "https://spreadsheets.google.com/feeds",
        "https://www.googleapis.com/auth/drive"
    ]
    return ServiceAccountCredentials.from_json_keyfile_dict(creds_dict, scope)

def handler(request):
    sheet_url = request.query.get("url")
    sheet_name = request.query.get("name")

    if not sheet_url or not sheet_name:
        return {
            "status": 400,
            "body": {"error": "url and name are required"}
        }

    client = gspread.authorize(load_credentials())
    sheet = client.open_by_url(sheet_url).worksheet(sheet_name)
    values = sheet.get_all_values()

    return {
        "status": 200,
        "body": {"data": values}
    }
