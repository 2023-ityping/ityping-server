module.exports = {
    //현재 학습 저장 
    studyUpdate: async (req, res) => {
        const data = req.query.data; // 쿼리 매개변수에서 data 값을 가져옴
        const email = req.query.email; // 쿼리 매개변수에서 email 값을 가져옴
        const count = req.query.count; // 쿼리 매개변수에서 count 값을 가져옴

        let column;

        // 컬럼명 선택 로직
        switch (data) {
            case 'pra_shortcut':
                column = 'pra_shortcut';
                break;
            case 'pra_emmat':
                column = 'pra_emmat';
                break;
            case 'stu_shortcut':
                column = 'stu_shortcut'
                break;
            case 'stu_emmat':
                column = 'stu_emmat'
                break;
            default:
                // 유효하지 않은 값 처리
                return res.status(400).json({ error: '유효하지 않은 데이터입니다.' });
        }

        // TODO: 가져온 값들을 이용하여 데이터베이스 업데이트 로직을 구현
        const query = `UPDATE users SET ${column} = ? WHERE email = ?`;
        try {
            const [results, _] = await connection.query(query, [count, email])
            console.log('성공:', results);
            // 예시로 응답을 보내는 부분입니다.
            res.json({
                success: true,
                message: '데이터 업데이트가 완료되었습니다.'
            });
        } catch (e) {
            console.error('데이터베이스 업데이트 중 오류 발생:', e);
            res.status(500).json({ error: '데이터베이스 업데이트에 실패했습니다.' });
        }
    },

    // 마이페이지 기록 출력
    getRecord: async (req, res) => {
        const email = req.query.email; // 쿼리 매개변수에서 email 값을 가져옴

        // TODO: 이메일을 이용하여 기록 가져오는 로직 구현
        const query = 'SELECT stu_emmat, stu_shortcut, pra_emmat, pra_shortcut FROM users WHERE email = ?';
        try {
            const [results, _] = await connection.query(query, [email])

            if (results.length < 1) {
                console.log('기록이 없습니다.');
                res.json({ success: true, records: {} });
                return
            }

            console.log('기록 가져오기 성공:', results[0].stu_shortcut);
            // 예시로 가져온 기록을 응답으로 보냅니다.
            res.json({ success: true, records: results[0] });
        } catch (e) {
            console.error('기록 가져오기 중 오류 발생:', e);
            res.status(500).json({ error: '기록 가져오기에 실패했습니다.' });
        }
    }
}