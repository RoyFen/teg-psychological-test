/**
 * TEG 模型計分系統（更新版）
 * 負責計算 TEG 7 組分數、百分位數轉換、結果生成
 * 
 * 新計分邏輯：
 * 1. ◯=2分、▲=1分、✕=0分
 * 2. 作答兩處則以0分計算（複選題該題計0分）
 * 3. 總共分為7組：CP、NP、A、FC、AC、D、Q
 * 4. D組的分數如果低於15分則需要受試者重做題目
 * 5. Q組的分數為所有題目的▲總計數
 * 6. 除Q以外其他組則以分數相加再進行百分比換算得出結果
 */

const TEGScoring = {
    /**
     * TEG 7 組的題目分組
     */
    questionGroups: {
        CP: [8, 38, 13, 43, 22, 53, 27, 57],
        NP: [10, 40, 15, 45, 20, 50, 24, 54],
        A: [6, 36, 7, 37, 14, 44, 17, 47, 26, 56],
        FC: [2, 32, 4, 34, 5, 35, 16, 46, 28, 58],
        AC: [1, 31, 11, 41, 12, 42, 18, 48, 21, 51],
        D: [3, 33, 9, 39, 19, 49, 29, 59, 30, 60]
        // Q 組不需要題目列表，直接計算所有題目的▲總數
    },

    /**
     * 計算單題分數
     * @param {Array} selections - 該題的選項陣列，例如 ['circle'] 或 ['circle', 'triangle']
     * @returns {Number} 該題的分數
     */
    calculateQuestionScore: function(selections) {
        // 規則2：作答兩處則以0分計算
        if (selections.length >= 2) {
            return 0;
        }
        
        // 規則1：◯=2分、▲=1分、✕=0分
        if (selections.length === 1) {
            const selection = selections[0];
            if (selection === 'circle') return 2;
            if (selection === 'triangle') return 1;
            if (selection === 'cross') return 0;
        }
        
        // 未作答
        return 0;
    },

    /**
     * 計算 TEG 7 組分數
     * @param {Object} answers - 所有答案的物件，格式：{ 1: ['circle'], 2: ['triangle', 'cross'], ... }
     * @returns {Object} TEG 7 組分數
     */
    calculateTEGScores: function(answers) {
        const scores = {
            CP: 0,
            NP: 0,
            A: 0,
            FC: 0,
            AC: 0,
            D: 0,
            Q: 0
        };

        // 計算 CP、NP、A、FC、AC、D 組的分數
        for (const group in this.questionGroups) {
            const questions = this.questionGroups[group];
            let groupScore = 0;
            
            for (const questionNum of questions) {
                const selections = answers[questionNum] || [];
                groupScore += this.calculateQuestionScore(selections);
            }
            
            scores[group] = groupScore;
        }

        // 計算 Q 組分數：所有題目的▲總計數
        let triangleCount = 0;
        for (let i = 1; i <= 60; i++) {
            const selections = answers[i] || [];
            // 計算該題選擇▲的次數
            const trianglesInQuestion = selections.filter(s => s === 'triangle').length;
            triangleCount += trianglesInQuestion;
        }
        scores.Q = triangleCount;

        return scores;
    },

    /**
     * 檢查 D 組和 Q 組是否需要重做
     * @param {Object} tegScores - TEG 分數
     * @returns {Object} 檢查結果 { needRetake: boolean, warnings: [] }
     */
    checkRetakeRequired: function(tegScores) {
        const warnings = [];
        let needRetake = false;

        // 規則4：D組的分數如果低於15分則需要受試者重做題目
        if (tegScores.D < 15) {
            warnings.push('D組（防衛）分數低於15分，建議重新作答');
            needRetake = true;
        }

        // 規則5（修正）：Q組的分數如果低於15分則需要受試者重做題目
        if (tegScores.Q < 15) {
            warnings.push('Q組（矛盾）分數低於15分，建議重新作答');
            needRetake = true;
        }

        return {
            needRetake: needRetake,
            warnings: warnings
        };
    },

    /**
     * 計算基本統計資料
     * @param {Object} answers - 所有答案的物件
     * @returns {Object} 統計資料
     */
    calculateBasicStats: function(answers) {
        let questionsAnswered = 0;
        let multipleChoice = 0;
        let circle = 0;
        let triangle = 0;
        let cross = 0;

        for (let i = 1; i <= 60; i++) {
            const selections = answers[i] || [];
            
            if (selections.length > 0) {
                questionsAnswered++;
            }
            
            if (selections.length >= 2) {
                multipleChoice++;
            }

            // 計算各選項次數
            selections.forEach(selection => {
                if (selection === 'circle') circle++;
                if (selection === 'triangle') triangle++;
                if (selection === 'cross') cross++;
            });
        }

        return {
            questionsAnswered: questionsAnswered,
            multipleChoice: multipleChoice,
            circle: circle,
            triangle: triangle,
            cross: cross,
            total: circle + triangle + cross
        };
    },

    /**
     * 計算百分位數
     * @param {Object} tegScores - TEG 分數
     * @param {String} gender - 性別 ('male' 或 'female')
     * @returns {Object} 百分位數結果
     */
    calculatePercentiles: function(tegScores, gender) {
        const percentiles = {};
        
        // 對每個分組計算百分位數
        Object.keys(tegScores).forEach(group => {
            const rawScore = tegScores[group];
            const percentile = getPercentile(group, rawScore, gender);
            const description = getPercentileDescription(percentile);
            const color = getPercentileColor(percentile);
            
            percentiles[group] = {
                raw: rawScore,
                percentile: percentile,
                description: description,
                color: color
            };
        });
        
        return percentiles;
    },

    /**
     * 計算完整分數
     * @param {Object} answers - 所有答案的物件
     * @param {String} gender - 性別 ('male' 或 'female')
     * @returns {Object} 完整計分結果
     */
    calculateScore: function(answers, gender = 'male') {
        const tegScores = this.calculateTEGScores(answers);
        const basicStats = this.calculateBasicStats(answers);
        const percentiles = this.calculatePercentiles(tegScores, gender);
        const retakeCheck = this.checkRetakeRequired(tegScores);

        return {
            tegScores: tegScores,
            basicStats: basicStats,
            percentiles: percentiles,
            gender: gender,
            retakeCheck: retakeCheck
        };
    },

    /**
     * 繪製 TEG 人格分析圖
     * @param {Object} percentiles - 百分位數資料
     * @param {String} gender - 性別
     */
    drawTEGChart: function(percentiles, gender) {
        const ctx = document.getElementById('teg-chart');
        if (!ctx) return;
        
        // 如果已經有圖表，先销毀
        if (window.tegChart) {
            window.tegChart.destroy();
        }
        
        // 準備資料（按照 CP、NP、A、FC、AC、D、Q 順序）
        const labels = ['CP', 'NP', 'A', 'FC', 'AC', 'D', 'Q'];
        const data = labels.map(group => percentiles[group].percentile);
        
        const genderText = gender === 'male' ? '男生' : '女生';
        
        // 建立圖表
        window.tegChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: `TEG 人格分析（${genderText}）`,
                    data: data,
                    borderColor: '#8CA9FF',
                    backgroundColor: 'rgba(140, 169, 255, 0.2)',
                    borderWidth: 3,
                    pointRadius: 6,
                    pointBackgroundColor: '#8CA9FF',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointHoverRadius: 8,
                    tension: 0.3,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: false
                    },
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            font: {
                                size: 14,
                                weight: 'bold'
                            },
                            padding: 15
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const group = context.label;
                                const percentile = context.parsed.y;
                                const raw = percentiles[group].raw;
                                return [
                                    `百分位數: ${percentile}`,
                                    `原始分數: ${raw}`
                                ];
                            }
                        },
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        titleFont: {
                            size: 14,
                            weight: 'bold'
                        },
                        bodyFont: {
                            size: 13
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            stepSize: 10,
                            font: {
                                size: 12
                            }
                        },
                        title: {
                            display: true,
                            text: '百分位數',
                            font: {
                                size: 14,
                                weight: 'bold'
                            }
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    x: {
                        ticks: {
                            font: {
                                size: 13,
                                weight: 'bold'
                            }
                        },
                        title: {
                            display: true,
                            text: 'TEG 人格面向',
                            font: {
                                size: 14,
                                weight: 'bold'
                            }
                        },
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    },
    
    /**
     * 生成 TEG 模型結果報告（含百分位數）
     * @param {Object} scores - 計分結果
     * @returns {String} HTML 格式的結果報告
     */
    generateResult: function(scores) {
        // 繪製圖表（延遲執行以確保 DOM 已渲染）
        setTimeout(() => {
            this.drawTEGChart(scores.percentiles, scores.gender);
        }, 100);
        const tegScores = scores.tegScores;
        const basicStats = scores.basicStats;
        const percentiles = scores.percentiles;
        const gender = scores.gender;
        const retakeCheck = scores.retakeCheck;
        
        const genderText = gender === 'male' ? '男生' : '女生';
        
        // 判斷人格類型
        const personalityType = PersonalityType.determineType(percentiles);
        
        // 生成警告訊息（如果需要重做）
        let warningHTML = '';
        if (retakeCheck.needRetake) {
            warningHTML = `
                <div class="retake-warning">
                    <h4>⚠️ 注意事項</h4>
                    ${retakeCheck.warnings.map(w => `<p>• ${w}</p>`).join('')}
                    <p class="warning-note">※ 建議重新進行測驗以獲得更準確的結果</p>
                </div>
            `;
        }
        
        // 生成各組的百分位數卡片
        const groupNames = {
            CP: 'CP（批判的父母）',
            NP: 'NP（養育的父母）',
            A: 'A（成人）',
            FC: 'FC（自由的兒童）',
            AC: 'AC（順應的兒童）',
            D: 'D（防衛）',
            Q: 'Q（矛盾）'
        };
        
        let scoreCardsHTML = '';
        Object.keys(groupNames).forEach(group => {
            const p = percentiles[group];
            const isWarning = (group === 'D' || group === 'Q') && p.raw < 15;
            const warningClass = isWarning ? 'warning-card' : '';
            
            scoreCardsHTML += `
                <div class="percentile-card ${p.color} ${warningClass}">
                    <div class="card-header">
                        <h4>${groupNames[group]}</h4>
                        ${isWarning ? '<span class="warning-badge">⚠️ 需注意</span>' : ''}
                    </div>
                    <div class="card-body">
                        <div class="raw-score">
                            <span class="label">原始分數</span>
                            <span class="value">${p.raw}</span>
                        </div>
                        <div class="percentile-score">
                            <span class="label">百分位數</span>
                            <span class="value">${p.percentile}</span>
                        </div>
                        <div class="percentile-bar">
                            <div class="bar-fill" style="width: ${p.percentile}%"></div>
                        </div>
                        <div class="percentile-description">${p.description}</div>
                    </div>
                </div>
            `;
        });

        const resultHTML = `
            <div class="result-header">
                <h3>您的 TEG 測驗結果</h3>
                <p class="gender-info">性別：${genderText}</p>
                <p class="result-description">以下是您的人格面向分析結果，包含原始分數和百分位數。</p>
            </div>
            
            ${warningHTML}
            
            <div class="personality-type-section">
                <h3>🎯 您的人格類型</h3>
                <div class="type-card">
                    <div class="type-header">
                        <span class="type-category">${personalityType.category}</span>
                        <h2 class="type-name">${personalityType.name}</h2>
                        <p class="type-subname">${personalityType.subname}</p>
                    </div>
                    <div class="type-description">
                        <p>${personalityType.description}</p>
                    </div>
                    <div class="type-characteristics">
                        <h4>特質：</h4>
                        <ul>
                            ${personalityType.characteristics.map(c => `<li>${c}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="type-suggestions">
                        <h4>建議：</h4>
                        <ul>
                            ${personalityType.suggestions.map(s => `<li>${s}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            </div>
            
            <div class="percentile-legend">
                <h4>百分位數說明</h4>
                <div class="legend-items">
                    <span class="legend-item"><span class="dot high"></span>非常高/高 (75-99)</span>
                    <span class="legend-item"><span class="dot medium-high"></span>中上 (60-74)</span>
                    <span class="legend-item"><span class="dot medium-low"></span>中等/中下 (25-59)</span>
                    <span class="legend-item"><span class="dot low"></span>低/非常低 (0-24)</span>
                </div>
                <p class="legend-note">※ 百分位數表示您的分數超過多少百分比的受測者</p>
            </div>

            <div class="percentile-cards-grid">
                ${scoreCardsHTML}
            </div>

            <div class="basic-stats-section">
                <h3>作答統計</h3>
                <div class="stats-grid">
                    <div class="stat-item">
                        <span class="stat-label">已完成題數：</span>
                        <span class="stat-value">${basicStats.questionsAnswered} / 60</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">複選題數：</span>
                        <span class="stat-value">${basicStats.multipleChoice} 題</span>
                    </div>
                </div>
                
                <h4>選項分布</h4>
                <div class="answer-distribution">
                    <div class="distribution-item">
                        <span class="option-symbol circle-symbol">◯</span>
                        <span class="option-label">是</span>
                        <div class="distribution-bar">
                            <div class="bar-fill" style="width: ${(basicStats.circle / basicStats.total * 100).toFixed(1)}%"></div>
                        </div>
                        <span class="option-count">${basicStats.circle} 次 (${(basicStats.circle / basicStats.total * 100).toFixed(1)}%)</span>
                    </div>
                    <div class="distribution-item">
                        <span class="option-symbol triangle-symbol">▲</span>
                        <span class="option-label">不一定</span>
                        <div class="distribution-bar">
                            <div class="bar-fill" style="width: ${(basicStats.triangle / basicStats.total * 100).toFixed(1)}%"></div>
                        </div>
                        <span class="option-count">${basicStats.triangle} 次 (${(basicStats.triangle / basicStats.total * 100).toFixed(1)}%)</span>
                    </div>
                    <div class="distribution-item">
                        <span class="option-symbol cross-symbol">✕</span>
                        <span class="option-label">不是</span>
                        <div class="distribution-bar">
                            <div class="bar-fill" style="width: ${(basicStats.cross / basicStats.total * 100).toFixed(1)}%"></div>
                        </div>
                        <span class="option-count">${basicStats.cross} 次 (${(basicStats.cross / basicStats.total * 100).toFixed(1)}%)</span>
                    </div>
                </div>
                
                <div class="scoring-note">
                    <h4>計分說明</h4>
                    <p>• ◯（是）= 2分、▲（不一定）= 1分、✕（不是）= 0分</p>
                    <p>• 複選題目（選擇兩個以上選項）該題計 0 分</p>
                    <p>• Q組分數為所有題目中選擇 ▲ 的總次數</p>
                    <p>• D組和Q組分數低於15分建議重新作答</p>
                </div>
            </div>
        `;

        return resultHTML;
    },

    /**
     * 生成答案列表
     * @param {Object} answers - 所有答案的物件
     * @param {Array} questions - 題目陣列
     * @param {Object} tegScores - TEG 分數（用於顯示分組）
     * @returns {String} HTML 格式的答案列表
     */
    generateAnswersList: function(answers, questions, tegScores) {
        let answersHTML = '';
        
        for (let i = 1; i <= 60; i++) {
            const question = questions[i - 1];
            const selections = answers[i] || [];
            const score = this.calculateQuestionScore(selections);
            
            // 找出該題屬於哪一組
            let group = '';
            for (const g in this.questionGroups) {
                if (this.questionGroups[g].includes(i)) {
                    group = g;
                    break;
                }
            }
            
            // 轉換選項為符號
            const symbolMap = {
                'circle': '◯',
                'triangle': '▲',
                'cross': '✕'
            };
            const answerText = selections.map(s => symbolMap[s]).join(' + ');
            
            // 複選標註
            const multipleNote = selections.length >= 2 ? '（複選，計0分）' : '';
            
            answersHTML += `
                <div class="answer-item">
                    <div class="answer-header">
                        <span class="question-number">題目 ${i}</span>
                        ${group ? `<span class="group-badge">${group}</span>` : ''}
                        <span class="answer-score">得分：${score}</span>
                    </div>
                    <div class="question-text">${question.text}</div>
                    <div class="answer-text">
                        您的答案：${answerText || '未作答'} ${multipleNote}
                    </div>
                </div>
            `;
        }
        
        return answersHTML;
    }
};
