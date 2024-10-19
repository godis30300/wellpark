import base64
import json
from openai import OpenAI
from langchain_openai import ChatOpenAI
import requests
import pandas as pd
import time


# 讀取 API 密鑰
with open('gpt_key.txt', 'r') as file:
    gpt_key = file.read().strip()

# 設置 OpenAI 客戶端
client = OpenAI(
    api_key=gpt_key
)

def encode_image(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

def recognize_parking_info(base64_image):

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": """請分析這張圖片，並提供剩餘車位(only return int)。如果無法確定，回傳Null"""
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{base64_image}"
                        }
                    }
                ]
            }
        ],
        max_tokens=150
    )

    # 直接返回 API 的回應
    return response.choices[0].message.content




def fetch_all_park_images_data(base_url="https://wellpark.dd-long.fun/api/park-images", recognized=0):
    """
    獲取 API 返回的所有停車場圖片數據，支持分頁。

    :param base_url: str，API的基礎URL
    :param recognized: int，是否包含識別結果
    :return: DataFrame，包含所有API返回數據
    """
    # 初始化變數
    page = 1
    all_data = []

    while True:
        # 設定查詢參數
        params = {
            'page': page,
            'recognized': recognized
        }
        
        # 發送請求到API，使用當前頁面的參數
        response = requests.get(base_url, params=params)
        
        # 如果回應的狀態碼不是200，則顯示錯誤並退出
        if response.status_code != 200:
            print(f"Error fetching page {page}: {response.status_code}")
            break
        
        # 解析JSON數據
        data = response.json()

        # 將這一頁的數據添加到總結果中
        all_data.extend(data['data'])

        # 取得當前頁和總頁數
        current_page = data['meta']['current_page']
        last_page = data['meta']['last_page']

        print(f"Fetched page {current_page} of {last_page}")

        # 如果已經是最後一頁，則結束迴圈
        if current_page >= last_page:
            break
        
        # 否則，移動到下一頁
        page += 1

    # 將所有數據轉換為pandas DataFrame
    df = pd.DataFrame(all_data)

    return df


def encode_image_from_url(image_url):
    """
    從網路URL下載圖片並進行Base64編碼。

    :param image_url: str，圖片的URL
    :return: str，編碼後的Base64字符串
    """
    # 從網路URL下載圖片
    response = requests.get(image_url)
    
    # 確保請求成功
    if response.status_code == 200:
        # 將圖片內容以Base64格式進行編碼
        encoded_string = base64.b64encode(response.content).decode('utf-8')
        return encoded_string
    else:
        print(f"Failed to download image. Status code: {response.status_code}")
        return None


def post_park_data(park_no, free_quantity, update_time, park_image_id):
    """
    發送 POST 請求到指定的 API，上傳停車場數據。

    :param park_no: str，停車場編號
    :param free_quantity: int，空閒數量
    :param update_time: str，更新時間 (格式: YYYY-MM-DD HH:MM:SS)
    :param park_image_id: int，停車場圖片ID
    :return: dict，API的回應內容
    """
    # API 的 URL
    url = "https://wellpark.dd-long.fun/api/park"
    
    # 設置表單資料
    data = {
        'park_no': park_no,
        'free_quantity': free_quantity,
        'update_time': update_time,
        'park_image_id': park_image_id
    }
    
    # 設置標頭
    headers = {
        'Content-Type': 'application/x-www-form-urlencoded'
    }
    
    # 發送 POST 請求
    response = requests.post(url, headers=headers, data=data)
    
    # 檢查回應狀態
    if response.status_code == 200:
        return response.json()  # 回應成功時返回 JSON 格式的內容
    else:
        print(f"Error: {response.status_code} - {response.text}")
        return None


def recogn_image_urls(df_park_images, host="https://wellpark.dd-long.fun"):
    """
    遍歷 DataFrame，將圖片 URL 與主機名拼接並打印出來

    :param df_park_images: DataFrame，包含API返回的圖片數據
    :param host: str，主機名，用於拼接完整的圖片URL
    """
    # 遍歷 DataFrame 中的每一行，並拼接圖片 URL
    for index, row in df_park_images.iterrows():
        # 獲取圖片的相對路徑
        image_url = row['url']
        # 與主機名拼接完整的URL
        full_url = f"{host}/{image_url}"
        # 打印完整的圖片URL
        remaining_num =  (recognize_parking_info(encode_image_from_url(full_url)))
        
        response_data = post_park_data(
            park_no=row["park_no"], 
            free_quantity=int(remaining_num), 
            update_time=row["captured_at"], 
            park_image_id=row["id"]
        )



while True:
    # 調用獲取數據的函數
    df_park_images = fetch_all_park_images_data()
    
    # 如果返回的資料為空，則暫停 10 秒
    if len(df_park_images) == 0:
        print("資料為空，等待 10 秒...")
        time.sleep(10)
    else:
        print("資料獲取成功，繼續處理...")
        recogn_info = recogn_image_urls(df_park_images)
        # 這裡可以加入其他的資料處理邏輯