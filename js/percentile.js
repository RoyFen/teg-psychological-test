/**
 * TEG 常模資料模組（最終版本）
 * 基於官方 Google Sheets 常模表
 */

// 常模資料（從 JSON 載入）
const TEG_NORMS = {
    "egogram": {
        "scales": ["CP", "NP", "A", "FC", "AC"],
        "genders": ["M", "F"],
        "rawToPercentile": {
            "CP": {
                "M": {1:3.5,2:4.9,3:8,4:15,5:23,6:33,7:43,8:54,9:65,10:78,11:85,12:92,13:94,14:97,15:98,16:99,17:99.5,18:99.8,19:99.9,20:100},
                "F": {1:4,2:8.45,3:15,4:23.5,5:34,6:44.2,7:56.5,8:68,9:77,10:84,11:90,12:93.75,13:96.4,14:98.2,15:99.06,16:99.47,17:99.65,18:99.8,19:99.95,20:100}
            },
            "NP": {
                "M": {1:0.2,2:0.7,3:0.9,4:1.5,5:2.5,6:4,7:5.5,8:10,9:17,10:28,11:38,12:48,13:59,14:68.5,15:78.5,16:85,17:91.5,18:95.75,19:98.25,20:100},
                "F": {1:0.35,2:0.6,3:0.82,4:1.4,5:2.6,6:3.75,7:5.25,8:8.25,9:13.2,10:23.2,11:32.8,12:43,13:53.5,14:64,15:74,16:83.8,17:89.5,18:94.6,19:98.8,20:100}
            },
            "A": {
                "M": {1:0.35,2:0.8,3:1.25,4:3,5:4.75,6:8,7:9.75,8:17,9:25,10:37,11:47.5,12:59.5,13:68.5,14:77.2,15:84.2,16:90.5,17:94.25,18:97.25,19:99.25,20:100},
                "F": {1:0.6,2:1.48,3:3.25,4:4.9,5:7.75,6:12,7:17.6,8:29,9:39.5,10:53.8,11:65,12:76,13:83.3,14:89.8,15:94,16:96.29,17:99.15,18:99.58,19:99.9,20:100}
            },
            "FC": {
                "M": {1:0.7,2:1.5,3:3.2,4:6,5:10,6:16.5,7:25.5,8:36,9:47,10:60.5,11:70.5,12:79,13:85.5,14:90.5,15:94.5,16:96.7,17:98,18:99.1,19:99.5,20:100},
                "F": {1:0.52,2:1.25,3:3.9,4:6.6,5:9.6,6:16.9,7:25,8:34.2,9:43.4,10:56,11:65.4,12:74,13:81.9,14:87.2,15:91.4,16:95.25,17:96.8,18:99.07,19:99.69,20:100}
            },
            "AC": {
                "M": {1:2.75,2:5.25,3:9.25,4:15,5:21,6:28,7:36,8:44.5,9:53.5,10:64.5,11:74.8,12:82,13:87,14:91,15:94,16:95.8,17:96.8,18:99.13,19:99.35,20:100},
                "F": {1:2,2:4.8,3:6.9,4:10.5,5:15.2,6:20,7:28.7,8:36,9:44.2,10:54.8,11:65.2,12:73.8,13:80.8,14:86.5,15:91.2,16:94.2,17:96.4,18:98.3,19:99.34,20:100}
            }
        }
    },
    "dq": {
        "scales": ["D", "Q"],
        "rawToPercentile": {
            "D": {
                "ALL": {0:100,1:99.58,2:99.2,3:98,4:96.5,5:93.5,6:89,7:81.8,8:74,9:62.5,10:50,11:38.5,12:27.5,13:18,14:10.8,15:6.25,16:3.75,17:2,18:0.8,19:0.4,20:0.1}
            },
            "Q": {
                "ALL": {0:0,1:0,2:0,3:0,4:0,5:0.7,6:0.84,7:0.98,8:1.12,9:1.26,10:2.5,11:3.26,12:4.02,13:4.78,14:5.54,15:6.5,16:8.26,17:10.02,18:11.78,19:13.54,20:15.8,21:18.96,22:22.12,23:25.28,24:28.44,25:31,26:34.8,27:38.6,28:42.4,29:46.2,30:50,31:54.2,32:58.4,33:62.6,34:66.8,35:71,36:73.9,37:76.8,38:79.7,39:82.6,40:84.5,41:86.54,42:88.58,43:90.62,44:92.66,45:93.7,46:94.62,47:95.54,48:96.46,49:97.38,50:97.4,51:97.94,52:98.48,53:99.02,54:99.56,55:99.32,56:99.42,57:99.52,58:99.62,59:99.72,60:99.85}
            }
        }
    }
};

/**
 * 獲取原始分數對應的百分位數
 * @param {string} scale - 尺度名稱 (CP, NP, A, FC, AC, D, Q)
 * @param {number} rawScore - 原始分數
 * @param {string} gender - 性別 (M=男, F=女)
 * @returns {number} 百分位數 (0-100)
 */
function getPercentile(scale, rawScore, gender = 'M') {
    // 轉換 gender 格式: 'male'/'female' → 'M'/'F'
    if (gender === 'male') gender = 'M';
    if (gender === 'female') gender = 'F';
    
    // Egogram 尺度
    if (['CP', 'NP', 'A', 'FC', 'AC'].includes(scale)) {
        const scaleData = TEG_NORMS.egogram.rawToPercentile[scale];
        if (!scaleData || !scaleData[gender]) {
            console.error(`Invalid scale or gender: ${scale}, ${gender}`);
            return 0;
        }
        return scaleData[gender][rawScore] || 0;
    }
    
    // D/Q 尺度（不分性別）
    if (['D', 'Q'].includes(scale)) {
        const scaleData = TEG_NORMS.dq.rawToPercentile[scale];
        if (!scaleData || !scaleData.ALL) {
            console.error(`Invalid scale: ${scale}`);
            return 0;
        }
        return scaleData.ALL[rawScore] || 0;
    }
    
    console.error(`Unknown scale: ${scale}`);
    return 0;
}

/**
 * 計算所有尺度的百分位數
 * @param {Object} scores - 原始分數物件 {CP, NP, A, FC, AC, D, Q}
 * @param {string} gender - 性別 (M=男, F=女)
 * @returns {Object} 百分位數物件
 */
function calculateAllPercentiles(scores, gender = 'M') {
    const percentiles = {};
    
    // Egogram
    for (const scale of ['CP', 'NP', 'A', 'FC', 'AC']) {
        percentiles[scale] = getPercentile(scale, scores[scale], gender);
    }
    
    // D/Q
    percentiles.D = getPercentile('D', scores.D);
    percentiles.Q = getPercentile('Q', scores.Q);
    
    return percentiles;
}

/**
 * 取得百分位數等級描述
 * @param {number} percentile - 百分位數
 * @returns {string} 等級描述
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

// 匯出函數
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { getPercentile, calculateAllPercentiles, getPercentileDescription, getPercentileColor, TEG_NORMS };
}
