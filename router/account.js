const connection = require('../util/dbConn')

module.exports = {
    // 회원가입 API 엔드포인트
    signUp: async (req, res) => {
        // 클라이언트로부터 전달받은 사용자 정보
        const { email, password, nickname } = req.body;
        console.log(req.body)
        // TODO: 데이터베이스에 사용자 정보 저장 로직 구현
        // 회원 정보를 데이터베이스에 저장
        const query = 'INSERT INTO users (email, pw, nickname) VALUES (?, ?, ?)';
        try {
            await connection.query(query, [email, password, nickname])
            res.json({ message: '회원가입이 성공적으로 완료되었습니다.' });
        } catch (e) {
            console.error('회원가입 중 오류 발생:', e);
            res.status(500).json({ error: '회원가입에 실패했습니다.' });
        }
    },
    //로그인 
    login: async (req, res) => {
        const { email, password } = req.body;
        console.log(req.body)   
        // 실제 로그인 검증 로직
        const query = 'SELECT * FROM users WHERE email = ?';
        try {

            const [results, _] = await connection.query(query, [email])

            if (results.length === 0) {
                // 사용자가 존재하지 않는 경우
                res.status(401).json({ message: '로그인 실패: 이메일 또는 닉네임 또는 비밀번호가 잘못되었습니다.' });
                return;
            }
            const user = results[0];
            if (user.pw !== password) {
                // 비밀번호가 일치하지 않는 경우
                res.status(401).json({ message: '로그인 실패: 이메일 또는 닉네임 또는 비밀번호가 잘못되었습니다.' });
                return;
            }
            // 로그인 성공
            req.session.user = user; // 세션에 사용자 정보 저장
            res.json({ message: '로그인 성공', user: { email: user.email, nickname: user.nickname } });
        } catch (e) {
            console.error('로그인 중 오류 발생:', e);
            res.status(500).json({ error: '로그인에 실패했습니다.' });
        }
    },

    // 사용자 정보 조회 엔드포인트
    getUserInfo: (req, res) => {
        const user = req.session.user;

        if (!user) {
            res.status(401).json({ message: '로그인이 필요합니다.' });
            return;
        }
        res.json(user); // 사용자 정보를 응답으로 보냄
    },

    // 로그아웃 처리
    logout: async (req, res) => {
        try {
            await req.session.destroy()

            res.clearCookie('loginSession');
            res.json({ message: '로그아웃 성공' });
        } catch (e) {
            console.log(e);
            res.status(500).json({ message: '로그아웃 실패' });
            return
        }
    }
}