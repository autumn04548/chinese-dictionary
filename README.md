# 中文查字機：GitHub Pages 靜態版

將本資料夾全部內容（包含 data 與 .nojekyll）上傳到 GitHub 儲存庫。Settings → Pages 選 Deploy from a branch，選 main 分支及 / (root)。等待 GitHub 完成部署，再用其提供的 HTTPS 網址於 iPad Safari 開啟。此步驟尚未由助理實際執行。

不用 Node.js 後端、不含金鑰、不呼叫付費 AI。查字規則、候選選字、搜尋框自動清空與筆順自動播放保留。不能直接雙擊 index.html 測試，需用 HTTP/HTTPS 提供檔案。所有內部資源採相對路徑，可用儲存庫子路徑。

第一次查字下載 dictionary.json，之後同一頁重用記憶體資料。重新開啟頁面可能重新下載，依瀏覽器快取而定；這不是已完成的離線 App。原字典釋義未包含在此網頁版，僅保留標題、注音、部首、筆畫以供查字；161,194 筆包含詞語，不是單字數。

字典原著教育部，來源 g0v/moedict-data，授權 CC BY-ND 3.0 TW（格式轉換 CC0）；原字串未改寫，SOURCE-README.md 保存來源說明。完整原始字典仍留在電腦原專案 data，適合另外放 Drive 備份。

筆順來源 Hanzi Writer Data／Make Me A Hanzi，Copyright (C) 1999 Arphic Technology Co., Ltd.，Arphic Public License 全文在 data/strokes/ARPHICPL.TXT。已收錄的七字資料隨網頁放置，其餘字首次查詢從固定版本 GitHub 公開資料下載。這會對 GitHub 傳送所查字形的下載請求；不用付費 API。筆順不保證符合臺灣教育部標準。

Google Drive 可存備份 ZIP，不作網頁即時讀取來源。此資料夾皆為公開網頁資源，勿加入金鑰、個人資料或 .env。部署後電腦可關機，但 iPad 仍需網路下載尚未快取的資料。
