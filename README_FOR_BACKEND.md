# 心理測驗前端系統 - 後端工程師文件

**版本**：v2.0 (TEG 模型完整版)  
**日期**：2025-12-19

---

## 快速開始

### 1. 檔案結構

```
psychological-test/
├── index.html              # 單頁應用主檔案
├── css/
│   └── style.css          # 完整樣式（18 KB）
├── js/
│   ├── questions.js       # 60 題題目資料
│   ├── app.js             # 測驗流程控制
│   └── scoring.js         # TEG 模型計分邏輯
└── assets/                # 資源資料夾（預留）
```

### 2. 本地測試

```bash
# 啟動簡易伺服器
cd psychological-test
python3 -m http.server 8080

# 在瀏覽器開啟
# http://localhost:8080
```

### 3. 核心功能

- ✅ 60 題心理測驗
- ✅ 單題顯示模式
- ✅ 複選功能（可選 1-3 個選項）
- ✅ TEG 模型 7 組計分
- ✅ 結果統計與視覺化
- ✅ 答案檢視功能

---

## 重要文件

### 必讀文件（依優先順序）

1. **BACKEND_INTEGRATION_GUIDE.md**（後端整合指南）
   - 資料結構說明
   - 計分邏輯詳解
   - 前後端整合方案
   - 資料庫設計建議

2. **API_SPECIFICATION.md**（API 規格文件）
   - 完整 API 端點定義
   - 請求/回應格式
   - 錯誤處理
   - 計分邏輯實作範例（Python）

3. **Q_GROUP_FINAL_TEST_REPORT.md**（測試報告）
   - 完整測試結果
   - Q 組計分驗證
   - 功能檢查清單

4. **UPDATE_NOTES_V2.md**（版本更新說明）
   - v2.0 新增功能
   - 檔案修改清單
   - 部署注意事項

---

## 資料格式速查

### 答案格式

```javascript
{
    1: ["circle"],              // 單選
    2: ["triangle"],            // 單選
    3: ["circle", "triangle"],  // 複選
    // ... 共 60 題
}
```

**選項值**：
- `"circle"` → ◯ 是（2 分）
- `"triangle"` → ▲ 不一定（1 分）
- `"cross"` → ✕ 不是（0 分）

### TEG 分數格式

```javascript
{
    CP: 12,  // 批判的父母
    NP: 9,   // 養育的父母
    A: 11,   // 成人
    FC: 10,  // 自由的兒童
    AC: 6,   // 順應的兒童
    D: 15,   // 防衛
    Q: 2     // 矛盾（複選題數）
}
```

---

## 計分邏輯摘要

### 基本規則

```
◯（是）= 2 分
▲（不一定）= 1 分
✕（不是）= 0 分
作答兩個以上 = 1 分（第一守則）
```

### 分組計分

**CP、NP、A、FC、AC、D 組**：分數相加
**Q 組**：計算「作答兩個以上」的題目數量

### 題目分組

```javascript
CP: [8, 38, 13, 43, 22, 53, 27, 57]
NP: [10, 40, 15, 45, 20, 50, 24, 54]
A: [6, 36, 7, 37, 14, 44, 17, 47, 26, 56]
FC: [1, 32, 11, 34, 12, 35, 18, 46, 21, 58]
AC: [3, 33, 9, 39, 19, 49, 29, 59, 30, 60]
D: [2, 4, 5, 16, 23, 28, 31, 41, 42, 48, 51, 52, 57]
Q: [25, 38, 40, 50, 54, 55]
```

**注意**：部分題目同時屬於多個分組（如題目 38 同時在 CP 和 Q 組）

---

## 整合方案

### 方案 A：純前端（當前版本）
- 無需後端
- 答案儲存在記憶體
- 適合測試和展示

### 方案 B：前端 + 後端 API（建議）
- 前端負責 UI 和流程
- 後端負責資料儲存
- API 端點參考 `API_SPECIFICATION.md`

### 方案 C：混合模式
- 前端計分（即時回饋）
- 後端儲存（資料持久化）
- 前端可離線運作

---

## 後端 API 建議

### 核心端點

```
POST /api/test/start          # 開始測驗
POST /api/test/{id}/answer    # 儲存答案
POST /api/test/{id}/submit    # 提交測驗
GET  /api/test/{id}/result    # 取得結果
```

### 資料庫表格

```sql
-- 測驗記錄
tests (id, user_id, started_at, completed_at, status)

-- 答案記錄
test_answers (id, test_id, question_id, answers, answered_at)

-- 結果記錄
test_results (id, test_id, score_cp, score_np, ..., statistics)
```

詳細設計請參考 `BACKEND_INTEGRATION_GUIDE.md` 第五節。

---

## 前端 JavaScript API

### 主要物件

**PsychologicalTest**（測驗控制）
- `init()` - 初始化
- `startTest()` - 開始測驗
- `selectOption(option)` - 選擇選項
- `nextQuestion()` - 下一題
- `showResult()` - 顯示結果

**ScoringSystem**（計分系統）
- `calculateScore(answers)` - 計算完整分數
- `calculateTEGScores(answers)` - 計算 TEG 分數
- `generateResult(scores)` - 生成結果 HTML

詳細 API 請參考 `BACKEND_INTEGRATION_GUIDE.md` 第七節。

---

## 修改指南

### 整合後端 API

**檔案**：`js/app.js`

```javascript
// 在 showResult 函式中新增
showResult: async function() {
    const scores = ScoringSystem.calculateScore(this.answers);
    
    // 呼叫後端 API
    await fetch('/api/test/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            answers: this.answers,
            scores: scores
        })
    });
    
    // 顯示結果...
}
```

### 從後端載入題目

**檔案**：`js/app.js`

```javascript
// 在 init 函式中
init: async function() {
    const response = await fetch('/api/test/start');
    const data = await response.json();
    
    this.testId = data.testId;
    // questions 變數可從後端覆寫
    
    this.showStartScreen();
}
```

---

## 測試驗證

### 計分邏輯測試

**測試案例 1**：全選 ◯（是）
```javascript
預期：CP=16, NP=16, A=20, FC=20, AC=20, D=26, Q=0
```

**測試案例 2**：Q 組全部複選
```javascript
Q 組題目：[25, 38, 40, 50, 54, 55]
預期：Q=6
```

### 前端功能測試

- [ ] 開始測驗正常
- [ ] 題目逐一顯示
- [ ] 選項選擇正常
- [ ] 複選功能正常
- [ ] 進度追蹤正確
- [ ] 結果顯示正常
- [ ] TEG 分數正確
- [ ] 答案檢視正常

---

## 常見問題

### Q1：為什麼有些題目屬於多個分組？

這是 TEG 模型的正常設計。計分時會同時計入兩個組的分數。

### Q2：Q 組計分為什麼不同？

Q 組計算的是「複選題數」，不是分數總和。這是 TEG 模型的特殊設計。

### Q3：前端計分可以信任嗎？

前端計分已經過完整測試，但建議後端也實作計分邏輯進行驗證。

### Q4：如何防止使用者作弊？

建議後端記錄作答時間、檢查作答順序、限制作答時間。

---

## 技術規格

- **JavaScript**：ES6+
- **CSS**：CSS3（Flexbox、Grid）
- **瀏覽器支援**：Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **無外部依賴**：不需要 jQuery、React 等框架
- **檔案大小**：約 30 KB（未壓縮）

---

## 效能建議

### 前端
- 壓縮 CSS 和 JavaScript
- 使用瀏覽器快取
- 延遲載入非關鍵資源

### 後端
- 使用資料庫索引
- 快取題目列表
- 批次儲存答案

---

## 安全性建議

### 輸入驗證
- 驗證 questionId 範圍（1-60）
- 驗證 answers 格式
- 防止 SQL 注入

### 身份驗證
- 使用 JWT 或 Session
- 確保使用者只能訪問自己的資料

### 資料保護
- 敏感資料加密
- 遵守隱私法規
- 提供資料刪除功能

---

## 聯絡與支援

如有技術問題或需要進一步說明，請參考：

1. **BACKEND_INTEGRATION_GUIDE.md** - 完整整合指南
2. **API_SPECIFICATION.md** - API 規格文件
3. **Q_GROUP_FINAL_TEST_REPORT.md** - 測試報告

---

## 檢查清單

### 前端檔案
- [ ] index.html 存在
- [ ] css/style.css 存在
- [ ] js/questions.js 存在（60 題）
- [ ] js/app.js 存在
- [ ] js/scoring.js 存在

### 後端準備
- [ ] API 端點已定義
- [ ] 資料庫已建立
- [ ] 計分邏輯已實作
- [ ] 認證機制已完成
- [ ] 錯誤處理已完成

### 測試
- [ ] 前端功能測試通過
- [ ] 計分邏輯驗證通過
- [ ] API 整合測試通過
- [ ] 安全性測試通過

---

**前端系統版本**：v2.0  
**最後更新**：2025-12-19  
**測試狀態**：已通過完整測試  
**可用狀態**：✅ 可以交付給後端工程師整合
