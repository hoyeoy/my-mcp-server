import json
import os
import gspread
from oauth2client.service_account import ServiceAccountCredentials
from vercel_python.tools import VercelRequest, VercelResponse

def load_credentials():
    service_account_json = os.environ.get("GOOGLE_SERVICE_ACCOUNT_JSON")
    if not service_account_json:
        raise Exception("Service account JSON not found in environment variables")

    creds_dict = json.loads(service_account_json)
    scope = [
        "https://spreadsheets.google.com/feeds",
        "https://www.googleapis.com/auth/drive"
    ]
    return ServiceAccountCredentials.from_json_keyfile_dict(creds_dict, scope)

def get_sheet(sheet_url, sheet_name):
    creds = load_credentials()
    client = gspread.authorize(creds)
    spreadsheet = client.open_by_url(sheet_url)
    return spreadsheet.worksheet(sheet_name)

def handler(request: VercelRequest):
    sheet_url = request.query.get("url")
    sheet_name = request.query.get("name")

    if not sheet_url or not sheet_name:
        return VercelResponse({"error": "url and name query params are required"}, status=400)

    sheet = get_sheet(sheet_url, sheet_name)
    values = sheet.get_all_values()

    return VercelResponse({"data": values})
