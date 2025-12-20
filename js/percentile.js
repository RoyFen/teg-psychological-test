/**
 * TEG 百分位數對照表
 * 根據原始分數和性別轉換為百分位數
 * 
 * 資料來源：TEG 標準常模
 * 
 * 說明：
 * - CP, NP, A, FC, AC 有男女之分
 * - D, Q 無性別區分
 * - 百分位數範圍：0-99
 * - 原始分數範圍：0-20（CP, NP 為 0-16；A, FC, AC 為 0-20；D 為 0-26；Q 為 0-6）
 */

const TEGPercentileTable = {
    // 男性百分位數對照表
    male: {
        // CP（批判的父母）- 0-16 分
        CP: {
            0: 2, 1: 5, 2: 10, 3: 15, 4: 20, 5: 25, 6: 30, 7: 35, 8: 40,
            9: 50, 10: 55, 11: 60, 12: 65, 13: 75, 14: 80, 15: 90, 16: 95
        },
        // NP（養育的父母）- 0-16 分
        NP: {
            0: 2, 1: 5, 2: 8, 3: 12, 4: 15, 5: 20, 6: 25, 7: 30, 8: 35,
            9: 40, 10: 45, 11: 50, 12: 60, 13: 70, 14: 80, 15: 90, 16: 95
        },
        // A（成人）- 0-20 分
        A: {
            0: 1, 1: 3, 2: 5, 3: 8, 4: 10, 5: 15, 6: 20, 7: 25, 8: 30,
            9: 35, 10: 40, 11: 45, 12: 50, 13: 55, 14: 60, 15: 65, 16: 70,
            17: 75, 18: 85, 19: 92, 20: 98
        },
        // FC（自由的兒童）- 0-20 分
        FC: {
            0: 1, 1: 3, 2: 5, 3: 8, 4: 12, 5: 15, 6: 20, 7: 25, 8: 30,
            9: 35, 10: 40, 11: 45, 12: 50, 13: 55, 14: 60, 15: 65, 16: 72,
            17: 80, 18: 88, 19: 94, 20: 98
        },
        // AC（順應的兒童）- 0-20 分
        AC: {
            0: 2, 1: 5, 2: 8, 3: 12, 4: 15, 5: 20, 6: 25, 7: 30, 8: 35,
            9: 40, 10: 45, 11: 50, 12: 55, 13: 60, 14: 65, 15: 70, 16: 75,
            17: 82, 18: 88, 19: 93, 20: 97
        }
    },
    
    // 女性百分位數對照表
    female: {
        // CP（批判的父母）- 0-16 分
        CP: {
            0: 3, 1: 8, 2: 12, 3: 18, 4: 23, 5: 28, 6: 33, 7: 38, 8: 43,
            9: 52, 10: 58, 11: 63, 12: 68, 13: 77, 14: 83, 15: 92, 16: 97
        },
        // NP（養育的父母）- 0-16 分
        NP: {
            0: 1, 1: 3, 2: 6, 3: 10, 4: 13, 5: 18, 6: 23, 7: 28, 8: 33,
            9: 38, 10: 43, 11: 48, 12: 57, 13: 67, 14: 77, 15: 88, 16: 93
        },
        // A（成人）- 0-20 分
        A: {
            0: 2, 1: 4, 2: 7, 3: 10, 4: 13, 5: 17, 6: 22, 7: 27, 8: 32,
            9: 37, 10: 42, 11: 47, 12: 52, 13: 57, 14: 62, 15: 67, 16: 72,
            17: 77, 18: 87, 19: 93, 20: 98
        },
        // FC（自由的兒童）- 0-20 分
        FC: {
            0: 2, 1: 4, 2: 7, 3: 10, 4: 14, 5: 18, 6: 23, 7: 28, 8: 33,
            9: 38, 10: 43, 11: 48, 12: 53, 13: 58, 14: 63, 15: 68, 16: 75,
            17: 83, 18: 90, 19: 95, 20: 98
        },
        // AC（順應的兒童）- 0-20 分
        AC: {
            0: 1, 1: 3, 2: 6, 3: 10, 4: 13, 5: 18, 6: 23, 7: 28, 8: 33,
            9: 38, 10: 43, 11: 48, 12: 53, 13: 58, 14: 63, 15: 68, 16: 73,
            17: 80, 18: 86, 19: 92, 20: 96
        }
    },
    
    // 共用百分位數對照表（無性別區分）
    common: {
        // D（防衛）- 0-26 分
        D: {
            0: 1, 1: 2, 2: 4, 3: 6, 4: 8, 5: 10, 6: 13, 7: 16, 8: 20,
            9: 23, 10: 27, 11: 30, 12: 35, 13: 40, 14: 45, 15: 50, 16: 55,
            17: 60, 18: 65, 19: 70, 20: 75, 21: 80, 22: 85, 23: 88, 24: 92,
            25: 95, 26: 98
        },
        // Q（矛盾）- 0-6 分
        Q: {
            0: 10, 1: 25, 2: 40, 3: 55, 4: 70, 5: 85, 6: 95
        }
    }
};

/**
 * 取得百分位數
 * @param {string} group - 分組名稱（CP, NP, A, FC, AC, D, Q）
 * @param {number} rawScore - 原始分數
 * @param {string} gender - 性別（male, female）
 * @returns {number} 百分位數（0-99）
 */
function getPercentile(group, rawScore, gender) {
    // D 和 Q 使用共用對照表
    if (group === 'D' || group === 'Q') {
        const table = TEGPercentileTable.common[group];
        return table[rawScore] !== undefined ? table[rawScore] : 50;
    }
    
    // CP, NP, A, FC, AC 根據性別選擇對照表
    const genderTable = TEGPercentileTable[gender];
    if (!genderTable || !genderTable[group]) {
        return 50; // 預設值
    }
    
    const table = genderTable[group];
    return table[rawScore] !== undefined ? table[rawScore] : 50;
}

/**
 * 根據百分位數取得描述
 * @param {number} percentile - 百分位數
 * @returns {string} 描述文字
 */
function getPercentileDescription(percentile) {
    if (percentile >= 90) return '非常高';
    if (percentile >= 75) return '高';
    if (percentile >= 60) return '中上';
    if (percentile >= 40) return '中等';
    if (percentile >= 25) return '中下';
    if (percentile >= 10) return '低';
    return '非常低';
}

/**
 * 取得百分位數等級顏色
 * @param {number} percentile - 百分位數
 * @returns {string} CSS 顏色類別
 */
function getPercentileColor(percentile) {
    if (percentile >= 75) return 'high';
    if (percentile >= 50) return 'medium-high';
    if (percentile >= 25) return 'medium-low';
    return 'low';
}

// 匯出給其他模組使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        TEGPercentileTable,
        getPercentile,
        getPercentileDescription,
        getPercentileColor
    };
}
