
import pandas as pd
from pmdarima import auto_arima
import matplotlib.pyplot as plt
import requests


def fetch_parking_lot_data(park_no):
    """
    從API獲取指定停車場的所有數據，並將其轉換為DataFrame格式。

    :param park_no: str，指定的停車場編號
    :return: DataFrame，包含停車場數據的pandas DataFrame
    """
    # 定義API的基本URL
    base_url = "https://wellpark.dd-long.fun/api/parks"
    
    # 初始化變數
    page = 1
    all_data = []
    
    # 開始遍歷每個頁面
    while True:
        # 設定查詢參數
        params = {
            'page': page,
            'park_no': park_no,
            'per_page': 1440
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
    parking_lot_df = pd.DataFrame(all_data)
    parking_lot_df = parking_lot_df.reset_index()

    # 返回DataFrame
    return parking_lot_df



def sarima_forecast(parking_lot_df_grouped, columns_to_forecast, forecast_periods=12, seasonal_period=48):
    """
    使用SARIMA模型為指定的欄位進行預測並返回預測結果的DataFrame

    :param parking_lot_df_grouped: DataFrame，包含歷史數據的數據框
    :param columns_to_forecast: list，指定要進行預測的欄位名稱
    :param forecast_periods: int，預測的時段數量，默認為12
    :param seasonal_period: int，SARIMA模型的季節性周期，默認為48
    :return: DataFrame，包含每個欄位的預測數據和日期的DataFrame
    """
    
    # 初始化預測結果DataFrame
    pred_df = pd.DataFrame()

    for column in columns_to_forecast:
        # 使用 update_time_30min 作為索引並去除缺失值
        series = parking_lot_df_grouped.set_index('update_time_60min')[column].dropna()

        # 使用 auto_arima 自動選擇最佳參數
        model = auto_arima(series, seasonal=True, m=seasonal_period, trace=True, error_action='ignore', suppress_warnings=True)

        # 預測未來指定時點
        forecast = model.predict(n_periods=forecast_periods)

        # 保存預測結果
        pred_df[column] = forecast

        # 繪製實際值和預測值的圖表
        plt.figure(figsize=(10,6))
        plt.plot(series.index, series, label='Historical Data')

        # 設置未來預測的時間範圍
        future_dates = pd.date_range(series.index[-1], periods=forecast_periods, freq='1H')
        plt.plot(future_dates, forecast, label='Forecast', color='red')

        # 設置標題和圖例
        plt.title(f"SARIMA Forecast for {column}")
        plt.xlabel('Time')
        plt.ylabel('Quantity')
        plt.xticks(rotation=45)
        plt.legend()

        # 顯示圖表
        plt.tight_layout()
        plt.show()

    # 添加日期欄位到預測結果DataFrame
    pred_df["date"] = future_dates

    return pred_df




def post_park_data(pred_df):
    """
    將預測數據發送至API，逐行處理並發送POST請求

    :param pred_df: DataFrame，包含要上傳的預測數據
    """
    # 確保 pred_df 重置索引
    pred_df = pred_df.reset_index(drop=True)

    # 定義API URL
    url = "https://wellpark.dd-long.fun/api/pred-park"
    
    for i in range(len(pred_df)):
        # 構建需要發送的數據格式
        park_format = {
            "park_no": "004",
            "free_quantity": max(0, round(pred_df.loc[i]["free_quantity"])),
            "free_quantity_big": max(0, round(pred_df.loc[i]["free_quantity_big"])),
            "free_quantity_mot": max(0, round(pred_df.loc[i]["free_quantity_mot"])),
            "free_quantity_dis": max(0, round(pred_df.loc[i]["free_quantity_dis"])),
            "free_quantity_cw": max(0, round(pred_df.loc[i]["free_quantity_cw"])),
            "free_quantity_ecar": max(0, round(pred_df.loc[i]["free_quantity_ecar"])),
            "future_time": pred_df.loc[i]["date"]  # 確保時間格式符合API要求
        }

        # 設置請求的標頭
        headers = {'Content-Type': 'application/x-www-form-urlencoded'}
        
        # 發送POST請求
        response = requests.post(url, headers=headers, data=park_format)

        # 打印狀態碼
        print(f"Status Code for record {i}: {response.status_code}")

        # 檢查是否成功回應
        if response.status_code == 201:
            try:
                print(response.json())  # 顯示成功回應的JSON內容
            except ValueError:
                print("Response is not in JSON format")
        else:
            print(f"Error: {response.text}")  # 顯示錯誤訊息


# 定義 API 的 base URL
base_url = "http://wellpark.dd-long.fun/api/latest-parks"
columns_to_forecast = ['free_quantity_mot', 'free_quantity_dis', 'free_quantity_cw', 'free_quantity_ecar', 'free_quantity_big', 'free_quantity']
# 用來儲存所有頁面的資料
all_data = []

# 初始頁面設定
page = 1

while True:
    # 構建分頁參數
    params = {'page': page}
    response = requests.get(base_url, params=params)

    # 確保請求成功
    if response.status_code == 200:
        # 取得回應資料
        data = response.json()
        
        # 將當前頁面的數據添加到 all_data 列表中
        all_data.extend(data['data'])

        # 檢查是否有下一頁
        print(data['links'])
        if data['links']['next'] is None:
            print(data['links']['next'])
            break
        
        # 進入下一頁
        page += 1
    else:
        print(f"Failed to retrieve data on page {page}, status code: {response.status_code}")
        break

# 將所有頁面的資料轉換為 pandas DataFrame
parking_lot_info_df = pd.DataFrame(all_data)



for i in range(len(parking_lot_info_df)):
    parking_no = parking_lot_info_df.loc[i, "park_no"]
    print(f"Parking No: {parking_no}")
    parking_lot_df = fetch_parking_lot_data(parking_no)
    # 將 update_time 欄位轉換為 datetime 格式
    parking_lot_df['update_time'] = pd.to_datetime(parking_lot_df['update_time'])
    # Round the 'update_time' to the nearest 30 minutes
    parking_lot_df['update_time_60min'] = parking_lot_df['update_time'].dt.round('60min')
    parking_lot_df_filter = parking_lot_df[['park_no', 'parking_name', 
           'free_quantity', 'total_quantity', 'free_quantity_mot',
           'total_quantity_mot', 'free_quantity_dis', 'total_quantity_dis',
           'free_quantity_cw', 'total_quantity_cw', 'free_quantity_ecar',
           'total_quantity_ecar', 'update_time_60min', 'free_quantity_big', 'total_quantity_big']]
    parking_lot_df_grouped = parking_lot_df_filter.groupby(['update_time_60min', 'park_no', 'parking_name']).mean().reset_index()
    pred_df_result = sarima_forecast(parking_lot_df_grouped, columns_to_forecast, forecast_periods=24, seasonal_period=24)
    post_park_data(pred_df_result)
