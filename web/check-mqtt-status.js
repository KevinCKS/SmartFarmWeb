// MQTT 상태 확인 스크립트
// 사용법: node check-mqtt-status.js

const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/mqtt/status',
  method: 'GET',
};

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      console.log('=== MQTT 연결 상태 ===');
      console.log('연결 상태:', result.connected ? '✅ 연결됨' : '❌ 연결 끊김');
      console.log('확인 시간:', result.timestamp);
      
      if (result.error) {
        console.log('오류:', result.error);
        console.log('상세:', result.details);
      }
    } catch (err) {
      console.error('응답 파싱 오류:', err);
      console.log('원본 응답:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('요청 오류:', error.message);
  console.log('\n서버가 실행 중인지 확인하세요:');
  console.log('  npm run dev');
});

req.end();
