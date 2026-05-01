window.timeCorrection = {
    // 1. 역대 표준시 변경 이력 (한국)
    standardTimes: [
        { start: '1908-04-01', end: '1911-12-31', offset: -30 }, // 127.5도 (현재 기준에서 30분 빼야 함)
        { start: '1912-01-01', end: '1954-03-20', offset: 0 },   // 135도 (현재 기준과 동일)
        { start: '1954-03-21', end: '1961-08-09', offset: -30 }, // 127.5도 (30분 빼야 함)
        { start: '1961-08-10', end: '2099-12-31', offset: 0 }    // 135도 (현재 기준과 동일)
    ],

    // 2. 역대 서머타임 실시 기간 (한국)
    summerTimes: [
        { start: '1948-05-31 23:00', end: '1948-09-12 23:00' },
        { start: '1949-04-02 23:00', end: '1949-09-10 23:00' },
        { start: '1950-03-31 23:00', end: '1950-09-09 23:00' },
        { start: '1951-05-06 23:00', end: '1951-09-08 23:00' },
        { start: '1955-05-05 00:00', end: '1955-09-09 00:00' },
        { start: '1956-05-20 00:00', end: '1956-09-30 00:00' },
        { start: '1957-05-05 00:00', end: '1957-09-22 00:00' },
        { start: '1958-05-04 00:00', end: '1958-09-21 00:00' },
        { start: '1959-05-03 00:00', end: '1959-09-20 00:00' },
        { start: '1960-05-01 00:00', end: '1960-09-18 00:00' },
        { start: '1987-05-10 02:00', end: '1987-10-11 03:00' },
        { start: '1988-05-08 02:00', end: '1988-10-09 03:00' }
    ],

    // 출생 시각 보정 함수
    correctTime: function(dateStr, timeStr) {
        if (!dateStr || !timeStr) return null;

        // 'YYYY-MM-DD', 'HH:mm' -> Date 객체 생성
        let targetDate = new Date(`${dateStr}T${timeStr}:00`);
        let appliedStandard = '동경 135도 (표준시)';
        let isSummer = false;
        let totalOffset = 0; // 분 단위

        const dateTimestamp = targetDate.getTime();

        // 1. 표준시 오프셋 검사
        for (let st of this.standardTimes) {
            let start = new Date(st.start + 'T00:00:00').getTime();
            let end = new Date(st.end + 'T23:59:59').getTime();
            if (dateTimestamp >= start && dateTimestamp <= end) {
                totalOffset += st.offset;
                if (st.offset === -30) {
                    appliedStandard = '동경 127.5도 (시차 -30분 적용)';
                }
                break;
            }
        }

        // 2. 서머타임 오프셋 검사
        for (let sm of this.summerTimes) {
            let start = new Date(sm.start.replace(' ', 'T')).getTime();
            let end = new Date(sm.end.replace(' ', 'T')).getTime();
            if (dateTimestamp >= start && dateTimestamp <= end) {
                totalOffset -= 60; // 서머타임이 적용된 시각이므로 1시간을 빼야 본래 시간임
                isSummer = true;
                break;
            }
        }

        // 보정된 시간 계산
        let correctedDate = new Date(targetDate.getTime() + (totalOffset * 60000));

        return {
            original: targetDate,
            corrected: correctedDate,
            appliedStandard: appliedStandard,
            isSummer: isSummer,
            totalOffset: totalOffset,
            correctedTimeStr: `${String(correctedDate.getHours()).padStart(2, '0')}:${String(correctedDate.getMinutes()).padStart(2, '0')}`
        };
    }
};

if (typeof module !== 'undefined') {
    module.exports = window.timeCorrection;
}
