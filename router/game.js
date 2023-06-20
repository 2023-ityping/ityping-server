module.exports = {
    // 게임 점수 저장
    saveScore: async (req, res) => {
        const { email, name, score, gametype } = req.body;
        // TODO: 게임 점수를 데이터베이스에 저장하는 로직 구현
        const query = 'INSERT INTO game (email, name, score, gametype) VALUES (?, ?, ?, ?)';
        try {
            await connection.query(query, [email, name, score, gametype])

            console.log('게임 점수 저장 성공:', results);
            res.json({ message: '게임 점수가 성공적으로 저장되었습니다.' });
        } catch (e) {
            console.error('게임 점수 저장 중 오류 발생:', error);
            res.status(500).json({ error: '게임 점수 저장에 실패했습니다.' });
        }
    },

    // 게임 랭킹 조회
    gameRank: async (req, res) => {
        // TODO: 게임 랭킹 데이터 조회 및 가공 로직 구현
        const query = 'SELECT name, score FROM game ORDER BY score DESC';
        try {
            const [results, _] = await connection.query(query)
            console.log('게임 랭킹 조회 결과:', results);
            // 가공된 데이터 배열 생성
            const gameRank = results.map((result) => ({
                name: result.name,
                score: result.score,
            }));

            res.json({ results: gameRank });
        } catch (e) {
            console.error('게임 랭킹 조회 중 오류 발생:', error);
            res.status(500).json({ error: '게임 랭킹 조회에 실패했습니다.' });
        }
    },

    // 나의 게임 랭킹 및 점수 조회
    myRank: async (req, res) => {
        const email = req.query.email;
        //데이터베이스 조회 
        const query = 'SELECT MAX(score) AS max_score, MIN(score) AS min_score FROM game WHERE email = ?';
        try {
            const [results, _] = await connection.query(query, [email])
            if (results.length === 0) {
                // 해당 이메일에 대한 데이터가 없는 경우
                res.status(404).json({ message: '데이터를 찾을 수 없습니다.' });
                return;
            }
            const { max_score, min_score } = results[0];
            // 현재 최고 랭킹 조회 쿼리문
            const rankQuery = 'SELECT COUNT(*) AS myrank FROM game WHERE score > (SELECT MAX(score) FROM game WHERE email = ?)';
            const [rankResults, __] = await connection.query(rankQuery, [email])
            const currentRank = rankResults[0].myrank + 1;
            const result = {
                max: max_score,
                min: min_score,
                rank: currentRank
            };
            console.log(result);
            res.json(result);
        } catch (e) {
            console.error('조회 오류:', e);
            res.status(500).json({ message: '서버 오류' });
            return;
        }
    }
}