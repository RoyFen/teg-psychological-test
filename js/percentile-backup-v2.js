/**
 * TEG 百分位數計算系統 v2.0
 * 使用常模表（Norm Table）方法實作
 * 
 * 設計理念：
 * 1. 使用 percentiles 和 cutoffs 陣列對應
 * 2. 支援不連續的分數區間
 * 3. 更符合心理測驗的專業標準
 * 4. 易於維護和擴展
 */

/**
 * 常模表結構
 * @typedef {Object} NormTable
 * @property {number[]} percentiles - 百分位數陣列（降序排列）
 * @property {number[]} cutoffs - 原始分數切點陣列（降序排列）
 */

/**
 * TEG 常模表資料
 * 
 * 資料來源：TEG 即交流式自我圖譜標準化測驗
 * 
 * 說明：
 * - percentiles: 百分位數，從高到低排列（99, 95, 90, ...）
 * - cutoffs: 原始分數切點，與 percentiles 對應
 * - 查詢時：原始分數 >= cutoffs[i] 時，對應 percentiles[i]
 */
const TEGNormTables = {
    // 男性常模
    male: {
        // CP (批判的父母) - 0-18 分
        CP: {
            percentiles: [99, 97, 95, 90, 85, 80, 75, 70, 60, 55, 50, 40, 35, 30, 20, 15, 10, 5, 0],
            cutoffs:     [18, 17, 16, 15, 14, 13, 12, 11, 10,  9,  8,  7,  6,  5,  4,  3,  2, 1, 0]
        },
        // NP (養育的父母) - 0-20 分
        NP: {
            percentiles: [99, 95, 90, 85, 80, 75, 70, 60, 55, 50, 45, 40, 35, 30, 25, 20, 15, 10, 8, 5, 0],
            cutoffs:     [20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10,  9,  8,  7,  6,  5,  4,  3, 2, 1, 0]
        },
        // A (成人自我) - 0-20 分
        A: {
            percentiles: [99, 92, 85, 75, 70, 65, 60, 55, 50, 45, 40, 35, 30, 25, 20, 15, 10, 8, 5, 3, 0],
            cutoffs:     [20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10,  9,  8,  7,  6,  5,  4, 3, 2, 1, 0]
        },
        // FC (自由兒童) - 0-20 分
        FC: {
            percentiles: [99, 94, 88, 80, 72, 65, 60, 55, 50, 45, 40, 35, 30, 25, 20, 15, 10, 8, 5, 3, 0],
            cutoffs:     [20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10,  9,  8,  7,  6,  5,  4, 3, 2, 1, 0]
        },
        // AC (順應兒童) - 0-20 分
        AC: {
            percentiles: [99, 93, 87, 80, 72, 67, 62, 57, 52, 47, 42, 37, 32, 27, 22, 17, 12, 8, 5, 3, 0],
            cutoffs:     [20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10,  9,  8,  7,  6,  5,  4, 3, 2, 1, 0]
        }
    },
    
    // 女性常模
    female: {
        // CP (批判的父母) - 0-18 分
        CP: {
            percentiles: [99, 97, 95, 90, 85, 80, 75, 70, 60, 55, 50, 40, 35, 30, 20, 15, 10, 5, 0],
            cutoffs:     [18, 17, 16, 15, 14, 13, 12, 11, 10,  9,  8,  7,  6,  5,  4,  3,  2, 1, 0]
        },
        // NP (養育的父母) - 0-20 分
        NP: {
            percentiles: [99, 95, 90, 85, 80, 75, 70, 60, 55, 50, 45, 40, 35, 30, 25, 20, 15, 10, 8, 5, 0],
            cutoffs:     [20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10,  9,  8,  7,  6,  5,  4,  3, 2, 1, 0]
        },
        // A (成人自我) - 0-20 分
        A: {
            percentiles: [99, 92, 85, 75, 70, 65, 60, 55, 50, 45, 40, 35, 30, 25, 20, 15, 10, 8, 5, 3, 0],
            cutoffs:     [20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10,  9,  8,  7,  6,  5,  4,  3, 2, 1, 0]
        },
        // FC (自由兒童) - 0-20 分
        FC: {
            percentiles: [99, 94, 88, 80, 72, 65, 60, 55, 50, 45, 40, 35, 30, 25, 20, 15, 10, 8, 5, 3, 0],
            cutoffs:     [20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10,  9,  8,  7,  6,  5,  4,  3, 2, 1, 0]
        },
        // AC (順應兒童) - 0-20 分
        AC: {
            percentiles: [99, 93, 87, 80, 72, 67, 62, 57, 52, 47, 42, 37, 32, 27, 22, 17, 12, 8, 5, 3, 0],
            cutoffs:     [20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10,  9,  8,  7,  6,  5,  4,  3, 2, 1, 0]
        }
    },
    
    // 通用常模（不分性別）
    common: {
        // D (防衛) - 0-20 分 (反向計分：分數越高，百分位數越低)
        // cutoffs 也必須降序排列，以配合 rawToPercentile 的查找邏輯
        D: {
            percentiles: [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 99],
            cutoffs:     [20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10,  9,  8,  7,  6,  5,  4,  3,  2,  1,  0]
        },
        // Q (矛盾) - 0-60 分
        Q: {
            percentiles: [99, 98, 97, 95, 93, 92, 90, 88, 87, 85, 83, 82, 80, 78, 77, 75, 73, 72, 70, 68, 67, 65, 63, 62, 60, 58, 57, 55, 53, 52, 50, 48, 47, 45, 43, 42, 40, 38, 37, 35, 33, 32, 30, 28, 27, 25, 23, 22, 20, 18, 17, 15, 13, 12, 10, 8, 7, 5, 3, 2, 0],
            cutoffs:     [60, 59, 58, 57, 56, 55, 54, 53, 52, 51, 50, 49, 48, 47, 46, 45, 44, 43, 42, 41, 40, 39, 38, 37, 36, 35, 34, 33, 32, 31, 30, 29, 28, 27, 26, 25, 24, 23, 22, 21, 20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10,  9,  8,  7,  6,  5,  4,  3,  2,  1,  0]
        }
    }
};

/**
 * 將原始分數轉換為百分位數
 * 
 * @param {number} rawScore - 原始分數
 * @param {NormTable} normTable - 常模表
 * @returns {number} 百分位數 (0-99)
 * 
 * 演算法：
 * 1. 從高分到低分遍歷 cutoffs 陣列
 * 2. 當原始分數 >= cutoffs[i] 時，返回對應的 percentiles[i]
 * 3. 如果所有 cutoffs 都不符合，返回最低百分位數
 */
function rawToPercentile(rawScore, normTable) {
    const { percentiles, cutoffs } = normTable;
    
    // 驗證輸入
    if (typeof rawScore !== 'number' || isNaN(rawScore)) {
        console.error('Invalid raw score:', rawScore);
        return 0;
    }
    
    // 確保分數在有效範圍內
    rawScore = Math.max(0, Math.min(rawScore, cutoffs[0]));
    
    // 從高到低查找對應的百分位數
    for (let i = 0; i < cutoffs.length; i++) {
        if (rawScore >= cutoffs[i]) {
            return percentiles[i];
        }
    }
    
    // 如果沒有找到，返回最低百分位數
    return percentiles[percentiles.length - 1];
}

/**
 * 計算 TEG 各尺度的百分位數
 * 
 * @param {Object} scores - 原始分數物件 {CP, NP, A, FC, AC, D, Q}
 * @param {string} gender - 性別 ('male' 或 'female')
 * @returns {Object} 百分位數物件 {CP, NP, A, FC, AC, D, Q}
 */
function calculateTEGPercentiles(scores, gender) {
    // 驗證性別參數
    if (gender !== 'male' && gender !== 'female') {
        console.error('Invalid gender:', gender);
        gender = 'male'; // 預設為男性
    }
    
    const percentiles = {};
    const genderTables = TEGNormTables[gender];
    const commonTables = TEGNormTables.common;
    
    // 計算各尺度的百分位數
    percentiles.CP = rawToPercentile(scores.CP, genderTables.CP);
    percentiles.NP = rawToPercentile(scores.NP, genderTables.NP);
    percentiles.A = rawToPercentile(scores.A, genderTables.A);
    percentiles.FC = rawToPercentile(scores.FC, genderTables.FC);
    percentiles.AC = rawToPercentile(scores.AC, genderTables.AC);
    percentiles.D = rawToPercentile(scores.D, commonTables.D);
    percentiles.Q = rawToPercentile(scores.Q, commonTables.Q);
    
    return percentiles;
}

/**
 * 取得指定尺度的百分位數
 * 
 * @param {string} scale - 尺度名稱 (CP, NP, A, FC, AC, D, Q)
 * @param {number} rawScore - 原始分數
 * @param {string} gender - 性別 ('male' 或 'female')
 * @returns {number} 百分位數 (0-99)
 */
function getPercentile(scale, rawScore, gender) {
    // 驗證尺度名稱
    const validScales = ['CP', 'NP', 'A', 'FC', 'AC', 'D', 'Q'];
    if (!validScales.includes(scale)) {
        console.error('Invalid scale:', scale);
        return 0;
    }
    
    // 驗證性別
    if (gender !== 'male' && gender !== 'female') {
        console.error('Invalid gender:', gender);
        gender = 'male';
    }
    
    // 選擇對應的常模表
    let normTable;
    if (scale === 'D' || scale === 'Q') {
        normTable = TEGNormTables.common[scale];
    } else {
        normTable = TEGNormTables[gender][scale];
    }
    
    return rawToPercentile(rawScore, normTable);
}

// 匯出函數供其他模組使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        TEGNormTables,
        rawToPercentile,
        calculateTEGPercentiles,
        getPercentile
    };
}
