/**
 * TEG 人格類型判斷模組
 * 根據 CP、NP、A、FC、AC、D、Q 的百分位數判斷人格類型
 */

const PersonalityType = {
    /**
     * 判斷人格類型
     * @param {Object} percentiles - 百分位數資料
     * @returns {Object} 類型資訊
     */
    determineType: function(percentiles) {
        // 取得各組的百分位數（只使用 CP、NP、A、FC、AC）
        const scores = {
            CP: percentiles.CP.percentile,
            NP: percentiles.NP.percentile,
            A: percentiles.A.percentile,
            FC: percentiles.FC.percentile,
            AC: percentiles.AC.percentile
        };
        
        // 定義高分和低分的閾值
        const HIGH_THRESHOLD = 60;  // 高分閾值
        const LOW_THRESHOLD = 40;   // 低分閾值
        
        // 判斷各組是否為高分或低分
        const isHigh = {
            CP: scores.CP >= HIGH_THRESHOLD,
            NP: scores.NP >= HIGH_THRESHOLD,
            A: scores.A >= HIGH_THRESHOLD,
            FC: scores.FC >= HIGH_THRESHOLD,
            AC: scores.AC >= HIGH_THRESHOLD
        };
        
        const isLow = {
            CP: scores.CP <= LOW_THRESHOLD,
            NP: scores.NP <= LOW_THRESHOLD,
            A: scores.A <= LOW_THRESHOLD,
            FC: scores.FC <= LOW_THRESHOLD,
            AC: scores.AC <= LOW_THRESHOLD
        };
        
        // 1. 優位型判斷（單一高分）
        const highCount = Object.values(isHigh).filter(v => v).length;
        if (highCount === 1) {
            if (isHigh.CP) return this.getTypeInfo('CP_HIGH');
            if (isHigh.NP) return this.getTypeInfo('NP_HIGH');
            if (isHigh.A) return this.getTypeInfo('A_HIGH');
            if (isHigh.FC) return this.getTypeInfo('FC_HIGH');
            if (isHigh.AC) return this.getTypeInfo('AC_HIGH');
        }
        
        // 2. 低位型判斷（單一低分）
        const lowCount = Object.values(isLow).filter(v => v).length;
        if (lowCount === 1) {
            if (isLow.CP) return this.getTypeInfo('CP_LOW');
            if (isLow.NP) return this.getTypeInfo('NP_LOW');
            if (isLow.A) return this.getTypeInfo('A_LOW');
            if (isLow.FC) return this.getTypeInfo('FC_LOW');
            if (isLow.AC) return this.getTypeInfo('AC_LOW');
        }
        
        // 3. 混合型判斷（根據圖形特徵）
        const shape = this.analyzeShape(scores);
        
        // 台形型：CP和NP都高
        if (isHigh.CP && isHigh.NP) {
            if (isHigh.A) return this.getTypeInfo('TRAPEZOID_C');  // 自利者型
            if (scores.A < HIGH_THRESHOLD && scores.A > LOW_THRESHOLD) {
                return this.getTypeInfo('TRAPEZOID_B');  // 志願者型
            }
            return this.getTypeInfo('TRAPEZOID_A');  // 家庭第一型
        }
        
        // U型：CP和NP都低，中間高
        if (isLow.CP && isLow.NP) {
            if (isHigh.A) return this.getTypeInfo('U_A');  // 內心糾葛型
            if (isHigh.FC) return this.getTypeInfo('U_B');  // 爆炸型
            if (isHigh.AC) return this.getTypeInfo('U_C');  // 委曲型
        }
        
        // N型：CP高，中間低，AC高
        if (isHigh.CP && isLow.A && isHigh.AC) {
            return this.getTypeInfo('N_A');  // 好好先生型
        }
        if (isHigh.NP && isLow.A && isHigh.AC) {
            return this.getTypeInfo('N_B');  // 老媽型
        }
        if (isHigh.CP && isHigh.A && isLow.FC) {
            return this.getTypeInfo('N_C');  // 工作狂型
        }
        
        // 逆N型：CP低，中間高，AC低
        if (isLow.CP && isHigh.A && isLow.AC) {
            return this.getTypeInfo('INVERTED_N_A');  // 孤高型
        }
        if (isLow.CP && isHigh.FC && isLow.AC) {
            return this.getTypeInfo('INVERTED_N_B');  // 花花公子型
        }
        if (isHigh.CP && isLow.FC && isLow.AC) {
            return this.getTypeInfo('INVERTED_N_C');  // 沉思型
        }
        
        // M型：兩端高，中間低
        if ((isHigh.CP || isHigh.NP) && isLow.A && (isHigh.FC || isHigh.AC)) {
            return this.getTypeInfo('M');  // 叛逆型
        }
        
        // W型：兩端低，中間有起伏
        if (isLow.CP && isLow.AC && !isLow.A) {
            return this.getTypeInfo('W');  // 厭世型
        }
        
        // 平坦型：所有分數都接近
        const variance = this.calculateVariance(Object.values(scores).slice(0, 5));
        if (variance < 100) {  // 變異數很小
            const avgScore = Object.values(scores).slice(0, 5).reduce((a, b) => a + b, 0) / 5;
            if (avgScore >= HIGH_THRESHOLD) return this.getTypeInfo('FLAT_A');  // 超人一等型
            if (avgScore >= LOW_THRESHOLD) return this.getTypeInfo('FLAT_B');  // 凡人型
            return this.getTypeInfo('FLAT_C');  // 嚴重內向型
        }
        
        // 如果無法明確分類，返回混合型
        return this.getTypeInfo('MIXED');
    },
    
    /**
     * 分析圖形形狀
     * @param {Object} scores - 分數
     * @returns {String} 形狀描述
     */
    analyzeShape: function(scores) {
        const values = [scores.CP, scores.NP, scores.A, scores.FC, scores.AC];
        const maxVal = Math.max(...values);
        const minVal = Math.min(...values);
        const range = maxVal - minVal;
        
        if (range < 20) return 'FLAT';
        if (values[0] > values[2] && values[4] > values[2]) return 'U';
        if (values[0] < values[2] && values[4] < values[2]) return 'INVERTED_U';
        if (values[0] > values[1] && values[3] > values[4]) return 'M';
        if (values[0] < values[1] && values[3] < values[4]) return 'W';
        return 'MIXED';
    },
    
    /**
     * 計算變異數
     * @param {Array} values - 數值陣列
     * @returns {Number} 變異數
     */
    calculateVariance: function(values) {
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
        return squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
    },
    
    /**
     * 取得類型資訊
     * @param {String} typeCode - 類型代碼
     * @returns {Object} 類型資訊
     */
    getTypeInfo: function(typeCode) {
        const types = {
            // 優位型
            'CP_HIGH': {
                code: 'CP_HIGH',
                name: 'CP優位型',
                subname: '頑固老爹型',
                category: '優位型',
                description: '批判性強，有主見，喜歡指導他人，重視規則和秩序。',
                characteristics: ['批判性強', '有主見', '重視規則', '喜歡指導他人'],
                suggestions: ['學習傾聽他人意見', '適度放鬆對規則的堅持', '培養同理心']
            },
            'NP_HIGH': {
                code: 'NP_HIGH',
                name: 'NP優位型',
                subname: '過分關照型',
                category: '優位型',
                description: '關懷他人，樂於助人，但可能過度保護，容易忽略自己的需求。',
                characteristics: ['關懷他人', '樂於助人', '過度保護', '容易忽略自己'],
                suggestions: ['學習適度關心', '注重自我照顧', '建立健康界線']
            },
            'A_HIGH': {
                code: 'A_HIGH',
                name: 'A優位型',
                subname: '電腦型',
                category: '優位型',
                description: '理性客觀，邏輯思維強，但可能過於冷靜，缺乏情感表達。',
                characteristics: ['理性客觀', '邏輯思維強', '冷靜分析', '缺乏情感表達'],
                suggestions: ['培養情感表達能力', '學習感受他人情緒', '平衡理性與感性']
            },
            'FC_HIGH': {
                code: 'FC_HIGH',
                name: 'FC優位型',
                subname: '自由奔放型',
                category: '優位型',
                description: '自由奔放，富有創意，但可能缺乏自制力，容易衝動。',
                characteristics: ['自由奔放', '富有創意', '缺乏自制力', '容易衝動'],
                suggestions: ['培養自制力', '學習計劃性', '考慮行為後果']
            },
            'AC_HIGH': {
                code: 'AC_HIGH',
                name: 'AC優位型',
                subname: '依靠者型',
                category: '優位型',
                description: '順從配合，但可能過度依賴他人，缺乏主見。',
                characteristics: ['順從配合', '過度依賴', '缺乏主見', '容易妥協'],
                suggestions: ['培養獨立性', '建立自信', '學習表達自己的意見']
            },
            
            // 低位型
            'CP_LOW': {
                code: 'CP_LOW',
                name: 'CP低位型',
                subname: '散漫型',
                category: '低位型',
                description: '缺乏批判性，容易散漫，不重視規則。',
                characteristics: ['缺乏批判性', '容易散漫', '不重視規則', '缺乏原則'],
                suggestions: ['建立基本原則', '培養責任感', '學習自律']
            },
            'NP_LOW': {
                code: 'NP_LOW',
                name: 'NP低位型',
                subname: '暴躁型',
                category: '低位型',
                description: '缺乏關懷，容易暴躁，不善於照顧他人。',
                characteristics: ['缺乏關懷', '容易暴躁', '不善照顧他人', '缺乏耐心'],
                suggestions: ['培養同理心', '學習關懷他人', '控制情緒']
            },
            'A_LOW': {
                code: 'A_LOW',
                name: 'A低位型',
                subname: '自目夢型',
                category: '低位型',
                description: '缺乏理性思考，容易憑感覺行事，不善於分析。',
                characteristics: ['缺乏理性', '憑感覺行事', '不善分析', '容易衝動'],
                suggestions: ['培養邏輯思維', '學習理性分析', '三思而後行']
            },
            'FC_LOW': {
                code: 'FC_LOW',
                name: 'FC低位型',
                subname: '貼身待衛型',
                category: '低位型',
                description: '缺乏自由性，過於拘謹，不敢表達真實感受。',
                characteristics: ['過於拘謹', '不敢表達', '缺乏創意', '壓抑情感'],
                suggestions: ['學習放鬆', '培養創造力', '勇於表達真實感受']
            },
            'AC_LOW': {
                code: 'AC_LOW',
                name: 'AC低位型',
                subname: '管理者型',
                category: '低位型',
                description: '不順從，有主見，善於管理，但可能過於強勢。',
                characteristics: ['不順從', '有主見', '善於管理', '可能過於強勢'],
                suggestions: ['學習傾聽', '適度妥協', '培養團隊合作精神']
            },
            
            // 混合型 - 台形型
            'TRAPEZOID_A': {
                code: 'TRAPEZOID_A',
                name: '台形型 a',
                subname: '家庭第一型',
                category: '混合型',
                description: 'CP和NP都高，重視家庭，關心家人，是理想的家長角色。',
                characteristics: ['重視家庭', '關心家人', '責任感強', '保護欲強'],
                suggestions: ['平衡工作與家庭', '給予家人適當空間', '注重自我成長']
            },
            'TRAPEZOID_B': {
                code: 'TRAPEZOID_B',
                name: '台形型 b',
                subname: '志願者型',
                category: '混合型',
                description: 'CP和NP都高，熱心公益，樂於奉獻，是優秀的志願者。',
                characteristics: ['熱心公益', '樂於奉獻', '關懷社會', '有使命感'],
                suggestions: ['注意自我照顧', '避免過度付出', '保持身心平衡']
            },
            'TRAPEZOID_C': {
                code: 'TRAPEZOID_C',
                name: '台形型 c',
                subname: '自利者型',
                category: '混合型',
                description: 'CP、NP、A都高，能力強，但可能過於理性，缺乏情感。',
                characteristics: ['能力強', '理性客觀', '自我中心', '缺乏情感'],
                suggestions: ['培養同理心', '學習情感表達', '關注他人需求']
            },
            
            // 混合型 - U型
            'U_A': {
                code: 'U_A',
                name: 'U型 a',
                subname: '內心糾葛型',
                category: '混合型',
                description: 'CP和NP低，A高，理性但缺乏情感支持，內心矛盾。',
                characteristics: ['理性分析', '內心矛盾', '缺乏情感支持', '孤獨感'],
                suggestions: ['培養情感連結', '尋求支持系統', '學習自我關懷']
            },
            'U_B': {
                code: 'U_B',
                name: 'U型 b',
                subname: '爆炸型',
                category: '混合型',
                description: 'CP和NP低，FC高，情緒容易爆發，缺乏自制。',
                characteristics: ['情緒化', '容易爆發', '缺乏自制', '衝動行事'],
                suggestions: ['學習情緒管理', '培養自制力', '建立支持系統']
            },
            'U_C': {
                code: 'U_C',
                name: 'U型 c',
                subname: '委曲型',
                category: '混合型',
                description: 'CP和NP低，AC高，過度順從，委曲求全。',
                characteristics: ['過度順從', '委曲求全', '缺乏支持', '壓抑自我'],
                suggestions: ['學習表達需求', '建立自信', '培養獨立性']
            },
            
            // 混合型 - N型
            'N_A': {
                code: 'N_A',
                name: 'N型 a',
                subname: '好好先生型',
                category: '混合型',
                description: 'CP高AC高，A低，想討好所有人，但缺乏理性判斷。',
                characteristics: ['討好他人', '缺乏主見', '容易妥協', '壓力大'],
                suggestions: ['學習說不', '建立界線', '培養理性思考']
            },
            'N_B': {
                code: 'N_B',
                name: 'N型 b',
                subname: '老媽型',
                category: '混合型',
                description: 'NP高AC高，A低，過度照顧他人，忽略自己。',
                characteristics: ['過度照顧', '忽略自己', '缺乏理性', '容易疲憊'],
                suggestions: ['學習自我照顧', '建立界線', '培養理性分析']
            },
            'N_C': {
                code: 'N_C',
                name: 'N型 c',
                subname: '工作狂型',
                category: '混合型',
                description: 'CP高A高，FC低，工作認真，但缺乏生活樂趣。',
                characteristics: ['工作認真', '缺乏樂趣', '過於嚴肅', '壓力大'],
                suggestions: ['學習放鬆', '培養興趣', '平衡工作與生活']
            },
            
            // 混合型 - 逆N型
            'INVERTED_N_A': {
                code: 'INVERTED_N_A',
                name: '逆N型 a',
                subname: '孤高型',
                category: '混合型',
                description: 'CP低A高AC低，獨立自主，但可能過於孤僻。',
                characteristics: ['獨立自主', '理性客觀', '過於孤僻', '缺乏連結'],
                suggestions: ['培養人際關係', '學習合作', '適度開放自己']
            },
            'INVERTED_N_B': {
                code: 'INVERTED_N_B',
                name: '逆N型 b',
                subname: '花花公子型',
                category: '混合型',
                description: 'CP低FC高AC低，自由奔放，享受生活，但可能不負責任。',
                characteristics: ['自由奔放', '享受生活', '不負責任', '缺乏承諾'],
                suggestions: ['培養責任感', '學習承諾', '考慮他人感受']
            },
            'INVERTED_N_C': {
                code: 'INVERTED_N_C',
                name: '逆N型 c',
                subname: '沉思型',
                category: '混合型',
                description: 'CP高FC低AC低，深思熟慮，但可能過於嚴肅。',
                characteristics: ['深思熟慮', '過於嚴肅', '缺乏樂趣', '孤獨感'],
                suggestions: ['學習放鬆', '培養興趣', '增加社交活動']
            },
            
            // 混合型 - M型
            'M': {
                code: 'M',
                name: 'M型',
                subname: '叛逆型',
                category: '混合型',
                description: '兩端高中間低，內心矛盾，可能有叛逆傾向。',
                characteristics: ['內心矛盾', '叛逆傾向', '情緒起伏大', '不穩定'],
                suggestions: ['尋求心理諮詢', '學習情緒管理', '建立穩定支持系統']
            },
            
            // 混合型 - W型
            'W': {
                code: 'W',
                name: 'W型',
                subname: '厭世型',
                category: '混合型',
                description: '兩端低中間有起伏，可能有厭世傾向，需要關注。',
                characteristics: ['厭世傾向', '缺乏動力', '情緒低落', '需要支持'],
                suggestions: ['尋求專業協助', '建立支持系統', '培養正向思維']
            },
            
            // 混合型 - 平坦型
            'FLAT_A': {
                code: 'FLAT_A',
                name: '平坦型 a',
                subname: '超人一等型',
                category: '混合型',
                description: '所有面向都高，能力全面，是理想的人格狀態。',
                characteristics: ['能力全面', '平衡發展', '適應力強', '理想狀態'],
                suggestions: ['保持現狀', '持續成長', '分享經驗幫助他人']
            },
            'FLAT_B': {
                code: 'FLAT_B',
                name: '平坦型 b',
                subname: '凡人型',
                category: '混合型',
                description: '所有面向都中等，平凡但穩定。',
                characteristics: ['平凡穩定', '中庸之道', '適應力佳', '無明顯特色'],
                suggestions: ['發展個人特色', '培養專長', '追求成長']
            },
            'FLAT_C': {
                code: 'FLAT_C',
                name: '平坦型 c',
                subname: '嚴重內向型',
                category: '混合型',
                description: '所有面向都低，可能過於內向，需要關注。',
                characteristics: ['過於內向', '缺乏自信', '社交困難', '需要支持'],
                suggestions: ['尋求專業協助', '培養自信', '逐步擴展社交圈']
            },
            
            // 無法明確分類
            'MIXED': {
                code: 'MIXED',
                name: '混合型',
                subname: '多元特質型',
                category: '混合型',
                description: '人格特質多元，無法歸類為單一類型。',
                characteristics: ['特質多元', '難以歸類', '複雜性格', '獨特個性'],
                suggestions: ['了解自己的獨特性', '發展個人優勢', '接納多元特質']
            }
        };
        
        return types[typeCode] || types['MIXED'];
    }
};
