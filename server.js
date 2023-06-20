const express = require('express');
const app = express();
const connection = require('./util/dbConn');
const cors = require('cors');
const session = require('express-session');
const sessionStore = require('express-mysql-session')(session)

const account = require('./router/account')
const game = require('./router/game')
const study = require('./router/study')

// CORS 설정
app.use(express.json());

// cors 옵션 설정
app.use(cors({
  origin: true,
  credentials: true,
  exposedHeaders: ["set-cookie"],
}));

app.use(session({
  // 쿠키 식별자 설정
  key: "loginSession",
  secret: '1234', // 세션 데이터 암호화를 위한 비밀 키
  resave: false,
  saveUninitialized: true,
  // 세션 저장 위치 설정(mysql)
  store: new sessionStore({
    host: "127.0.0.1",
    port: 3306,
    user: "root",
    password: "#koldin13579",
    database: "keystudy"
  }),
  cookie: { maxAge: 600000000, secure: false }
}));

// account 관련
app.post('/api/signup', account.signUp)
app.post('/api/login', account.login)
app.get('/api/user', account.getUserInfo)
app.post('/api/logout', account.logout)


// game 관련
app.post('/api/game', game.saveScore)
app.get('/api/game/rank', game.gameRank)
app.get('/api/game/my-rank', game.myRank)

// 학습 기록 관련
app.put('/api/study/update', study.studyUpdate)
app.get('/api/study/record', study.getRecord)

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