/**
 * 心理測驗主應用程式
 * 負責管理測驗流程、UI 互動、答案儲存
 */

const PsychologicalTest = {
    // 狀態變數
    currentQuestionIndex: 0,
    answers: {},
    isAnswerLocked: false,
    currentSelections: [],
    userName: null,
    gender: null, // 'male' 或 'female'

    // DOM 元素
    elements: {
        // 畫面
        genderScreen: null,
        startScreen: null,
        testScreen: null,
        resultScreen: null,
        answersScreen: null,
        
        // 按鈕
        userNameInput: null,
        maleBtn: null,
        femaleBtn: null,
        greetingName: null,
        startBtn: null,
        nextBtn: null,
        restartBtn: null,
        viewAnswersBtn: null,
        fullAnalysisBtn: null,
        backToResultBtn: null,
        restartFromAnswersBtn: null,
        
        // 測驗相關
        currentQuestionSpan: null,
        totalQuestionsSpan: null,
        progressFill: null,
        questionNum: null,
        questionText: null,
        optionBtns: null,
        
        // 結果相關
        resultDetails: null,
        answersList: null
    },

    /**
     * 初始化應用程式
     */
    init: function() {
        this.cacheElements();
        this.bindEvents();
        this.showScreen('gender');
    },

    /**
     * 快取 DOM 元素
     */
    cacheElements: function() {
        // 畫面
        this.elements.genderScreen = document.getElementById('gender-screen');
        this.elements.startScreen = document.getElementById('start-screen');
        this.elements.testScreen = document.getElementById('test-screen');
        this.elements.resultScreen = document.getElementById('result-screen');
        this.elements.answersScreen = document.getElementById('answers-screen');
        
        // 按鈕
        this.elements.userNameInput = document.getElementById('user-name');
        this.elements.maleBtn = document.getElementById('male-btn');
        this.elements.femaleBtn = document.getElementById('female-btn');
        this.elements.greetingName = document.getElementById('greeting-name');
        this.elements.startBtn = document.getElementById('start-btn');
        this.elements.nextBtn = document.getElementById('next-btn');
        this.elements.restartBtn = document.getElementById('restart-btn');
        this.elements.viewAnswersBtn = document.getElementById('view-answers-btn');
        this.elements.fullAnalysisBtn = document.getElementById('full-analysis-btn');
        this.elements.backToResultBtn = document.getElementById('back-to-result-btn');
        this.elements.restartFromAnswersBtn = document.getElementById('restart-from-answers-btn');
        
        // 測驗相關
        this.elements.currentQuestionSpan = document.getElementById('current-question');
        this.elements.totalQuestionsSpan = document.getElementById('total-questions');
        this.elements.progressFill = document.getElementById('progress-fill');
        this.elements.questionNum = document.getElementById('question-num');
        this.elements.questionText = document.getElementById('question-text');
        this.elements.optionBtns = document.querySelectorAll('.option-btn');
        
        // 結果相關
        this.elements.resultDetails = document.getElementById('result-details');
        this.elements.answersList = document.getElementById('answers-list');
    },

    /**
     * 綁定事件監聽器
     */
    bindEvents: function() {
        // 性別選擇
        this.elements.maleBtn.addEventListener('click', () => this.selectGender('male'));
        this.elements.femaleBtn.addEventListener('click', () => this.selectGender('female'));
        
        // 開始測驗
        this.elements.startBtn.addEventListener('click', () => this.startTest());
        
        // 選項按鈕
        this.elements.optionBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.selectOption(e));
        });
        
        // 下一題
        this.elements.nextBtn.addEventListener('click', () => this.nextQuestion());
        
        // 重新測驗
        this.elements.restartBtn.addEventListener('click', () => this.restart());
        this.elements.restartFromAnswersBtn.addEventListener('click', () => this.restart());
        
        // 查看答案
        this.elements.viewAnswersBtn.addEventListener('click', () => this.viewAnswers());
        
        // 完整TEG模型分析
        this.elements.fullAnalysisBtn.addEventListener('click', () => this.showFullAnalysis());
        
        // 返回結果
        this.elements.backToResultBtn.addEventListener('click', () => this.showScreen('result'));
    },

    /**
     * 顯示指定畫面
     */
    showScreen: function(screenName) {
        // 隱藏所有畫面
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // 顯示指定畫面
        const screenMap = {
            'gender': this.elements.genderScreen,
            'start': this.elements.startScreen,
            'test': this.elements.testScreen,
            'result': this.elements.resultScreen,
            'answers': this.elements.answersScreen
        };
        
        if (screenMap[screenName]) {
            screenMap[screenName].classList.add('active');
        }
    },

    /**
     * 選擇性別
     */
    selectGender: function(gender) {
        // 檢查是否輸入姓名
        const userName = this.elements.userNameInput.value.trim();
        if (!userName) {
            alert('請輸入您的姓名');
            this.elements.userNameInput.focus();
            return;
        }
        
        this.userName = userName;
        this.gender = gender;
        console.log('使用者:', userName, '性別:', gender === 'male' ? '男生' : '女生');
        
        // 顯示歡迎訊息
        this.elements.greetingName.textContent = userName;
        this.showScreen('start');
    },

    /**
     * 開始測驗
     */
    startTest: function() {
        this.currentQuestionIndex = 0;
        this.answers = {};
        this.showScreen('test');
        this.displayQuestion();
    },

    /**
     * 顯示當前題目
     */
    displayQuestion: function() {
        const question = questions[this.currentQuestionIndex];
        
        // 更新題號和進度
        const questionNumber = this.currentQuestionIndex + 1;
        this.elements.currentQuestionSpan.textContent = questionNumber;
        this.elements.totalQuestionsSpan.textContent = questions.length;
        this.elements.questionNum.textContent = questionNumber;
        
        // 更新進度條
        const progress = (questionNumber / questions.length) * 100;
        this.elements.progressFill.style.width = progress + '%';
        
        // 顯示題目文字
        this.elements.questionText.textContent = question.text;
        
        // 重置選項狀態
        this.isAnswerLocked = false;
        this.currentSelections = [];
        this.elements.optionBtns.forEach(btn => {
            btn.classList.remove('selected');
            btn.disabled = false;
        });
        
        // 禁用下一題按鈕
        this.elements.nextBtn.disabled = true;
    },

    /**
     * 選擇選項
     */
    selectOption: function(event) {
        if (this.isAnswerLocked) return;
        
        const btn = event.currentTarget;
        const value = btn.getAttribute('data-value');
        
        // 切換選擇狀態
        if (btn.classList.contains('selected')) {
            // 取消選擇
            btn.classList.remove('selected');
            const index = this.currentSelections.indexOf(value);
            if (index > -1) {
                this.currentSelections.splice(index, 1);
            }
        } else {
            // 新增選擇
            btn.classList.add('selected');
            this.currentSelections.push(value);
        }
        
        // 更新下一題按鈕狀態
        this.elements.nextBtn.disabled = this.currentSelections.length === 0;
    },

    /**
     * 下一題
     */
    nextQuestion: function() {
        // 儲存答案
        const questionId = questions[this.currentQuestionIndex].id;
        this.answers[questionId] = [...this.currentSelections];
        
        // 鎖定答案
        this.isAnswerLocked = true;
        this.elements.optionBtns.forEach(btn => {
            btn.disabled = true;
        });
        
        // 檢查是否為最後一題
        if (this.currentQuestionIndex >= questions.length - 1) {
            this.showResult();
        } else {
            // 進入下一題
            this.currentQuestionIndex++;
            this.displayQuestion();
        }
    },

    /**
     * 顯示結果
     */
    showResult: function() {
        // 計算分數
        const scores = TEGScoring.calculateScore(this.answers, this.gender);
        
        // 生成結果 HTML
        const resultHTML = TEGScoring.generateResult(scores);
        this.elements.resultDetails.innerHTML = resultHTML;
        
        // 顯示結果畫面
        this.showScreen('result');
    },

    /**
     * 查看答案
     */
    viewAnswers: function() {
        // 生成答案列表 HTML
        const answersHTML = TEGScoring.generateAnswersList(this.answers, questions, TEGScoring.calculateTEGScores(this.answers));
        this.elements.answersList.innerHTML = answersHTML;
        
        // 顯示答案畫面
        this.showScreen('answers');
    },

    /**
     * 重新測驗
     */
    restart: function() {
        this.currentQuestionIndex = 0;
        this.answers = {};
        this.isAnswerLocked = false;
        this.currentSelections = [];
        this.userName = null;
        this.gender = null;
        this.elements.userNameInput.value = '';
        this.showScreen('gender');
    },
    
    /**
     * 顯示完整TEG模型分析
     */
    showFullAnalysis: function() {
        // 計算分數
        const scores = TEGScoring.calculateScore(this.answers, this.gender);
        
        // 生成完整分析報告
        const analysisHTML = this.generateFullAnalysisReport(scores);
        
        // 在新視窗或彈出視窗顯示
        const analysisWindow = window.open('', '_blank', 'width=1000,height=800,scrollbars=yes');
        analysisWindow.document.write(analysisHTML);
        analysisWindow.document.close();
    },
    
    /**
     * 生成完整分析報告 HTML
     */
    generateFullAnalysisReport: function(scores) {
        const personalityType = PersonalityType.determineType(scores.percentiles);
        const genderText = scores.gender === 'male' ? '男生' : '女生';
        
        // 提取百分位數和原始分數
        const percentileScores = Object.keys(scores.percentiles).map(k => scores.percentiles[k].percentile);
        const rawScores = Object.keys(scores.percentiles).map(k => scores.percentiles[k].raw);
        
        return `
<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TEG 完整模型分析 - ${this.userName}</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Microsoft JhengHei', 'PingFang TC', sans-serif;
            background: linear-gradient(135deg, #FFF8DE 0%, #FFF2C6 100%);
            padding: 40px 20px;
            color: #333;
        }
        .container {
            max-width: 1000px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 10px 50px rgba(0, 0, 0, 0.3);
        }
        h1 {
            text-align: center;
            color: #8CA9FF;
            font-size: 2.5rem;
            margin-bottom: 10px;
        }
        .subtitle {
            text-align: center;
            color: #666;
            font-size: 1.2rem;
            margin-bottom: 30px;
        }
        .info-section {
            background: #FFF8DE;
            padding: 20px;
            border-radius: 15px;
            margin-bottom: 30px;
        }
        .info-item {
            display: inline-block;
            margin-right: 30px;
            font-size: 1.1rem;
        }
        .info-label {
            font-weight: bold;
            color: #8CA9FF;
        }
        .chart-container {
            position: relative;
            height: 600px !important;
            margin: 30px 0;
            background: white;
            padding: 20px;
            border-radius: 15px;
        }
        .type-section {
            background: linear-gradient(135deg, #8CA9FF 0%, #AAC4F5 100%);
            color: white;
            padding: 30px;
            border-radius: 15px;
            margin: 30px 0;
        }
        .type-title {
            font-size: 2rem;
            text-align: center;
            margin-bottom: 20px;
        }
        .type-content {
            font-size: 1.1rem;
            line-height: 1.8;
        }
        .scores-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin: 30px 0;
        }
        .score-card {
            background: #FFF8DE;
            padding: 20px;
            border-radius: 15px;
            text-align: center;
            border: 3px solid #8CA9FF;
        }
        .score-label {
            font-size: 1.1rem;
            font-weight: bold;
            color: #8CA9FF;
            margin-bottom: 10px;
        }
        .score-value {
            font-size: 2rem;
            font-weight: bold;
            color: #333;
        }
        .score-percentile {
            font-size: 0.9rem;
            color: #666;
            margin-top: 5px;
        }
        .characteristics, .suggestions {
            margin: 30px 0;
        }
        .characteristics h3, .suggestions h3 {
            color: #8CA9FF;
            font-size: 1.5rem;
            margin-bottom: 15px;
        }
        .characteristics ul, .suggestions ul {
            list-style: none;
            padding-left: 0;
        }
        .characteristics li, .suggestions li {
            padding: 10px 0 10px 30px;
            position: relative;
            font-size: 1.1rem;
            line-height: 1.6;
        }
        .characteristics li:before {
            content: "✓";
            position: absolute;
            left: 0;
            color: #667eea;
            font-weight: bold;
            font-size: 1.3rem;
        }
        .suggestions li:before {
            content: "💡";
            position: absolute;
            left: 0;
            font-size: 1.2rem;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #eee;
            color: #666;
        }
        .print-btn {
            display: block;
            width: 200px;
            margin: 30px auto;
            padding: 15px 30px;
            background: #8CA9FF;
            color: white;
            border: none;
            border-radius: 10px;
            font-size: 1.1rem;
            cursor: pointer;
            font-weight: bold;
        }
        .print-btn:hover {
            background: #7A98EE;
        }
        @media print {
            body { background: white; padding: 0; }
            .print-btn { display: none; }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎯 TEG 完整模型分析</h1>
        <p class="subtitle">Transactional Analysis Egogram</p>
        
        <div class="info-section">
            <div class="info-item">
                <span class="info-label">姓名：</span>
                <span>${this.userName}</span>
            </div>
            <div class="info-item">
                <span class="info-label">性別：</span>
                <span>${genderText}</span>
            </div>
            <div class="info-item">
                <span class="info-label">測驗日期：</span>
                <span>${new Date().toLocaleDateString('zh-TW')}</span>
            </div>
        </div>
        
        <h2 style="text-align: center; color: #667eea; margin: 30px 0 20px 0;">📊 TEG 人格分析圖</h2>
        <div class="chart-container">
            <canvas id="teg-chart"></canvas>
        </div>
        
        <div class="type-section">
            <div class="type-title">🎯 您的人格類型：${personalityType.name}</div>
            <div class="type-content">
                <p style="text-align: center; font-size: 1.3rem; margin-bottom: 20px;">${personalityType.subname}</p>
                <p>${personalityType.description}</p>
            </div>
        </div>
        
        <h2 style="text-align: center; color: #667eea; margin: 30px 0 20px 0;">📊 百分位數分數</h2>
        <div class="scores-grid">
            ${Object.keys(scores.tegScores).map(group => `
                <div class="score-card">
                    <div class="score-label">${group}</div>
                    <div class="score-value">${scores.tegScores[group]}</div>
                    <div class="score-percentile">百分位：${scores.percentiles[group].percentile}</div>
                </div>
            `).join('')}
        </div>
        
        <div class="characteristics">
            <h3>✨ 人格特質</h3>
            <ul>
                ${personalityType.characteristics.map(c => `<li>${c}</li>`).join('')}
            </ul>
        </div>
        
        <div class="suggestions">
            <h3>💡 建議與發展方向</h3>
            <ul>
                ${personalityType.suggestions.map(s => `<li>${s}</li>`).join('')}
            </ul>
        </div>
        
        <button class="print-btn" onclick="window.print()">🖨️ 列印報告</button>
        
        <div class="footer">
            <p>版權為天禄出版社所有</p>
        </div>
    </div>
    
    <script>
        // 繪製 TEG 圖表
        const ctx = document.getElementById('teg-chart').getContext('2d');
        const percentileScores = [${percentileScores.join(', ')}];
        const rawScores = [${rawScores.join(', ')}];
        
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['CP', 'NP', 'A', 'FC', 'AC', 'D', 'Q'],
                datasets: [{
                    label: 'TEG 人格分析 (${genderText})',
                    data: percentileScores,
                    borderColor: '#8CA9FF',
                    backgroundColor: 'rgba(140, 169, 255, 0.2)',
                    borderWidth: 4,
                    pointRadius: 8,
                    pointBackgroundColor: '#8CA9FF',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 3,
                    pointHoverRadius: 10,
                    tension: 0.3,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        title: {
                            display: true,
                            text: '百分位數',
                            font: { size: 16, weight: 'bold' }
                        },
                        grid: { color: 'rgba(0, 0, 0, 0.1)' },
                        ticks: {
                            stepSize: 10,
                            font: { size: 14 }
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'TEG 人格面向',
                            font: { size: 16, weight: 'bold' }
                        },
                        grid: { display: false },
                        ticks: {
                            font: { size: 14 }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: { font: { size: 16 } }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const labels = ['CP', 'NP', 'A', 'FC', 'AC', 'D', 'Q'];
                                const index = context.dataIndex;
                                const percentile = percentileScores[index];
                                const raw = rawScores[index];
                                return [
                                    labels[index] + ' 百分位數: ' + percentile + '%',
                                    '原始分數: ' + raw
                                ];
                            }
                        }
                    }
                }
            }
        });
    </script>
</body>
</html>
        `;
    }
};

// 當 DOM 載入完成後初始化應用程式
document.addEventListener('DOMContentLoaded', function() {
    PsychologicalTest.init();
});
