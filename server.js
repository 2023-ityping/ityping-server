const express = require('express');
const app = express();
const mysql = require('mysql2');
const config = require('./config');
const cors = require('cors');
const session = require('express-session');
// CORS 설정
app.use(express.json());
app.use(cors());

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
        } else {
            console.log('회원가입 성공:', results);
            res.status(200).json({ message: '회원가입이 성공적으로 완료되었습니다.' });
        }
    });
});

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    // 실제 로그인 검증 로직
    connection.query(
        'SELECT * FROM users WHERE email = ?', [email],
        (err, results) => {
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
            res.json({ message: '로그인 성공', user });
        }
    );
});

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