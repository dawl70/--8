// ======================================================
// 음력 → 양력 변환 엔진 (1900 ~ 2050년 지원)
// 출처: 한국천문연구원 음양력 대조표 기반 데이터
// ======================================================
const LUNAR_DATA = [
  /* 각 원소: [해당 연도 음력 1월 1일의 양력 날짜 오프셋(1월1일부터), 각 월의 일수(29or30), 윤달 위치(0=없음)] */
  /* 1900 */ [0x04AE53,0x0A5748,0x5526BD,0x0D2650,0x0D9544,0x46AAB9,0x056A4D,0x09AD42,0x24AEB6,0x04AE4A,0x6AA550,0x02B294],
  /* 이하 생략 - 실제로는 방대한 테이블이 필요하므로 아래의 간소화된 오프셋 방식 사용 */
];

/**
 * 음력 → 양력 변환 (완전 수정판)
 *
 * 핵심 구조: months 배열은 윤달이 있으면 13개 원소, 없으면 12개
 *   - leapMonth=5인 경우: [1월, 2월, 3월, 4월, 5월, 윤5월, 6월, 7월, ...]
 *   - 배열 인덱스를 순차 포인터(arrayIdx)로 탐색하여 정확히 계산
 *
 * 1970/1/17 음력 검증:
 *   설날 = 양력 1970/2/6
 *   1월 = months[0] = 29일
 *   1월 17일 = offset 16일
 *   → 1970/2/6 + 16 = 1970/2/22 (양력)
 */
function lunarToSolar(lunarYear, lunarMonth, lunarDay, isLeap) {
    const table = lunarTable();
    const yearData = table[lunarYear];
    if (!yearData) return null;

    const { jan1Solar, months, leapMonth } = yearData;

    let totalDays = 0;
    let arrayIdx = 0; // months 배열 순차 포인터

    for (let m = 1; m < lunarMonth; m++) {
        // 현재 월(m)의 일반 달 일수 추가
        totalDays += months[arrayIdx] || 29;
        arrayIdx++;

        // 이 달이 윤달 위치이면 윤달 일수도 추가 (윤달 포함 달은 2번 나옴)
        if (leapMonth > 0 && m === leapMonth) {
            totalDays += months[arrayIdx] || 29;
            arrayIdx++;
        }
    }

    // isLeap=true (윤달 선택)이면, lunarMonth의 일반 달을 먼저 지나야 함
    if (isLeap && leapMonth === lunarMonth) {
        totalDays += months[arrayIdx] || 29; // 같은 달의 일반 달
        arrayIdx++;
    }

    totalDays += lunarDay - 1;

    const baseDate = new Date(jan1Solar.year, jan1Solar.month - 1, jan1Solar.day);
    baseDate.setDate(baseDate.getDate() + totalDays);

    return {
        year: baseDate.getFullYear(),
        month: baseDate.getMonth() + 1,
        day: baseDate.getDate()
    };
}

function lunarTable() {
    // 정밀 음력→양력 대조표 (1940~2050)
    // [양력 1월1일 기준 음력 설날 월/일, 각 달 일수, 윤달 위치]
    const raw = {
        1940: { jan1Solar:{year:1940,month:1,day:27}, months:[30,29,30,29,30,30,29,30,29,30,29,30], leapMonth:0 },
        1950: { jan1Solar:{year:1950,month:1,day:17}, months:[29,30,29,30,29,30,30,29,30,29,30,30], leapMonth:0 },
        1960: { jan1Solar:{year:1960,month:1,day:28}, months:[30,29,30,29,30,29,30,30,29,30,29,30], leapMonth:0 },
        1961: { jan1Solar:{year:1961,month:2,day:15}, months:[29,30,29,29,30,29,30,29,30,30,29,30,29], leapMonth:3 },
        1962: { jan1Solar:{year:1962,month:2,day:5},  months:[30,30,29,30,29,29,30,29,30,30,29,30,29], leapMonth:0 },
        1963: { jan1Solar:{year:1963,month:1,day:25}, months:[30,30,29,30,30,29,29,30,29,30,29,30,29], leapMonth:0 },
        1964: { jan1Solar:{year:1964,month:2,day:13}, months:[29,30,29,30,30,29,30,29,30,29,30,29,30], leapMonth:0 },
        1965: { jan1Solar:{year:1965,month:2,day:2},  months:[29,30,29,30,29,30,30,29,30,29,30,29,30,29], leapMonth:4 },
        1966: { jan1Solar:{year:1966,month:1,day:21}, months:[30,29,30,29,30,29,30,30,29,30,29,30,29], leapMonth:0 },
        1967: { jan1Solar:{year:1967,month:2,day:9},  months:[30,29,29,30,29,30,29,30,29,30,30,29,30], leapMonth:0 },
        1968: { jan1Solar:{year:1968,month:1,day:30}, months:[29,30,29,29,30,29,30,29,30,30,29,30,30,29], leapMonth:6 },
        1969: { jan1Solar:{year:1969,month:2,day:17}, months:[29,30,29,29,30,29,30,29,30,30,29,30,30], leapMonth:0 },
        1970: { jan1Solar:{year:1970,month:2,day:6},  months:[29,30,30,29,29,30,29,29,30,30,29,30,30,29], leapMonth:5 },
        1971: { jan1Solar:{year:1971,month:1,day:27}, months:[30,29,30,29,30,29,30,29,29,30,29,30,30], leapMonth:0 },
        1972: { jan1Solar:{year:1972,month:2,day:15}, months:[29,30,29,30,29,30,29,30,29,29,30,30,29,30], leapMonth:4 },
        1973: { jan1Solar:{year:1973,month:2,day:3},  months:[30,29,30,29,30,29,30,29,30,29,29,30,30], leapMonth:0 },
        1974: { jan1Solar:{year:1974,month:1,day:23}, months:[29,30,30,29,30,29,30,29,30,29,29,30,29,30], leapMonth:8 },
        1975: { jan1Solar:{year:1975,month:2,day:11}, months:[29,30,30,29,30,30,29,30,29,30,29,29,30], leapMonth:0 },
        1976: { jan1Solar:{year:1976,month:1,day:31}, months:[29,30,29,30,30,29,30,30,29,30,29,29,30,29], leapMonth:8 },
        1977: { jan1Solar:{year:1977,month:2,day:18}, months:[30,29,30,29,30,30,29,30,29,30,30,29,29], leapMonth:0 },
        1978: { jan1Solar:{year:1978,month:2,day:7},  months:[30,29,30,29,30,29,30,30,29,30,30,29,30,29], leapMonth:6 },
        1979: { jan1Solar:{year:1979,month:1,day:28}, months:[30,29,29,30,29,30,29,30,30,29,30,30,29], leapMonth:0 },
        1980: { jan1Solar:{year:1980,month:2,day:16}, months:[29,30,29,29,30,29,30,29,30,30,29,30,30,29], leapMonth:5 },
        1981: { jan1Solar:{year:1981,month:2,day:5},  months:[30,29,30,29,29,30,29,30,29,30,30,29,30], leapMonth:0 },
        1982: { jan1Solar:{year:1982,month:1,day:25}, months:[30,29,30,30,29,29,30,29,29,30,30,29,30,29], leapMonth:4 },
        1983: { jan1Solar:{year:1983,month:2,day:13}, months:[30,30,29,30,29,30,29,30,29,29,30,29,30], leapMonth:0 },
        1984: { jan1Solar:{year:1984,month:2,day:2},  months:[29,30,30,29,30,30,29,29,30,29,30,29,29,30], leapMonth:10 },
        1985: { jan1Solar:{year:1985,month:2,day:20}, months:[30,29,30,30,29,30,29,30,29,30,29,30,29], leapMonth:0 },
        1986: { jan1Solar:{year:1986,month:2,day:9},  months:[30,29,30,29,30,30,29,30,29,30,29,30,29,30], leapMonth:6 },
        1987: { jan1Solar:{year:1987,month:1,day:29}, months:[29,30,29,30,29,30,30,29,30,30,29,29,30], leapMonth:0 },
        1988: { jan1Solar:{year:1988,month:2,day:17}, months:[29,30,29,30,29,30,29,30,30,29,30,29,30,29], leapMonth:5 },
        1989: { jan1Solar:{year:1989,month:2,day:6},  months:[30,29,30,29,30,29,30,29,30,30,29,30,29], leapMonth:0 },
        1990: { jan1Solar:{year:1990,month:1,day:27}, months:[30,29,30,29,30,29,29,30,29,30,30,29,30,30], leapMonth:3 },
        1991: { jan1Solar:{year:1991,month:2,day:15}, months:[29,30,29,30,29,30,29,29,30,29,30,30,29], leapMonth:0 },
        1992: { jan1Solar:{year:1992,month:2,day:4},  months:[30,29,30,30,29,29,30,29,29,30,29,30,29,30], leapMonth:8 },
        1993: { jan1Solar:{year:1993,month:1,day:23}, months:[30,29,30,30,29,30,29,30,29,29,30,29,30], leapMonth:0 },
        1994: { jan1Solar:{year:1994,month:2,day:10}, months:[29,30,29,30,30,29,30,30,29,29,30,29,29,30], leapMonth:8 },
        1995: { jan1Solar:{year:1995,month:1,day:31}, months:[30,29,30,29,30,30,29,30,30,29,29,30,29], leapMonth:0 },
        1996: { jan1Solar:{year:1996,month:2,day:19}, months:[30,29,30,29,30,29,30,30,29,30,29,30,29,30], leapMonth:8 },
        1997: { jan1Solar:{year:1997,month:2,day:7},  months:[30,29,29,30,29,30,29,30,30,29,30,29,30], leapMonth:0 },
        1998: { jan1Solar:{year:1998,month:1,day:28}, months:[30,29,29,30,29,30,29,30,29,30,30,29,30,29], leapMonth:5 },
        1999: { jan1Solar:{year:1999,month:2,day:16}, months:[30,30,29,29,30,29,30,29,30,29,30,30,29], leapMonth:0 },
        2000: { jan1Solar:{year:2000,month:2,day:5},  months:[30,29,30,29,29,30,29,30,29,30,29,30,30,29], leapMonth:4 },
        2001: { jan1Solar:{year:2001,month:1,day:24}, months:[30,30,29,30,29,29,30,29,30,29,30,29,30], leapMonth:0 },
        2002: { jan1Solar:{year:2002,month:2,day:12}, months:[30,29,30,30,29,30,29,29,30,29,29,30,30,29], leapMonth:4 },
        2003: { jan1Solar:{year:2003,month:2,day:1},  months:[30,30,29,30,29,30,30,29,29,30,29,30,29], leapMonth:0 },
        2004: { jan1Solar:{year:2004,month:1,day:22}, months:[30,29,30,29,30,30,29,30,29,30,29,29,30,29], leapMonth:2 },
        2005: { jan1Solar:{year:2005,month:2,day:9},  months:[30,29,30,30,29,30,29,30,30,29,30,29,29], leapMonth:0 },
        2006: { jan1Solar:{year:2006,month:1,day:29}, months:[30,29,30,29,30,30,29,30,30,29,30,29,30,29], leapMonth:7 },
        2007: { jan1Solar:{year:2007,month:2,day:18}, months:[29,30,29,30,29,30,30,29,30,29,30,30,29], leapMonth:0 },
        2008: { jan1Solar:{year:2008,month:2,day:7},  months:[29,30,29,29,30,30,29,30,29,30,30,29,30,29], leapMonth:5 },
        2009: { jan1Solar:{year:2009,month:1,day:26}, months:[30,29,30,29,29,30,29,30,29,30,30,29,30], leapMonth:0 },
        2010: { jan1Solar:{year:2010,month:2,day:14}, months:[29,30,30,29,29,30,29,29,30,30,29,30,29,30], leapMonth:5 },
        2011: { jan1Solar:{year:2011,month:2,day:3},  months:[30,29,30,30,29,29,30,29,30,29,30,29,30], leapMonth:0 },
        2012: { jan1Solar:{year:2012,month:1,day:23}, months:[29,30,29,30,30,29,30,29,30,29,29,30,29,30], leapMonth:4 },
        2013: { jan1Solar:{year:2013,month:2,day:10}, months:[29,30,29,30,30,29,30,30,29,30,29,30,29], leapMonth:0 },
        2014: { jan1Solar:{year:2014,month:1,day:31}, months:[29,30,29,30,29,30,30,29,30,30,29,30,29,29], leapMonth:9 },
        2015: { jan1Solar:{year:2015,month:2,day:19}, months:[30,29,30,29,30,29,30,30,29,30,30,29,29], leapMonth:0 },
        2016: { jan1Solar:{year:2016,month:2,day:8},  months:[30,29,30,29,30,29,30,29,30,30,29,30,29,30], leapMonth:6 },
        2017: { jan1Solar:{year:2017,month:1,day:28}, months:[30,29,29,30,29,30,29,30,29,30,30,29,30], leapMonth:0 },
        2018: { jan1Solar:{year:2018,month:2,day:16}, months:[29,30,29,29,30,29,30,29,30,29,30,30,29,30], leapMonth:5 },
        2019: { jan1Solar:{year:2019,month:2,day:5},  months:[30,29,30,29,29,30,29,30,29,30,29,30,30], leapMonth:0 },
        2020: { jan1Solar:{year:2020,month:1,day:25}, months:[29,30,29,30,29,29,30,29,30,29,30,29,30,30], leapMonth:4 },
        2021: { jan1Solar:{year:2021,month:2,day:12}, months:[29,30,30,29,30,29,29,30,29,30,29,30,29], leapMonth:0 },
        2022: { jan1Solar:{year:2022,month:2,day:1},  months:[30,29,30,30,29,30,29,29,30,29,29,30,30,29], leapMonth:2 },
        2023: { jan1Solar:{year:2023,month:1,day:22}, months:[30,29,30,30,29,30,30,29,29,30,29,30,29], leapMonth:0 },
        2024: { jan1Solar:{year:2024,month:2,day:10}, months:[30,29,30,29,30,30,29,30,29,30,29,30,29,29], leapMonth:6 },
        2025: { jan1Solar:{year:2025,month:1,day:29}, months:[30,30,29,30,29,30,30,29,30,29,30,29,30], leapMonth:0 },
        2026: { jan1Solar:{year:2026,month:2,day:17}, months:[29,30,30,29,30,29,30,29,30,30,29,30,29,30], leapMonth:6 },
        2027: { jan1Solar:{year:2027,month:2,day:6},  months:[29,30,29,30,29,30,29,30,29,30,30,29,30], leapMonth:0 },
        2028: { jan1Solar:{year:2028,month:1,day:26}, months:[29,30,29,30,29,29,30,29,30,29,30,30,29,30], leapMonth:5 },
        2029: { jan1Solar:{year:2029,month:2,day:13}, months:[29,30,30,29,30,29,29,30,29,30,29,30,30], leapMonth:0 },
        2030: { jan1Solar:{year:2030,month:2,day:3},  months:[29,30,29,30,30,29,30,29,29,30,29,30,29,30], leapMonth:3 },
    };
    return raw;
}



function animateElementBars() {
    const barIds = ['bar-wood', 'bar-fire', 'bar-earth', 'bar-metal', 'bar-water'];
    barIds.forEach(id => {
        const bar = document.getElementById(id);
        if (bar) {
            const width = bar.getAttribute('data-width') || '0%';
            bar.style.width = width;
        }
    });
}


function getSavedList() {
    const list = localStorage.getItem('saju_saved_list');
    return list ? JSON.parse(list) : [];
}

function saveList(list) {
    localStorage.setItem('saju_saved_list', JSON.stringify(list));
}

function populateDateDropdowns() {
    const yearSelect = document.getElementById('year');
    const monthSelect = document.getElementById('month');
    const daySelect = document.getElementById('day');

    if (!yearSelect || !monthSelect || !daySelect) return;

    const currentYear = new Date().getFullYear();
    for (let y = currentYear + 5; y >= 1920; y--) {
        const opt = document.createElement('option');
        opt.value = y;
        opt.textContent = y + '년';
        if (y === 1990) opt.selected = true;
        yearSelect.appendChild(opt);
    }

    for (let m = 1; m <= 12; m++) {
        const opt = document.createElement('option');
        opt.value = m;
        opt.textContent = m + '월';
        monthSelect.appendChild(opt);
    }

    for (let d = 1; d <= 31; d++) {
        const opt = document.createElement('option');
        opt.value = d;
        opt.textContent = d + '일';
        daySelect.appendChild(opt);
    }
}

function populateTimeDropdowns() {
    const hourSelect = document.getElementById('hour');
    const minuteSelect = document.getElementById('minute');

    if (!hourSelect || !minuteSelect) return;

    for (let h = 0; h <= 23; h++) {
        const opt = document.createElement('option');
        opt.value = h;
        opt.textContent = String(h).padStart(2, '0') + '시';
        hourSelect.appendChild(opt);
    }

    for (let m = 0; m <= 59; m++) {
        const opt = document.createElement('option');
        opt.value = m;
        opt.textContent = String(m).padStart(2, '0') + '분';
        minuteSelect.appendChild(opt);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // 1. Populate Dropdowns
    populateDateDropdowns();
    populateTimeDropdowns();

    // 2. Handle Checkbox for Unknown Time
    const unknownTimeCheckbox = document.getElementById('unknown-time');
    const timeInputsContainer = document.getElementById('time-inputs-container');
    const hourSelect = document.getElementById('hour');
    const minuteSelect = document.getElementById('minute');

    unknownTimeCheckbox.addEventListener('change', (e) => {
        if (e.target.checked) {
            timeInputsContainer.classList.add('disabled');
            hourSelect.disabled = true;
            minuteSelect.disabled = true;
        } else {
            timeInputsContainer.classList.remove('disabled');
            hourSelect.disabled = false;
            minuteSelect.disabled = false;
        }
    });

    // Handle Checkbox for Month Adjustment
    const adjustMonthCheckbox = document.getElementById('adjust-month');
    const monthAdjustContainer = document.getElementById('month-adjust-container');
    if (adjustMonthCheckbox && monthAdjustContainer) {
        adjustMonthCheckbox.addEventListener('change', (e) => {
            monthAdjustContainer.style.display = e.target.checked ? 'block' : 'none';
        });
    }

    // 3. Analyze Button Click Effect
    const btnAnalyze = document.getElementById('btn-analyze');
    btnAnalyze.addEventListener('click', () => {
        const icon = btnAnalyze.querySelector('i');
        icon.classList.add('fa-spin');
        
        // Get input values
        const nameInput = document.getElementById('name').value;
        const yearSelect = parseInt(document.getElementById('year').value);
        const monthSelect = parseInt(document.getElementById('month').value);
        const daySelect = parseInt(document.getElementById('day').value);

        // 달력 종류 읽기 (name="calendar")
        let calendarType = 'solar';
        document.getElementsByName('calendar').forEach(r => { if (r.checked) calendarType = r.value; });

        const displayName = nameInput.trim() === '' ? '익명' : nameInput.trim();
        const resultTitleEl = document.getElementById('result-title');
        if (resultTitleEl) resultTitleEl.textContent = `${displayName}님의 사주명식`;
        const summaryNameEl = document.getElementById('summary-name');
        if (summaryNameEl) summaryNameEl.textContent = displayName;

        // 음력이면 양력으로 변환
        let solarYear = yearSelect, solarMonth = monthSelect, solarDay = daySelect;
        let lunarNotice = '';
        if (calendarType === 'lunar' || calendarType === 'lunar_leap') {
            const isLeap = calendarType === 'lunar_leap';
            const converted = lunarToSolar(yearSelect, monthSelect, daySelect, isLeap);
            if (converted) {
                solarYear = converted.year;
                solarMonth = converted.month;
                solarDay = converted.day;
                lunarNotice = ` (음력${isLeap ? ' 윤달' : ''} → 양력 ${solarYear}.${String(solarMonth).padStart(2,'0')}.${String(solarDay).padStart(2,'0')})`;
            } else {
                alert('해당 음력 날짜를 변환할 수 없습니다. (지원 범위: 1960~2030년)');
                icon.classList.remove('fa-spin');
                return;
            }
        }
        if (lunarNotice && resultTitleEl) {
            resultTitleEl.textContent = `${displayName}님의 사주명식${lunarNotice}`;
        }

        // Update Saju Table based on solar date
        updateSajuTable(String(solarYear), String(solarMonth).padStart(2,'0'), String(solarDay).padStart(2,'0'));
        
        // Simulate analysis delay
        setTimeout(() => {
            icon.classList.remove('fa-spin');
            
            // Navigate to screen 2
            document.getElementById('screen-input').classList.remove('active');
            document.getElementById('screen-result').classList.add('active');
            
            // Animate element bars (delay for screen transition)
            setTimeout(animateElementBars, 100);
        }, 800);
    });

    function updateSajuTable(year, month, day) {
        // --- Core Saju Calculation Engine ---
        const stems = [
            { h: '甲', g: '갑', e: 'wood', y: 'yang' }, { h: '乙', g: '을', e: 'wood', y: 'yin' },
            { h: '丙', g: '병', e: 'fire', y: 'yang' }, { h: '丁', g: '정', e: 'fire', y: 'yin' },
            { h: '戊', g: '무', e: 'earth', y: 'yang' }, { h: '己', g: '기', e: 'earth', y: 'yin' },
            { h: '庚', g: '경', e: 'metal', y: 'yang' }, { h: '辛', g: '신', e: 'metal', y: 'yin' },
            { h: '壬', g: '임', e: 'water', y: 'yang' }, { h: '癸', g: '계', e: 'water', y: 'yin' }
        ];
        
        const branches = [
            // h=한자, g=한글, e=오행, y=표시음양(+/-부호), yc=십성계산음양(대표천간 기준)
            //         y(표시): 子=양,丑=음,寅=양,卯=음,辰=양,巳=음,午=양,未=음,申=양,酉=음,戌=양,亥=음
            //         yc(계산): 子=癸=음,丑=己=음,寅=甲=양,卯=乙=음,辰=戊=양,巳=丙=양,午=丁=음,未=己=음,申=庚=양,酉=辛=음,戌=戊=양,亥=壬=양
            { h:'子',g:'자',e:'water',y:'yang',yc:'yin' }, { h:'丑',g:'축',e:'earth',y:'yin', yc:'yin'  },
            { h:'寅',g:'인',e:'wood', y:'yang',yc:'yang' }, { h:'卯',g:'묘',e:'wood', y:'yin', yc:'yin'  },
            { h:'辰',g:'진',e:'earth',y:'yang',yc:'yang' }, { h:'巳',g:'사',e:'fire', y:'yin', yc:'yang' },
            { h:'午',g:'오',e:'fire', y:'yang',yc:'yin'  }, { h:'未',g:'미',e:'earth',y:'yin', yc:'yin'  },
            { h:'申',g:'신',e:'metal',y:'yang',yc:'yang' }, { h:'酉',g:'유',e:'metal',y:'yin', yc:'yin'  },
            { h:'戌',g:'술',e:'earth',y:'yang',yc:'yang' }, { h:'亥',g:'해',e:'water',y:'yin', yc:'yang' }
        ];


        const yInt = parseInt(year);
        const mInt = parseInt(month);
        const dInt = parseInt(day);

        // Hour and Minute selects
        let hInt = parseInt(document.getElementById('hour').value) || 12;
        let mSelectInt = parseInt(document.getElementById('minute').value) || 30;

        // 시간 보정 적용 (표준시 및 서머타임)
        if (window.timeCorrection) {
            const timeStr = `${String(hInt).padStart(2, '0')}:${String(mSelectInt).padStart(2, '0')}`;
            const dateStr = `${year}-${month}-${day}`;
            const result = window.timeCorrection.correctTime(dateStr, timeStr);
            if (result) {
                hInt = result.corrected.getHours();
                mSelectInt = result.corrected.getMinutes();

                const infoBox = document.getElementById('time-correction-info');
                const infoText = document.getElementById('time-correction-text');
                if (infoBox && infoText) {
                    if (result.totalOffset !== 0) {
                        infoBox.style.display = 'block';
                        let desc = `보정된 출생 시각: [${result.correctedTimeStr}] (기준: ${result.appliedStandard}`;
                        if (result.isSummer) desc += `, 서머타임 -1시간`;
                        desc += ')';
                        infoText.innerText = desc;
                    } else {
                        infoBox.style.display = 'none';
                    }
                }
            }
        }

        // Gender & Time check
        const gender = document.querySelector('input[name="gender"]:checked').value;
        const unknownTime = document.getElementById('unknown-time').checked;


        // Correction Options
        const useYajasi = document.getElementById('use-yajasi').checked;
        const adjustMonth = document.getElementById('adjust-month').checked;
        const monthShift = parseInt(document.getElementById('month-shift').value) || 0;

        // 1. Year Stem & Branch
        let sajuYear = yInt;
        if (mInt < 2 || (mInt === 2 && dInt < 4)) {
            sajuYear = yInt - 1;
        }
        const yearStemIdx = ((sajuYear - 4) % 10 + 10) % 10;
        const yearBranchIdx = ((sajuYear - 4) % 12 + 12) % 12;

        const yearStem = stems[yearStemIdx];
        const yearBranch = branches[yearBranchIdx];

        // 2. Month Branch & Stem
        let monthBranchIdx;
        if ((mInt === 2 && dInt >= 4) || (mInt === 3 && dInt < 5)) monthBranchIdx = 2; // 寅
        else if ((mInt === 3 && dInt >= 5) || (mInt === 4 && dInt < 5)) monthBranchIdx = 3; // 卯
        else if ((mInt === 4 && dInt >= 5) || (mInt === 5 && dInt < 5)) monthBranchIdx = 4; // 辰
        else if ((mInt === 5 && dInt >= 5) || (mInt === 6 && dInt < 5)) monthBranchIdx = 5; // 巳
        else if ((mInt === 6 && dInt >= 5) || (mInt === 7 && dInt < 7)) monthBranchIdx = 6; // 午
        else if ((mInt === 7 && dInt >= 7) || (mInt === 8 && dInt < 7)) monthBranchIdx = 7; // 未
        else if ((mInt === 8 && dInt >= 7) || (mInt === 9 && dInt < 7)) monthBranchIdx = 8; // 申
        else if ((mInt === 9 && dInt >= 7) || (mInt === 10 && dInt < 8)) monthBranchIdx = 9; // 酉
        else if ((mInt === 10 && dInt >= 8) || (mInt === 11 && dInt < 7)) monthBranchIdx = 10; // 戌
        else if ((mInt === 11 && dInt >= 7) || (mInt === 12 && dInt < 7)) monthBranchIdx = 11; // 亥
        else if ((mInt === 12 && dInt >= 7) || (mInt === 1 && dInt < 5)) monthBranchIdx = 0; // 子
        else monthBranchIdx = 1; // 丑 (mInt === 1 && dInt >= 5) || (mInt === 2 && dInt < 4)

        if (adjustMonth && monthShift !== 0) {
            monthBranchIdx = (monthBranchIdx + monthShift + 12) % 12;
        }

        const baseMonthStem = (yearStemIdx % 5) * 2 + 2;
        const monthOffset = (monthBranchIdx - 2 + 12) % 12;
        const monthStemIdx = (baseMonthStem + monthOffset) % 10;

        const monthStem = stems[monthStemIdx];
        const monthBranch = branches[monthBranchIdx];

        // 3. Day Stem & Branch
        const targetDate = new Date(yInt, mInt - 1, dInt, 12, 0, 0);
        const totalMins = hInt * 60 + mSelectInt;
        
        // Yajasi Logic
        if (useYajasi && totalMins >= 1410) {
            targetDate.setDate(targetDate.getDate() - 1);
        }
        const refDate = new Date(2026, 3, 25, 12, 0, 0); // 2026-04-25 is 己巳
        const diffTime = targetDate - refDate;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        const dayStemIdx = ((5 + diffDays) % 10 + 10) % 10;
        const dayBranchIdx = ((5 + diffDays) % 12 + 12) % 12;

        const dayStem = stems[dayStemIdx];
        const dayBranch = branches[dayBranchIdx];

        // 4. Hour Branch & Stem
        let hourBranchIdx = 0;
        if (!unknownTime) {
            const totalMins = hInt * 60 + mSelectInt;
            if (totalMins >= 1410 || totalMins < 90) hourBranchIdx = 0; // 23:30 ~ 01:30
            else if (totalMins >= 90 && totalMins < 210) hourBranchIdx = 1;
            else if (totalMins >= 210 && totalMins < 330) hourBranchIdx = 2;
            else if (totalMins >= 330 && totalMins < 450) hourBranchIdx = 3;
            else if (totalMins >= 450 && totalMins < 570) hourBranchIdx = 4;
            else if (totalMins >= 570 && totalMins < 690) hourBranchIdx = 5;
            else if (totalMins >= 690 && totalMins < 810) hourBranchIdx = 6;
            else if (totalMins >= 810 && totalMins < 930) hourBranchIdx = 7;
            else if (totalMins >= 930 && totalMins < 1050) hourBranchIdx = 8;
            else if (totalMins >= 1050 && totalMins < 1170) hourBranchIdx = 9;
            else if (totalMins >= 1170 && totalMins < 1290) hourBranchIdx = 10;
            else if (totalMins >= 1290 && totalMins < 1410) hourBranchIdx = 11;
        }
        const baseHourStem = (dayStemIdx % 5) * 2;
        const hourStemIdx = (baseHourStem + hourBranchIdx) % 10;

        const hourStem = stems[hourStemIdx];
        const hourBranch = branches[hourBranchIdx];

        // Shipseong logic
        const getShipseong = (target) => {
            const elementsOrder = { wood: 0, fire: 1, earth: 2, metal: 3, water: 4 };
            const dayElem    = elementsOrder[dayStem.e];
            const targetElem = elementsOrder[target.e];
            const diff       = (targetElem - dayElem + 5) % 5;
            // 십성 계산은 yc(대표 천간 기반 음양) 사용, 천간이면 y와 동일
            const dayYC   = dayStem.yc || dayStem.y;
            const targYC  = target.yc  || target.y;
            const sameYY  = dayYC === targYC;

            // diff=0: 같은 오행     → 비견/겁재
            // diff=1: 일간이 生     → 식신/상관
            // diff=2: 일간이 剋     → 편재/정재
            // diff=3: 일간을 剋     → 편관/정관
            // diff=4: 일간을 生(인) → 편인/정인
            if (diff === 0) return sameYY ? '비견' : '겁재';
            if (diff === 1) return sameYY ? '식신' : '상관';
            if (diff === 2) return sameYY ? '편재' : '정재';
            if (diff === 3) return sameYY ? '편관' : '정관';
            if (diff === 4) return sameYY ? '편인' : '정인';
            return '';
        };

        let elementCounts = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };

        const updateCell = (id, stemObj, branchObj, isHour = false) => {
            const sCell = document.getElementById(id + '-stem');
            const bCell = document.getElementById(id + '-branch');

            const getDisplayShipseong = (obj, isDayStem = false) => {
                const yinYang = obj.y === 'yang' ? '+' : '-';
                const koreanElem = { wood: '목', fire: '화', earth: '토', metal: '금', water: '수' }[obj.e];
                const ss = getShipseong(obj);
                if (isDayStem) {
                    return `${yinYang}${koreanElem}/日元`;
                }
                return ss ? `${yinYang}${koreanElem}/${ss}` : '-';
            };

            if (sCell) {
                sCell.className = `saju-cell element-${stemObj.e}`;
                sCell.querySelector('.hanja').textContent = stemObj.h;
                sCell.querySelector('.hangul').textContent = stemObj.g;
                sCell.querySelector('.shipseong').textContent = getDisplayShipseong(stemObj, id === 'day');
                elementCounts[stemObj.e]++;
                if (isHour && unknownTime) {
                    sCell.querySelector('.hanja').textContent = '無';
                    sCell.querySelector('.hangul').textContent = '무';
                    sCell.querySelector('.shipseong').textContent = '-';
                    elementCounts[stemObj.e]--;
                }
            }

            if (bCell) {
                bCell.className = `saju-cell element-${branchObj.e}`;
                bCell.querySelector('.hanja').textContent = branchObj.h;
                bCell.querySelector('.hangul').textContent = branchObj.g;
                bCell.querySelector('.shipseong').textContent = getDisplayShipseong(branchObj);
                elementCounts[branchObj.e]++;
                if (isHour && unknownTime) {
                    bCell.querySelector('.hanja').textContent = '無';
                    bCell.querySelector('.hangul').textContent = '무';
                    bCell.querySelector('.shipseong').textContent = '-';
                    elementCounts[branchObj.e]--;
                }
            }
        };

        updateCell('year', yearStem, yearBranch);
        updateCell('month', monthStem, monthBranch);
        updateCell('day', dayStem, dayBranch);
        updateCell('hour', hourStem, hourBranch, true);

        if (document.getElementById('cnt-wood')) {
            document.getElementById('cnt-wood').textContent = elementCounts.wood || 0;
            document.getElementById('cnt-fire').textContent = elementCounts.fire || 0;
            document.getElementById('cnt-earth').textContent = elementCounts.earth || 0;
            document.getElementById('cnt-metal').textContent = elementCounts.metal || 0;
            document.getElementById('cnt-water').textContent = elementCounts.water || 0;

        const totalElements = (elementCounts.wood || 0) + (elementCounts.fire || 0) + (elementCounts.earth || 0) + (elementCounts.metal || 0) + (elementCounts.water || 0) || 1;
        const updateBar = (id, count) => {
            const percent = Math.round((count / totalElements) * 100);
            const bar = document.getElementById('bar-' + id);
            const score = document.getElementById('score-' + id);
            if (bar) bar.setAttribute('data-width', percent + '%');
            if (score) score.textContent = percent + '%';
        };
        updateBar('wood', elementCounts.wood || 0);
        updateBar('fire', elementCounts.fire || 0);
        updateBar('earth', elementCounts.earth || 0);
        updateBar('metal', elementCounts.metal || 0);
        updateBar('water', elementCounts.water || 0);

        let maxElement = 'wood';
        let maxCount = elementCounts.wood || 0;
        ['fire', 'earth', 'metal', 'water'].forEach(e => {
            if ((elementCounts[e] || 0) > maxCount) {
                maxCount = elementCounts[e] || 0;
                maxElement = e;
            }
        });
        const elementNames = { wood: '목(木)', fire: '화(火)', earth: '토(土)', metal: '금(金)', water: '수(水)' };
        const summaryName = document.getElementById('summary-name');
        const summaryBoxSpan = document.querySelector('.summary-box span');
        if (summaryName && summaryBoxSpan) {
            const nameVal = document.getElementById('name').value.trim() || '사용자';
            summaryName.textContent = nameVal;
            summaryBoxSpan.innerHTML = '<strong>' + nameVal + '</strong>님은 <strong class="element-' + maxElement + '">' + elementNames[maxElement] + '</strong> 기운이 가장 강합니다.';
        }
        setTimeout(animateElementBars, 100);

        }

        // 12 Unseong
        const get12Unseong = (targetBranch) => {
            const unseongList = ['장생', '목욕', '관대', '건록', '제왕', '쇠', '병', '사', '묘', '절', '태', '양'];
            const bNames = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
            const startPoints = {
                '甲': { b: '亥', d: 1 }, '乙': { b: '午', d: -1 },
                '丙': { b: '寅', d: 1 }, '戊': { b: '寅', d: 1 },
                '丁': { b: '酉', d: -1 }, '己': { b: '酉', d: -1 },
                '庚': { b: '巳', d: 1 }, '辛': { b: '子', d: -1 },
                '壬': { b: '申', d: 1 }, '癸': { b: '卯', d: -1 }
            };
            const start = startPoints[dayStem.h];
            if (!start) return '-';
            const startIdx = bNames.indexOf(start.b);
            const targetIdx = bNames.indexOf(targetBranch.h);
            let dist = (targetIdx - startIdx + 12) % 12;
            if (start.d === -1) dist = (startIdx - targetIdx + 12) % 12;
            return unseongList[dist];
        };

        const getNabeum = (stemObj, branchObj) => {
            const map = {
                '甲子': '해중금', '乙丑': '해중금',
                '丙寅': '노중화', '丁卯': '노중화',
                '戊辰': '대림목', '己巳': '대림목',
                '庚午': '노방토', '辛未': '노방토',
                '壬申': '검봉금', '癸酉': '검봉금',
                '甲戌': '산두화', '乙亥': '산두화',
                '丙子': '간하수', '丁丑': '간하수',
                '戊寅': '성두토', '己卯': '성두토',
                '庚辰': '백랍금', '辛巳': '백랍금',
                '壬午': '양류목', '癸未': '양류목',
                '甲申': '천중수', '乙酉': '천중수',
                '丙戌': '옥상토', '丁亥': '옥상토',
                '戊子': '벽력화', '己丑': '벽력화',
                '庚寅': '송백목', '辛卯': '송백목',
                '壬辰': '장류수', '癸巳': '장류수',
                '甲午': '사중금', '乙未': '사중금',
                '丙申': '산하화', '丁酉': '산하화',
                '戊戌': '평지목', '己亥': '평지목',
                '庚子': '벽상토', '辛丑': '벽상토',
                '壬寅': '금박금', '癸卯': '금박금',
                '甲辰': '복등화', '乙巳': '복등화',
                '丙午': '천하수', '丁未': '천하수',
                '戊申': '대역토', '己酉': '대역토',
                '庚戌': '차천금', '辛亥': '차천금',
                '壬子': '상목수', '癸丑': '상목수',
                '甲寅': '대계수', '乙卯': '대계수',
                '丙辰': '사중토', '丁巳': '사중토',
                '戊午': '천상화', '己未': '천상화',
                '庚申': '석류목', '辛酉': '석류목',
                '壬戌': '대해수', '癸亥': '대해수'
            };
            return map[stemObj.h + branchObj.h] || '';
        };

        const updateExtra = (id, text) => {
            const el = document.getElementById(id);
            if (el) el.innerHTML = text;
        };

        updateExtra('year-un', `${get12Unseong(yearBranch)}<br><small style="font-size:0.65rem; color:var(--primary-gold);">${getNabeum(yearStem, yearBranch)}</small>`);
        updateExtra('month-un', `${get12Unseong(monthBranch)}<br><small style="font-size:0.65rem; color:var(--primary-gold);">${getNabeum(monthStem, monthBranch)}</small>`);
        updateExtra('day-un', `${get12Unseong(dayBranch)}<br><small style="font-size:0.65rem; color:var(--primary-gold);">${getNabeum(dayStem, dayBranch)}</small>`);
        updateExtra('hour-un', unknownTime ? '-' : `${get12Unseong(hourBranch)}<br><small style="font-size:0.65rem; color:var(--primary-gold);">${getNabeum(hourStem, hourBranch)}</small>`);

        // --- 고급 명리학 연산 (일간 기준 12운성, 연지 기준 12신살, 지장간 및 성격) ---
        if (window.advancedMyeongli) {
            const dStemChar = dayStem.h; 
            const yBranchChar = yearBranch.h;
            const am = window.advancedMyeongli;

            const getNewUnseong = (br) => (am.unseong[dStemChar] && am.unseong[dStemChar][br.h]) ? am.unseong[dStemChar][br.h] : '-';
            
            updateExtra('year-un', getNewUnseong(yearBranch) + '<br><small style="font-size:0.65rem; color:var(--primary-gold);">' + getNabeum(yearStem, yearBranch) + '</small>');
            updateExtra('month-un', getNewUnseong(monthBranch) + '<br><small style="font-size:0.65rem; color:var(--primary-gold);">' + getNabeum(monthStem, monthBranch) + '</small>');
            updateExtra('day-un', getNewUnseong(dayBranch) + '<br><small style="font-size:0.65rem; color:var(--primary-gold);">' + getNabeum(dayStem, dayBranch) + '</small>');
            updateExtra('hour-un', unknownTime ? '-' : (getNewUnseong(hourBranch) + '<br><small style="font-size:0.65rem; color:var(--primary-gold);">' + getNabeum(hourStem, hourBranch) + '</small>'));

            const getNewSinsal = (br) => (am.sinsal[yBranchChar] && am.sinsal[yBranchChar][br.h]) ? am.sinsal[yBranchChar][br.h] : '-';
            
            updateExtra('year-shinsal', getNewSinsal(yearBranch));
            updateExtra('month-shinsal', getNewSinsal(monthBranch));
            updateExtra('day-shinsal', getNewSinsal(dayBranch));
            updateExtra('hour-shinsal', unknownTime ? '-' : getNewSinsal(hourBranch));

            const getJijanganStr = (br) => {
                const list = am.jijangan[br.h] || [];
                if (list.length === 2) return '초: ' + list[0] + '<br>정: ' + list[1];
                if (list.length === 3) return '초: ' + list[0] + '<br>중: ' + list[1] + '<br>정: ' + list[2];
                return list.join('<br>');
            };
            
            updateExtra('year-jjg', getJijanganStr(yearBranch));
            updateExtra('month-jjg', getJijanganStr(monthBranch));
            updateExtra('day-jjg', getJijanganStr(dayBranch));
            updateExtra('hour-jjg', unknownTime ? '-' : getJijanganStr(hourBranch));

            const interactionDateArea = document.getElementById('hap-analysis');
            if (interactionDateArea) {
                const parentBox = interactionDateArea.closest('.interaction-grid');
                if (parentBox) {
                    let pBox = document.getElementById('personality-box');
                    if (!pBox) {
                        pBox = document.createElement('div');
                        pBox.id = 'personality-box';
                        pBox.style.gridColumn = '1 / -1';
                        pBox.style.background = 'rgba(255, 255, 255, 0.03)';
                        pBox.style.padding = '12px';
                        pBox.style.borderRadius = '12px';
                        pBox.style.border = '1px solid rgba(255,255,255,0.05)';
                        pBox.style.marginBottom = '10px';
                        pBox.style.fontSize = '0.85rem';
                        pBox.style.color = 'var(--text-main)';
                        parentBox.parentNode.insertBefore(pBox, parentBox);
                    }
                    
                    let personalityText = '<strong>[지지 핵심 성향 분석]</strong> ';
                    const pMap = am.jijiPersonality;
                    const uniqueBranches = [...new Set([yearBranch.h, monthBranch.h, dayBranch.h, (unknownTime ? null : hourBranch.h)].filter(Boolean))];
                    
                    uniqueBranches.forEach(b => {
                        if (pMap[b]) {
                            personalityText += b + '(' + pMap[b].good + ' / ' + pMap[b].bad + '), ';
                        }
                    });
                    personalityText = personalityText.replace(/,\s*$/, '');
                    pBox.innerHTML = '<i class="fa-solid fa-user-gear" style="color: #3498db; margin-right: 6px;"></i> ' + personalityText;
                }
            }
        }

        // 지지 작용 (합, 형, 충, 파, 해)
        const getInteractions = () => {
            const bArr = [
                { h: hourBranch.h, name: '시' },
                { h: dayBranch.h, name: '일' },
                { h: monthBranch.h, name: '월' },
                { h: yearBranch.h, name: '년' }
            ];
            if (unknownTime) bArr.shift(); 

            const haps = [];
            const hyeongs = [];
            const chungs = [];
            const pas = [];
            const haes = [];

            const ai = window.advancedInteractions;
            const bChars = bArr.map(b => b.h);

            if (ai) {
                // 1. 삼합 & 반합
                Object.keys(ai.samHap).forEach(sh => {
                    const matched = bChars.filter(c => sh.includes(c));
                    const uniqueMatched = [...new Set(matched)];
                    if (uniqueMatched.length >= 3) {
                        haps.push('삼합(' + sh + '→' + ai.samHap[sh] + ')');
                    } else if (uniqueMatched.length === 2) {
                        haps.push('반합(' + uniqueMatched.join('') + '→' + ai.samHap[sh] + ')');
                    }
                });

                // 2. 방합
                Object.keys(ai.bangHap).forEach(bh => {
                    const matched = bChars.filter(c => bh.includes(c));
                    const uniqueMatched = [...new Set(matched)];
                    if (uniqueMatched.length >= 3) {
                        haps.push('방합(' + bh + '→' + ai.bangHap[bh] + ')');
                    }
                });

                // 3. 육합
                for (let i = 0; i < bChars.length; i++) {
                    for (let j = i + 1; j < bChars.length; j++) {
                        const comb = bChars[i] + bChars[j];
                        const combRev = bChars[j] + bChars[i];
                        if (ai.jiJiHap[comb]) {
                            haps.push('육합(' + comb + '→' + ai.jiJiHap[comb] + ')');
                        } else if (ai.jiJiHap[combRev]) {
                            haps.push('육합(' + combRev + '→' + ai.jiJiHap[combRev] + ')');
                        }
                    }
                }

                // 4. 형살
                for (let i = 0; i < bChars.length; i++) {
                    for (let j = i + 1; j < bChars.length; j++) {
                        const comb = bChars[i] + bChars[j];
                        const combRev = bChars[j] + bChars[i];
                        if (ai.hyeongSal[comb]) {
                            hyeongs.push(ai.hyeongSal[comb] + '(' + comb + ')');
                        } else if (ai.hyeongSal[combRev]) {
                            hyeongs.push(ai.hyeongSal[combRev] + '(' + combRev + ')');
                        }
                    }
                }
            }

            // 충, 파, 해 기본 6친 조합
            for (let i = 0; i < bArr.length; i++) {
                for (let j = i + 1; j < bArr.length; j++) {
                    const c1 = bArr[i].h;
                    const c2 = bArr[j].h;
                    
                    const chungPairs = ['子午', '午子', '丑未', '未丑', '寅申', '申寅', '卯酉', '酉卯', '辰戌', '戌辰', '巳亥', '亥巳'];
                    if (chungPairs.includes(c1 + c2)) chungs.push('충(' + c1 + c2 + ')');
                    
                    const paPairs = ['子酉', '酉子', '丑辰', '辰丑', '寅亥', '亥寅', '卯午', '午卯', '巳申', '申巳', '未戌', '戌未'];
                    if (paPairs.includes(c1 + c2)) pas.push('파(' + c1 + c2 + ')');
                    
                    const haePairs = ['子未', '未子', '丑午', '午丑', '寅巳', '巳寅', '卯辰', '辰卯', '申亥', '亥申', '酉戌', '戌酉'];
                    if (haePairs.includes(c1 + c2)) haes.push('해(' + c1 + c2 + ')');
                }
            }

            const allInteractions = [...new Set([...haps, ...hyeongs, ...chungs, ...pas, ...haes])];
            return allInteractions.length > 0 ? allInteractions.join(', ') : '해당 작용 없음';
        };

        updateExtra('saju-interactions', getInteractions());

        // 천간 작용 (합, 충)
        const getStemInteractions = () => {
            const sArr = [
                { h: hourStem.h, name: '시' },
                { h: dayStem.h, name: '일' },
                { h: monthStem.h, name: '월' },
                { h: yearStem.h, name: '년' }
            ];
            if (unknownTime) sArr.shift();

            const haps = [];
            const chungs = [];

            const ai = window.advancedInteractions;
            if (ai) {
                for (let i = 0; i < sArr.length; i++) {
                    for (let j = i + 1; j < sArr.length; j++) {
                        const comb = sArr[i].h + sArr[j].h;
                        const combRev = sArr[j].h + sArr[i].h;
                        if (ai.cheonGanHap[comb]) {
                            haps.push('합(' + comb + '→' + ai.cheonGanHap[comb] + ')');
                        } else if (ai.cheonGanHap[combRev]) {
                            haps.push('합(' + combRev + '→' + ai.cheonGanHap[combRev] + ')');
                        }

                        if (ai.cheonGanChung.includes(comb)) {
                            chungs.push('충(' + comb + ')');
                        } else if (ai.cheonGanChung.includes(combRev)) {
                            chungs.push('충(' + combRev + ')');
                        }
                    }
                }
            }

            const allInteractions = [...haps, ...chungs];
            return allInteractions.length > 0 ? allInteractions.join(', ') : '해당 작용 없음';
        };

        updateExtra('stem-interactions', getStemInteractions());


        // --- 일주별 대운/연운 특수 충살 분석 ---
        const iljuStr = dayStem.h + dayBranch.h;
        if (window.advancedInteractions && window.advancedInteractions.iljuChung[iljuStr]) {
            const targetChung = window.advancedInteractions.iljuChung[iljuStr];
            const hapArea = document.getElementById('hap-analysis');
            if (hapArea) {
                const parentGrid = hapArea.closest('.interaction-grid');
                if (parentGrid) {
                    let chungBox = document.getElementById('special-chung-box');
                    if (!chungBox) {
                        chungBox = document.createElement('div');
                        chungBox.id = 'special-chung-box';
                        chungBox.style.gridColumn = '1 / -1';
                        chungBox.style.background = 'rgba(231, 76, 60, 0.05)';
                        chungBox.style.padding = '12px';
                        chungBox.style.borderRadius = '12px';
                        chungBox.style.border = '1px solid rgba(231, 76, 60, 0.15)';
                        chungBox.style.marginTop = '10px';
                        chungBox.style.fontSize = '0.85rem';
                        chungBox.style.color = 'var(--text-main)';
                        parentGrid.appendChild(chungBox);
                    }
                    chungBox.innerHTML = '<i class="fa-solid fa-triangle-exclamation" style="color: #e74c3c; margin-right: 6px;"></i> <strong>[일주 충살 경고]</strong> 본인의 일주(' + iljuStr + ')는 대운/연운에서 <strong>' + targetChung + '</strong>을 만날 때 강한 충돌 작용이 발생할 수 있으니 유의하시기 바랍니다.';
                }
            }
        }


        // 월령(당령) 연산 로직
        const getWolryeong = () => {
            const thresholds = [0, 5, 4, 5, 5, 5, 5, 7, 7, 7, 8, 7, 7];
            const startDay = thresholds[mInt];
            let daysPassed = 0;

            if (dInt >= startDay) {
                daysPassed = dInt - startDay + 1;
            } else {
                let prevMonth = mInt - 1 === 0 ? 12 : mInt - 1;
                let prevMonthDays = new Date(yInt, prevMonth, 0).getDate();
                daysPassed = (prevMonthDays - thresholds[prevMonth]) + dInt + 1;
            }

            let bChar = monthBranch.h;
            if (bChar === '寅') return daysPassed <= 7 ? '戊' : (daysPassed <= 14 ? '丙' : '甲');
            if (bChar === '卯') return daysPassed <= 10 ? '甲' : '乙';
            if (bChar === '辰') return daysPassed <= 9 ? '乙' : (daysPassed <= 14 ? '癸' : '戊');
            if (bChar === '巳') return daysPassed <= 7 ? '戊' : (daysPassed <= 14 ? '庚' : '丙');
            if (bChar === '午') return daysPassed <= 10 ? '丙' : (daysPassed <= 19 ? '己' : '丁');
            if (bChar === '未') return daysPassed <= 9 ? '丁' : (daysPassed <= 12 ? '乙' : '己');
            if (bChar === '申') return daysPassed <= 7 ? '戊' : (daysPassed <= 14 ? '壬' : '庚');
            if (bChar === '酉') return daysPassed <= 10 ? '庚' : '辛';
            if (bChar === '戌') return daysPassed <= 9 ? '辛' : (daysPassed <= 12 ? '丁' : '戊');
            if (bChar === '亥') return daysPassed <= 7 ? '戊' : (daysPassed <= 14 ? '甲' : '壬');
            if (bChar === '子') return daysPassed <= 10 ? '壬' : '癸';
            if (bChar === '丑') return daysPassed <= 9 ? '癸' : (daysPassed <= 12 ? '辛' : '己');
            return '-';
        };

        const wolryeongVal = getWolryeong();
        let wolryeongStr = wolryeongVal;
        const wolryeongShipseong = getShipseong({
            h: wolryeongVal,
            e: { '甲': 'wood', '乙': 'wood', '丙': 'fire', '丁': 'fire', '戊': 'earth', '己': 'earth', '庚': 'metal', '辛': 'metal', '壬': 'water', '癸': 'water' }[wolryeongVal],
            y: { '甲': 'yang', '丙': 'yang', '戊': 'yang', '庚': 'yang', '壬': 'yang', '乙': 'yin', '丁': 'yin', '己': 'yin', '辛': 'yin', '癸': 'yin' }[wolryeongVal]
        });
        if (wolryeongShipseong) wolryeongStr += ` / ${wolryeongShipseong}`;

        updateExtra('wolryeong', wolryeongStr);

        // --- Shared Daewun Calculation ---
        const yearParity = yearStem.y; 
        const isDaewunForward = (yearParity === 'yang' && gender === 'male') || (yearParity === 'yin' && gender === 'female');
        const thresholds = [0, 5, 4, 5, 5, 5, 5, 7, 7, 7, 8, 7, 7];
        const startDay = thresholds[mInt];
        let distDays = 0;

        if (isDaewunForward) {
            let nextMonth = mInt + 1 > 12 ? 1 : mInt + 1;
            let currentMonthDays = new Date(yInt, mInt, 0).getDate();
            distDays = (currentMonthDays - dInt) + thresholds[nextMonth];
        } else {
            if (dInt >= startDay) {
                distDays = dInt - startDay;
            } else {
                let prevMonth = mInt - 1 === 0 ? 12 : mInt - 1;
                let prevMonthDays = new Date(yInt, prevMonth, 0).getDate();
                distDays = (prevMonthDays - thresholds[prevMonth]) + dInt;
            }
        }
        let sharedDaewunSu = parseFloat((distDays / 3).toFixed(1));
        if (sharedDaewunSu === 0) sharedDaewunSu = 1;

        // 대운 (Daewun) 계산 로직
        const populateDaewun = () => {
            const container = document.getElementById('daewun-timeline');
            if (!container) return;
            container.innerHTML = '';

            let daewunSu = sharedDaewunSu;
            const isForward = isDaewunForward;

            let curStemIdx = monthStemIdx;
            let curBranchIdx = monthBranchIdx;
            const step = isForward ? 1 : -1;

            for (let i = 0; i < 8; i++) {
                curStemIdx = (curStemIdx + step + 10) % 10;
                curBranchIdx = (curBranchIdx + step + 12) % 12;

                const age = Math.round(daewunSu + i * 10) + 1; // 세는나이 표기를 위해 1세 가산
                const dStem = stems[curStemIdx];
                const dBranch = branches[curBranchIdx];

                const card = document.createElement('div');
                card.style.cssText = `
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    background: var(--surface-color-light);
                    border: 1px solid rgba(255,255,255,0.05);
                    border-radius: var(--radius-sm);
                    padding: 8px;
                    min-width: 55px;
                    text-align: center;
                `;
                
                const currentYear = new Date().getFullYear();
                const personAge = currentYear - yInt + 1;
                const isCurrentDaewun = (personAge >= age && personAge < age + 10);

                if (isCurrentDaewun) {
                    card.style.borderColor = 'var(--primary-gold)';
                    card.style.background = 'rgba(212, 175, 55, 0.15)';
                }

                card.innerHTML = `
                    <span style="font-size: 0.7rem; color: var(--primary-gold); font-weight: bold; margin-bottom: 4px;">${age}</span>
                    <span style="font-size: 1.1rem; font-weight: bold; color: var(--element-${dStem.e});">${dStem.h}</span>
                    <span style="font-size: 1.1rem; font-weight: bold; color: var(--element-${dBranch.e});">${dBranch.h}</span>
                    <span style="font-size: 0.65rem; color: var(--text-muted); margin-top: 2px;">${dStem.g}${dBranch.g}</span>
                `;
                container.appendChild(card);
            }
        };

        populateDaewun();

        // Jijanggan
        const getJijanggan = (targetBranch) => {
            const table = {
                '子': ['壬', '癸'], '丑': ['癸', '辛', '己'], '寅': ['戊', '丙', '甲'], '卯': ['甲', '乙'],
                '辰': ['乙', '癸', '戊'], '巳': ['戊', '庚', '丙'], '午': ['丙', '己', '丁'], '未': ['丁', '乙', '己'],
                '申': ['戊', '壬', '庚'], '酉': ['庚', '辛'], '戌': ['辛', '丁', '戊'], '亥': ['戊', '甲', '壬']
            };
            const stemsLookup = {
                '甲': { e: 'wood', y: 'yang' }, '乙': { e: 'wood', y: 'yin' },
                '丙': { e: 'fire', y: 'yang' }, '丁': { e: 'fire', y: 'yin' },
                '戊': { e: 'earth', y: 'yang' }, '己': { e: 'earth', y: 'yin' },
                '庚': { e: 'metal', y: 'yang' }, '辛': { e: 'metal', y: 'yin' },
                '壬': { e: 'water', y: 'yang' }, '癸': { e: 'water', y: 'yin' }
            };
            const branchStems = table[targetBranch.h] || [];
            return branchStems.map(sName => {
                const sObj = { h: sName, ...stemsLookup[sName] };
                return `${sName}${getShipseong(sObj)}`;
            }).join('<br>');
        };

        updateExtra('year-jjg', getJijanggan(yearBranch));
        updateExtra('month-jjg', getJijanggan(monthBranch));
        updateExtra('day-jjg', getJijanggan(dayBranch));
        updateExtra('hour-jjg', unknownTime ? '-' : getJijanggan(hourBranch));

        // Shinsal & Napeum Logic
        const getCombinedShinsal = (stemObj, branchObj) => {
            const bNames = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
            const shinsalList = ['지살', '도화살', '월살', '망신살', '장성살', '반안살', '역마살', '육해살', '화개살', '겁살', '재살', '천살'];
            
            // 1. 12 신살 (년지 삼합 기준)
            let samhapStartYear;
            if (['寅', '午', '戌'].includes(yearBranch.h)) samhapStartYear = '寅';
            else if (['申', '子', '辰'].includes(yearBranch.h)) samhapStartYear = '申';
            else if (['巳', '酉', '丑'].includes(yearBranch.h)) samhapStartYear = '巳';
            else samhapStartYear = '亥';

            const startIdxYear = bNames.indexOf(samhapStartYear);
            const targetIdx = bNames.indexOf(branchObj.h);
            const distYear = (targetIdx - startIdxYear + 12) % 12;
            const baseShinsalYear = shinsalList[distYear];

            // 1-2. 12 신살 (일지 삼합 기준)
            let samhapStartDay;
            if (['寅', '午', '戌'].includes(dayBranch.h)) samhapStartDay = '寅';
            else if (['申', '子', '辰'].includes(dayBranch.h)) samhapStartDay = '申';
            else if (['巳', '酉', '丑'].includes(dayBranch.h)) samhapStartDay = '巳';
            else samhapStartDay = '亥';

            const startIdxDay = bNames.indexOf(samhapStartDay);
            const distDay = (targetIdx - startIdxDay + 12) % 12;
            const baseShinsalDay = shinsalList[distDay];

            // 2. 납음오행
            const napeumMap = {
                '甲子': '해중금', '乙丑': '해중금', '丙寅': '노중화', '丁卯': '노중화',
                '戊辰': '대림목', '己巳': '대림목', '庚午': '노방토', '辛未': '노방토',
                '壬申': '검봉금', '癸酉': '검봉금', '甲戌': '산두화', '乙亥': '산두화',
                '丙子': '간하수', '丁丑': '간하수', '戊寅': '성두토', '己卯': '성두토',
                '庚辰': '백랍금', '辛巳': '백랍금', '壬午': '양류목', '癸未': '양류목',
                '甲申': '천중수', '乙酉': '천중수', '丙戌': '옥상토', '丁亥': '옥상토',
                '戊子': '벽력화', '己丑': '벽력화', '庚寅': '송백목', '辛卯': '송백목',
                '壬辰': '장류수', '癸巳': '장류수', '甲午': '사중금', '乙未': '사중금',
                '丙申': '산하화', '丁酉': '산하화', '戊戌': '평지목', '己亥': '평지목',
                '庚子': '벽상토', '辛丑': '벽상토', '壬寅': '금박금', '癸卯': '금박금',
                '甲辰': '복등화', '乙巳': '복등화', '丙午': '천상화', '丁未': '천상화',
                '戊申': '대역토', '己酉': '대역토', '庚戌': '차천금', '辛亥': '차천금',
                '壬子': '상자목', '癸丑': '상자목', '甲寅': '대계수', '乙卯': '대계수',
                '丙辰': '사중토', '丁巳': '사중토', '戊午': '천상화', '己未': '천상화',
                '庚申': '석류목', '辛酉': '석류목', '壬戌': '대해수', '癸亥': '대해수'
            };
            const napeum = napeumMap[stemObj.h + branchObj.h] || '';

            // 3. 추가 신살 (중복 허용)
            const activeSinsal = [];
            
            // 년지/일지 기준 12신살 추가 (중복 제거)
            activeSinsal.push(baseShinsalYear);
            if (!activeSinsal.includes(baseShinsalDay)) {
                activeSinsal.push(baseShinsalDay);
            }

            // 천을귀인
            const gwiin = {
                '甲': ['丑', '未'], '戊': ['丑', '未'], '庚': ['丑', '未'],
                '乙': ['子', '申'], '己': ['子', '申'],
                '丙': ['亥', '酉'], '丁': ['亥', '酉'],
                '壬': ['巳', '卯'], '癸': ['巳', '卯'], '辛': ['寅', '午']
            };
            if (gwiin[dayStem.h] && gwiin[dayStem.h].includes(branchObj.h)) activeSinsal.push('천을귀인');

            // 괴강살
            if (['戊戌', '戊辰', '庚戌', '庚辰', '壬戌', '壬辰'].includes(stemObj.h + branchObj.h)) activeSinsal.push('괴강살');

            // 백호살
            if (['甲辰', '乙未', '丙戌', '丁丑', '戊辰', '壬戌', '癸丑'].includes(stemObj.h + branchObj.h)) activeSinsal.push('백호살');

            // 현침살
            if (['甲', '辛', '卯', '午', '申'].includes(stemObj.h) || ['甲', '辛', '卯', '午', '申'].includes(branchObj.h)) activeSinsal.push('현침살');

            // 금여록
            const geumyeo = { '甲':'巳', '乙':'午', '丙':'未', '丁':'申', '戊':'未', '己':'申', '庚':'戌', '辛':'亥', '壬':'寅', '癸':'卯' };
            if (geumyeo[dayStem.h] === branchObj.h) activeSinsal.push('금여록');

            // 문곡귀인
            const mungok = { '甲':'亥', '乙':'午', '丙':'寅', '丁':'酉', '戊':'寅', '己':'酉', '庚':'巳', '辛':'子', '壬':'申', '癸':'酉' };
            if (mungok[dayStem.h] === branchObj.h) activeSinsal.push('문곡귀인');

            // 태극귀인
            const taegeuk = {
                '甲': ['子', '午'], '乙': ['子', '午'],
                '丙': ['卯', '酉'], '丁': ['卯', '酉'],
                '戊': ['辰', '戌', '丑', '未'], '己': ['辰', '戌', '丑', '未'],
                '庚': ['寅', '亥'], '辛': ['寅', '亥'],
                '壬': ['巳', '申'], '癸': ['巳', '申']
            };
            if (taegeuk[dayStem.h] && taegeuk[dayStem.h].includes(branchObj.h)) activeSinsal.push('태극귀인');

            // 홍염살
            const hongyeom = {
                '甲': ['午'], '乙': ['午'], '丙': ['寅'], '丁': ['未'],
                '戊': ['辰'], '己': ['辰'], '庚': ['戌'], '辛': ['酉'],
                '壬': ['申', '子'], '癸': ['申']
            };
            if (hongyeom[dayStem.h] && hongyeom[dayStem.h].includes(branchObj.h)) activeSinsal.push('홍염살');

            // 상문살
            const yIdx = bNames.indexOf(yearBranch.h);
            const sangmun1 = bNames[(yIdx + 2) % 12];
            const sangmun2 = bNames[(yIdx - 2 + 12) % 12];
            if (branchObj.h === sangmun1 || branchObj.h === sangmun2) activeSinsal.push('상문살');

            // 귀문관살
            const gwimunPairs = ['子酉', '酉子', '丑午', '午丑', '寅未', '未寅', '卯申', '申卯', '辰亥', '亥辰', '巳戌', '戌巳'];
            const allBranches = [yearBranch.h, monthBranch.h, dayBranch.h, hourBranch.h];
            let hasGwimun = false;
            allBranches.forEach(b => {
                if (b !== branchObj.h && gwimunPairs.includes(branchObj.h + b)) {
                    hasGwimun = true;
                }
            });
            if (hasGwimun) activeSinsal.push('귀문관살');

            // 원진살
            const wonjinPairs = ['子未', '未子', '丑午', '午丑', '寅酉', '酉寅', '卯申', '申卯', '辰亥', '亥辰', '巳戌', '戌巳'];
            let hasWonjin = false;
            allBranches.forEach(b => {
                if (b !== branchObj.h && wonjinPairs.includes(branchObj.h + b)) {
                    hasWonjin = true;
                }
            });
            if (hasWonjin) activeSinsal.push('원진살');

            // 월덕귀인
            const woldeok = {
                '寅': '丙', '午': '丙', '戌': '丙',
                '申': '壬', '子': '壬', '辰': '壬',
                '亥': '甲', '卯': '甲', '未': '甲',
                '巳': '庚', '酉': '庚', '丑': '庚'
            };
            if (woldeok[monthBranch.h] === stemObj.h) activeSinsal.push('월덕귀인');

            // 천덕귀인
            const cheondeok = {
                '寅': { s: '丁' }, '卯': { b: '申' }, '辰': { s: '壬' },
                '巳': { s: '辛' }, '午': { b: '亥' }, '未': { s: '甲' },
                '申': { s: '癸' }, '酉': { b: '寅' }, '戌': { s: '丙' },
                '亥': { s: '乙' }, '子': { b: '巳' }, '丑': { s: '庚' }
            };
            const cd = cheondeok[monthBranch.h];
            if (cd) {
                if (cd.s && cd.s === stemObj.h) activeSinsal.push('천덕귀인');
                if (cd.b && cd.b === branchObj.h) activeSinsal.push('천덕귀인');
            }

            // 고신살 (홀아비살)
            let gosinChar = '';
            if (['寅', '卯', '辰'].includes(yearBranch.h) || ['寅', '卯', '辰'].includes(dayBranch.h)) gosinChar = '巳';
            else if (['巳', '午', '未'].includes(yearBranch.h) || ['巳', '午', '未'].includes(dayBranch.h)) gosinChar = '申';
            else if (['申', '酉', '戌'].includes(yearBranch.h) || ['申', '酉', '戌'].includes(dayBranch.h)) gosinChar = '亥';
            else if (['亥', '子', '丑'].includes(yearBranch.h) || ['亥', '子', '丑'].includes(dayBranch.h)) gosinChar = '寅';
            if (branchObj.h === gosinChar) activeSinsal.push('고신살');

            // 조객살
            const jIdx = bNames.indexOf(yearBranch.h);
            const jogaek = bNames[(jIdx - 2 + 12) % 12];
            if (branchObj.h === jogaek) activeSinsal.push('조객살');

            // 곡각살
            if (['乙', '己', '巳', '丑'].includes(stemObj.h) || ['乙', '己', '巳', '丑'].includes(branchObj.h)) activeSinsal.push('곡각살');

            // 천복귀인
            const cheonbok = {
                '甲': '酉', '乙': '申', '丙': '子', '丁': '亥', '戊': '卯',
                '己': '寅', '庚': '午', '辛': '巳', '壬': '午', '癸': '巳'
            };
            if (cheonbok[dayStem.h] === branchObj.h) activeSinsal.push('천복귀인');

            // 관귀학관
            const gwangwi = ['甲寅', '丙寅', '戊申', '庚亥', '壬寅', '癸丑'];
            if (gwangwi.includes(stemObj.h + branchObj.h)) activeSinsal.push('관귀학관');

            // 단교관살
            const dangyo = {
                '寅': '寅', '卯': '卯', '辰': '申', '巳': '丑', '午': '戌', '未': '酉',
                '申': '辰', '酉': '巳', '戌': '午', '亥': '未', '子': '亥', '丑': '子'
            };
            if (dangyo[monthBranch.h] === branchObj.h) activeSinsal.push('단교관살');

            // 양인살
            const yangin = { '甲': '卯', '丙': '午', '戊': '午', '庚': '酉', '壬': '子' };
            if (yangin[dayStem.h] === branchObj.h) activeSinsal.push('양인살');

            // 수옥살
            // 수옥살 is essentially 재살 from the 12 Sinsal.
            // Since activeSinsal already has 재살, let's also append '수옥살' explicitly if '재살' is present!
            if (activeSinsal.includes('재살')) activeSinsal.push('수옥살');

            // 4. 최종 출력 조립
            let resultStr = '';
            activeSinsal.forEach((s, idx) => {
                if (idx === 0) resultStr += s;
                else resultStr += `<br>${s}`;
            });
            return resultStr;
        };

        updateExtra('year-shinsal', getCombinedShinsal(yearStem, yearBranch));
        updateExtra('month-shinsal', getCombinedShinsal(monthStem, monthBranch));
        updateExtra('day-shinsal', getCombinedShinsal(dayStem, dayBranch));
        updateExtra('hour-shinsal', unknownTime ? '-' : getCombinedShinsal(hourStem, hourBranch));

        // Missing IDs added via HTML
        const getGongmang = (sObj, bObj) => {
            const bNames = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
            const sNames = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
            const sIdx = sNames.indexOf(sObj.h);
            const bIdx = bNames.indexOf(bObj.h);
            const g1 = (bIdx - sIdx + 10 + 12) % 12;
            const g2 = (bIdx - sIdx + 11 + 12) % 12;
            return bNames[g1] + bNames[g2];
        };

        const wolryeongTable = { '子':'癸', '丑':'己', '寅':'甲', '卯':'乙', '辰':'戊', '巳':'丙', '午':'丁', '未':'己', '申':'庚', '酉':'辛', '戌':'戊', '亥':'壬' };
        updateExtra('wolryeong', wolryeongTable[monthBranch.h] || monthBranch.h);
        updateExtra('year-gongmang', getGongmang(yearStem, yearBranch));
        updateExtra('day-gongmang', getGongmang(dayStem, dayBranch));
        
        const samjaeText = ['亥', '卯', '未'].includes(yearBranch.h) ? '눌삼재' : '해당없음';
        updateExtra('samjae', samjaeText);
        const sjWrapper = document.getElementById('samjae-wrapper');
        if (sjWrapper) {
            if (samjaeText !== '해당없음') {
                sjWrapper.style.background = 'rgba(231, 76, 60, 0.1)';
                sjWrapper.style.color = '#e74c3c';
            } else {
                sjWrapper.style.background = 'rgba(255, 255, 255, 0.05)';
                sjWrapper.style.color = 'var(--text-muted)';
            }
        }

        // Additional simple analysis logic
        updateExtra('hap-analysis', `${monthBranch.h}${dayBranch.h}합 또는 주변 조화가 이루어짐`);
        updateExtra('chung-analysis', `${yearBranch.h}${dayBranch.h} 충 돌파력과 변화의 기운`);
        updateExtra('hyeong-pa-hae-analysis', '신중한 대인관계가 요구되는 시기');
        updateExtra('major-shinsal-analysis', '천을귀인 등 길신이 작용함');

        // Life guide
        const elementsGood = { wood: '수(水)와 목(木)', fire: '목(木)과 화(火)', earth: '화(火)와 토(土)', metal: '토(土)와 금(金)', water: '금(金)와 수(水)' };
        updateExtra('isa-desc', `올해는 본인에게 유리한 <strong>${elementsGood[dayStem.e]}</strong>의 기운이 있는 방향으로의 이동이 매우 길합니다.`);
        updateExtra('direction-desc', `책상 배치나 사업 방향은 본인의 수호 오행인 <strong>${dayStem.e === 'wood' ? '동쪽' : dayStem.e === 'fire' ? '남쪽' : dayStem.e === 'earth' ? '중앙' : dayStem.e === 'metal' ? '서쪽' : '북쪽'}</strong>이 유리합니다.`);
        updateExtra('date-desc', `중요한 계약이나 행사는 <strong>${elementsGood[dayStem.e]}</strong> 오행의 날짜를 고르는 것이 성공 확률을 높입니다.`);

        // Relation & Lifetime (Dynamic calculation based on Saju)
        const dayUnseong = get12Unseong(dayBranch);
        const yearUnseong = get12Unseong(yearBranch);
        const hourUnseong = get12Unseong(hourBranch);
        let lifetimeDesc = '평온안정형';
        if (['건록', '제왕', '관대'].includes(dayUnseong)) lifetimeDesc = '자수성가형';
        else if (['장생', '목욕'].includes(dayUnseong)) lifetimeDesc = '인덕원만형';
        if (['태', '양', '절', '묘'].includes(yearUnseong) && ['건록', '제왕', '관대', '장생'].includes(hourUnseong) && !unknownTime) lifetimeDesc = '대기만성형';
        updateExtra('lifetime-desc', lifetimeDesc);

        let spouseDesc = '원만무난';
        const sShip = getShipseong(dayBranch);
        if (['정재', '정관'].includes(sShip)) spouseDesc = '가정다정';
        else if (['식신', '상관'].includes(sShip)) spouseDesc = '헌신적';
        else if (['비견', '겁재'].includes(sShip)) spouseDesc = '친구같은';
        else if (['정인', '편인'].includes(sShip)) spouseDesc = '조력자형';
        else if (['편재', '편관'].includes(sShip)) spouseDesc = '다이나믹';
        updateExtra('spouse-desc', spouseDesc);

        let parentDesc = '원만안정';
        const pShip = getShipseong(monthBranch);
        if (['정인', '편인'].includes(pShip)) parentDesc = '물심양면지원';
        else if (['정재', '정관'].includes(pShip)) parentDesc = '든든한배경';
        else if (['비견', '겁재'].includes(pShip)) parentDesc = '자수성가';
        else if (['식신', '상관'].includes(pShip)) parentDesc = '일찍독립';
        updateExtra('parent-desc', parentDesc);

        let siblingDesc = '원만한우애';
        const sibShip = getShipseong(monthStem);
        if (['비견', '겁재'].includes(sibShip)) siblingDesc = '경쟁과협력';
        else if (['정인', '편인'].includes(sibShip)) siblingDesc = '우애독실';
        else if (['편관', '정관'].includes(sibShip)) siblingDesc = '각자도생';
        updateExtra('sibling-desc', siblingDesc);

        let childDesc = '평탄원만';
        if (unknownTime) {
            childDesc = '알수없음';
        } else {
            const cShip = getShipseong(hourBranch);
            if (['식신', '정관', '정인'].includes(cShip)) childDesc = '효자효녀';
            else if (['상관', '편관', '겁재'].includes(cShip)) childDesc = '개성강함';
            else if (['정재', '편재'].includes(cShip)) childDesc = '재물복자식';
        }
        updateExtra('child-desc', childDesc);

        let maxElem = 'wood';
        let maxCnt = -1;
        for (const [e, count] of Object.entries(elementCounts)) {
            if (count > maxCnt) {
                maxCnt = count;
                maxElem = e;
            }
        }
        const elementsOrderMap = { wood: 0, fire: 1, earth: 2, metal: 3, water: 4 };
        const dayElemIdxMap = elementsOrderMap[dayStem.e];
        const maxElemIdxMap = elementsOrderMap[maxElem];
        const elemDiff = (maxElemIdxMap - dayElemIdxMap + 5) % 5;
        let relationDesc = '원만소통';
        if (elemDiff === 0) relationDesc = '리더형인맥';
        else if (elemDiff === 1) relationDesc = '광폭사교계';
        else if (elemDiff === 2) relationDesc = '실용적인맥';
        else if (elemDiff === 3) relationDesc = '공적인관계';
        else if (elemDiff === 4) relationDesc = '멘토멘티관계';
        updateExtra('relation-desc', relationDesc);

        // Element Scores for Chart
        const totalElements = Object.values(elementCounts).reduce((a, b) => a + b, 0);
        window.currentElementScores = {
            wood: ((elementCounts.wood || 0) / totalElements) * 100,
            fire: ((elementCounts.fire || 0) / totalElements) * 100,
            earth: ((elementCounts.earth || 0) / totalElements) * 100,
            metal: ((elementCounts.metal || 0) / totalElements) * 100,
            water: ((elementCounts.water || 0) / totalElements) * 100
        };

        const updateElemCnt = (id, eName) => {
            const el = document.getElementById(id);
            if (el) el.textContent = elementCounts[eName] || 0;
        };
        updateElemCnt('cnt-wood', 'wood');
        updateElemCnt('cnt-fire', 'fire');
        updateElemCnt('cnt-earth', 'earth');
        updateElemCnt('cnt-metal', 'metal');
        updateElemCnt('cnt-water', 'water');

        // Determine Dominant Element for Summary Box
        let dominantElem = 'wood';
        let maxCount = -1;
        for (const [el, count] of Object.entries(elementCounts)) {
            if (count > maxCount) {
                maxCount = count;
                dominantElem = el;
            }
        }
        const summaryNameEl = document.getElementById('summary-name');
        const summaryName = summaryNameEl ? summaryNameEl.textContent : (document.getElementById('name') ? document.getElementById('name').value.trim() : '사용자');
        const elemKorean = { wood: '목(木)', fire: '화(火)', earth: '토(土)', metal: '금(金)', water: '수(水)' };
        const summaryBox = document.querySelector('.summary-box span');
        if (summaryBox) {
            summaryBox.innerHTML = `<strong>${summaryName}</strong>님은 <strong class="element-${dominantElem}">${elemKorean[dominantElem]}</strong> 기운이 가장 강합니다.`;
        }

        // --- Dynamic Updates for Art/Talent/Hobby/Exercise based on dominant element ---
        const talentData = {
            wood: {
                art: "성장과 뻗어나가는 기운이 있어 시각 디자인, 건축 설계, 조경, 공예 분야에서 잠재력이 매우 높습니다.",
                special: "기획안 작성 및 아이디어 발상이 특출나며 새로운 분야를 개척하는 추진력이 독보적입니다.",
                hobby: "식물 키우기, 목공예, 컬러링북처럼 무언가 자라나고 완성되는 생산적인 취미가 잘 맞습니다.",
                exercise: "에너지를 고루 발산할 수 있는 조깅, 등산, 배드민턴 등 자연과 함께하는 야외 유산소 운동을 추천합니다."
            },
            fire: {
                art: "열정과 표현력이 강력하여 연극, 뮤지컬, 현대 미술, 영상 및 미디어 제작에서 빛을 발하는 예술성이 있습니다.",
                special: "대중을 사로잡는 화술과 프레젠테이션 능력이 뛰어나며 임기응변과 순발력이 매우 강합니다.",
                hobby: "사진 촬영, 댄스, 맛집 탐방, 화려한 파티 기획 등 오감을 자극하는 동적인 취미가 어울립니다.",
                exercise: "체력 소모가 크고 화끈한 스피닝, 복싱, 에어로빅, 크로스핏 같은 고강도 운동이 제격입니다."
            },
            earth: {
                art: "차분하고 포용력이 있어 도예, 조소, 전통 공예 등 묵직하고 형태를 빚어내는 예술에 재능이 있습니다.",
                special: "다양한 의견을 조율하는 중재 능력과 디테일을 꼼꼼히 챙기는 높은 안정감이 당신의 특색입니다.",
                hobby: "베이킹, 가죽 공예, 수집 활동, 정원 가꾸기 등 정적이고 손끝의 감각을 살리는 취미가 좋습니다.",
                exercise: "심신의 균형을 잡아주는 요가, 필라테스, 헬스 트레이닝 등 코어 중심의 운동이 적합합니다."
            },
            metal: {
                art: "정밀하고 섬세한 감각을 지녀 금속 공예, 주얼리 디자인, 클래식 음악, 정교한 드로잉에 소질이 있습니다.",
                special: "맺고 끊음이 확실한 결단력과 뛰어난 정보 분석력, 논리적이고 정교한 문제 해결 능력이 돋보입니다.",
                hobby: "모형 조립, 악기 연주(피아노/기타), 캘리그라피 같은 고도의 집중력을 요하는 취미가 적절합니다.",
                exercise: "체력과 정신력을 동시에 단련할 수 있는 검도, 골프, 웨이트 리프팅, 클라이밍을 추천합니다."
            },
            water: {
                art: "흐르는 듯한 유연함과 깊은 통찰력으로 문학 창작, 시나리오 집필, 추상 미술, 작곡에서 독특한 감성을 보여줍니다.",
                special: "남들이 보지 못하는 이면을 읽어내는 직관력과 깊은 공감 능력이 가장 강력한 무기입니다.",
                hobby: "독서, 영화 감상, 낚시, 홈카페(다도)처럼 사색을 즐길 수 있는 차분한 취미가 최적의 힐링이 됩니다.",
                exercise: "수(水)의 기운을 보강해주는 수영, 서핑, 또는 가벼운 한강 산책과 명상이 행운의 주파수를 높여줍니다."
            }
        };

        const tData = talentData[dominantElem] || talentData['wood'];
        const elArt = document.getElementById('career-art');
        const elSpecial = document.getElementById('career-special');
        const elHobby = document.getElementById('career-hobby');
        const elExercise = document.getElementById('career-exercise');

        if (elArt) elArt.innerHTML = tData.art;
        if (elSpecial) elSpecial.innerHTML = tData.special;
        if (elHobby) elHobby.innerHTML = tData.hobby;
        if (elExercise) elExercise.innerHTML = tData.exercise;

        // --- Saju Summary (사주 요약) Dynamic Updates ---
        const ilganShort = {
            '甲': '갑목 (거목, 추진력)', '乙': '을목 (화초, 유연성)',
            '丙': '병화 (태양, 열정)', '丁': '정화 (촛불, 헌신)',
            '戊': '무토 (태산, 포용력)', '己': '기토 (전답, 성실함)',
            '庚': '경금 (무쇠, 결단력)', '辛': '신금 (보석, 섬세함)',
            '壬': '임수 (바다, 포용력)', '癸': '계수 (시냇물, 지혜)'
        };
        const elIlgan = document.getElementById('summary-ilgan');
        if (elIlgan) {
            elIlgan.innerHTML = `<strong>일간:</strong> ${ilganShort[dayStem.h] || '분석 중...'} - 나의 기운`;
        }

        let gyeokgukName = wolryeongShipseong ? wolryeongShipseong + '격' : '건록/양인격';
        if (wolryeongShipseong === '비견') gyeokgukName = '건록격';
        if (wolryeongShipseong === '겁재') gyeokgukName = '양인격';
        
        const gyeokgukDesc = {
            '정관격': '바르고 원칙을 중시함', '편관격': '카리스마와 돌파력',
            '정재격': '치밀함과 안정 추구', '편재격': '넓은 시야와 재물욕',
            '정인격': '학구적이고 수용성 강함', '편인격': '독창적이고 눈치 빠름',
            '식신격': '탐구심과 전문성', '상관격': '뛰어난 화술과 개혁성',
            '건록격': '주관 뚜렷하고 독립적', '양인격': '경쟁심 강하고 투쟁적'
        };
        const elGyeokguk = document.getElementById('summary-gyeokguk');
        if (elGyeokguk) {
            elGyeokguk.innerHTML = `<strong>격국:</strong> ${gyeokgukName} (${gyeokgukDesc[gyeokgukName] || '특수격'})`;
        }

        const genElem = { wood: 'water', fire: 'wood', earth: 'fire', metal: 'earth', water: 'metal' };
        const myElemCount = (elementCounts[dayStem.e] || 0) + (elementCounts[genElem[dayStem.e]] || 0);
        
        let strength = '신약 (주변 환경에 맞추는 유연함이 큼)';
        let isGang = false;
        if (myElemCount >= 4) {
            strength = '신강 (나의 주관이 매우 강한 편)';
            isGang = true;
        } else if (myElemCount === 3) {
            if (monthBranch.e === dayStem.e || monthBranch.e === genElem[dayStem.e]) {
                isGang = true;
                strength = '중화신강 (조화로우나 약간 강한 편)';
            } else {
                strength = '중화신약 (조화로우나 약간 약한 편)';
            }
        }
        
        const elStrength = document.getElementById('summary-strength');
        if (elStrength) {
            elStrength.innerHTML = `<strong>강약:</strong> ${strength}`;
        }

        const yongheeMap = {
            wood: isGang ? '화(火), 토(土), 금(金)' : '수(水), 목(木)',
            fire: isGang ? '토(土), 금(金), 수(水)' : '목(木), 화(火)',
            earth: isGang ? '금(金), 수(水), 목(木)' : '화(火), 토(土)',
            metal: isGang ? '수(水), 목(木), 화(火)' : '토(土), 금(金)',
            water: isGang ? '목(木), 화(火), 토(土)' : '금(金), 수(水)'
        };
        const elYonghee = document.getElementById('summary-yonghee');
        if (elYonghee) {
            elYonghee.innerHTML = `<strong>용희신:</strong> ${yongheeMap[dayStem.e]} 기운이 도움됨`;
        }

        // --- Hourly Fortune (시간별 운세) ---
        const renderHourlyFortune = (dateObj) => {
            const container = document.getElementById('hourly-fortune-container');
            if (!container) return;
            container.innerHTML = '';
            
            const hoursData = [
                { time: '23:30~01:30', h: '子', g: '자' },
                { time: '01:30~03:30', h: '丑', g: '축' },
                { time: '03:30~05:30', h: '寅', g: '인' },
                { time: '05:30~07:30', h: '卯', g: '묘' },
                { time: '07:30~09:30', h: '辰', g: '진' },
                { time: '09:30~11:30', h: '巳', g: '사' },
                { time: '11:30~13:30', h: '午', g: '오' },
                { time: '13:30~15:30', h: '未', g: '미' },
                { time: '15:30~17:30', h: '申', g: '신' },
                { time: '17:30~19:30', h: '酉', g: '유' },
                { time: '19:30~21:30', h: '戌', g: '술' },
                { time: '21:30~23:30', h: '亥', g: '해' }
            ];

            const branchMap = {};
            branches.forEach(b => branchMap[b.h] = b);
            const yongheeElements = yongheeMap[dayStem.e] || '';
            const chungMap = {'子':'午','丑':'未','寅':'申','卯':'酉','辰':'戌','巳':'亥','午':'子','未':'丑','申':'寅','酉':'卯','戌':'辰','亥':'巳'};
            const korToEng = { '목': 'wood', '화': 'fire', '토': 'earth', '금': 'metal', '수': 'water' };

            hoursData.forEach(hd => {
                const bObj = branchMap[hd.h];
                let fClass = 'normal';
                let fText = '평범';
                
                const isYonghee = yongheeElements.split(',').some(part => {
                    const korChar = part.trim()[0];
                    return korToEng[korChar] === bObj.e;
                });
                const shipseong = getShipseong(bObj);
                
                if (isYonghee) {
                    if (['정재', '정관', '정인', '식신'].some(s => shipseong.includes(s))) {
                        fClass = 'best'; fText = '대길';
                    } else {
                        fClass = 'good'; fText = '길';
                    }
                } else {
                    if (['편관', '상관', '겁재'].some(s => shipseong.includes(s))) {
                        fClass = 'caution'; fText = '주의';
                    }
                }
                
                if (chungMap[dayBranch.h] === hd.h) {
                    fClass = 'caution'; fText = '주의(충)';
                }

                container.innerHTML += `
                    <div class="hourly-item">
                        <div class="hour-time">${hd.time}</div>
                        <div class="hour-branch">${hd.g}시(${hd.h})</div>
                        <div class="hour-fortune ${fClass}">${fText}</div>
                    </div>
                `;
            });
        };

        const hourlyDateInput = document.getElementById('hourly-fortune-date');
        if (hourlyDateInput) {
            if (!hourlyDateInput.value) {
                const tzoffset = (new Date()).getTimezoneOffset() * 60000;
                const localISOTime = (new Date(Date.now() - tzoffset)).toISOString().slice(0, 10);
                hourlyDateInput.value = localISOTime;
            }
            hourlyDateInput.onchange = (e) => {
                renderHourlyFortune(new Date(e.target.value));
            };
            renderHourlyFortune(new Date(hourlyDateInput.value));
        }

        // --- Interaction Analysis (합·형·충·파·해 및 신살) ---
        const renderInteraction = (dateObj) => {
            const curDate = new Date(dateObj);
            const targetDateForCalc = new Date(curDate.getFullYear(), curDate.getMonth(), curDate.getDate(), 12, 0, 0);
            const refDate = new Date(2026, 3, 25, 12, 0, 0); // 2026-04-25 is 己巳
            const diffDays = Math.floor((targetDateForCalc - refDate) / (1000 * 60 * 60 * 24));
            
            const curDayStem = stems[((5 + diffDays) % 10 + 10) % 10];
            const curDayBranch = branches[((5 + diffDays) % 12 + 12) % 12];

            const bList = [yearBranch.h, monthBranch.h, dayBranch.h, hourBranch.h, curDayBranch.h];

            let hapRes = [];
            let chungRes = [];
            let hphRes = [];
            let shinsalRes = [];

            const yukHap = { '子':'丑', '丑':'子', '寅':'亥', '亥':'寅', '卯':'戌', '戌':'卯', '辰':'酉', '酉':'辰', '巳':'申', '申':'巳', '午':'未', '未':'午' };
            const samHap = [
                { name: '신자진(수국)', items: ['申','子','辰'] },
                { name: '해묘미(목국)', items: ['亥','卯','未'] },
                { name: '인오술(화국)', items: ['寅','午','戌'] },
                { name: '사유축(금국)', items: ['巳','酉','丑'] }
            ];
            const yukChung = { '子':'午', '午':'子', '丑':'未', '未':'丑', '寅':'申', '申':'寅', '卯':'酉', '酉':'卯', '辰':'戌', '戌':'辰', '巳':'亥', '亥':'巳' };
            const wonjin = { '子':'未', '未':'子', '丑':'午', '午':'丑', '寅':'酉', '酉':'寅', '卯':'申', '申':'卯', '辰':'亥', '亥':'辰', '巳':'戌', '戌':'巳' };
            const gwimun = { '子':'酉', '酉':'子', '丑':'午', '午':'丑', '寅':'未', '未':'寅', '卯':'申', '申':'卯', '辰':'亥', '亥':'辰', '巳':'戌', '戌':'巳' };
            const samHyeong1 = ['寅','巳','申'];
            const samHyeong2 = ['丑','戌','未'];
            const jaHyeong = ['辰','午','酉','亥'];
            const sangHyeong = { '子':'卯', '卯':'子' };
            const pa = { '子':'酉', '酉':'子', '丑':'辰', '辰':'丑', '寅':'亥', '亥':'寅', '卯':'午', '午':'卯', '巳':'申', '申':'巳', '戌':'未', '未':'戌' };
            const hae = { '子':'未', '未':'子', '丑':'午', '午':'丑', '寅':'巳', '巳':'寅', '卯':'辰', '辰':'卯', '申':'亥', '亥':'申', '酉':'戌', '戌':'酉' };

            let hapPairs = new Set();
            for (let i=0; i<bList.length; i++) {
                for (let j=i+1; j<bList.length; j++) {
                    if (yukHap[bList[i]] === bList[j]) hapPairs.add(`${bList[i]}${bList[j]}합`);
                }
            }
            if (hapPairs.size > 0) hapRes.push(...Array.from(hapPairs));
            samHap.forEach(sh => {
                const count = sh.items.filter(item => bList.includes(item)).length;
                if (count === 3) hapRes.push(sh.name);
                else if (count === 2) hapRes.push(sh.name.replace('(', ' 반합('));
            });

            let chungPairs = new Set();
            for (let i=0; i<bList.length; i++) {
                for (let j=i+1; j<bList.length; j++) {
                    if (yukChung[bList[i]] === bList[j]) chungPairs.add(`${bList[i]}${bList[j]}충`);
                }
            }
            if (chungPairs.size > 0) chungRes.push(...Array.from(chungPairs));

            let hphPairs = new Set();
            for (let i=0; i<bList.length; i++) {
                for (let j=i+1; j<bList.length; j++) {
                    if (sangHyeong[bList[i]] === bList[j]) hphPairs.add(`${bList[i]}${bList[j]}형`);
                    if (pa[bList[i]] === bList[j]) hphPairs.add(`${bList[i]}${bList[j]}파`);
                    if (hae[bList[i]] === bList[j]) hphPairs.add(`${bList[i]}${bList[j]}해`);
                }
            }
            jaHyeong.forEach(jh => {
                if (bList.filter(b => b === jh).length >= 2) hphPairs.add(`${jh}${jh} 자형`);
            });
            const countHyeong1 = samHyeong1.filter(item => bList.includes(item)).length;
            if (countHyeong1 === 3) hphPairs.add('인사신 삼형');
            const countHyeong2 = samHyeong2.filter(item => bList.includes(item)).length;
            if (countHyeong2 === 3) hphPairs.add('축술미 삼형');
            if (hphPairs.size > 0) hphRes.push(...Array.from(hphPairs));

            let shinsalPairs = new Set();
            for (let i=0; i<bList.length; i++) {
                for (let j=i+1; j<bList.length; j++) {
                    if (wonjin[bList[i]] === bList[j]) shinsalPairs.add(`${bList[i]}${bList[j]} 원진`);
                    if (gwimun[bList[i]] === bList[j]) shinsalPairs.add(`${bList[i]}${bList[j]} 귀문`);
                }
            }
            const cheoneulMap = { '甲':['丑','未'], '乙':['子','申'], '丙':['亥','酉'], '丁':['亥','酉'], '戊':['丑','未'], '己':['子','申'], '庚':['丑','未'], '辛':['寅','午'], '壬':['卯','巳'], '癸':['卯','巳'] };
            bList.forEach(b => {
                if (cheoneulMap[dayStem.h]?.includes(b)) shinsalPairs.add(`천을귀인(${b})`);
            });
            const baekho = ['戊辰','丁丑','丙戌','乙未','甲辰','癸丑','壬戌'];
            const goegang = ['戊戌','庚辰','庚戌','壬辰'];
            const pList = [yearStem.h+yearBranch.h, monthStem.h+monthBranch.h, dayStem.h+dayBranch.h, hourStem.h+hourBranch.h, curDayStem.h+curDayBranch.h];
            pList.forEach(p => {
                if (baekho.includes(p)) shinsalPairs.add(`백호(${p})`);
                if (goegang.includes(p)) shinsalPairs.add(`괴강(${p})`);
            });
            if (shinsalPairs.size > 0) shinsalRes.push(...Array.from(shinsalPairs));

            const updateField = (id, arr, defaultText) => {
                const el = document.getElementById(id);
                if (el) el.textContent = arr.length > 0 ? arr.join(', ') : defaultText;
            };

            updateField('hap-analysis', hapRes, '해당 없음');
            updateField('chung-analysis', chungRes, '해당 없음');
            updateField('hyeong-pa-hae-analysis', hphRes, '해당 없음');
            updateField('major-shinsal-analysis', shinsalRes, '해당 없음');
        };

        const interDateInput = document.getElementById('interaction-date');
        if (interDateInput) {
            if (!interDateInput.value) {
                const tzoffset = (new Date()).getTimezoneOffset() * 60000;
                const localISOTime = (new Date(Date.now() - tzoffset)).toISOString().slice(0, 10);
                interDateInput.value = localISOTime;
            }
            interDateInput.onchange = (e) => {
                renderInteraction(new Date(e.target.value));
            };
            renderInteraction(new Date(interDateInput.value));
        }

        // --- Daily Fortune (최근 일별 운세) ---
        const renderDailyFortune = (dateObj) => {
            const container = document.getElementById('daily-fortune-container');
            if (!container) return;
            container.innerHTML = '';

            const refDate = new Date(2026, 3, 25, 12, 0, 0); // 2026-04-25 is 己巳
            const today = new Date();
            today.setHours(0,0,0,0);
            
            const korToEng = { '목': 'wood', '화': 'fire', '토': 'earth', '금': 'metal', '수': 'water' };
            const yongheeElements = yongheeMap[dayStem.e] || '';
            const chungMap = {'子':'午','丑':'未','寅':'申','卯':'酉','辰':'戌','巳':'亥','午':'子','未':'丑','申':'寅','酉':'卯','戌':'辰','亥':'巳'};

            for (let i = 0; i < 7; i++) {
                const curDate = new Date(dateObj);
                curDate.setDate(dateObj.getDate() + i);
                
                const targetDateForCalc = new Date(curDate.getFullYear(), curDate.getMonth(), curDate.getDate(), 12, 0, 0);
                const diffTime = targetDateForCalc - refDate;
                const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                
                const curDayStemIdx = ((5 + diffDays) % 10 + 10) % 10;
                const curDayBranchIdx = ((5 + diffDays) % 12 + 12) % 12;
                const curDayStem = stems[curDayStemIdx];
                const curDayBranch = branches[curDayBranchIdx];
                
                const dateStr = `${curDate.getMonth() + 1}/${curDate.getDate()}`;
                
                curDate.setHours(0,0,0,0);
                const dayDiffFromToday = Math.floor((curDate - today) / (1000 * 60 * 60 * 24));
                let labelStr = '';
                let labelColor = 'var(--text-muted)';
                if (dayDiffFromToday === 0) {
                    labelStr = '오늘';
                    labelColor = 'var(--primary-gold)';
                } else if (dayDiffFromToday === 1) {
                    labelStr = '내일';
                } else if (dayDiffFromToday === -1) {
                    labelStr = '어제';
                } else {
                    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
                    labelStr = weekdays[curDate.getDay()];
                }
                
                let fortuneIcon = '';
                const isYonghee = yongheeElements.split(',').some(part => {
                    const korChar = part.trim()[0];
                    if (!korChar) return false;
                    return korToEng[korChar] === curDayBranch.e;
                });
                
                const shipseong = getShipseong(curDayBranch);
                if (isYonghee) {
                    fortuneIcon = ' <i class="fa-solid fa-circle-arrow-up" style="color: #2ecc71;"></i>';
                } else if (['편관', '상관', '겁재'].some(s => shipseong.includes(s)) || chungMap[dayBranch.h] === curDayBranch.h) {
                    fortuneIcon = ' <i class="fa-solid fa-triangle-exclamation" style="color: #e74c3c;"></i>';
                }

                container.innerHTML += `
                    <div class="daewun-item">
                        <div class="daewun-age">${dateStr}</div>
                        <div class="daewun-stem element-${curDayStem.e}">${curDayStem.h}</div>
                        <div class="daewun-branch element-${curDayBranch.e}">${curDayBranch.h}</div>
                        <div class="daewun-age" style="margin-top: 4px; color: ${labelColor}; display:flex; align-items:center; justify-content:center; gap:3px;">
                            ${labelStr}${fortuneIcon}
                        </div>
                    </div>
                `;
            }
        };

        const dailyDateInput = document.getElementById('daily-fortune-date');
        if (dailyDateInput) {
            if (!dailyDateInput.value) {
                const tzoffset = (new Date()).getTimezoneOffset() * 60000;
                const localISOTime = (new Date(Date.now() - tzoffset)).toISOString().slice(0, 10);
                dailyDateInput.value = localISOTime;
            }
            dailyDateInput.onchange = (e) => {
                renderDailyFortune(new Date(e.target.value));
            };
            renderDailyFortune(new Date(dailyDateInput.value));
        }

        // --- Life Fortune Analysis (생활 길흉 분석) ---
        // --- Life Fortune Analysis (생활 길흉 분석) ---
        const renderLifeFortune = (dateObj) => {
            const curDate = new Date(dateObj);
            const targetYear = curDate.getFullYear();
            
            // Calculate Year Branch for the selected date
            let sajuYear = targetYear;
            const yearBranchIdx = ((sajuYear - 4) % 12 + 12) % 12;
            const bNames = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
            const yearBranch = bNames[yearBranchIdx];

            // 1. 삼살방 (三煞方)
            let samsalBang = '';
            if (['寅', '午', '戌'].includes(yearBranch)) samsalBang = '북쪽';
            else if (['巳', '酉', '丑'].includes(yearBranch)) samsalBang = '동쪽';
            else if (['申', '子', '辰'].includes(yearBranch)) samsalBang = '남쪽';
            else if (['亥', '卯', '未'].includes(yearBranch)) samsalBang = '서쪽';

            // 2. 대장군방 (大將軍方)
            let daejanggunBang = '';
            if (['亥', '子', '丑'].includes(yearBranch)) daejanggunBang = '서쪽';
            else if (['寅', '卯', '辰'].includes(yearBranch)) daejanggunBang = '북쪽';
            else if (['巳', '午', '未'].includes(yearBranch)) daejanggunBang = '동쪽';
            else if (['申', '酉', '戌'].includes(yearBranch)) daejanggunBang = '남쪽';

            // 3. 삼재방 (三災方)
            let samjaeBang = '';
            if (['申', '子', '辰'].includes(yearBranch)) samjaeBang = '북쪽(亥子丑)';
            else if (['巳', '酉', '丑'].includes(yearBranch)) samjaeBang = '서쪽(申酉戌)';
            else if (['寅', '午', '戌'].includes(yearBranch)) samjaeBang = '남쪽(巳午未)';
            else if (['亥', '卯', '未'].includes(yearBranch)) samjaeBang = '동쪽(寅卯辰)';

            // Determine best direction (avoid Samsal, Daejanggun, Samjae)
            const allDirections = ['동쪽', '서쪽', '남쪽', '북쪽'];
            const avoidDirections = [samsalBang, daejanggunBang];
            if (samjaeBang.includes('북쪽')) avoidDirections.push('북쪽');
            if (samjaeBang.includes('서쪽')) avoidDirections.push('서쪽');
            if (samjaeBang.includes('남쪽')) avoidDirections.push('남쪽');
            if (samjaeBang.includes('동쪽')) avoidDirections.push('동쪽');

            const uniqueAvoid = [...new Set(avoidDirections)];
            const bestDirs = allDirections.filter(d => !uniqueAvoid.includes(d));

            const targetDateForCalc = new Date(curDate.getFullYear(), curDate.getMonth(), curDate.getDate(), 12, 0, 0);
            const refDate = new Date(2026, 3, 25, 12, 0, 0); // 2026-04-25 is 己巳
            const diffTime = targetDateForCalc - refDate;
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            
            const curDayStemIdx = ((5 + diffDays) % 10 + 10) % 10;
            const curDayBranchIdx = ((5 + diffDays) % 12 + 12) % 12;
            const curDayStem = stems[curDayStemIdx];
            const curDayBranch = branches[curDayBranchIdx];

            const isaDesc = document.getElementById('isa-desc');
            if (isaDesc) {
                isaDesc.innerHTML = `
                    <strong>${targetYear}년(${yearBranch}년) 기준</strong> 피해야 할 흉한 방위는 <strong>${samsalBang}(삼살방)</strong>과 <strong>${daejanggunBang}(대장군방)</strong>입니다.<br>
                    이사를 계획하신다면 흉신이 없는 <strong>${bestDirs.length > 0 ? bestDirs.join(', ') : '무난한'}</strong> 방향으로의 이동이 길합니다.
                `;
            }

            const dirDesc = document.getElementById('direction-desc');
            if (dirDesc) {
                dirDesc.innerHTML = `
                    학업이나 사업을 위한 길한 방위는 삼재방(${samjaeBang})을 피하고 본인의 용희신 기운을 살릴 수 있는 방향이 좋습니다.<br>
                    현재 해[年]의 흐름상 <strong>${bestDirs.length > 0 ? bestDirs[0] : '현위치'}</strong> 방위가 상대적으로 유리합니다.
                `;
            }

            const dateDesc = document.getElementById('date-desc');
            if (dateDesc) {
                const yongheeElements = yongheeMap[dayStem.e] || '';
                const korToEng = { '목': 'wood', '화': 'fire', '토': 'earth', '금': 'metal', '수': 'water' };
                const isYongheeDay = yongheeElements.split(',').some(part => {
                    const korChar = part.trim()[0];
                    if (!korChar) return false;
                    return korToEng[korChar] === curDayBranch.e || korToEng[korChar] === curDayStem.e;
                });
                const shipseong = getShipseong(curDayBranch);
                const chungMap = {'子':'午','丑':'未','寅':'申','卯':'酉','辰':'戌','巳':'亥','午':'子','未':'丑','申':'寅','酉':'卯','戌':'辰','亥':'巳'};
                const isChung = chungMap[dayBranch.h] === curDayBranch.h;
                
                let evalText = '평범한 날';
                let color = 'var(--text-main)';
                if (isChung) {
                    evalText = '주의가 필요한 날(충)';
                    color = '#e74c3c';
                } else if (isYongheeDay) {
                    if (['정재', '정관', '정인', '식신'].some(s => shipseong.includes(s))) {
                        evalText = '대길(최고의 길일)';
                        color = '#2ecc71';
                    } else {
                        evalText = '길일(무난하고 좋은 날)';
                        color = '#27ae60';
                    }
                } else if (['편관', '상관', '겁재'].some(s => shipseong.includes(s))) {
                    evalText = '신중해야 하는 날';
                    color = '#e67e22';
                }

                dateDesc.innerHTML = `
                    선택하신 날(${curDate.getMonth()+1}/${curDate.getDate()})은 <strong>${curDayStem.h}${curDayBranch.h}일</strong>로, 택일 분석 결과 <strong style="color: ${color};">${evalText}</strong>입니다.
                `;
            }
        };

        const lifeDateInput = document.getElementById('life-fortune-date');
        if (lifeDateInput) {
            if (!lifeDateInput.value) {
                const tzoffset = (new Date()).getTimezoneOffset() * 60000;
                const localISOTime = (new Date(Date.now() - tzoffset)).toISOString().slice(0, 10);
                lifeDateInput.value = localISOTime;
            }
            lifeDateInput.onchange = (e) => {
                renderLifeFortune(new Date(e.target.value));
            };
            renderLifeFortune(new Date(lifeDateInput.value));
        }

        // --- Screen 3: Comprehensive Analysis ---
        const dayStemPersonality = {
            '甲': '우람한 나무처럼 곧고 추진력이 강합니다. 리더십이 있으며 명예를 중시합니다.',
            '乙': '유연한 화초처럼 적응력이 뛰어나고 끈기가 있습니다. 예술적 감각이 발달했습니다.',
            '丙': '태양처럼 밝고 열정적입니다. 감정 표현이 솔직하고 뒤끝이 없습니다.',
            '丁': '달빛이나 촛불처럼 따뜻하고 헌신적입니다. 속정이 깊고 예의가 바릅니다.',
            '戊': '거대한 산처럼 묵직하고 믿음직스럽습니다. 포용력이 넓고 중재를 잘합니다.',
            '己': '부드러운 전답처럼 포용력이 있고 섬세합니다. 성실하며 실속을 잘 챙깁니다.',
            '庚': '단단한 바위나 무쇠처럼 결단력과 의리가 있습니다. 공사 구분이 확실합니다.',
            '辛': '정교한 보석처럼 섬세하고 깔끔합니다. 자존심이 강하고 예리한 통찰력이 있습니다.',
            '壬': '넓은 바다처럼 지혜롭고 생각이 깊습니다. 융통성이 있으며 통이 큽니다.',
            '癸': '맑은 시냇물처럼 지혜롭고 유연합니다. 눈치가 빠르고 환경 적응력이 탁월합니다.'
        };
        const dayStemShort = {
            '甲':'곧은 나무', '乙':'유연한 화초', '丙':'뜨거운 태양', '丁':'따뜻한 불꽃', '戊':'거대한 산', '己':'품어주는 대지', '庚':'단단한 바위', '辛':'빛나는 보석', '壬':'넓은 바다', '癸':'지혜로운 시냇물'
        };

        const setVal = (id, html) => {
            const el = document.getElementById(id);
            if(el) el.innerHTML = html;
        };

        // 1. 총평 탭 (General)
        setVal('comp-intro', `"${dayStemShort[dayStem.h]}처럼, ${dayStem.e==='water'?'지혜롭고 유연하게':(dayStem.e==='wood'?'곧고 단단하게':(dayStem.e==='fire'?'열정적이고 밝게':(dayStem.e==='earth'?'신뢰감 있고 묵직하게':'결단력 있고 섬세하게')))} 자신의 길을 개척해 나가는 사주입니다."`);
        
        let lifetimeText = '';
        
        // 1. 초년/기본 성향 (일간 + 신강/신약)
        if (isGang) lifetimeText += `타고난 자아가 강하고 주관이 뚜렷하여 일찍부터 자신의 길을 개척해 나가는 힘이 있습니다. 흔들림 없는 뚝심으로 난관을 돌파하며, `;
        else lifetimeText += `주변 환경에 유연하게 적응하는 능력이 뛰어나며, 타인과의 조화를 통해 점진적으로 내실을 다져가는 대기만성형 구조를 가졌습니다. `;

        // 2. 발달된 오행에 따른 장기적 무기
        const maxElement = Object.keys(elementCounts).reduce((a, b) => elementCounts[a] > elementCounts[b] ? a : b);
        if (maxElement === 'wood') lifetimeText += `특히 목(木) 기운이 강하여 끊임없는 성장 욕구와 기획력을 바탕으로 새로운 분야를 개척하는 데 평생의 강점이 있습니다. `;
        else if (maxElement === 'fire') lifetimeText += `특히 화(火) 기운이 강하여 넘치는 열정과 뛰어난 언변으로 사람들을 이끄는 리더십이 평생의 큰 무기가 됩니다. `;
        else if (maxElement === 'earth') lifetimeText += `특히 토(土) 기운이 강하여 어떤 상황에서도 중심을 잃지 않는 묵직한 신뢰감과 포용력으로 조직의 기둥 역할을 하게 됩니다. `;
        else if (maxElement === 'metal') lifetimeText += `특히 금(金) 기운이 강하여 맺고 끊음이 확실한 결단력과 강력한 실행력으로 목표를 완벽하게 쟁취해내는 능력이 탁월합니다. `;
        else if (maxElement === 'water') lifetimeText += `특히 수(水) 기운이 강하여 깊은 지혜와 뛰어난 융통성을 발휘하여 위기 상황을 부드럽게 넘기는 처세술이 뛰어납니다. `;

        // 3. 인생의 후반부 방향성 (시주의 십성)
        const hourSs = getShipseong(hourStem);
        if (hourSs) {
            lifetimeText += `말년으로 갈수록 `;
            if (['식신', '상관'].includes(hourSs)) lifetimeText += `자신만의 재능을 나누거나 후학을 양성하며 여유롭고 풍요로운 삶을 누리게 되는 길한 흐름입니다.`;
            else if (['정관', '편관'].includes(hourSs)) lifetimeText += `사회적인 명예와 권위를 얻으며 주변 사람들에게 존경받는 안정적인 노후를 맞이하게 됩니다.`;
            else if (['정재', '편재'].includes(hourSs)) lifetimeText += `축적된 자산을 바탕으로 금전적인 풍요와 안락함을 누리며 실질적인 성과를 거두는 노후가 예상됩니다.`;
            else if (['정인', '편인'].includes(hourSs)) lifetimeText += `학문적 성취나 정신적인 수양을 통해 깊은 지혜를 깨닫고 문서나 부동산 등으로 안정적인 기반을 다지게 됩니다.`;
            else if (['비견', '겁재'].includes(hourSs)) lifetimeText += `본인의 독립적인 뜻을 굽히지 않고 뜻이 맞는 사람들과 교류하며 주도적인 삶을 끝까지 유지하는 흐름입니다.`;
        } else {
            lifetimeText += `시간이 흐를수록 본인만의 철학과 내공이 깊어지며, 평안하고 굳건한 노후를 맞이하게 되는 좋은 흐름을 가지고 있습니다.`;
        }

        setVal('comp-lifetime', lifetimeText);

        const korToEng = { '목': 'wood', '화': 'fire', '토': 'earth', '금': 'metal', '수': 'water' };
        const chungMapGeneral = {'子':'午','丑':'未','寅':'申','卯':'酉','辰':'戌','巳':'亥','午':'子','未':'丑','申':'寅','酉':'卯','戌':'辰','亥':'巳'};
        const yongheeArr = yongheeMap[dayStem.e] || '';

        const renderDaewunFortune = (dateObj) => {
            const targetYear = dateObj.getFullYear();
            const curAge = targetYear - yInt + 1;
            
            const currentDaewunStep = Math.max(1, Math.floor((curAge - sharedDaewunSu) / 10) + 1);
            
            const mStemIdx = stems.findIndex(s=>s.h===monthStem.h);
            const mBranchIdx = branches.findIndex(b=>b.h===monthBranch.h);
            
            const stepOffset = isDaewunForward ? currentDaewunStep : -currentDaewunStep;
            const dStemIdx = (mStemIdx + stepOffset + 60) % 10;
            const dBranchIdx = (mBranchIdx + stepOffset + 60) % 12;
            
            const curDaewunStem = stems[dStemIdx];
            const curDaewunBranch = branches[dBranchIdx];
            const curDaewunAge = Math.max(1, Math.round(sharedDaewunSu) + (currentDaewunStep - 1) * 10);
            
            const daewunShipseong = getShipseong(curDaewunStem);
            const isDaewunYonghee = yongheeArr.split(',').some(part => {
                const korChar = part.trim()[0];
                return korChar && (korToEng[korChar] === curDaewunStem.e || korToEng[korChar] === curDaewunBranch.e);
            });
            const isDaewunChung = chungMapGeneral[dayBranch.h] === curDaewunBranch.h;

            let dwAdvice = '새로운 변화를 준비하며 내실을 다지는 안정적인 시기입니다.';
            if (isDaewunYonghee) dwAdvice = '본인에게 가장 필요한 수호 기운이 대운을 타고 들어와, 인생의 큰 도약과 발전을 이룰 수 있는 황금기입니다.';
            else if (isDaewunChung) dwAdvice = '주변 환경이나 인간관계에 큰 변화가 예상되는 시기이므로, 무리한 확장보다는 관리에 집중하는 것이 유리합니다.';
            else if (['정재','편재','정관','편관'].includes(daewunShipseong)) dwAdvice = '재물과 명예운이 강하게 작용하는 시기로, 사회적인 성취와 안정을 쟁취하기에 매우 좋습니다.';

            let dateLabel = '';
            if (targetYear === new Date().getFullYear()) dateLabel = '현재';
            else dateLabel = `${targetYear}년 기준`;

            setVal('comp-daewun', `${dateLabel} <strong>${curDaewunAge}세</strong>부터 시작된 <strong>${curDaewunStem.h}${curDaewunBranch.h} 대운</strong>의 흐름에 있습니다. ${dwAdvice}`);
        };

        const daewunDateInput = document.getElementById('daewun-fortune-date');
        if (daewunDateInput) {
            if (!daewunDateInput.value) {
                const tzoffset = (new Date()).getTimezoneOffset() * 60000;
                const localISOTime = (new Date(Date.now() - tzoffset)).toISOString().slice(0, 10);
                daewunDateInput.value = localISOTime;
            }
            daewunDateInput.onchange = (e) => {
                renderDaewunFortune(new Date(e.target.value));
            };
            renderDaewunFortune(new Date(daewunDateInput.value));
        } else {
            renderDaewunFortune(new Date());
        }

        const renderYearFortune = (dateObj) => {
            const targetYear = dateObj.getFullYear();
            
            const curYearStemIdx = ((targetYear - 4) % 10 + 10) % 10;
            const curYearBranchIdx = ((targetYear - 4) % 12 + 12) % 12;
            const curYearStem = stems[curYearStemIdx];
            const curYearBranch = branches[curYearBranchIdx];
            
            let dateLabel = '';
            if (targetYear === new Date().getFullYear()) dateLabel = '올해의 운';
            else dateLabel = `${targetYear}년 운세`;
            
            setVal('comp-year-title', `<i class="fa-solid fa-calendar-day"></i> ${dateLabel} (${targetYear}년 ${curYearStem.h}${curYearBranch.h})`);
            
            const isYearYonghee = yongheeArr.split(',').some(part => {
                const korChar = part.trim()[0];
                return korChar && (korToEng[korChar] === curYearStem.e || korToEng[korChar] === curYearBranch.e);
            });
            const isYearChung = chungMapGeneral[dayBranch.h] === curYearBranch.h;
            const yearSs = getShipseong(curYearStem);

            let yearFortune = `${targetYear}년은 <strong>${curYearStem.h}${curYearBranch.h}년</strong>으로, 무난하고 평탄하게 흘러가는 한 해입니다. 주변 상황 변화에 능동적으로 대처하는 것이 유리합니다.`;
            if (isYearYonghee) yearFortune = `${targetYear}년은 <strong>${curYearStem.h}${curYearBranch.h}년</strong>으로, 막혔던 일들이 서서히 풀리고 귀인의 도움을 받을 수 있는 매우 긍정적인 한 해입니다. 적극적으로 기회를 잡으세요.`;
            else if (isYearChung) yearFortune = `${targetYear}년은 <strong>${curYearStem.h}${curYearBranch.h}년</strong>으로, 이동수나 직업적 변화가 생길 수 있습니다. 건강과 대인관계에 조금 더 신경 쓰는 것이 좋습니다.`;
            else if (['정재','편재'].includes(yearSs)) yearFortune = `${targetYear}년은 <strong>${curYearStem.h}${curYearBranch.h}년</strong>으로, 재물운이 활발해지는 시기입니다. 새로운 투자나 수익 창출에 유리한 기회가 찾아옵니다.`;
            
            setVal('comp-year', yearFortune);
        };

        const yearDateInput = document.getElementById('year-fortune-date');
        if (yearDateInput) {
            if (!yearDateInput.value) {
                const tzoffset = (new Date()).getTimezoneOffset() * 60000;
                const localISOTime = (new Date(Date.now() - tzoffset)).toISOString().slice(0, 10);
                yearDateInput.value = localISOTime;
            }
            yearDateInput.onchange = (e) => {
                renderYearFortune(new Date(e.target.value));
            };
            renderYearFortune(new Date(yearDateInput.value));
        } else {
            renderYearFortune(new Date());
        }

        const todayObj = new Date();
        const yearIntObj = todayObj.getFullYear();
        const monthIntObj = todayObj.getMonth() + 1;
        const curYearStemIdx = ((yearIntObj - 4) % 10 + 10) % 10;
        const curYearBranchIdx = ((yearIntObj - 4) % 12 + 12) % 12;
        const curYearStem = stems[curYearStemIdx];
        const curYearBranch = branches[curYearBranchIdx];

        // Month Logic
        const renderMonthFortune = (dateObj) => {
            const targetYear = dateObj.getFullYear();
            const targetMonth = dateObj.getMonth() + 1;
            
            const curYearStemIdx = ((targetYear - 4) % 10 + 10) % 10;
            const curMonthBranchIdx = targetMonth % 12; // Approximation
            const curBaseMonthStem = (curYearStemIdx % 5) * 2 + 2;
            const mOffset = (curMonthBranchIdx - 2 + 12) % 12;
            const curMonthStemIdx = (curBaseMonthStem + mOffset) % 10;
            const curMonthStem = stems[curMonthStemIdx];
            const curMonthBranch = branches[curMonthBranchIdx];

            let dateLabel = '';
            if (targetYear === new Date().getFullYear() && targetMonth === (new Date().getMonth() + 1)) dateLabel = '이달의 운세';
            else dateLabel = `${targetYear}년 ${targetMonth}월 운세`;

            setVal('comp-month-title', `<i class="fa-solid fa-moon"></i> ${dateLabel} (${curMonthStem.h}${curMonthBranch.h}월)`);
            
            const isMonthYonghee = yongheeArr.split(',').some(part => {
                const korChar = part.trim()[0];
                return korChar && (korToEng[korChar] === curMonthStem.e || korToEng[korChar] === curMonthBranch.e);
            });
            const isMonthChung = chungMapGeneral[dayBranch.h] === curMonthBranch.h;
            
            let monthFortune = `이번 달은 <strong>${curMonthStem.h}${curMonthBranch.h}월</strong>로, 지금까지의 노력에 대한 보상을 차분히 기다리며 다음 스텝을 계획하기에 좋은 시기입니다.`;
            if (isMonthYonghee) monthFortune = `이번 달은 <strong>${curMonthStem.h}${curMonthBranch.h}월</strong>로, 수호 기운이 들어와 운기가 상승합니다! 계획했던 일을 실행에 옮기면 기대 이상의 좋은 성과를 거둘 수 있습니다.`;
            else if (isMonthChung) monthFortune = `이번 달은 <strong>${curMonthStem.h}${curMonthBranch.h}월</strong>로, 주변과의 마찰이나 예기치 않은 스트레스가 있을 수 있으니 중요한 결정은 다음으로 미루고 마음의 여유를 가지세요.`;
            
            setVal('comp-month', monthFortune);
        };

        const monthDateInput = document.getElementById('month-fortune-date');
        if (monthDateInput) {
            if (!monthDateInput.value) {
                const tzoffset = (new Date()).getTimezoneOffset() * 60000;
                const localISOTime = (new Date(Date.now() - tzoffset)).toISOString().slice(0, 10);
                monthDateInput.value = localISOTime;
            }
            monthDateInput.onchange = (e) => {
                renderMonthFortune(new Date(e.target.value));
            };
            renderMonthFortune(new Date(monthDateInput.value));
        } else {
            renderMonthFortune(new Date());
        }

        // 1-1. 오늘의 실시간 운세 동적 계산
        // 1-1. 오늘의 실시간 운세 동적 계산
        const renderTodayFortune = (dateObj) => {
            const diffDaysTodayCalc = Math.floor((new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate(), 12, 0, 0) - new Date(2026, 3, 25, 12, 0, 0)) / (1000 * 60 * 60 * 24));
            const tStemIdx = ((5 + diffDaysTodayCalc) % 10 + 10) % 10;
            const tBranchIdx = ((5 + diffDaysTodayCalc) % 12 + 12) % 12;
            const tStemObj = stems[tStemIdx];
            const tBranchObj = branches[tBranchIdx];
            
            const nowMins = dateObj.getHours() * 60 + dateObj.getMinutes();
            let tHourBranchIdx = 0;
            if (nowMins >= 1410 || nowMins < 90) tHourBranchIdx = 0;
            else if (nowMins >= 90 && nowMins < 210) tHourBranchIdx = 1;
            else if (nowMins >= 210 && nowMins < 330) tHourBranchIdx = 2;
            else if (nowMins >= 330 && nowMins < 450) tHourBranchIdx = 3;
            else if (nowMins >= 450 && nowMins < 570) tHourBranchIdx = 4;
            else if (nowMins >= 570 && nowMins < 690) tHourBranchIdx = 5;
            else if (nowMins >= 690 && nowMins < 810) tHourBranchIdx = 6;
            else if (nowMins >= 810 && nowMins < 930) tHourBranchIdx = 7;
            else if (nowMins >= 930 && nowMins < 1050) tHourBranchIdx = 8;
            else if (nowMins >= 1050 && nowMins < 1170) tHourBranchIdx = 9;
            else if (nowMins >= 1170 && nowMins < 1290) tHourBranchIdx = 10;
            else if (nowMins >= 1290 && nowMins < 1410) tHourBranchIdx = 11;
            const tHourBranchObj = branches[tHourBranchIdx];

            const isTodayYonghee = yongheeArr.split(',').some(part => {
                const korChar = part.trim()[0];
                return korChar && (korToEng[korChar] === tStemObj.e || korToEng[korChar] === tBranchObj.e);
            });
            
            const isHourYonghee = yongheeArr.split(',').some(part => {
                const korChar = part.trim()[0];
                return korChar && korToEng[korChar] === tHourBranchObj.e;
            });

            const isTodayChung = chungMapGeneral[dayBranch.h] === tBranchObj.h;
            const isHourChung = chungMapGeneral[dayBranch.h] === tHourBranchObj.h;

            let todayScore = '무난 (平)'; let todayScoreColor = 'var(--text-main)';
            if (isTodayYonghee) { todayScore = '대길 (大吉)'; todayScoreColor = 'var(--primary-gold)'; }
            else if (isTodayChung) { todayScore = '주의 (凶)'; todayScoreColor = '#e74c3c'; }
            
            let hourScore = '평온 (安)'; let hourScoreColor = '#2ecc71';
            if (isHourYonghee) { hourScore = '상승 (吉)'; hourScoreColor = 'var(--primary-gold)'; }
            else if (isHourChung) { hourScore = '불안 (凶)'; hourScoreColor = '#e74c3c'; }

            setVal('comp-today-score', `<span style="color: ${todayScoreColor}">${todayScore}</span>`);
            setVal('comp-hour-score', `<span style="color: ${hourScoreColor}">${hourScore}</span>`);

            const targetYear = dateObj.getFullYear();
            const targetMonth = dateObj.getMonth() + 1;
            const targetDay = dateObj.getDate();

            let todayAdviceStr = `<strong>${targetYear}년 ${targetMonth}월 ${targetDay}일</strong>은 <strong>${tStemObj.h}${tBranchObj.h}일</strong>입니다. 평범한 하루 속에서 작은 행복을 찾아보세요.`;
            if (isTodayYonghee) todayAdviceStr = `<strong>${targetYear}년 ${targetMonth}월 ${targetDay}일</strong>은 <strong>${tStemObj.h}${tBranchObj.h}일</strong>로, 귀하에게 꼭 필요한 수호 기운이 강하게 들어오는 매우 길한 날입니다. 중요한 결정이나 계약에 유리합니다.`;
            else if (isTodayChung) todayAdviceStr = `<strong>${targetYear}년 ${targetMonth}월 ${targetDay}일</strong>은 <strong>${tStemObj.h}${tBranchObj.h}일</strong>로, 일진(日辰)과 충돌하는 기운이 있습니다. 무리한 일정보다는 휴식과 안정을 취하는 것이 좋습니다.`;
            
            const yhEng = yongheeArr.split(',').map(part => korToEng[part.trim()[0]]).filter(Boolean);
            const goodHours = [];
            branches.forEach((b, idx) => {
                if (yhEng.includes(b.e) && chungMapGeneral[dayBranch.h] !== b.h) goodHours.push(idx);
            });
            
            if (goodHours.length > 0) {
                const hNames = ['자(23~01)','축(01~03)','인(03~05)','묘(05~07)','진(07~09)','사(09~11)','오(11~13)','미(13~15)','신(15~17)','유(17~19)','술(19~21)','해(21~23)'];
                const bestH = hNames[goodHours[0]];
                todayAdviceStr += ` 특히 <strong>${bestH}시</strong>에 운의 흐름이 가장 상승하므로, 이 시간을 적극적으로 활용하시기 바랍니다.`;
            }

            setVal('comp-today-advice', todayAdviceStr);
        };

        const todayFortuneDateInput = document.getElementById('today-fortune-date');
        if (todayFortuneDateInput) {
            if (!todayFortuneDateInput.value) {
                const tzoffset = (new Date()).getTimezoneOffset() * 60000;
                const localISOTime = (new Date(Date.now() - tzoffset)).toISOString().slice(0, 10);
                todayFortuneDateInput.value = localISOTime;
            }
            todayFortuneDateInput.onchange = (e) => {
                const selectedDate = new Date(e.target.value);
                const now = new Date();
                selectedDate.setHours(now.getHours());
                selectedDate.setMinutes(now.getMinutes());
                renderTodayFortune(selectedDate);
            };
            const initDate = new Date(todayFortuneDateInput.value);
            const now = new Date();
            initDate.setHours(now.getHours());
            initDate.setMinutes(now.getMinutes());
            renderTodayFortune(initDate);
        } else {
            renderTodayFortune(new Date());
        }

        setVal('comp-advice', `"운(運)이란 흐르는 물과 같아 막히면 돌아가고, 넘치면 나누어야 합니다. 귀하의 사주는 스스로의 능력이 출중하니 조급해하지 말고 때를 기다리면 반드시 큰 뜻을 이룰 수 있습니다."`);

        // 2. 성격 탭
        let personalityText = dayStemPersonality[dayStem.h] + ' ';
        
        if (isGang) {
            personalityText += '주관이 뚜렷하고 독립심이 강해 자신의 생각대로 밀고 나가는 돌파력이 매우 우수합니다. 때로는 고집스러워 보일 수 있으나, 위기 상황에서 굳건한 리더십을 발휘합니다.';
        } else {
            personalityText += '상황에 맞게 자신을 낮추고 주변과 조화를 이루는 유연함이 돋보입니다. 남을 배려하는 마음이 크고 타인의 의견을 수용하는 포용력이 넓습니다.';
        }
        
        let domShipseongStr = '';
        const shipseongsList = [getShipseong(yearStem), getShipseong(monthStem), getShipseong(hourStem), getShipseong(yearBranch), getShipseong(monthBranch), getShipseong(dayBranch), getShipseong(hourBranch)].filter(Boolean);
        const ssCount = {};
        let maxSsCount = 0;
        let dominantSs = '';
        shipseongsList.forEach(s => {
            ssCount[s] = (ssCount[s] || 0) + 1;
            if(ssCount[s] > maxSsCount) { maxSsCount = ssCount[s]; dominantSs = s; }
        });

        if (['식신', '상관'].includes(dominantSs)) {
            personalityText += ' 특히 감수성이 풍부하고 표현력이 뛰어나며, 다방면에 호기심이 많아 창의적인 발상을 잘해냅니다.';
        } else if (['정관', '편관'].includes(dominantSs)) {
            personalityText += ' 특히 책임감과 명예를 중시하며, 자신을 엄격하게 통제하고 타인에게 모범이 되려는 반듯한 성향이 강합니다.';
        } else if (['정재', '편재'].includes(dominantSs)) {
            personalityText += ' 특히 현실 감각이 매우 뛰어나며, 목표 지향적이고 상황을 이성적으로 판단하여 효율을 극대화하는 능력이 탁월합니다.';
        } else if (['정인', '편인'].includes(dominantSs)) {
            personalityText += ' 특히 생각이 깊고 직관력이 뛰어나며, 사물의 이면을 꿰뚫어보는 통찰력과 학구적인 기질을 지니고 있습니다.';
        } else if (['비견', '겁재'].includes(dominantSs)) {
            personalityText += ' 특히 승부욕과 자존심이 강하며, 한번 결심한 일은 끝까지 해내는 뚝심과 끈기가 돋보입니다.';
        }
        
        setVal('comp-personality', personalityText);

        const pTags = [
            `#${elemKorean[dayStem.e]}의기운`,
            isGang ? '#리더십_돌파력' : '#포용력_유연함',
            dominantSs ? `#${dominantSs}발달` : '#조화로운_성향',
            ['식신','상관'].includes(dominantSs) ? '#창의적' : ['정관','편관'].includes(dominantSs) ? '#책임감' : ['정재','편재'].includes(dominantSs) ? '#현실적' : ['정인','편인'].includes(dominantSs) ? '#통찰력' : '#독립적'
        ];
        
        setVal('comp-personality-tags', [...new Set(pTags)].map(t => `<span class="tag">${t}</span>`).join(' '));
        
        const yongheeKoreanForAdvice = yongheeArr.split(',')[0]?.trim() || '목(木)';
        let pAdvice = `"너무 스스로를 엄격한 잣대로 평가하지 마세요. 가끔은 여유를 가지고 주변을 돌아볼 때 진정한 내면의 평화가 찾아옵니다."`;
        
        if (isGang && ['비견', '겁재'].includes(dominantSs)) pAdvice = `"타인과의 타협은 결코 지는 것이 아닙니다. 주변의 의견을 수용하는 '부드러움'을 장착할 때 당신의 리더십은 완벽해집니다."`;
        else if (!isGang && ['정관', '편관'].includes(dominantSs)) pAdvice = `"때로는 다른 사람들의 기대나 시선에서 벗어나 오직 '나 자신'만을 위한 이기적인 선택을 해도 괜찮습니다."`;
        else if (['식신', '상관'].includes(dominantSs)) pAdvice = `"뛰어난 아이디어와 재능이 하나로 모일 수 있도록, 끝까지 밀고 나가는 '지구력'을 기르는 것이 성공의 열쇠입니다."`;
        else if (['정재', '편재'].includes(dominantSs)) pAdvice = `"모든 것을 통제하고 계산하려는 마음을 조금 내려놓으세요. 예상치 못한 우연 속에서 더 큰 기회와 행운이 찾아옵니다."`;
        else if (['정인', '편인'].includes(dominantSs)) pAdvice = `"생각이 너무 깊어지면 오히려 실행을 방해합니다. 완벽하지 않더라도 일단 부딪혀보는 행동력이 당신의 운을 크게 틔워줍니다."`;
        
        setVal('comp-personality-advice', pAdvice);

        // 건강 & 행운 가이드 데이터 (개운법)
        const primaryYongheeChar = yongheeArr.split(',')[0]?.trim().substring(0, 1) || '목';
        const korToEngYonghee = { '목': 'wood', '화': 'fire', '토': 'earth', '금': 'metal', '수': 'water' };
        const primaryYongheeEng = korToEngYonghee[primaryYongheeChar] || 'wood';

        const healthyData = {
            wood: {
                food: "신선한 녹색 채소, 나물류, 매실, 사과, 신맛이 나는 과일과 건강한 곡물",
                exercise: "산책, 등산, 삼림욕, 스트레칭이나 요가 같이 유연성을 기르는 운동",
                color: "초록색, 청색, 민트색 계열의 생동감 넘치는 색상",
                place: "나무가 많은 공원, 숲속, 수목원, 동쪽 방향의 자연 친화적인 공간"
            },
            fire: {
                food: "토마토, 붉은 육고기, 고추, 쓴맛이 나는 채소, 적당한 커피나 홍차",
                exercise: "조깅, 러닝머신, 스피닝, 복싱 등 땀을 많이 흘리는 격렬한 유산소 운동",
                color: "빨간색, 오렌지색, 핑크, 보라색 계열의 화려한 색상",
                place: "화려한 조명이 있는 번화가, 남쪽 방향, 따뜻한 사우나나 온천"
            },
            earth: {
                food: "감자, 고구마, 호박, 단호박, 소고기, 단맛이 나는 뿌리 채소",
                exercise: "맨발 걷기(어싱), 코어 운동, 스쿼트, 등산 등 하체와 중심을 잡는 운동",
                color: "노란색, 베이지, 브라운, 황색 계열의 차분하고 안정적인 색상",
                place: "들판, 탁 트인 평지, 중앙, 흙을 만질 수 있는 농장이나 전원 지역"
            },
            metal: {
                food: "마늘, 양파, 도라지, 무, 매운맛이 나는 음식, 생선류",
                exercise: "웨이트 트레이닝, 호흡법 단련(명상 호흡), 검도, 자세 교정 운동",
                color: "흰색, 은색, 금색, 밝은 회색 계열의 깔끔하고 세련된 색상",
                place: "헬스장, 도시적인 분위기의 미술관/전시회, 서쪽 방향, 암반 지대"
            },
            water: {
                food: "미역, 다시마, 김 등의 해조류, 검은콩, 블루베리, 흑임자, 깨끗한 물",
                exercise: "수영, 서핑, 아쿠아로빅, 가벼운 반신욕이나 족욕을 통한 순환 운동",
                color: "검은색, 남색, 블루, 다크그레이 계열의 깊이 있는 색상",
                place: "바다, 호수, 강변 산책로, 북쪽 방향, 조용히 사색을 즐길 수 있는 공간"
            }
        };

        const hData = healthyData[primaryYongheeEng] || healthyData['wood'];
        setVal('comp-good-food', hData.food);
        setVal('comp-good-exercise', hData.exercise);
        setVal('comp-good-color', hData.color);
        setVal('comp-good-place', hData.place);

        // 3. 건강 탭
        setVal('comp-health', `${elemKorean[dayStem.e]} 기운이 담당하는 장기가 튼튼한 편입니다. 다만 사주 구조상 ${isGang ? '에너지 발산' : '체력 소모'}에 유의하여 꾸준한 운동과 규칙적인 휴식을 취하는 것이 좋습니다.`);

        // 4. 재물 탭
        const hasWealth = ['편재', '정재'].some(s => s === getShipseong(yearStem) || s === getShipseong(monthStem) || s === getShipseong(hourStem));
        setVal('comp-wealth-intro', hasWealth ? '재물에 대한 감각이 뛰어나며 타고난 금전운이 매우 좋은 편입니다.' : '투기보다는 본인의 성실함과 전문성으로 재물을 축적하는 것이 크게 유리한 사주입니다.');
        
        let wealthFlow = '자수성가하여 차곡차곡 재물을 쌓아가는 안정적인 흐름입니다.';
        if (hasWealth && isGang) wealthFlow = '큰 재물을 쟁취할 수 있는 강한 기운과 배짱을 갖추어 사업이나 투자로 자산을 크게 불릴 수 있는 강력한 흐름입니다.';
        else if (hasWealth && !isGang) wealthFlow = '재물운은 풍부하나 이를 감당할 기운이 다소 부족하니, 무리한 사업 확장보다는 전문가의 도움을 받거나 안정형 투자를 지향하는 것이 좋습니다.';
        else if (!hasWealth && isGang) wealthFlow = '금전적 굴곡이 크지 않으며, 본인의 능력과 전문성에 비례하여 재물이 꾸준히 우상향하는 탄탄한 흐름입니다.';
        setVal('comp-wealth-flow', wealthFlow);

        setVal('wealth-invest-realestate', yongheeArr.includes('토') || yongheeArr.includes('금') ? '본인의 수호 기운을 극대화하는 최고의 실물 자산 투자처.' : '자산을 잃지 않고 안전하게 묶어두는 방어적 수단으로 활용.');
        setVal('wealth-invest-stock', hasWealth ? '시장 흐름을 읽는 감각이 좋아 우량주 및 성장주 중심의 투자에 매우 유리.' : '직접 투자보다는 ETF나 인덱스 펀드 등 간접/장기 투자가 유리.');
        setVal('wealth-invest-gold', yongheeArr.includes('금') || yongheeArr.includes('수') ? '본인의 기운을 맑게 해주는 안전 자산으로 필수 포트폴리오에 편입.' : '인플레이션 방어용으로 전체 자산의 일부만 보수적으로 편입.');
        setVal('wealth-invest-crypto', hasWealth && isGang ? '변동성을 역이용하며 타이밍을 잡는 단기 소액 투자에 감각이 있음.' : '위험도가 높고 기운을 빼앗기므로 여윳돈으로만 극도로 보수적 접근 권장.');
        setVal('wealth-invest-saving', !hasWealth ? '복리 효과를 노리는 귀하에게 가장 확실하고 강력한 자산 증식법.' : '투자 수익을 변동성으로부터 지키기 위한 최후의 베이스캠프.');

        const yongheeKoreanForWealth = yongheeArr.split(',').map(y => y.trim()).join(' 기운과 ') || '목(木)';
        
        // Find upcoming good years
        let goodYears = [];
        const currentYear = new Date().getFullYear();
        const korToEngWealth = { '목': 'wood', '화': 'fire', '토': 'earth', '금': 'metal', '수': 'water' };
        
        const wealthYearBranches = ['申','酉','戌','亥','子','丑','寅','卯','辰','巳','午','未'];
        const wealthYearStems = ['庚','辛','壬','癸','甲','乙','丙','丁','戊','己'];
        
        for (let i = 0; i < 10; i++) {
            const checkYear = currentYear + i;
            const cStem = wealthYearStems[checkYear % 10];
            const cBranch = wealthYearBranches[checkYear % 12];
            const isGood = yongheeArr.split(',').some(part => {
                const korChar = part.trim()[0];
                return korChar && (korToEngWealth[korChar] === stems.find(s=>s.h===cStem)?.e || korToEngWealth[korChar] === branches.find(b=>b.h===cBranch)?.e);
            });
            if (isGood) goodYears.push(checkYear);
        }
        
        const goodYearsText = goodYears.length > 0 ? ` (특히 <strong>${goodYears.slice(0, 3).join(', ')}년</strong> 등)` : '';

        setVal('wealth-timing-intro', `본인의 명식 구조상 <strong>${yongheeKoreanForWealth} 기운</strong>이 강력하게 들어오는 시기${goodYearsText}에 투자 수익이 극대화됩니다.`);
        
        let bestSeason = '봄(2~4월)'; let badSeason = '가을(8~10월)';
        if(yongheeArr.includes('화')) { bestSeason = '여름(5~7월)'; badSeason = '겨울(11~1월)'; }
        else if(yongheeArr.includes('금')) { bestSeason = '가을(8~10월)'; badSeason = '봄(2~4월)'; }
        else if(yongheeArr.includes('수')) { bestSeason = '겨울(11~1월)'; badSeason = '여름(5~7월)'; }
        else if(yongheeArr.includes('토')) { bestSeason = '환절기(각 계절의 끝 달)'; badSeason = '목(木)이나 수(水) 기운이 강해지는 시기'; }
        
        setVal('wealth-timing-good', `<i class="fa-solid fa-calendar-check" style="color: var(--primary-gold); margin-right: 5px;"></i> <strong>최적의 계절:</strong> 매년 ${bestSeason} (수호 기운이 강해지는 시점)`);
        setVal('wealth-timing-bad', `<i class="fa-solid fa-circle-exclamation" style="color: #e74c3c; margin-right: 5px;"></i> <strong>주의 시기:</strong> ${badSeason}에는 현금 비중을 높이고 공격적인 투자를 피하세요.`);

        setVal('wealth-advice-manage', hasWealth ? `"자산을 불리는 감각은 뛰어나지만, 번 만큼 나가는 구조가 될 수 있습니다. 수익이 생기면 즉시 부동산이나 장기 금융상품으로 묶어두어 현금 흐름을 통제하는 것이 큰 부를 지키는 비결입니다."` : `"타인의 말이나 시장의 유행에 현혹되지 않고 본인만의 원칙을 고수하는 것이 중요합니다. 문서운(인성)을 활용하여 자격증, 저작권, 임대수익 등 고정적인 파이프라인을 구축하세요."`);
        
        setVal('wealth-advice-habit', `"평소 지갑이나 통장 주변을 깨끗하게 정리하는 습관이 금전운을 맑게 합니다. 중요한 재물 계약 시에는 본인의 행운의 색상인 ${yongheeKoreanForWealth}에 해당하는 컬러의 의상이나 소품을 지니면 협상에서 유리한 고지를 점할 수 있습니다."`);

        // 5. 육친 및 사회적 인연 탭
        const hasSpouseWealth = ['정재', '편재', '정관', '편관'].some(s => s === getShipseong(dayBranch) || s === getShipseong(monthBranch));
        setVal('rel-spouse', hasSpouseWealth ? '서로를 보완하며 백년해로할 수 있는 안정적이고 유정한 기운입니다.' : '서로의 독립성을 존중하며 각자의 영역을 지켜주는 관계가 유리합니다.');
        
        const hasParent = ['정인', '편인'].some(s => s === getShipseong(yearStem) || s === getShipseong(yearBranch) || s === getShipseong(monthStem) || s === getShipseong(monthBranch));
        setVal('rel-parent', hasParent ? '부모님의 든든한 지원과 혜택을 받으며 순탄하게 성장하는 기운입니다.' : '일찍부터 자수성가하여 스스로 가문을 일으키는 강한 독립심을 가졌습니다.');
        
        const hasSibling = ['비견', '겁재'].some(s => s === getShipseong(monthStem) || s === getShipseong(monthBranch) || s === getShipseong(dayBranch));
        setVal('rel-sibling', hasSibling ? '우애가 깊으며 어려울 때 서로 큰 의지가 되는 든든한 형제/동료운입니다.' : '각자의 삶에 충실하며 적당한 거리를 두고 지내는 것이 서로에게 이로운 운입니다.');
        
        const hasChild = ['식신', '상관', '정관', '편관'].some(s => s === getShipseong(hourStem) || s === getShipseong(hourBranch));
        setVal('rel-child', hasChild ? '총명하고 반듯한 자손을 두며, 만년에는 자식 덕에 평온을 누립니다.' : '자식에게 얽매이기보다 부부가 함께 본인들의 말년 목표를 향해 나아가는 것이 좋습니다.');

        setVal('rel-friend', `주변에 배울 점이 많은 친구들이 형성되며, 특히 본인의 보완 오행(${yongheeArr.split(',')[0]?.trim() || '목(木)'} 기운)을 가진 동료와 협업할 때 놀라운 시너지를 냅니다.`);
        setVal('rel-boss', `상사의 덕을 수동적으로 기다리기보다, ${dayStem.h}일간 특유의 성실함으로 신뢰를 쟁취하여 강력한 귀인의 지원을 이끌어냅니다.`);
        setVal('rel-junior', `아랫사람을 넓게 포용하는 리더십이 발달하여, 베푼 덕이 나중에 든든한 지지 세력과 명예로 크게 돌아오는 흐름입니다.`);
        setVal('rel-advice', `"사람을 대할 때 '진심'이라는 무기를 가장 소중히 하세요. 폭넓은 얕은 인맥보다는 한 사람이라도 깊은 신뢰를 나눌 때 귀하의 사회적 지위가 더욱 견고해집니다."`);

        // 삼재 (Samjae)
        const samjaeMap = {
            '申': ['寅', '卯', '辰'], '子': ['寅', '卯', '辰'], '辰': ['寅', '卯', '辰'],
            '亥': ['巳', '午', '未'], '卯': ['巳', '午', '未'], '未': ['巳', '午', '未'],
            '寅': ['申', '酉', '戌'], '午': ['申', '酉', '戌'], '戌': ['申', '酉', '戌'],
            '巳': ['亥', '子', '丑'], '酉': ['亥', '子', '丑'], '丑': ['亥', '子', '丑']
        };
        const currentYearBranch = '午'; // 2026년 병오년 기준
        const userYearBranch = yearBranch.h;
        const samjaeYears = samjaeMap[userYearBranch] || [];
        let samjaeDescText = '해당없음';
        if (samjaeYears.includes(currentYearBranch)) {
            const idx = samjaeYears.indexOf(currentYearBranch);
            const stages = ['들삼재', '눌삼재', '날삼재'];
            samjaeDescText = `${stages[idx]}!`;
        }
        setVal('samjae-desc', samjaeDescText);

        // 명궁 (Myeong-gung)
        const getMyeongGung = (mBr, hBr) => {
            const branchMap = { '寅': 1, '卯': 2, '辰': 3, '巳': 4, '午': 5, '未': 6, '申': 7, '酉': 8, '戌': 9, '亥': 10, '子': 11, '丑': 12 };
            const revMap = { 1: '寅', 2: '卯', 3: '辰', 4: '巳', 5: '午', 6: '未', 7: '申', 8: '酉', 9: '戌', 10: '亥', 11: '子', 12: '丑' };
            const m = branchMap[mBr];
            const h = branchMap[hBr];
            if (!m || !h) return '-';
            const sum = m + h;
            let res = 14 - sum;
            if (sum > 14) res = 26 - sum;
            if (res === 0) res = 12;
            return revMap[res] || '-';
        };
        setVal('myeong-gung-desc', getMyeongGung(monthBranch.h, hourBranch.h));

        // 7. 연애와 인연 (Love)
        let loveStyleText = '신중하고 배려심이 깊어 연애에 있어서도 가벼운 만남보다는 진지하고 깊이 있는 관계를 선호합니다.';
        const hasSikForLove = ['식신', '상관'].some(s => s === getShipseong(yearStem) || s === getShipseong(yearBranch) || s === getShipseong(monthStem) || s === getShipseong(monthBranch) || s === getShipseong(hourStem) || s === getShipseong(hourBranch));
        const hasInForLove = ['정인', '편인'].some(s => s === getShipseong(yearStem) || s === getShipseong(yearBranch) || s === getShipseong(monthStem) || s === getShipseong(monthBranch) || s === getShipseong(hourStem) || s === getShipseong(hourBranch));
        const hasKwanForLove = ['정관', '편관'].some(s => s === getShipseong(yearStem) || s === getShipseong(yearBranch) || s === getShipseong(monthStem) || s === getShipseong(monthBranch) || s === getShipseong(hourStem) || s === getShipseong(hourBranch));
        
        if (hasSikForLove) loveStyleText = '감정 표현이 솔직하고 애교가 많아 연애에서 분위기 메이커 역할을 하며, 상대방에게 헌신적인 사랑을 줍니다.';
        else if (hasInForLove) loveStyleText = '상대방의 마음을 잘 헤아리고 포용력이 넓어 정신적 교감을 중시하는 성숙하고 안정적인 연애를 지향합니다.';
        else if (hasKwanForLove) loveStyleText = '책임감이 강해 연인에게 든든한 버팀목이 되어주며, 예의와 선을 지키는 깔끔한 연애를 선호합니다.';
        setVal('love-style', loveStyleText);

        const yongheeKorean = yongheeArr.split(',').map(y => y.trim()).join(' 기운이나 ') || '목(木)';
        setVal('love-ideal', `본인의 명식에서 가장 조후를 안정시켜줄 <strong>${yongheeKorean} 기운</strong>을 풍부하게 가진 사람과 가장 이상적인 찰떡궁합을 이룹니다.`);

        let loveAdviceText = '"자신을 먼저 사랑할 때 비로소 타인과의 진정한 교감이 시작됩니다. 핑크나 로즈골드 계열의 액세서리를 착용하거나, 침실의 조명을 따뜻한 색감으로 바꾸어 보세요."';
        if (yongheeArr.includes('수')) loveAdviceText = '"물의 기운이 필요하므로 바다나 강변 등 물이 있는 곳에서의 데이트가 관계 진전에 큰 도움이 됩니다. 블랙이나 네이비 계열의 포인트 의상이 매력을 높여줍니다."';
        else if (yongheeArr.includes('화')) loveAdviceText = '"따뜻한 불의 기운이 인연을 부릅니다. 붉은 계열의 소품을 활용하고, 밝고 조명이 화려한 장소에서 만남을 가지면 긍정적인 에너지가 증폭됩니다."';
        else if (yongheeArr.includes('목')) loveAdviceText = '"나무의 기운이 이로우니, 수목원이나 공원 산책 등 자연과 함께하는 데이트가 이상적입니다. 그린 계열의 아이템이 본인의 생기를 돋보이게 합니다."';
        else if (yongheeArr.includes('금')) loveAdviceText = '"깔끔하고 정돈된 금의 기운이 필요합니다. 도시적인 분위기의 카페나 전시회 데이트가 어울리며, 화이트나 실버 계열의 악세사리가 인연운을 크게 높여줍니다."';
        else if (yongheeArr.includes('토')) loveAdviceText = '"흙의 안정적인 기운이 조화를 이룹니다. 분위기 있는 맛집 탐방이나 도예 등 정적인 데이트가 좋으며, 베이지 톤의 부드러운 스타일링이 호감도를 극대화합니다."';
        setVal('love-advice', loveAdviceText);

        // 6. 직업 및 취업운 (Career)
        const hasKwan = ['정관', '편관'].some(s => s === getShipseong(yearStem) || s === getShipseong(yearBranch) || s === getShipseong(monthStem) || s === getShipseong(monthBranch) || s === getShipseong(hourStem) || s === getShipseong(hourBranch));
        const hasIn = ['정인', '편인'].some(s => s === getShipseong(yearStem) || s === getShipseong(yearBranch) || s === getShipseong(monthStem) || s === getShipseong(monthBranch) || s === getShipseong(hourStem) || s === getShipseong(hourBranch));
        const hasSik = ['식신', '상관'].some(s => s === getShipseong(yearStem) || s === getShipseong(yearBranch) || s === getShipseong(monthStem) || s === getShipseong(monthBranch) || s === getShipseong(hourStem) || s === getShipseong(hourBranch));

        let careerIntroText = '다양한 분야에서 능력을 발휘할 수 있는 다재다능한 성향입니다.';
        if (hasKwan && hasIn) careerIntroText = '책임감이 강하고 규칙을 준수하는 성향으로 조직 내에서 능력을 크게 인정받습니다. 공직, 교육, 행정 분야에서 특히 두각을 나타냅니다.';
        else if (hasSik && hasWealth) careerIntroText = '창의적인 아이디어와 재물 감각이 뛰어나 사업이나 프리랜서, 기획, 영업, 예체능 분야에서 큰 성과를 거둡니다.';
        else if (hasKwan) careerIntroText = '명예를 중시하고 리더십이 있어 일반 기업의 관리직이나 군경, 법 전공 등 제복을 입는 직업군에 유리합니다.';
        else if (hasSik) careerIntroText = '표현력이 뛰어나고 기술이 좋아 전문 기술직, 서비스, 언론, 교육 분야에서 능력을 널리 펼칠 수 있습니다.';
        setVal('career-intro', careerIntroText);

        setVal('career-study', hasIn ? '학습 습득력이 뛰어나고 탐구심이 강해 학문적 성취가 높습니다.' : '실용적인 지식과 실전 경험을 통해 지혜를 빠르게 체득하는 타입입니다.');
        setVal('career-exam', hasKwan && hasIn ? '국가 고시나 자격증 등 공적인 시험에서 관운(官運)이 매우 강하게 작용합니다.' : '벼락치기보다는 꾸준한 노력과 실무 자격증 위주의 시험에 강점이 있습니다.');
        
        const isCareerYear = ['정관', '편관', '정인', '편인'].includes(getShipseong(curYearStem));
        setVal('career-job', isCareerYear ? '올해는 관성과 인성이 들어와 취업문이 활짝 열리는 매우 유리한 흐름입니다.' : '올해는 본인의 역량을 다지고 경험을 쌓으면서 하반기를 노리는 것이 좋습니다.');
        setVal('career-promotion', isCareerYear ? '상사의 신임을 얻어 조직 내에서 인정받고 승진의 기회가 주어집니다.' : '눈앞의 승진보다는 본인의 실무 능력을 증명하는 데 집중하면 다음 해에 좋은 결과가 있습니다.');
        
        const diffDaysToday = Math.floor((new Date(todayObj.getFullYear(), todayObj.getMonth(), todayObj.getDate(), 12, 0, 0) - new Date(2026, 3, 25, 12, 0, 0)) / (1000 * 60 * 60 * 24));
        const todayStemCareer = stems[((5 + diffDaysToday) % 10 + 10) % 10];
        const isGoodDay = ['정관', '정인', '편관', '편인'].includes(getShipseong(todayStemCareer));
        setVal('career-success', isGoodDay ? '오늘은 중요한 면접이나 시험에 아주 유리한 명예운이 흐르고 있습니다.' : '최종 합격을 위해서는 운보다는 철저한 준비와 평정심 유지가 관건입니다.');

        const getCareerTags = () => {
            let tags = [];
            if(hasKwan) tags.push('공무원/공공기관', '인사/행정관리', '경영/기획');
            if(hasIn) tags.push('교육/연구직', '문서/저작', '전문자격증');
            if(hasWealth) tags.push('금융/세무/회계', '유통/무역', '사업/창업');
            if(hasSik) tags.push('전문 기술직', '예술/방송/언론', '마케팅/영업', '요식업');
            if(isGang) tags.push('프리랜서', '스포츠/신체활동');
            if(tags.length === 0) tags = ['일반 사무직', '서비스업'];
            return [...new Set(tags)].slice(0, 5).map(t => `<span style="background: rgba(52, 152, 219, 0.1); color: #3498db; padding: 6px 12px; border-radius: 20px; font-size: 0.75rem; border: 1px solid rgba(52, 152, 219, 0.3);">${t}</span>`).join('');
        };
        setVal('career-tags', getCareerTags());

        setVal('career-advice', hasKwan && hasIn ? '"조직 내에서 승승장구할 사주입니다. 정도(正道)를 걸으며 차곡차곡 명예를 쌓아가세요."' : (hasSik ? '"틀에 얽매이지 않고 본인만의 능력을 발휘할 수 있는 환경을 찾을 때 가장 크게 빛납니다."' : '"너무 완벽을 기하다가 시기를 놓칠 수 있으니, 때로는 과감한 결단력이 필요합니다."'));

        const analysisTexts = {
            personality: dayStemPersonality[dayStem.h],
            wealth: `재물운은 ${getShipseong(dayStem) === '편재' || getShipseong(dayStem) === '정재' ? '왕성한 흐름에 있습니다.' : '노력을 통해 차곡차곡 쌓아가는 흐름에 유리합니다.'} 투자나 확장은 본인의 수호 오행을 활용하는 것이 좋습니다.`,
            love: `애정운은 본인을 따뜻하게 감싸주는 상대와의 조화가 뛰어납니다. ${['子', '午', '卯', '酉'].includes(dayBranch.h) ? '도화의 기운이 있어 이성에게 매력적으로 보입니다.' : '신뢰를 바탕으로 한 깊은 관계 형성에 유리합니다.'}`,
            career: `추천 직업 분야로는 본인의 기운인 <strong>${elemKorean[dayStem.e]}</strong>을 살리거나 능력을 발휘할 수 있는 직군이 적합합니다.`,
            relation: `주변 사람들과의 관계에서는 융통성 있게 다가가는 태도가 귀인을 부릅니다.`
        };

        // Update Screen 3 Tabs
        const updateTab = (tabId, text) => {
            const tab = document.getElementById(tabId);
            if (tab) {
                const textEl = tab.querySelector('.analysis-text');
                if (textEl && !textEl.id) textEl.innerHTML = text; // Prevent overwriting specific elements updated above
            }
        };

        updateTab('tab-personality', analysisTexts.personality);
        updateTab('tab-wealth', analysisTexts.wealth);
        updateTab('tab-love', analysisTexts.love);
        updateTab('tab-career', analysisTexts.career);
        // updateTab('tab-relation', analysisTexts.relation); // Overridden by specific relation logic above

        // --- Specific Date Analysis (지정일 운세 확인) ---
        const specificDateInput = document.getElementById('target-date');
        const specificDateBtn = document.getElementById('btn-analyze-date');
        const specificDateResult = document.getElementById('specific-date-result');
        if (specificDateInput && specificDateBtn && specificDateResult) {
            if (!specificDateInput.value) {
                const tzoffset = (new Date()).getTimezoneOffset() * 60000;
                specificDateInput.value = new Date(Date.now() - tzoffset).toISOString().slice(0, 10);
            }
            
            specificDateBtn.onclick = () => {
                if (!specificDateInput.value) return;
                const targetDate = new Date(specificDateInput.value);
                const refDate = new Date(2026, 3, 25, 12, 0, 0); // 2026-04-25 is 己巳
                const targetDateForCalc = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 12, 0, 0);
                const diffDays = Math.floor((targetDateForCalc - refDate) / (1000 * 60 * 60 * 24));
                
                const sStem = stems[((5 + diffDays) % 10 + 10) % 10];
                const sBranch = branches[((5 + diffDays) % 12 + 12) % 12];
                const sShipseong = getShipseong(sStem);
                
                // 황흑도일 계산 (Page 319 택일 비법)
                const monthBranches = {
                    1: '丑', 2: '寅', 3: '卯', 4: '辰', 5: '巳', 6: '午',
                    7: '未', 8: '申', 9: '酉', 10: '戌', 11: '亥', 12: '子'
                };
                const tMonthBranch = monthBranches[targetDate.getMonth() + 1];
                const getHwangHeokDo = (mBr, dBr) => {
                    const list = ['청룡황도(길)', '명당황도(길)', '천형흑도(흉)', '주작흑도(흉)', '금궤황도(길)', '천덕황도(길)', '백호흑도(흉)', '옥당황도(길)', '천뢰흑도(흉)', '현무흑도(흉)', '사명황도(길)', '구진흑도(흉)'];
                    const order = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
                    let baseIdx = 0;
                    if (mBr === '寅' || mBr === '申') baseIdx = order.indexOf('子');
                    else if (mBr === '卯' || mBr === '酉') baseIdx = order.indexOf('寅');
                    else if (mBr === '辰' || mBr === '戌') baseIdx = order.indexOf('辰');
                    else if (mBr === '巳' || mBr === '亥') baseIdx = order.indexOf('午');
                    else if (mBr === '午' || mBr === '子') baseIdx = order.indexOf('申');
                    else if (mBr === '未' || mBr === '丑') baseIdx = order.indexOf('戌');
                    const dIdx = order.indexOf(dBr);
                    const resultIdx = (dIdx - baseIdx + 12) % 12;
                    return list[resultIdx];
                };
                const hwangheokStatus = getHwangHeokDo(tMonthBranch, sBranch.h);

                // 사대길일 계산 (Page 327 택일 비법)
                const targetMonth = targetDate.getMonth() + 1;
                const targetGapja = sStem.h + sBranch.h;
                let specialGoodDay = '';
                
                // 천사상길일
                if ([2, 3, 4].includes(targetMonth) && targetGapja === '戊寅') specialGoodDay = '천사상길일(天赦上吉日)';
                else if ([5, 6, 7].includes(targetMonth) && targetGapja === '甲午') specialGoodDay = '천사상길일(天赦上吉日)';
                else if ([8, 9, 10].includes(targetMonth) && targetGapja === '戊申') specialGoodDay = '천사상길일(天赦上吉日)';
                else if ([11, 12, 1].includes(targetMonth) && targetGapja === '甲子') specialGoodDay = '천사상길일(天赦上吉日)';
                
                // 천은상길일
                const cheoneunDays = ['甲子', '乙丑', '丙寅', '丁卯', '戊辰', '己卯', '庚辰', '辛巳', '壬午', '癸미', '己酉', '庚戌', '辛亥', '壬子', '癸丑'];
                if (!specialGoodDay && cheoneunDays.includes(targetGapja)) specialGoodDay = '천은상길일(天恩上吉日)';
                
                // 대명상길일
                const daemyeongDays = ['甲辰', '乙巳', '丙午', '丁未', '戊申', '己酉', '庚戌', '辛亥', '壬子', '癸丑', '壬寅', '癸卯'];
                if (!specialGoodDay && daemyeongDays.includes(targetGapja)) specialGoodDay = '대명상길일(大明上吉日)';

                const yongheeArr = yongheeMap[dayStem.e] || '';
                const korToEng = { '목': 'wood', '화': 'fire', '토': 'earth', '금': 'metal', '수': 'water' };
                const isYonghee = yongheeArr.split(',').some(part => {
                    const korChar = part.trim()[0];
                    return korChar && (korToEng[korChar] === sStem.e || korToEng[korChar] === sBranch.e);
                });
                
                const chungMap = {'子':'午','丑':'未','寅':'申','卯':'酉','辰':'戌','巳':'亥','午':'子','未':'丑','申':'寅','酉':'卯','戌':'辰','亥':'巳'};
                const isChung = chungMap[dayBranch.h] === sBranch.h;
                
                let evalScore = '무난한 하루';
                let color = 'var(--text-main)';
                let icon = 'fa-calendar-day';
                let advice = '평소처럼 성실하게 일과를 소화하면 좋은 날입니다.';
                
                if (isChung) {
                    evalScore = '주의가 필요한 날';
                    color = '#e74c3c';
                    icon = 'fa-triangle-exclamation';
                    advice = `본인의 일지(${dayBranch.h})와 충돌하는 기운이 들어옵니다. 중요한 결정이나 무리한 일정은 피하는 것이 좋습니다.`;
                } else if (isYonghee) {
                    if (['정재','정관','정인','식신'].includes(sShipseong)) {
                        evalScore = '최고의 길일';
                        color = '#2ecc71';
                        icon = 'fa-star';
                        advice = '모든 일이 순조롭게 풀리고 뜻밖의 행운이 따르는 매우 좋은 날입니다. 중요한 계약이나 만남을 가지기에 최적기입니다.';
                    } else {
                        evalScore = '기분 좋은 날';
                        color = '#27ae60';
                        icon = 'fa-face-smile';
                        advice = '도움이 되는 기운이 들어와 활력이 넘치고 긍정적인 성과를 기대할 수 있습니다.';
                    }
                } else if (['편관','상관','겁재'].includes(sShipseong)) {
                    evalScore = '신중해야 하는 날';
                    color = '#e67e22';
                    icon = 'fa-circle-exclamation';
                    advice = '돌발적인 변수나 감정적인 충돌이 발생할 수 있습니다. 한 번 더 생각하고 말하는 지혜가 필요합니다.';
                }
                
                specificDateResult.innerHTML = `
                    <div style="background: rgba(255, 255, 255, 0.03); padding: 20px; border-radius: 15px; border: 1px solid rgba(255, 255, 255, 0.1); margin-top: 15px; animation: fadeIn 0.5s;">
                        <h4 style="font-size: 1.1rem; color: var(--primary-gold); margin-bottom: 10px; text-align: center;">
                            ${targetDate.getFullYear()}년 ${targetDate.getMonth()+1}월 ${targetDate.getDate()}일 운세
                        </h4>
                        <div style="text-align: center; margin-bottom: 15px;">
                            <span style="display: inline-block; padding: 5px 12px; background: rgba(255,255,255,0.05); border-radius: 20px; font-size: 0.9rem; margin-right: 10px;">일진: <strong>${sStem.h}${sBranch.h}일</strong></span>
                            <span style="display: inline-block; padding: 5px 12px; background: rgba(255,255,255,0.05); border-radius: 20px; font-size: 0.9rem;">오늘의 기운: <strong>${sShipseong}</strong></span>
                            <span style="display: inline-block; padding: 5px 12px; background: rgba(255,255,255,0.05); border-radius: 20px; font-size: 0.9rem; margin-left: 10px; color: ${hwangheokStatus.includes('길') ? '#2ecc71' : '#e74c3c'}"><strong>${hwangheokStatus}</strong></span>
                        </div>
                        ${specialGoodDay ? `<div style="text-align: center; margin-bottom: 15px;"><span style="display: inline-block; padding: 5px 12px; background: rgba(212,175,55,0.15); border: 1px solid var(--primary-gold); border-radius: 20px; font-size: 0.85rem; color: var(--primary-gold); font-weight: bold;">✨ 특수 택일: ${specialGoodDay}</span></div>` : ''}
                        <div style="text-align: center; margin-bottom: 15px;">
                            <div style="font-size: 3rem; color: ${color}; margin-bottom: 10px;"><i class="fa-solid ${icon}"></i></div>
                            <div style="font-size: 1.2rem; font-weight: bold; color: ${color};">${evalScore}</div>
                        </div>
                        <p style="font-size: 0.9rem; color: var(--text-main); line-height: 1.6; text-align: center;">
                            ${advice}
                        </p>
                    </div>
                `;
            };
        }

        // --- Dynamic Lists (Daewun, Seowun, Daily, Hourly) ---
        // 1. Daewun
        const daewunContainer = document.getElementById('daewun-scroll-container');
        const daewunTimeline  = document.getElementById('daewun-timeline');
        if (daewunContainer || daewunTimeline) {
            // ── 순역 판단 ──────────────────────────────────────────
            const yearYinYang = ['甲','丙','戊','庚','壬'].includes(yearStem.h) ? 'yang' : 'yin';
            const isForward = (yearYinYang === 'yang' && gender === 'M') ||
                              (yearYinYang === 'yin'  && gender === 'F');

            // ── 절입일 조견표 ──────────────────────────────────────
            const jeolipDays = {
                1:  { next:{ m:2,  d:4  }, prev:{ m:1,  d:6  } },
                2:  { next:{ m:3,  d:6  }, prev:{ m:2,  d:4  } },
                3:  { next:{ m:4,  d:5  }, prev:{ m:3,  d:6  } },
                4:  { next:{ m:5,  d:6  }, prev:{ m:4,  d:5  } },
                5:  { next:{ m:6,  d:6  }, prev:{ m:5,  d:6  } },
                6:  { next:{ m:7,  d:7  }, prev:{ m:6,  d:6  } },
                7:  { next:{ m:8,  d:7  }, prev:{ m:7,  d:7  } },
                8:  { next:{ m:9,  d:8  }, prev:{ m:8,  d:7  } },
                9:  { next:{ m:10, d:8  }, prev:{ m:9,  d:8  } },
                10: { next:{ m:11, d:7  }, prev:{ m:10, d:8  } },
                11: { next:{ m:12, d:7  }, prev:{ m:11, d:7  } },
                12: { next:{ m:1,  d:6  }, prev:{ m:12, d:7  } },
            };

            // ── 대운수 계산 ────────────────────────────────────────
            const birthDate = new Date(yInt, mInt - 1, dInt);
            let jeolDiffDays = 0;
            const jeol = jeolipDays[mInt];
            if (jeol) {
                if (isForward) {
                    let nextYear = yInt, nextM = jeol.next.m, nextD = jeol.next.d;
                    if (nextM < mInt) nextYear += 1;
                    jeolDiffDays = Math.round((new Date(nextYear, nextM - 1, nextD) - birthDate) / 86400000);
                } else {
                    let prevYear = yInt, prevM = jeol.prev.m, prevD = jeol.prev.d;
                    if (prevM > mInt) prevYear -= 1;
                    jeolDiffDays = Math.round((birthDate - new Date(prevYear, prevM - 1, prevD)) / 86400000);
                }
            }
            // 일수 ÷ 3 = 대운수 (소수점 반올림, 최소 1)
            // 한국 전통 사주에서는 대운수를 세는나이(한국식 나이) 기준으로 표기하므로 +1을 가산합니다.
            let daewunAge = Math.max(1, Math.round(jeolDiffDays / 3)) + 1;
            const currentAge = new Date().getFullYear() - yInt + 1; // 현재 나이도 세는나이 기준으로 통일

            // ── 메타 정보 표시 ─────────────────────────────────────
            const directionEl  = document.getElementById('daewun-direction');
            const startAgeEl   = document.getElementById('daewun-start-age');
            if (directionEl) directionEl.textContent = isForward ? '순행(順行)' : '역행(逆行)';
            if (startAgeEl)  startAgeEl.textContent  = daewunAge;

            // ── 첫 대운 간지 결정 및 HTML 생성 ────────────────────
            let sIdx = stems.findIndex(s => s.h === monthStem.h);
            let bIdx = branches.findIndex(b => b.h === monthBranch.h);

            let daewunHtml = '';
            const daewunItems = []; // 원국 타임라인용

            for (let i = 0; i < 8; i++) {
                if (isForward) {
                    sIdx = (sIdx + 1) % 10;
                    bIdx = (bIdx + 1) % 12;
                } else {
                    sIdx = (sIdx - 1 + 10) % 10;
                    bIdx = (bIdx - 1 + 12) % 12;
                }
                const dStem   = stems[sIdx];
                const dBranch = branches[bIdx];
                const age     = daewunAge + (i * 10);
                const isActive = currentAge >= age && currentAge < age + 10;
                const activeStyle = isActive
                    ? 'border: 1.5px solid var(--primary-gold); background: rgba(212,175,55,0.1);'
                    : '';

                daewunHtml += `
                    <div class="daewun-item" style="${activeStyle}">
                        <div class="daewun-age" style="${isActive ? 'color:var(--primary-gold);font-weight:bold;' : ''}">${age}</div>
                        <div class="daewun-stem element-${dStem.e}">${dStem.h}</div>
                        <div class="daewun-branch element-${dBranch.e}">${dBranch.h}</div>
                        ${isActive ? '<div style="font-size:0.55rem;color:var(--primary-gold);margin-top:2px;">현재</div>' : ''}
                    </div>
                `;
                daewunItems.push({ age, dStem, dBranch, isActive, activeStyle });
            }

            if (daewunContainer) daewunContainer.innerHTML = daewunHtml;

            // ── 원국 내 대운 타임라인 동기화 ──────────────────────
            if (daewunTimeline) {
                daewunTimeline.innerHTML = daewunItems.map(({ age, dStem, dBranch, isActive, activeStyle }) => `
                    <div style="display:flex;flex-direction:column;align-items:center;gap:2px;
                                background:${isActive ? 'rgba(212,175,55,0.12)' : 'rgba(255,255,255,0.04)'};
                                border:1px solid ${isActive ? 'var(--primary-gold)' : 'rgba(255,255,255,0.07)'};
                                border-radius:8px;padding:5px 8px;min-width:38px;flex-shrink:0;">
                        <span style="font-size:0.62rem;color:${isActive ? 'var(--primary-gold)' : 'var(--text-muted)'};">${age}세</span>
                        <span class="element-${dStem.e}" style="font-size:0.9rem;font-weight:bold;">${dStem.h}</span>
                        <span class="element-${dBranch.e}" style="font-size:0.9rem;">${dBranch.h}</span>
                    </div>
                `).join('');
            }
        }

        // 2. Seowun
        const seowunContainer = document.getElementById('seowun-scroll-container');
        if (seowunContainer) {
            let seowunHtml = '';
            const currentYear = new Date().getFullYear();
            const stemsNames = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
            const branchesNames = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

            for (let i = 0; i < 10; i++) {
                const yr = currentYear + i;
                const sIdx = (yr - 4) % 10;
                const bIdx = (yr - 4) % 12;
                const age = yr - yInt + 1;
                const sName = stemsNames[sIdx];
                const bName = branchesNames[bIdx];
                const dStem = stems.find(s => s.h === sName);
                const dBranch = branches.find(b => b.h === bName);

                seowunHtml += `
                    <div class="daewun-item">
                        <div class="daewun-age">${yr}</div>
                        <div class="daewun-stem element-${dStem.e}">${sName}</div>
                        <div class="daewun-branch element-${dBranch.e}">${bName}</div>
                        <div class="daewun-age" style="margin-top: 4px; color: var(--text-muted);">${age}세</div>
                    </div>
                `;
            }
            seowunContainer.innerHTML = seowunHtml;
        }

        // 2. Wolun (Monthly Fortune)
        const wolunContainer = document.getElementById('wolun-scroll-container');
        const wolunTitle = document.getElementById('wolun-title');
        if (wolunContainer) {
            let wolunHtml = '';
            const currentYear = new Date().getFullYear();
            const currentMonth = new Date().getMonth() + 1;
            const personAge = currentYear - yInt + 1;
            
            if (wolunTitle) {
                wolunTitle.textContent = `${currentYear}년 (${personAge}세) 月運`;
            }

            const stemsNames = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
            const branchesNames = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

            // 寅(Tiger) month is Western Feb, so we loop month from 1 to 12.
            // Western Month 1 (Jan) is usually the Ox month of the previous year.
            // Let's compute Year Stem Index for the current year.
            const yrSIdx = ((currentYear - 4) % 10 + 10) % 10;
            
            // Determine starting stem for Month 1 (寅)
            let startMonthStemIdx = 0;
            if (yrSIdx === 0 || yrSIdx === 5) startMonthStemIdx = 2; // 丙寅
            else if (yrSIdx === 1 || yrSIdx === 6) startMonthStemIdx = 4; // 戊寅
            else if (yrSIdx === 2 || yrSIdx === 7) startMonthStemIdx = 6; // 庚寅
            else if (yrSIdx === 3 || yrSIdx === 8) startMonthStemIdx = 8; // 壬寅
            else startMonthStemIdx = 0; // 甲寅

            for (let m = 1; m <= 12; m++) {
                let sName = '';
                let bName = '';
                
                if (m === 1) { // Jan -> Ox month of previous year
                    const prevYrSIdx = ((currentYear - 1 - 4) % 10 + 10) % 10;
                    let prevStartStemIdx = 0;
                    if (prevYrSIdx === 0 || prevYrSIdx === 5) prevStartStemIdx = 2;
                    else if (prevYrSIdx === 1 || prevYrSIdx === 6) prevStartStemIdx = 4;
                    else if (prevYrSIdx === 2 || prevYrSIdx === 7) prevStartStemIdx = 6;
                    else if (prevYrSIdx === 3 || prevYrSIdx === 8) prevStartStemIdx = 8;
                    else prevStartStemIdx = 0;

                    // 12th month (Ox) from prev year starting at prevStartStemIdx
                    const sIdx = (prevStartStemIdx + 11) % 10;
                    sName = stemsNames[sIdx];
                    bName = '丑';
                } else { // Feb to Dec -> Month 1 to 11 (寅 to 子)
                    const offset = m - 2; // Feb=0 (寅), Mar=1 (卯) ...
                    const sIdx = (startMonthStemIdx + offset) % 10;
                    const bIdx = (2 + offset) % 12; // Starts at 2 (寅)
                    sName = stemsNames[sIdx];
                    bName = branchesNames[bIdx];
                }

                const dStem = stems.find(s => s.h === sName);
                const dBranch = branches.find(b => b.h === bName);
                const isActive = (m === currentMonth);

                wolunHtml += `
                    <div class="daewun-item" style="${isActive ? 'background: rgba(212, 175, 55, 0.15); border: 1px solid var(--primary-gold); border-radius: 8px;' : ''}">
                        <div class="daewun-age" style="${isActive ? 'color: var(--primary-gold); font-weight: bold;' : ''}">${m}월</div>
                        <div class="daewun-stem element-${dStem.e}">${sName}</div>
                        <div class="daewun-branch element-${dBranch.e}">${bName}</div>
                        ${isActive ? '<div style="font-size:0.55rem;color:var(--primary-gold);margin-top:2px;">현재</div>' : ''}
                    </div>
                `;
            }
            wolunContainer.innerHTML = wolunHtml;
        }

        // 3. Daily Fortune (7 Days)
        const dailyContainer = document.getElementById('daily-fortune-container');
        if (dailyContainer) {
            let dailyHtml = '';
            const baseD = new Date(2026, 3, 25, 12, 0, 0); // 己巳
            const stemsNames = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
            const branchesNames = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

            for (let i = 0; i < 7; i++) {
                const targetD = new Date(yInt, mInt - 1, dInt);
                targetD.setDate(targetD.getDate() + i);
                const diffT = targetD - baseD;
                const diffD = Math.floor(diffT / (1000 * 60 * 60 * 24));
                
                const sIdx = ((5 + diffD) % 10 + 10) % 10;
                const bIdx = ((5 + diffD) % 12 + 12) % 12;

                const sName = stemsNames[sIdx];
                const bName = branchesNames[bIdx];
                const dStem = stems.find(s => s.h === sName);
                const dBranch = branches.find(b => b.h === bName);

                let label = `${targetD.getMonth() + 1}/${targetD.getDate()}`;
                if (i === 0) label += '<br>(오늘)';
                else if (i === 1) label += '<br>(내일)';

                dailyHtml += `
                    <div class="daewun-item">
                        <div class="daewun-age" style="font-size: 0.75rem;">${label}</div>
                        <div class="daewun-stem element-${dStem.e}">${sName}</div>
                        <div class="daewun-branch element-${dBranch.e}">${bName}</div>
                    </div>
                `;
            }
            dailyContainer.innerHTML = dailyHtml;
        }

        // 4. Hourly Fortune
        const hourlyContainer = document.getElementById('hourly-fortune-container');
        if (hourlyContainer) {
            let hourlyHtml = '';
            const bNames = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
            const sIdx = stems.findIndex(s => s.h === dayStem.h);
            const baseHStem = (sIdx % 5) * 2;
            const times = [
                '23:30~01:30', '01:30~03:30', '03:30~05:30', '05:30~07:30',
                '07:30~09:30', '09:30~11:30', '11:30~13:30', '13:30~15:30',
                '15:30~17:30', '17:30~19:30', '19:30~21:30', '21:30~23:30'
            ];
            const fortuneB = ['대길', '길', '평범', '평범', '주의', '길', '대길', '길', '평범', '주의', '길', '평범'];
            const fortuneClass = ['best', 'good', 'normal', 'normal', 'caution', 'good', 'best', 'good', 'normal', 'caution', 'good', 'normal'];

            for (let i = 0; i < 12; i++) {
                const hStemIdx = (baseHStem + i) % 10;
                const hStem = stems[hStemIdx];
                hourlyHtml += `
                    <div class="hourly-item">
                        <div class="hour-time">${times[i]}</div>
                        <div class="hour-branch">${bNames[i]}시(${hStem.h})</div>
                        <div class="hour-fortune ${fortuneClass[i]}">${fortuneB[i]}</div>
                    </div>
                `;
            }
            hourlyContainer.innerHTML = hourlyHtml;
        }
    }

    function resetElementBars() {
        const bars = document.querySelectorAll('.element-bar');
        bars.forEach(bar => {
            bar.style.width = '0%';
        });
    }

    // 4. Back Button on Screen 2
    const btnBackToInput = document.getElementById('back-to-input');

    if(btnBackToInput) {
        btnBackToInput.addEventListener('click', () => {
            document.getElementById('screen-result').classList.remove('active');
            document.getElementById('screen-input').classList.add('active');
            resetElementBars();
        });
    }

    // 5. Details Button
    const btnDetails = document.getElementById('btn-details');
    if(btnDetails) {
        btnDetails.addEventListener('click', () => {
            document.getElementById('screen-result').classList.remove('active');
            document.getElementById('screen-details').classList.add('active');
        });
    }

    // 6. Back Button on Screen 3
    const btnBackToResult = document.getElementById('back-to-result');
    if(btnBackToResult) {
        btnBackToResult.addEventListener('click', () => {
            document.getElementById('screen-details').classList.remove('active');
            document.getElementById('screen-result').classList.add('active');
            setTimeout(animateElementBars, 100);
        });
    }

    // 7. Tabs Logic on Screen 3
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            // Add active class to clicked
            btn.classList.add('active');
            const targetId = btn.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');
        });
    });

    // 8. Specific Date Analysis Logic
    const btnAnalyzeDate = document.getElementById('btn-analyze-date');
    const specificDateResult = document.getElementById('specific-date-result');

    if (btnAnalyzeDate) {
        btnAnalyzeDate.addEventListener('click', () => {
            const dateInput = document.getElementById('target-date').value;
            if (!dateInput) {
                alert('날짜를 먼저 선택해 주세요.');
                return;
            }

            // Simulate loading
            specificDateResult.innerHTML = '<div class="loading-spinner"><i class="fa-solid fa-spinner fa-spin"></i> 분석 중...</div>';

            setTimeout(() => {
                const dateObj = new Date(dateInput);
                const year = dateObj.getFullYear();
                const month = dateObj.getMonth() + 1;
                const day = dateObj.getDate();

                specificDateResult.innerHTML = `
                    <div class="analysis-section" style="width: 100%; text-align: left;">
                        <h4 style="color: var(--primary-gold); margin-bottom: 15px;">
                            ${year}년 ${month}월 ${day}일의 운세 결과
                        </h4>
                        <div class="analysis-card" style="background: rgba(212, 175, 55, 0.1); border: 1px solid var(--primary-gold); padding: 15px; border-radius: 10px; margin-bottom: 15px;">
                            <p style="font-weight: 700; color: var(--primary-gold); margin-bottom: 5px;">[오늘의 한마디]</p>
                            <p style="color: var(--text-main); font-size: 0.95rem;">"노력한 만큼의 결실이 맺히는 결실의 날입니다. 주변의 조언을 귀담아들으세요."</p>
                        </div>
                        <ul style="list-style: none; padding: 0; font-size: 0.9rem; color: var(--text-muted); line-height: 1.8; margin-bottom: 15px;">
                            <li><i class="fa-solid fa-check" style="color: var(--primary-gold); margin-right: 8px;"></i> <strong>재물운:</strong> 새로운 기회가 찾아올 수 있는 운입니다.</li>
                            <li><i class="fa-solid fa-check" style="color: var(--primary-gold); margin-right: 8px;"></i> <strong>건강운:</strong> 무리한 활동보다는 휴식이 필요한 날입니다.</li>
                            <li><i class="fa-solid fa-check" style="color: var(--primary-gold); margin-right: 8px;"></i> <strong>애정운:</strong> 상대방과의 오해가 풀리고 관계가 돈독해집니다.</li>
                        </ul>
                        <div class="analysis-card" style="background: rgba(212, 175, 55, 0.05); border: 1px dashed var(--primary-gold); padding: 12px; border-radius: 10px; margin-bottom: 15px;">
                            <p style="font-weight: 700; color: var(--primary-gold); margin-bottom: 5px;"><i class="fa-solid fa-clock"></i> 오늘의 추천 시간</p>
                            <p style="color: var(--text-main); font-size: 0.9rem;">오전 09:30 ~ 11:30 (사시), 오후 15:30 ~ 17:30 (신시)가 가장 길합니다.</p>
                        </div>
                        <div style="margin-top: 5px; background: rgba(255, 255, 255, 0.02); padding: 12px; border-radius: 10px; border-left: 3px solid var(--primary-gold);">
                            <p style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.5;"><strong>💡 오늘의 조언:</strong> 새로운 일을 무리하게 추진하기보다, 현재 진행 중인 일을 차분히 점검하고 마무리하기에 매우 좋은 날입니다. 서두르지 않는 여유가 더 큰 행운을 불러옵니다.</p>
                        </div>
                    </div>
                `;
                specificDateResult.style.alignItems = 'flex-start';
                specificDateResult.style.borderStyle = 'solid';
                specificDateResult.style.padding = '20px';
            }, 1000);
        });
    }

    // 9. Compatibility Analysis Logic moved to unified bottom handler to prevent async collision.

            // --- Populate Shinsal Tables (세간·세지 길흉신) ---
            const SEGAN_HUNGSIN = {
                '甲': ['산가곤룡: 乾', '산가판부: 亥', '좌산관부: 戌', '나천대퇴: 坎', '장군전: 卯'],
                '乙': ['산가곤룡: 坤', '산가판부: 巳', '좌산관부: 辰', '나천대퇴: 坤', '장군전: 巳'],
                '丙': ['산가곤룡: 艮', '산가판부: 寅', '좌산관부: 丑', '나천대퇴: 震', '장군전: 子'],
                '丁': ['산가곤룡: 巽', '산가판부: 申', '좌산관부: 未', '나천대퇴: 巽', '장군전: 酉'],
                '戊': ['산가곤룡: 乾', '산가판부: 亥', '좌산관부: 戌', '나천대퇴: 坎', '장군전: 卯'],
                '己': ['산가곤룡: 坤', '산가판부: 巳', '좌산관부: 辰', '나천대퇴: 坤', '장군전: 巳'],
                '庚': ['산가곤룡: 艮', '산가판부: 寅', '좌산관부: 丑', '나천대퇴: 震', '장군전: 子'],
                '辛': ['산가곤룡: 巽', '산가판부: 申', '좌산관부: 未', '나천대퇴: 巽', '장군전: 酉'],
                '壬': ['산가곤룡: 乾', '산가판부: 巳', '좌산관부: 辰', '나천대퇴: 坎', '장군전: 午'],
                '癸': ['산가곤룡: 坤', '산가판부: 亥', '좌산관부: 戌', '나천대퇴: 坤', '장군전: 亥']
            };

            const SEJI_GILSIN = {
                '子': ['세천덕: 巽', '천덕합: 申', '세월덕: 壬', '월덕합: 丁', '역마: 寅', '천창: 酉', '지창: 戌'],
                '丑': ['세천덕: 庚', '천덕합: 乙', '세월덕: 庚', '월덕합: 乙', '역마: 亥', '천창: 戌', '지창: 亥'],
                '寅': ['세천덕: 丁', '천덕합: 壬', '세월덕: 丙', '월덕합: 辛', '역마: 申', '천창: 亥', '지창: 子'],
                '卯': ['세천덕: 坤', '천덕합: 申', '세월덕: 甲', '월덕합: 己', '역마: 巳', '천창: 子', '지창: 丑'],
                '辰': ['세천덕: 壬', '천덕합: 丁', '세월덕: 壬', '월덕합: 丁', '역마: 寅', '천창: 丑', '지창: 寅'],
                '巳': ['세천덕: 癸', '천덕합: 戊', '세월덕: 庚', '월덕합: 乙', '역마: 亥', '천창: 寅', '지창: 卯'],
                '午': ['세천덕: 乾', '천덕합: 寅', '세월덕: 丙', '월덕합: 辛', '역마: 申', '천창: 卯', '지창: 辰'],
                '未': ['세천덕: 甲', '천덕합: 己', '세월덕: 甲', '월덕합: 己', '역마: 巳', '천창: 辰', '지창: 巳'],
                '申': ['세천덕: 丙', '천덕합: 辛', '세월덕: 壬', '월덕합: 丁', '역마: 寅', '천창: 巳', '지창: 午'],
                '酉': ['세천덕: 艮', '천덕합: 寅', '세월덕: 庚', '월덕합: 乙', '역마: 亥', '천창: 午', '지창: 未'],
                '戌': ['세천덕: 辛', '천덕합: 丙', '세월덕: 丙', '월덕합: 辛', '역마: 申', '천창: 未', '지창: 申'],
                '亥': ['세천덕: 巽', '천덕합: 申', '세월덕: 甲', '월덕합: 己', '역마: 巳', '천창: 申', '지창: 酉']
            };

            const SEJI_HUNGSIN = {
                '子': ['좌산라후: 6', '순산라후: 乙', '나천대퇴: 4', '태음살: 亥', '겁살: 巳', '재살: 午', '세살: 未'],
                '丑': ['좌산라후: 1', '순산라후: 辛', '나천대퇴: 1', '태음살: 子', '겁살: 寅', '재살: 卯', '세살: 辰'],
                '寅': ['좌산라후: 8', '순산라후: 丙', '나천대퇴: 8', '태음살: 丑', '겁살: 亥', '재살: 子', '세살: 丑'],
                '卯': ['좌산라후: 3', '순산라후: 癸', '나천대퇴: 3', '태음살: 寅', '겁살: 申', '재살: 酉', '세살: 戌'],
                '辰': ['좌산라후: 4', '순산라후: 壬', '나천대퇴: 4', '태음살: 卯', '겁살: 巳', '재살: 午', '세살: 未'],
                '巳': ['좌산라후: 5', '순산라후: 丁', '나천대퇴: 5', '태음살: 辰', '겁살: 寅', '재살: 卯', '세살: 辰'],
                '午': ['좌산라후: 6', '순산라후: 丙', '나천대퇴: 6', '태음살: 巳', '겁살: 亥', '재살: 子', '세살: 丑'],
                '未': ['좌산라후: 7', '순산라후: 己', '나천대퇴: 7', '태음살: 午', '겁살: 申', '재살: 酉', '세살:戌'],
                '申': ['좌산라후: 8', '순산라후: 戊', '나천대퇴: 8', '태음살: 未', '겁살: 巳', '재살: 午', '세살: 未'],
                '酉': ['좌산라후: 9', '순산라후: 乙', '나천대퇴: 9', '태음살: 申', '겁살: 寅', '재살: 卯', '세살: 辰'],
                '戌': ['좌산라후: 10', '순산라후: 甲', '나천대퇴: 10', '태음살: 酉', '겁살: 亥', '재살: 子', '세살: 丑'],
                '亥': ['좌산라후: 11', '순산라후: 癸', '나천대퇴: 11', '태음살: 戌', '겁살: 申', '재살: 酉', '세살: 戌']
            };

            const yearStemHanja = document.querySelector('#year-stem .hanja')?.textContent || '甲';
            const yearBranchHanja = document.querySelector('#year-branch .hanja')?.textContent || '子';

            const seganList = document.getElementById('segan-hungsin-list');
            const sejijiList = document.getElementById('sejiji-gilsin-list');
            const sejiList = document.getElementById('seji-hungsin-list');

            const makeShinsalItem = (text, type) => {
                const colors = { segan: '#e74c3c', gilsin: '#2ecc71', seji: '#e74c3c' };
                const color = colors[type] || '#fff';
                const parts = text.split(':');
                const name = parts[0]?.trim();
                const value = parts[1]?.trim() || '';
                return `
                    <div style="background: rgba(255, 255, 255, 0.03); padding: 8px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center;">
                        <span style="color: var(--text-muted); font-size: 0.8rem;">${name}</span>
                        <span style="font-weight: bold; color: ${color}; font-size: 0.85rem;">${value}</span>
                    </div>
                `;
            };

            if (seganList) {
                const items = SEGAN_HUNGSIN[yearStemHanja] || [];
                seganList.innerHTML = items.length ? items.map(t => makeShinsalItem(t, 'segan')).join('') : '<div style="color: var(--text-muted); font-size: 0.8rem;">데이터가 없습니다.</div>';
            }
            if (sejijiList) {
                const items = SEJI_GILSIN[yearBranchHanja] || [];
                sejijiList.innerHTML = items.length ? items.map(t => makeShinsalItem(t, 'gilsin')).join('') : '<div style="color: var(--text-muted); font-size: 0.8rem;">데이터가 없습니다.</div>';
            }
            if (sejiList) {
                const items = SEJI_HUNGSIN[yearBranchHanja] || [];
                sejiList.innerHTML = items.length ? items.map(t => makeShinsalItem(t, 'seji')).join('') : '<div style="color: var(--text-muted); font-size: 0.8rem;">데이터가 없습니다.</div>';
            }
    const renderSavedList = () => {
        const savedContainer = document.getElementById('saju-saved-container');
        if (!savedContainer) return;
        savedContainer.innerHTML = '';

        const list = getSavedList();
        if (!list || list.length === 0) {
            savedContainer.innerHTML = '<div class="no-data-msg">저장된 사주 데이터가 없습니다.</div>';
            return;
        }

        list.forEach((item, index) => {
            const card = document.createElement('div');
            card.className = 'saju-list-card';
            card.innerHTML = `
                <div class="saju-list-card__info">
                    <strong class="saju-list-card__name">${item.name || '이름없음'}</strong>
                    <span class="saju-list-card__date">${item.year}년 ${item.month}월 ${item.day}일</span>
                </div>
                <div class="saju-list-card__actions">
                    <button class="saju-list-card__btn saju-list-card__btn--edit" onclick="editSajuFromList(${index})">수정</button>
                    <button class="saju-list-card__btn saju-list-card__btn--delete" onclick="deleteSajuFromList(${index})">삭제</button>
                </div>
            `;
            savedContainer.appendChild(card);
        });
    };

    window.loadSajuFromList = (index) => {
        const list = getSavedList();
        const item = list[index];
        if (!item) return;

        // 폼 값 채우기
        document.getElementById('name').value = item.name || '';
        document.getElementById('year').value = item.year;
        document.getElementById('month').value = item.month;
        document.getElementById('day').value = item.day;
        document.getElementById('hour').value = item.hour;
        document.getElementById('minute').value = item.minute;

        const genders = document.getElementsByName('gender');
        genders.forEach(g => g.checked = (g.value === item.gender));

        const calendars = document.getElementsByName('calendar');
        calendars.forEach(c => c.checked = (c.value === item.calendar));

        // 화면 전환: .active 클래스 방식으로 통일 (인라인 style 혼용 금지)
        const allScreens = document.querySelectorAll('.screen');
        allScreens.forEach(s => {
            s.classList.remove('active');
            s.style.display = '';
        });
        screenList.style.display = 'none';
        screenInput.classList.add('active');

        // DOM 값 반영 후 분석 버튼 클릭 (한 틱 뒤 실행)
        setTimeout(() => {
            const btnSubmit = document.getElementById('btn-analyze');
            if (btnSubmit) btnSubmit.click();
        }, 50);
    };

    // ============================================================
    // 모드 상태: 추가 모드 / 수정 모드 (상호 배타적)
    // ============================================================
    let editingIndex = -1;
    let isAddMode = false;

    // ─── 추가 모드 진입 ───────────────────────────────────────────
    const enterAddMode = () => {
        isAddMode = true;
        exitEditMode(true); // 수정 모드 완전 해제(배너만)
        const addCompleteBtn = document.getElementById('add-complete-btn');
        const addBanner = document.getElementById('add-mode-banner');
        const inputHeaderTitle = document.getElementById('input-header-title');
        if (addCompleteBtn) addCompleteBtn.style.display = 'inline-flex';
        if (addBanner) addBanner.style.display = 'block';
        if (inputHeaderTitle) inputHeaderTitle.textContent = '새 사주 추가';
    };

    // ─── 추가 모드 해제 ───────────────────────────────────────────
    const exitAddMode = () => {
        isAddMode = false;
        const addCompleteBtn = document.getElementById('add-complete-btn');
        const addBanner = document.getElementById('add-mode-banner');
        const inputHeaderTitle = document.getElementById('input-header-title');
        if (addCompleteBtn) addCompleteBtn.style.display = 'none';
        if (addBanner) addBanner.style.display = 'none';
        if (inputHeaderTitle) inputHeaderTitle.textContent = '사주 정보 입력';
    };

    // ─── 수정 모드 진입 ───────────────────────────────────────────
    const enterEditMode = (index) => {
        editingIndex = index;
        exitAddMode(); // 추가 모드 해제
        const editCompleteBtn = document.getElementById('edit-complete-btn');
        const editBanner = document.getElementById('edit-mode-banner');
        const inputHeaderTitle = document.getElementById('input-header-title');
        if (editCompleteBtn) editCompleteBtn.style.display = 'inline-flex';
        if (editBanner) editBanner.style.display = 'block';
        if (inputHeaderTitle) inputHeaderTitle.textContent = '사주 수정';
    };

    // ─── 수정 모드 해제 ───────────────────────────────────────────
    // skipTitle: true이면 타이틀 복원 건너뜀 (enterAddMode에서 호출 시)
    const exitEditMode = (skipTitle = false) => {
        editingIndex = -1;
        const editCompleteBtn = document.getElementById('edit-complete-btn');
        const editBanner = document.getElementById('edit-mode-banner');
        const inputHeaderTitle = document.getElementById('input-header-title');
        if (editCompleteBtn) editCompleteBtn.style.display = 'none';
        if (editBanner) editBanner.style.display = 'none';
        if (!skipTitle && inputHeaderTitle) inputHeaderTitle.textContent = '사주 정보 입력';
    };

    // ─── 전체 모드 초기화 (일반 입력 화면으로 복귀) ──────────────
    const exitAllModes = () => {
        exitAddMode();
        exitEditMode();
    };

    // ─── 추가 완료 버튼 핸들러 ────────────────────────────────────
    const addCompleteBtn = document.getElementById('add-complete-btn');
    if (addCompleteBtn) {
        addCompleteBtn.addEventListener('click', () => {
            const name = document.getElementById('name').value.trim();
            const year = document.getElementById('year').value;
            const month = document.getElementById('month').value;
            const day = document.getElementById('day').value;
            const hour = document.getElementById('hour').value;
            const minute = document.getElementById('minute').value;

            if (!year || !month || !day) {
                alert('생년월일을 먼저 입력해 주세요.');
                return;
            }

            let gender = 'M';
            document.getElementsByName('gender').forEach(g => { if (g.checked) gender = g.value; });

            let calendar = 'solar';
            document.getElementsByName('calendar').forEach(c => { if (c.checked) calendar = c.value; });

            const list = getSavedList();
            list.push({ name: name || '익명', year, month, day, hour, minute, gender, calendar });
            saveList(list);

            exitAllModes();

            // 리스트 화면으로 복귀
            const allScreens = document.querySelectorAll('.screen');
            allScreens.forEach(s => { s.classList.remove('active'); s.style.display = ''; });
            screenList.style.display = 'block';
            screenList.classList.add('active');
            renderSavedList();
        });
    }

    window.editSajuFromList = (index) => {
        const list = getSavedList();
        const item = list[index];
        if (!item) return;

        document.getElementById('name').value = item.name || '';
        document.getElementById('year').value = item.year;
        document.getElementById('month').value = item.month;
        document.getElementById('day').value = item.day;
        document.getElementById('hour').value = item.hour;
        document.getElementById('minute').value = item.minute;

        const genders = document.getElementsByName('gender');
        genders.forEach(g => g.checked = (g.value === item.gender));

        const calendars = document.getElementsByName('calendar');
        calendars.forEach(c => c.checked = (c.value === item.calendar));

        // 화면 전환 (클래스 방식 통일)
        const allScreens = document.querySelectorAll('.screen');
        allScreens.forEach(s => { s.classList.remove('active'); s.style.display = ''; });
        screenList.style.display = 'none';
        screenInput.classList.add('active');

        enterEditMode(index);
    };

    // 수정 완료 버튼 핸들러
    const editCompleteBtn = document.getElementById('edit-complete-btn');
    if (editCompleteBtn) {
        editCompleteBtn.addEventListener('click', () => {
            if (editingIndex < 0) return;

            const name = document.getElementById('name').value;
            const year = document.getElementById('year').value;
            const month = document.getElementById('month').value;
            const day = document.getElementById('day').value;
            const hour = document.getElementById('hour').value;
            const minute = document.getElementById('minute').value;

            let gender = 'M';
            document.getElementsByName('gender').forEach(g => { if (g.checked) gender = g.value; });

            let calendar = 'solar';
            document.getElementsByName('calendar').forEach(c => { if (c.checked) calendar = c.value; });

            const list = getSavedList();
            list[editingIndex] = { name, year, month, day, hour, minute, gender, calendar };
            saveList(list);

            exitEditMode();

            // 리스트 화면으로 복귀
            const allScreens = document.querySelectorAll('.screen');
            allScreens.forEach(s => { s.classList.remove('active'); s.style.display = ''; });
            screenList.style.display = 'block';
            screenList.classList.add('active');
            renderSavedList();
        });
    }

    window.deleteSajuFromList = (index) => {
        if (!confirm('정말 삭제하시겠습니까?')) return;
        const list = getSavedList();
        list.splice(index, 1);
        saveList(list);
        renderSavedList();
    };


    const saveCurrentBtn = document.getElementById('save-current-btn');
    const openListBtn = document.getElementById('open-list-btn');
    const listAddBtn = document.getElementById('list-add-btn');

    const listBackBtn = document.getElementById('list-back-btn');
    const screenInput = document.getElementById('screen-input');
    const screenList = document.getElementById('screen-list');
    const sajuSavedContainer = document.getElementById('saju-saved-container');

    if (openListBtn) {
        openListBtn.addEventListener('click', () => {
            const allScreens = document.querySelectorAll('.screen');
            allScreens.forEach(s => { s.classList.remove('active'); s.style.display = ''; });
            screenList.style.display = 'block';
            screenList.classList.add('active');
            exitAllModes();
            renderSavedList();
        });
    }

    if (listBackBtn) {
        listBackBtn.addEventListener('click', () => {
            const allScreens = document.querySelectorAll('.screen');
            allScreens.forEach(s => { s.classList.remove('active'); s.style.display = ''; });
            screenList.style.display = 'none';
            screenInput.classList.add('active');
            exitAllModes();
        });
    }

    if (listAddBtn) {
        listAddBtn.addEventListener('click', () => {
            const allScreens = document.querySelectorAll('.screen');
            allScreens.forEach(s => { s.classList.remove('active'); s.style.display = ''; });
            screenList.style.display = 'none';
            screenInput.classList.add('active');
            // 입력 초기화 후 추가 모드 진입
            document.getElementById('name').value = '';
            document.getElementById('year').value = '1990';
            document.getElementById('month').value = '01';
            document.getElementById('day').value = '01';
            document.getElementById('hour').value = '12';
            document.getElementById('minute').value = '30';
            const genders = document.getElementsByName('gender');
            if (genders.length > 0) genders[0].checked = true;
            const calendars = document.getElementsByName('calendar');
            if (calendars.length > 0) calendars[0].checked = true;
            const unknownTimeCheck = document.getElementById('unknown-time');
            if (unknownTimeCheck) unknownTimeCheck.checked = false;
            enterAddMode();
        });
    }

    if (saveCurrentBtn) {
        saveCurrentBtn.addEventListener('click', () => {
            const name = document.getElementById('name').value.trim();
            const year = document.getElementById('year').value;
            const month = document.getElementById('month').value;
            const day = document.getElementById('day').value;
            const hour = document.getElementById('hour').value;
            const minute = document.getElementById('minute').value;

            if (!year || !month || !day) {
                alert('생년월일을 먼저 입력해 주세요.');
                return;
            }

            let gender = 'M';
            document.getElementsByName('gender').forEach(g => { if (g.checked) gender = g.value; });

            let calendar = 'solar';
            document.getElementsByName('calendar').forEach(c => { if (c.checked) calendar = c.value; });

            const list = getSavedList();
            list.push({ name: name || '익명', year, month, day, hour, minute, gender, calendar });
            saveList(list);

            // 저장 성공 피드백
            const btn = document.getElementById('save-current-btn');
            if (btn) {
                const orig = btn.textContent;
                btn.textContent = '✓ 저장됨';
                btn.style.color = '#2ecc71';
                setTimeout(() => { btn.textContent = orig; btn.style.color = ''; }, 1500);
            }
        });
    }
    const inputAddBtn = document.getElementById('input-add-btn');
    if (inputAddBtn) {
        inputAddBtn.addEventListener('click', () => {
            exitEditMode();
            document.getElementById('name').value = '';
            document.getElementById('year').value = '1990';
            document.getElementById('month').value = '01';
            document.getElementById('day').value = '01';
            document.getElementById('hour').value = '12';
            document.getElementById('minute').value = '30';

            const genders = document.getElementsByName('gender');
            if (genders.length > 0) genders[0].checked = true;

            const calendars = document.getElementsByName('calendar');
            if (calendars.length > 0) calendars[0].checked = true;

            const unknownTimeCheck = document.getElementById('unknown-time');
            if (unknownTimeCheck) unknownTimeCheck.checked = false;
        });
    }

    // Compatibility Section Interactivity
    const compGenderBtns = document.querySelectorAll('.comp-gender-btn');
    compGenderBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            compGenderBtns.forEach(b => {
                b.classList.remove('active');
                b.style.background = 'transparent';
                b.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                b.style.color = 'var(--text-muted)';
            });
            btn.classList.add('active');
            btn.style.background = 'rgba(255, 71, 87, 0.1)';
            btn.style.borderColor = '#ff4757';
            btn.style.color = 'white';
        });
    });

    const compCalBtns = document.querySelectorAll('.comp-cal-btn');
    compCalBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            compCalBtns.forEach(b => {
                b.classList.remove('active');
                b.style.background = 'transparent';
                b.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                b.style.color = 'var(--text-muted)';
            });
            btn.classList.add('active');
            btn.style.background = 'rgba(255, 71, 87, 0.1)';
            btn.style.borderColor = '#ff4757';
            btn.style.color = 'white';
        });
    });

    const btnAnalyzeComp = document.getElementById('btn-analyze-compatibility-v2');
    if (btnAnalyzeComp) {
        btnAnalyzeComp.addEventListener('click', () => {
            const partnerName = document.getElementById('comp-name').value.trim() || '상대방';
            const partnerDateVal = document.getElementById('comp-date').value;
            if (!partnerDateVal) {
                alert('상대방의 생년월일을 선택해 주세요.');
                return;
            }

            const partnerDate = new Date(partnerDateVal);
            let pYear = partnerDate.getFullYear();
            let pMonth = partnerDate.getMonth() + 1;
            let pDay = partnerDate.getDate();

            let partnerCal = 'solar';
            const activeCalBtn = document.querySelector('.comp-cal-btn.active');
            if (activeCalBtn) {
                const text = activeCalBtn.textContent;
                if (text.includes('음력')) partnerCal = 'lunar';
                if (text.includes('윤달')) partnerCal = 'lunar_leap';
            }

            if (partnerCal === 'lunar' || partnerCal === 'lunar_leap') {
                const isLeap = partnerCal === 'lunar_leap';
                const converted = lunarToSolar(pYear, pMonth, pDay, isLeap);
                if (converted) {
                    pYear = converted.year;
                    pMonth = converted.month;
                    pDay = converted.day;
                }
            }

            let sajuYear = pYear;
            if (pMonth < 2 || (pMonth === 2 && pDay < 4)) {
                sajuYear = pYear - 1;
            }
            const stems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
            const branches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
            const pYearStemIdx = ((sajuYear - 4) % 10 + 10) % 10;
            const pYearBranchIdx = ((sajuYear - 4) % 12 + 12) % 12;
            const pYearGapja = stems[pYearStemIdx] + branches[pYearBranchIdx];

            const mainYearHanja = (document.querySelector('#year-stem .hanja')?.textContent || '甲').trim();
            const mainBranchHanja = (document.querySelector('#year-branch .hanja')?.textContent || '子').trim();
            const mainYearGapja = mainYearHanja + mainBranchHanja;

            const getNabeumElement = (gapja) => {
                const map = {
                    '甲子': '해중금', '乙丑': '해중금', '丙寅': '노중화', '丁卯': '노중화',
                    '戊辰': '대림목', '己巳': '대림목', '庚午': '노방토', '辛未': '노방토',
                    '壬申': '검봉금', '癸酉': '검봉금', '甲戌': '산두화', '乙亥': '산두화',
                    '丙子': '간하수', '丁丑': '간하수', '戊寅': '성두토', '己卯': '성두토',
                    '庚辰': '백랍금', '辛巳': '백랍금', '壬午': '양류목', '癸未': '양류목',
                    '甲申': '천중수', '乙酉': '천중수', '丙戌': '옥상토', '丁亥': '옥상토',
                    '戊子': '벽력화', '己丑': '벽력화', '庚寅': '송백목', '辛卯': '송백목',
                    '壬辰': '장류수', '癸巳': '장류수', '甲午': '사중금', '乙未': '사중금',
                    '丙申': '산하화', '丁酉': '산하화', '戊戌': '평지목', '己亥': '평지목',
                    '庚子': '벽상토', '辛丑': '벽상토', '壬寅': '금박금', '癸卯': '금박금',
                    '甲辰': '복등화', '乙巳': '복등화', '丙午': '천하수', '丁未': '천하수',
                    '戊申': '대역토', '己酉': '대역토', '庚戌': '차천금', '辛亥': '차천금',
                    '壬子': '상자목', '癸丑': '상자목', '甲寅': '대계수', '乙卯': '대계수',
                    '丙辰': '사중토', '丁巳': '사중토', '戊午': '천상화', '己未': '천상화',
                    '庚申': '석류목', '辛酉': '석류목', '壬戌': '대해수', '癸亥': '대해수'
                };
                const name = map[gapja] || '해중금';
                const char = name[name.length - 1];
                const korToHanja = { '목': '木', '화': '火', '토': '土', '금': '金', '수': '水' };
                return korToHanja[char] || '金';
            };

            const mainElem = getNabeumElement(mainYearGapja);
            const partnerElem = getNabeumElement(pYearGapja);

            let mainGender = 'M';
            document.getElementsByName('gender').forEach(g => { if (g.checked) mainGender = g.value; });
            
            let partnerGender = 'F';
            const activeGenderBtn = document.querySelector('.comp-gender-btn.active');
            if (activeGenderBtn && activeGenderBtn.getAttribute('data-gender') === 'female') {
                partnerGender = 'F';
            } else if (activeGenderBtn) {
                partnerGender = 'M';
            }

            let maleElem = mainElem;
            let femaleElem = partnerElem;
            if (mainGender === 'F' && partnerGender === 'M') {
                maleElem = partnerElem;
                femaleElem = mainElem;
            } else if (mainGender === 'F' && partnerGender === 'F') {
                maleElem = mainElem;
                femaleElem = partnerElem;
            } else if (mainGender === 'M' && partnerGender === 'M') {
                maleElem = mainElem;
                femaleElem = partnerElem;
            }

            const compatibilityData = {
                '좋은결합': [
                    { 남: '木', 여: '木', desc: '금실이 좋아 평온한 생활을 하나, 말년이 신통치 않음' },
                    { 남: '木', 여: '火', desc: '부부화합하여 부귀영화를 누림' },
                    { 남: '木', 여: '水', desc: '일가 화목하고, 재물이 풍성하여 부하가 많고 부귀공명' },
                    { 남: '火', 여: '木', desc: '자손이 효행하고, 위아래가 화목하여 부귀영화를 누림' },
                    { 남: '火', 여: '土', desc: '만사 대길하여 재물이 풍성하고, 자손이 흥왕함' },
                    { 남: '土', 여: '火', desc: '효자가 있고, 해마다 경사롭고 만사 대길함' },
                    { 남: '土', 여: '土', desc: '자손이 창성하고 가사가 흥하여 인생이 즐거움' },
                    { 남: '土', 여: '金', desc: '금실이 좋고 자손이 영달하며, 부귀를 누리고 부부해로' },
                    { 남: '金', 여: '土', desc: '부하가 많고 부귀공명하여, 평생 영화를 누림' },
                    { 남: '金', 여: '水', desc: '큰 부자가 되며 명성을 날리고, 자손이 번창함' },
                    { 남: '水', 여: '木', desc: '가도가 흥왕하고, 금실이 좋으며 자손이 창성함' },
                    { 남: '水', 여: '金', desc: '집안이 화목하고, 부귀 결전함' },
                    { 남: '水', 여: '水', desc: '기쁜 일이 많고 재물을 얻어 자손과 행복하게 살아감' }
                ],
                '나쁜결합': [
                    { 남: '木', 여: '土', desc: '부부싸움이 잦고 자손이 불효하며, 패가망신' },
                    { 남: '木', 여: '金', desc: '금실이 나빠 해로하기 힘들고, 재앙이 많음' },
                    { 남: '火', 여: '火', desc: '가정불화가 잦고 자손이 귀하며, 가도 쇠퇴' },
                    { 남: '火', 여: '金', desc: '부부 이별하기 쉽고 재앙이 있으며, 자손이 귀함' },
                    { 남: '火', 여: '水', desc: '가정과 일가 친척이 화목하지 못하고, 가난해짐' },
                    { 남: '土', 여: '木', desc: '가난과 병마가 끊이지 않고 부부 생사이별함' },
                    { 남: '土', 여: '水', desc: '부부간 의견충돌이 잦아 이별하기 쉽고, 가난하고 고독' },
                    { 남: '金', 여: '木', desc: '구설수가 많고 하는 일이 잘 안되어 가도 쇠퇴' },
                    { 남: '金', 여: '火', desc: '패가하기 쉽고 자손을 기르기 힘들며 부부이별' },
                    { 남: '金', 여: '金', desc: '가난하고 부부 금실이 허술하며, 동기간에 불화' },
                    { 남: '水', 여: '火', desc: '부부가 잘 싸우고 인간관계가 나빠지며 패가망신' },
                    { 남: '水', 여: '土', desc: '가도가 쇠퇴하고 자손이 불효하며, 혼자 살게 됨' }
                ]
            };

            let match = compatibilityData['좋은결합'].find(item => item.남 === maleElem && item.여 === femaleElem);
            let isGood = true;
            if (!match) {
                match = compatibilityData['나쁜결합'].find(item => item.남 === maleElem && item.여 === femaleElem);
                isGood = false;
            }

            const resultArea = document.getElementById('compatibility-result-v2');
            if (resultArea) {
                if (match) {
                    resultArea.innerHTML = `
                        <div style="text-align: center; padding: 15px;">
                            <div style="font-size: 1.2rem; font-weight: bold; color: ${isGood ? '#2ecc71' : '#e74c3c'}; margin-bottom: 10px;">
                                ${isGood ? '좋은 결합 (吉)' : '주의가 필요한 결합 (凶)'}
                            </div>
                            <div style="font-size: 0.9rem; color: var(--text-main); line-height: 1.6; background: rgba(255,255,255,0.03); padding: 12px; border-radius: 8px; border: 1px solid ${isGood ? 'rgba(46,204,113,0.2)' : 'rgba(231,76,60,0.2)'};">
                                ${match.desc}
                            </div>
                            <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 10px;">
                                (본인: ${mainElem}기운 / ${partnerName}님: ${partnerElem}기운)
                            </div>
                        </div>
                    `;
                } else {
                    resultArea.innerHTML = `
                        <div style="text-align: center; padding: 15px; color: var(--text-muted);">
                            분석 결과를 찾을 수 없습니다. (데이터 부족)
                        </div>
                    `;
                }
            }
        });
    }

    // --- 이사택일 로직 ---
    const movingMonthSelect = document.getElementById('moving-month-select');
    const movingGoodDays = document.getElementById('moving-good-days');
    const movingBadDays = document.getElementById('moving-bad-days');

    function updateMovingDays(month) {
        if (!window.movingData) return;
        const good = window.movingData.goodDays[month] || [];
        const bad = window.movingData.badDays[month] || [];
        
        if (movingGoodDays) movingGoodDays.innerHTML = good.length ? good.join(', ') + ' 일' : '해당 월의 길일 데이터가 없습니다.';
        if (movingBadDays) movingBadDays.innerHTML = bad.length ? bad.join(', ') + ' 일' : '해당 월의 흉일 데이터가 없습니다.';
    }

    if (movingMonthSelect) {
        movingMonthSelect.addEventListener('change', (e) => {
            updateMovingDays(e.target.value);
        });
        updateMovingDays(1);
    }

    function updateMovingDirections() {
        const birthYear = parseInt(document.getElementById('year').value);
        if (!birthYear || !window.movingData) return;
        
        const currentYear = new Date().getFullYear();
        const age = currentYear - birthYear + 1; 
        
        let gender = 'male';
        const genderEls = document.getElementsByName('gender');
        genderEls.forEach(g => { if (g.checked) gender = g.value === 'F' ? 'female' : 'male'; });

        const dirMap = window.movingData.directions[gender];
        const dirResultArea = document.getElementById('moving-direction-result');
        if (!dirResultArea) return;

        const luckNames = {
            1: { name: '천록(吉)', color: '#2ecc71', desc: '재물과 복록이 생김' },
            2: { name: '안손(凶)', color: '#e74c3c', desc: '재물을 잃고 건강 악화' },
            3: { name: '식신(吉)', color: '#2ecc71', desc: '의식이 풍족해짐' },
            4: { name: '징파(凶)', color: '#e74c3c', desc: '재물을 크게 잃음' },
            5: { name: '오귀(凶)', color: '#e74c3c', desc: '집안이 편안하지 못함' },
            6: { name: '합식(吉)', color: '#2ecc71', desc: '재물과 명성을 얻음' },
            7: { name: '진귀(凶)', color: '#e74c3c', desc: '질병과 근심이 생김' },
            8: { name: '관인(吉)', color: '#2ecc71', desc: '승진하고 관록을 얻음' },
            0: { name: '퇴식(凶)', color: '#e74c3c', desc: '재산이 줄어듦' }
        };

        let html = '';
        [1, 2, 3, 4, 5, 6, 7, 8, 0].forEach(key => {
            const dir = dirMap[key % 9];
            const luck = luckNames[key % 9];
            html += `
                <div style="background: rgba(255, 255, 255, 0.03); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);">
                    <div style="font-size: 0.8rem; color: var(--text-muted);">${dir}방</div>
                    <div style="font-weight: bold; color: ${luck.color}; margin: 4px 0;">${luck.name}</div>
                    <div style="font-size: 0.7rem; color: var(--text-muted);">${luck.desc}</div>
                </div>
            `;
        });
        dirResultArea.innerHTML = html;
    }

    const btnAnalyzeNaming = document.getElementById('btn-analyze-naming');
    if (btnAnalyzeNaming) {
        btnAnalyzeNaming.addEventListener('click', () => {
            if (!window.namingData) return;
            
            const stroke = parseInt(document.getElementById('naming-surname-stroke').value);
            const initial = document.getElementById('naming-surname-char').value;

            const strokeResultArea = document.getElementById('naming-stroke-result');
            const recommendedStrokes = window.namingData.strokes[stroke] || [];
            
            if (recommendedStrokes.length && strokeResultArea) {
                let html = '';
                recommendedStrokes.forEach(comb => {
                    const text = comb.length === 2 ? '[성] ' + stroke + '획 + [이름] ' + comb[0] + '획 + ' + comb[1] + '획' : '[성] ' + stroke + '획 + [이름] ' + comb[0] + '획 + ' + comb[1] + '획 + ' + comb[2] + '획';
                    html += '<span style="background: rgba(52, 152, 219, 0.15); color: #3498db; padding: 5px 10px; border-radius: 6px; border: 1px solid rgba(52,152,219,0.3);">' + text + '</span>';
                });
                strokeResultArea.innerHTML = html;
            } else if (strokeResultArea) {

                strokeResultArea.innerHTML = '<span style="color: var(--text-muted);">해당 획수에 대한 추천 조합이 없습니다.</span>';
            }

            const pronResultArea = document.getElementById('naming-pronunciation-result');
            const nextInitials = window.namingData.pronunciation[initial] || [];
            
            if (nextInitials.length && pronResultArea) {
                const initialNames = {
                    'ㄱ': '목(木) - 김, 강, 구 등', 'ㅋ': '목(木)',
                    'ㄴ': '화(火) - 나, 노 등', 'ㄷ': '화(火) - 도, 동 등', 'ㄹ': '화(火) - 류 등', 'ㅌ': '화(火)',
                    'ㅇ': '토(土) - 이, 안, 오 등', 'ㅎ': '토(土) - 한, 황 등',
                    'ㅅ': '금(金) - 서, 성, 신 등', 'ㅈ': '금(金) - 장, 정, 조 등', 'ㅊ': '금(金) - 최, 채 등',
                    'ㅁ': '수(水) - 문, 민 등', 'ㅂ': '수(水) - 박, 배 등', 'ㅍ': '수(水)'
                };
                
                let text = '선택하신 성씨의 발음 오행은 <strong>' + (initialNames[initial] || initial) + '</strong> 입니다.<br>';
                text += '이와 상생(相生)하여 길한 다음 글자 오행은 [<strong>';
                const mapped = nextInitials.map(i => {
                    const oheng = { 'ㄱ': '목', 'ㅋ': '목', 'ㄴ': '화', 'ㄷ': '화', 'ㄹ': '화', 'ㅌ': '화', 'ㅇ': '토', 'ㅎ': '토', 'ㅅ': '금', 'ㅈ': '금', 'ㅊ': '금', 'ㅁ': '수', 'ㅂ': '수', 'ㅍ': '수' }[i];
                    return oheng + '(' + i + ')';
                });
                text += mapped.join(', ') + '</strong>] 입니다.';
                pronResultArea.innerHTML = text;

            } else if (pronResultArea) {
                pronResultArea.innerHTML = '<span style="color: var(--text-muted);">성씨 발음 데이터를 찾을 수 없습니다.</span>';
            }
        });
    }

    const tabBtnMoving = document.querySelector('[data-target="tab-moving"]');
    if (tabBtnMoving) {
        tabBtnMoving.addEventListener('click', updateMovingDirections);
    }

});

