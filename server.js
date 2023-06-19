const express = require('express');
const app = express();
const mysql = require('mysql2');
const config = require('./config');
const session = require('express-session');
// CORS 설정
app.use(express.json());
// app.use(cors());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

app.use(session({
    secret: '1234', // 세션 데이터 암호화를 위한 비밀 키
    resave: false,
    saveUninitialized: true
}));

const connection = mysql.createConnection(config);

// 회원가입 API 엔드포인트
app.post('/api/signup', (req, res) => {
    // 클라이언트로부터 전달받은 사용자 정보
    const { email, password, nickname } = req.body;

    // TODO: 데이터베이스에 사용자 정보 저장 로직 구현
    // 회원 정보를 데이터베이스에 저장
    const query = 'INSERT INTO users (email, pw, nickname) VALUES (?, ?, ?)';
    connection.query(query, [email, password, nickname], (error, results) => {
        if (error) {
            console.error('회원가입 중 오류 발생:', error);
            res.status(500).json({ error: '회원가입에 실패했습니다.' });
        }
        console.log('회원가입 성공:', results);
        res.json({ message: '회원가입이 성공적으로 완료되었습니다.' });
    });
});

//로그인 
app.post('/api/login', (req, res) => {
    console.log("login")
    const { email, password } = req.body;

    // 실제 로그인 검증 로직
    const query = 'SELECT * FROM users WHERE email = ?';
    connection.query(query, [email], (err, results) => {
        if (err) {
            console.error('데이터베이스 조회 오류:', err);
            res.status(500).json({ message: '서버 오류' });
            return;
        }
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
        console.log(user)
        res.json({ message: '로그인 성공', user: { email: user.email, nickname: user.nickname } });
    });
});

// 사용자 정보 조회 엔드포인트
app.get('/api/user', (req, res) => {
    const user = req.session.user;
    if (!user) {
      res.status(401).json({ message: '로그인이 필요합니다.' });
      return;
    }
    res.json(user); // 사용자 정보를 응답으로 보냄
  });

// 로그아웃 처리
app.post('/api/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.log(err);
            res.status(500).json({ message: '로그아웃 실패' });
        } else {
            res.clearCookie('connect.sid'); // 쿠키 삭제
            res.json({ message: '로그아웃 성공' });
        }
    });
});

// 현재 학습률 저장 
app.post('/api/update', (req, res) => {
    // 클라이언트로부터 전달받은 사용자 정보
    const { email, password, nickname } = req.body;

    // TODO: 데이터베이스에 사용자 정보 저장 로직 구현
    // 회원 정보를 데이터베이스에 저장
    const query = 'UPDATE users SET nickname = ? WHERE email = ?';
    connection.query(query, [nickname, email], (error, results) => {
        if (error) {
            console.error('회원가입 중 오류 발생:', error);
            res.status(500).json({ error: '회원가입에 실패했습니다.' });
        }
        console.log('회원가입 성공:', results);
        res.json({ message: '회원가입이 성공적으로 완료되었습니다.' });
    });
});

// 게임 점수 저장
app.post('/api/game', (req, res) => {
    const { email, name, score, gametype } = req.body;
    // TODO: 게임 점수를 데이터베이스에 저장하는 로직 구현
    const query = 'INSERT INTO game (email, name, score, gametype) VALUES (?, ?, ?, ?)';
    connection.query(query, [email, name, score, gametype], (error, results) => {
        if (error) {
            console.error('게임 점수 저장 중 오류 발생:', error);
            res.status(500).json({ error: '게임 점수 저장에 실패했습니다.' });
        } else {
            console.log('게임 점수 저장 성공:', results);
            res.json({ message: '게임 점수가 성공적으로 저장되었습니다.' });
        }
    });
});

// 게임 랭킹 조회
app.get('/api/gameRank', (req, res) => {
    // TODO: 게임 랭킹 데이터 조회 및 가공 로직 구현
    const query = 'SELECT name, score FROM game ORDER BY score DESC';
    connection.query(query, (error, results) => {
        if (error) {
            console.error('게임 랭킹 조회 중 오류 발생:', error);
            res.status(500).json({ error: '게임 랭킹 조회에 실패했습니다.' });
        } else {
            console.log('게임 랭킹 조회 결과:', results);
            // 가공된 데이터 배열 생성
            const gameRank = results.map((result) => ({
                name: result.name,
                score: result.score,
            }));

            res.json({ results: gameRank });
        }
    });
});

// 나의 게임 랭킹 및 점수 조회
app.get('/api/gameMyRank', (req, res) => {
    const email = req.query.email;
    //데이터베이스 조회 
    const query = 'SELECT MAX(score) AS max_score, MIN(score) AS min_score FROM game WHERE email = ?';
    connection.query(query, [email], (error, results) => {
        if (error) {
            console.error('데이터베이스 조회 오류:', error);
            res.status(500).json({ message: '서버 오류' });
            return;
        } 
        if (results.length === 0) {
            // 해당 이메일에 대한 데이터가 없는 경우
            res.status(404).json({ message: '데이터를 찾을 수 없습니다.' });
            return;
        }
        const { max_score, min_score } = results[0];
        // 현재 최고 랭킹 조회 쿼리문
        const rankQuery = 'SELECT COUNT(*) AS myrank FROM game WHERE score > (SELECT MAX(score) FROM game WHERE email = ?)';
        connection.query(rankQuery, [email], (rankError, rankResults) => {
            if (rankError) {
                console.error('랭킹 조회 오류:', rankError);
                res.status(500).json({ message: '서버 오류' });
                return;
            }
            const currentRank = rankResults[0].myrank + 1;
            const result = {
                max: max_score,
                min: min_score,
                rank: currentRank
            };
            console.log(result);
            res.json(result);
        });
    });
});
    const query = 'UPDATE users SET game_score = ? WHERE nickname = ?';
    connection.query(query, [score, nickname], (error, results) => {
        if(error){
            console.log('게임 점수 중 오류 발생')
            res.status(500).json({ error: '점수 입력에 실패했습니다.' });
        }
        console.log('게임 점수 성공:', results);
        res.json({ message: '점수 입력이 성공적으로 완료되었습니다.' });
    })
})
connection.connect((error) => {
    if (error) {
        console.error('데이터베이스 연결 실패:', error);
        return;
    }
    console.log('데이터베이스에 연결되었습니다.');

    // Express.js 서버 실행
    app.listen(5000, () => {
        console.log('서버가 5000번 포트에서 실행되었습니다.');
    });
});