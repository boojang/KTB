import CryptoJS from 'crypto-js';

const data = 'apple'; //암호를 진행할때 데이터를 작성
const secretKey = '1q2w3e4r'; //암호화를 진행할때 설정할 비밀번호

//encrypt를 사용해 암호화하기
const bytes = CryptoJS.AES.encrypt(data, secretKey); //암호화 진행
const bytesString = bytes.toString(); //암호화된 데이터를 문자열로 변환 ->평문으로 사용할라꼬

console.log('bytesString: ',bytesString); //암호화된 데이터 출력

//decrypt를 사용해 복호화하기
const decryptBytes = CryptoJS.AES.decrypt(bytesString, secretKey); //복호화 진행
const decryptBytesString = decryptBytes.toString(CryptoJS.enc.Utf8); //복호화된 데이터를 문자열로 변환

console.log('decryptBytesString: ',decryptBytesString); //복호화된 데이터 출력
