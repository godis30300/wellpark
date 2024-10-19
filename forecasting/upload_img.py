import requests

# 定義API的URL
url = "https://wellpark.dd-long.fun/api/park-image"

# 設定需要發送的表單資料
data = {
    'park_no': 'test_01',
    'captured_at': '2024-10-17 05:47:04'
}

# 設定要上傳的圖片檔案 (請確保圖片檔案位於本地系統)
file_path = './parking_lot_img/test_1.jpg'  # 替換成實際的檔案路徑
files = {'image': open(file_path, 'rb')}

# 發送POST請求，上傳圖片
response = requests.post(url, data=data, files=files)

# 檢查回應狀態
print(f"Status Code: {response.status_code}")

# 如果上傳成功，顯示回應內容
if response.status_code == 200:
    print(response.json())
else:
    print(f"Error: {response.text}")